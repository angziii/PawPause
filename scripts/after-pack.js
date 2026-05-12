import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export default async function afterPack(context) {
  if (process.platform !== "darwin" || context.electronPlatformName !== "darwin") return;
  await execFileAsync("/usr/bin/xattr", ["-cr", context.appOutDir]);
}
