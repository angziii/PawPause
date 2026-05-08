import { inflateRawSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import electron from "electron";
import type { InstalledPet, PetImportResult, PetPackageManifest } from "../shared/types";

const { app, dialog } = electron;

const MIN_SPRITE_SIZE = 256;

type SpriteFile = {
  name: "spritesheet.webp" | "spritesheet.png";
  ext: "webp" | "png";
  data: Buffer;
};

export function userPetsRoot(): string {
  return path.join(app.getPath("userData"), "pets");
}

export function legacyUserPetsRoot(): string {
  return path.join(homedir(), ".codex", "pets");
}

export function discoverInstalledPets(): InstalledPet[] {
  const roots = [userPetsRoot(), legacyUserPetsRoot()];
  const pets = new Map<string, InstalledPet>();

  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pet = readInstalledPet(path.join(root, entry.name), entry.name);
      if (pet) pets.set(pet.slug, pet);
    }
  }

  return [...pets.values()].sort((left, right) =>
    left.manifest.displayName.localeCompare(right.manifest.displayName)
  );
}

export async function chooseAndImportPet(): Promise<PetImportResult> {
  const result = await dialog.showOpenDialog({
    title: "Import Pet Package",
    properties: ["openFile", "openDirectory"],
    filters: [
      { name: "Pet package", extensions: ["zip"] },
      { name: "All files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, error: "import_cancelled" };
  }

  return importPetPackage(result.filePaths[0]);
}

export async function importPetPackage(sourcePath: string): Promise<PetImportResult> {
  const input = await stat(sourcePath).catch(() => null);
  if (!input) return { ok: false, error: "Package path does not exist." };

  const workspace = await mkdtemp(path.join(tmpdir(), "pawpause-pet-"));
  try {
    const root = input.isDirectory()
      ? sourcePath
      : await extractZipPackage(sourcePath, workspace);
    const parsed = await readPackage(root);
    const slug = await uniqueSlug(parsed.manifest.id || path.basename(sourcePath, path.extname(sourcePath)));
    const target = path.join(userPetsRoot(), slug);

    await mkdir(target, { recursive: true });
    await writeFile(
      path.join(target, "pet.json"),
      `${JSON.stringify({ ...parsed.manifest, id: slug, source: "imported" }, null, 2)}\n`
    );
    await writeFile(path.join(target, parsed.sprite.name), parsed.sprite.data);

    const installed: InstalledPet = {
      slug,
      manifest: {
        ...parsed.manifest,
        id: slug,
        spritesheet: parsed.sprite.name,
        source: "imported"
      },
      spritesheetPath: path.join(target, parsed.sprite.name),
      spritesheetExt: parsed.sprite.ext,
      importedAt: new Date().toISOString()
    };

    return { ok: true, pet: installed };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function readPackage(root: string): Promise<{
  manifest: PetPackageManifest;
  sprite: SpriteFile;
}> {
  const manifestPath = path.join(root, "pet.json");
  const rawManifest = await readFile(manifestPath, "utf8").catch(() => {
    throw new Error("Package is missing pet.json at the root.");
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawManifest) as Record<string, unknown>;
  } catch {
    throw new Error("pet.json is not valid JSON.");
  }

  const sprite = await readSprite(root);
  const dimensions = measureSprite(sprite);
  if (
    !dimensions ||
    dimensions.width < MIN_SPRITE_SIZE ||
    dimensions.height < MIN_SPRITE_SIZE
  ) {
    throw new Error("Spritesheet is unreadable or smaller than 256x256.");
  }

  const id = slugify(
    stringField(parsed.id) ||
      stringField(parsed.name) ||
      stringField(parsed.displayName) ||
      path.basename(root)
  );
  if (!id) throw new Error("pet.json must include a usable id or displayName.");

  return {
    manifest: {
      id,
      displayName: stringField(parsed.displayName) || stringField(parsed.name) || id,
      description: stringField(parsed.description),
      author: stringField(parsed.author),
      spritesheet: sprite.name,
      source: "imported"
    },
    sprite
  };
}

async function readSprite(root: string): Promise<SpriteFile> {
  const webp = path.join(root, "spritesheet.webp");
  const png = path.join(root, "spritesheet.png");
  const webpData = await readFile(webp).catch(() => null);
  if (webpData) return { name: "spritesheet.webp", ext: "webp", data: webpData };
  const pngData = await readFile(png).catch(() => null);
  if (pngData) return { name: "spritesheet.png", ext: "png", data: pngData };
  throw new Error("Package is missing spritesheet.webp or spritesheet.png at the root.");
}

async function uniqueSlug(base: string): Promise<string> {
  const safeBase = slugify(base) || "pet";
  await mkdir(userPetsRoot(), { recursive: true });
  const entries = new Set(await readdir(userPetsRoot()).catch(() => []));
  if (!entries.has(safeBase)) return safeBase;
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${safeBase}-${index}`;
    if (!entries.has(candidate)) return candidate;
  }
  return `${safeBase}-${Date.now()}`;
}

async function extractZipPackage(zipPath: string, workspace: string): Promise<string> {
  const data = await readFile(zipPath);
  const files = unzip(data);
  const usable = files.filter((file) => !file.name.endsWith("/"));
  const hasRootPetJson = usable.some((file) => file.name === "pet.json");
  const rootNames = new Set(usable.map((file) => file.name.split("/")[0]));
  const stripSingleRoot = !hasRootPetJson && rootNames.size === 1;

  for (const file of usable) {
    const relativeName = stripSingleRoot ? file.name.split("/").slice(1).join("/") : file.name;
    if (!relativeName) continue;
    const target = path.resolve(workspace, relativeName);
    if (!target.startsWith(workspace)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.data);
  }

  return workspace;
}

function unzip(data: Buffer): Array<{ name: string; data: Buffer }> {
  const eocd = findEndOfCentralDirectory(data);
  if (eocd < 0) throw new Error("Zip package is invalid.");
  const entryCount = data.readUInt16LE(eocd + 10);
  let cursor = data.readUInt32LE(eocd + 16);
  const out: Array<{ name: string; data: Buffer }> = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (data.readUInt32LE(cursor) !== 0x02014b50) break;
    const method = data.readUInt16LE(cursor + 10);
    const compressedSize = data.readUInt32LE(cursor + 20);
    const nameLength = data.readUInt16LE(cursor + 28);
    const extraLength = data.readUInt16LE(cursor + 30);
    const commentLength = data.readUInt16LE(cursor + 32);
    const localOffset = data.readUInt32LE(cursor + 42);
    const name = data.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");

    if (!name.includes("__MACOSX/")) {
      const localNameLength = data.readUInt16LE(localOffset + 26);
      const localExtraLength = data.readUInt16LE(localOffset + 28);
      const fileStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = data.subarray(fileStart, fileStart + compressedSize);
      if (method !== 0 && method !== 8) {
        throw new Error(`Unsupported zip compression method: ${method}.`);
      }
      out.push({
        name,
        data: method === 0 ? compressed : inflateRawSync(compressed)
      });
    }

    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return out;
}

function findEndOfCentralDirectory(data: Buffer): number {
  for (let cursor = data.length - 22; cursor >= Math.max(0, data.length - 66000); cursor -= 1) {
    if (data.readUInt32LE(cursor) === 0x06054b50) return cursor;
  }
  return -1;
}

function measureSprite(sprite: SpriteFile): { width: number; height: number } | null {
  return sprite.ext === "png" ? measurePng(sprite.data) : measureWebp(sprite.data);
}

function measurePng(data: Buffer): { width: number; height: number } | null {
  if (data.length < 24 || data.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function measureWebp(data: Buffer): { width: number; height: number } | null {
  if (data.length < 30 || data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const chunk = data.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + data.readUIntLE(24, 3),
      height: 1 + data.readUIntLE(27, 3)
    };
  }
  if (chunk === "VP8 " && data.length >= 30) {
    return {
      width: data.readUInt16LE(26) & 0x3fff,
      height: data.readUInt16LE(28) & 0x3fff
    };
  }
  if (chunk === "VP8L" && data.length >= 25) {
    const bits = data.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }
  return null;
}

function readInstalledPet(root: string, fallbackSlug: string): InstalledPet | null {
  try {
    const manifestPath = path.join(root, "pet.json");
    const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    const slug = slugify(stringField(parsed.id) || fallbackSlug);
    if (!slug) return null;
    const spriteName = resolveSpriteName(root, parsed);
    if (!spriteName) return null;
    const spriteExt = spriteName.endsWith(".png") ? "png" : "webp";
    const stats = statSync(path.join(root, spriteName));

    return {
      slug,
      manifest: {
        id: slug,
        displayName: stringField(parsed.displayName) || stringField(parsed.name) || slug,
        description: stringField(parsed.description),
        author: stringField(parsed.author),
        spritesheet: spriteName,
        source: "imported"
      },
      spritesheetPath: path.join(root, spriteName),
      spritesheetExt: spriteExt,
      importedAt: stats.mtime.toISOString()
    };
  } catch {
    return null;
  }
}

function resolveSpriteName(root: string, manifest: Record<string, unknown>): "spritesheet.webp" | "spritesheet.png" | null {
  const raw =
    stringField(manifest.spritesheet) ||
    stringField(manifest.spritesheetPath) ||
    "spritesheet.webp";
  const base = path.basename(raw);
  if (base === "spritesheet.webp" && existsSync(path.join(root, base))) return base;
  if (base === "spritesheet.png" && existsSync(path.join(root, base))) return base;
  if (existsSync(path.join(root, "spritesheet.webp"))) return "spritesheet.webp";
  if (existsSync(path.join(root, "spritesheet.png"))) return "spritesheet.png";
  return null;
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
