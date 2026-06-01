export {};

interface WorkerMessage {
  file: File;
}
self.onmessage = async function (message: MessageEvent<WorkerMessage>) {
  const { file } = message.data;
  const imgBitmap = await createImageBitmap(file);

  console.log("imgbitmap:", imgBitmap);

  const MAX_DIMENTION = 400;

  let w = imgBitmap.width;
  let h = imgBitmap.height;

  if (w > MAX_DIMENTION || h > MAX_DIMENTION) {
    const scale = Math.min(MAX_DIMENTION / w, MAX_DIMENTION / h);
    w = w * scale;
    h = h * scale;
  }

  try {
    const offScrCanvas = new OffscreenCanvas(w, h);
    const ctx = offScrCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgBitmap, 0, 0, w, h);
    const compressedBlob = await offScrCanvas.convertToBlob({
      type: "image/webp",
      quality: 0.7,
    });
    self.postMessage(compressedBlob);
    imgBitmap.close();
  } catch (error) {
    console.error("Worker error: ", error);
  }
};
