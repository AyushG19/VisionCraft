import { JoinRoomResponseType, newRoom } from "@repo/common";
import {
  createRoomApi,
  joinRoomApi,
  leaveRoomApi,
  uploadImgApi,
} from "../api/canvas.api";

export async function joinRoomService(
  roomCode: string,
): Promise<JoinRoomResponseType> {
  return await joinRoomApi(roomCode);
}

export async function createRoomService(): Promise<newRoom> {
  return await createRoomApi();
}

export async function leaveRoomService(roomId: string) {
  return await leaveRoomApi(roomId);
}

export async function storeImg(imageBlob: Blob): Promise<string> {
  const formData = new FormData();
  const file = new File([imageBlob], "image.webp", { type: "image/webp" });
  formData.append("file", file);
  formData.append("upload_preset", "visioncraft");
  // Debug — verify no [] keys
  for (const [key, value] of formData.entries()) {
    console.log("FormData key:", key, "value:", value);
  }
  const res = await uploadImgApi(formData);
  return res.secure_url as string;
}
