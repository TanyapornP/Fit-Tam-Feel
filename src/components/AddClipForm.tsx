// ฟอร์มเพิ่มคลิปของฉัน (ตรวจข้อมูลก่อนบันทึก แบบเดียวกับฟอร์มในแลบ 9)
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useData } from "../lib/DataContext";
import { useT } from "../lib/i18n";
import { tierOf, ytId } from "../lib/logic";
import { ui } from "../lib/styles";
import BatterySlider from "./BatterySlider";
import { Btn, Field } from "./ui";

export default function AddClipForm({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const { addClip, battery } = useData();
  const [title, setTitle] = useState("");
  const [min, setMin] = useState("10");
  const [link, setLink] = useState("");
  const [pct, setPct] = useState(battery);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const m = parseInt(min, 10);
    if (!title.trim() || !m || m < 1 || m > 120 || !link.trim()) return setErr(t("errClip"));
    const vid = ytId(link);
    if (!vid) return setErr(t("errLink"));
    setBusy(true);
    try {
      await addClip({ title: title.trim(), min: m, vid, pct, level: tierOf(pct) });
      onDone();
    } catch (e) {
      setErr(t("saveFail") + " (" + (e as Error).message + ")");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[ui.card, { marginTop: 10, marginBottom: 14 }]}>
      <Field label={t("clipTitle")} value={title} onChangeText={setTitle} placeholder={t("clipTitlePh")} autoCapitalize="sentences" />
      <Field label={t("clipMin")} value={min} onChangeText={setMin} keyboardType="number-pad" maxLength={3} />
      <Field label={t("clipLink")} value={link} onChangeText={setLink} placeholder="https://youtu.be/..." keyboardType="url" />
      <Text style={ui.label}>{t("clipEnergy")}</Text>
      <Text style={ui.big}>{pct}%</Text>
      <BatterySlider value={pct} onChange={setPct} />
      <Text style={[ui.mid, { marginBottom: 12 }]}>{t("tier_" + tierOf(pct))}</Text>
      {!!err && <Text style={ui.err}>{err}</Text>}
      <Btn label={t("saveClip")} onPress={save} busy={busy} />
      <Pressable onPress={onDone} style={{ alignItems: "center", marginTop: 12 }}>
        <Text style={ui.link}>{t("cancel")}</Text>
      </Pressable>
    </View>
  );
}
