import electron from "electron";

const { nativeImage, nativeTheme } = electron;

function imageFromPath(path: string, template: boolean): Electron.NativeImage | null {
  const image = nativeImage.createFromPath(path);
  if (image.isEmpty()) return null;
  const resized = image.resize({ width: 22, height: 22 });
  resized.setTemplateImage(template);
  return resized;
}

function renderPaw(size: number, color: [number, number, number]): Buffer {
  const buf = Buffer.alloc(size * size * 4, 0);
  const [r, g, b] = color;

  function fillCircle(cx: number, cy: number, radius: number): void {
    const r2 = radius * radius;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) {
          const i = (y * size + x) * 4;
          buf[i] = r;
          buf[i + 1] = g;
          buf[i + 2] = b;
          buf[i + 3] = 255;
        }
      }
    }
  }

  fillCircle(5, 4, 2.4);
  fillCircle(11, 2.5, 2.4);
  fillCircle(17, 4, 2.4);
  fillCircle(3, 9, 2.4);
  fillCircle(11, 15, 7);

  return buf;
}

export function createTrayImage(iconPath?: string): Electron.NativeImage {
  const size = 22;

  if (process.platform === "darwin") {
    if (iconPath) {
      const image = imageFromPath(iconPath, true);
      if (image) return image;
    }
    const image = nativeImage.createFromBuffer(renderPaw(size, [0, 0, 0]), {
      width: size,
      height: size
    });
    image.setTemplateImage(true);
    return image;
  }

  const color: [number, number, number] = nativeTheme.shouldUseDarkColors
    ? [255, 255, 255]
    : [0, 0, 0];
  if (iconPath) {
    const image = imageFromPath(iconPath, false);
    if (image) return image;
  }
  return nativeImage.createFromBuffer(renderPaw(size, color), { width: size, height: size });
}
