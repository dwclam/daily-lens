// src/utils/cropImage.js

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Hàm này nhận vào đường dẫn ảnh gốc và tọa độ cắt (pixelCrop)
 * Trả về một file ảnh mới (Blob) đã được cắt
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set kích thước canvas bằng kích thước vùng cắt
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Vẽ ảnh lên canvas tại vị trí đã chọn
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Xuất ra dạng Blob (file ảo)
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg');
  });
}