// เลือกรูปจาก "กล้อง" หรือ "คลังภาพ" — ใช้ร่วมกันทั้งโพสต์ โปรไฟล์ และหน้าตั้งค่าเริ่มต้น
import * as ImagePicker from "expo-image-picker";

export type PhotoSource = "camera" | "gallery";
export type Picked = { uri: string; mime: string | null };

/** ผู้ใช้ไม่อนุญาตสิทธิ์ (source บอกว่าเป็นกล้องหรือคลังภาพ เพื่อแสดงข้อความให้ตรง) */
export class PhotoPermissionError extends Error {
  constructor(public source: PhotoSource) {
    super("photo permission denied: " + source);
  }
}

/** คืนรูปที่เลือก หรือ null ถ้าผู้ใช้กดยกเลิก · ไม่อนุญาตสิทธิ์จะโยน PhotoPermissionError */
export async function pickPhoto(source: PhotoSource, opts?: { square?: boolean; selfie?: boolean }): Promise<Picked | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: !opts?.selfie, // เซลฟี่ถ่ายแล้วใช้เลย ไม่ต้องครอป
    quality: 0.6, // บีบรูปให้เล็กลง (ที่เก็บรูปจำกัดไฟล์ละ 2–3 MB)
    ...(opts?.square ? { aspect: [1, 1] as [number, number] } : {}),
    ...(opts?.selfie ? { cameraType: ImagePicker.CameraType.front } : {}),
  };
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new PhotoPermissionError("camera");
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new PhotoPermissionError("gallery");
  }
  const res = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  const a = res.canceled ? null : res.assets[0];
  return a ? { uri: a.uri, mime: a.mimeType ?? null } : null;
}

/** แปลง error จากการเลือกรูปเป็นข้อความ (ส่งฟังก์ชัน t เข้ามา) */
export function photoErrorText(e: unknown, t: (k: string) => string): string {
  if (e instanceof PhotoPermissionError) return t(e.source === "camera" ? "errCamPerm" : "errPhotoPerm");
  return t("errPhoto");
}
