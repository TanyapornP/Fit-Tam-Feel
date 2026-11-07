// แผ่นเลือกแหล่งรูป: ถ่ายรูปด้วยกล้อง / เลือกจากคลังภาพ (ใช้ Modal เพราะ Alert แบบหลายปุ่มใช้บนเว็บไม่ได้)
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useT } from "../lib/i18n";
import type { PhotoSource } from "../lib/photo";
import { COLORS, FONTS } from "../lib/theme";
import Icon from "./Icon";

export default function PhotoSheet({
  visible,
  onClose,
  onPick,
  title,
  subtitle,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (source: PhotoSource) => void;
  title?: string;
  subtitle?: string;
}) {
  const { t } = useT();
  const choose = (src: PhotoSource) => {
    onClose();
    onPick(src);
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          {!!title && <Text style={s.title}>{title}</Text>}
          {!!subtitle && <Text style={s.sub}>{subtitle}</Text>}
          <Pressable style={s.row} onPress={() => choose("camera")} accessibilityRole="button">
            <Icon name="camera" size={20} />
            <Text style={s.rowText}>{t("takePhoto")}</Text>
          </Pressable>
          <Pressable style={s.row} onPress={() => choose("gallery")} accessibilityRole="button">
            <Icon name="photo" size={20} />
            <Text style={s.rowText}>{t("fromGallery")}</Text>
          </Pressable>
          <View style={s.gap} />
          <Pressable style={[s.row, s.cancel]} onPress={onClose} accessibilityRole="button">
            <Text style={[s.rowText, { color: COLORS.sub, textAlign: "center", flex: 1 }]}>{t("cancel")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14 },
  rowText: { fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.text },
  title: { fontFamily: FONTS.head, fontSize: 17, color: COLORS.text, textAlign: "center", marginTop: 4 },
  sub: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sub, textAlign: "center", marginTop: 2, marginBottom: 8 },
  gap: { height: 6 },
  cancel: { backgroundColor: COLORS.bg },
});
