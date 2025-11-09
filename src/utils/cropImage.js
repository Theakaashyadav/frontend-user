export default async function getCroppedImg(imageElement, crop) {
  if (!crop?.width || !crop?.height) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // ✅ Use actual rendered dimensions to compute accurate scale
  const rect = imageElement.getBoundingClientRect();
  const scaleX = imageElement.naturalWidth / rect.width;
  const scaleY = imageElement.naturalHeight / rect.height;

  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ✅ Account for CSS scaling & scrolling offset
  const imageOffset = imageElement.getBoundingClientRect();
  const containerOffset = imageElement.parentElement.getBoundingClientRect();

  const offsetX = (imageOffset.left - containerOffset.left);
  const offsetY = (imageOffset.top - containerOffset.top);

  ctx.drawImage(
    imageElement,
    (crop.x - offsetX) * scaleX,
    (crop.y - offsetY) * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.95);
}
