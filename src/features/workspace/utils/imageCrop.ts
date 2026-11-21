export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const fullCrop: CropRect = { x: 0, y: 0, width: 1, height: 1 };
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function changeCrop(
  initial: CropRect,
  handle: string,
  dx: number,
  dy: number,
): CropRect {
  if (handle === "move")
    return {
      ...initial,
      x: clamp(initial.x + dx, 0, 1 - initial.width),
      y: clamp(initial.y + dy, 0, 1 - initial.height),
    };
  let left = initial.x,
    top = initial.y,
    right = left + initial.width,
    bottom = top + initial.height;
  if (handle.includes("w")) left = clamp(left + dx, 0, right - 0.03);
  if (handle.includes("e")) right = clamp(right + dx, left + 0.03, 1);
  if (handle.includes("n")) top = clamp(top + dy, 0, bottom - 0.03);
  if (handle.includes("s")) bottom = clamp(bottom + dy, top + 0.03, 1);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
export async function cropImage(
  url: string,
  crop: CropRect,
  name: string,
): Promise<File> {
  const image = new Image();
  if (new URL(url, location.href).origin !== location.origin)
    image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  const width = Math.max(1, Math.round(image.naturalWidth * crop.width)),
    height = Math.max(1, Math.round(image.naturalHeight * crop.height));
  const scale = Math.min(
    1,
    4096 / width,
    4096 / height,
    Math.sqrt(12000000 / (width * height)),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw Error("Trình duyệt chưa hỗ trợ cắt ảnh.");
  context.drawImage(
    image,
    crop.x * image.naturalWidth,
    crop.y * image.naturalHeight,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  let blob: Blob;
  try {
    blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(Error("Chưa tạo được ảnh.")),
        "image/png",
      ),
    );
  } catch {
    throw Error(
      "Ảnh từ website này không cho phép cắt. Hãy tải ảnh lên Workspace rồi thử lại.",
    );
  }
  if (blob.size > 10 * 1024 * 1024)
    throw Error("Ảnh sau khi cắt vượt 10 MB. Chọn vùng nhỏ hơn rồi thử lại.");
  return new File([blob], `${name.replace(/\.[^.]+$/, "") || "anh"}-crop.png`, {
    type: "image/png",
  });
}
