import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import { PDFDocument } from "pdf-lib";
export const fillAndPrintPdf = async (records: any[]) => {
  try {
    // 📄 LOAD PDF
    const asset = Asset.fromModule(require("../assets/images/tickler.pdf"));
    await asset.downloadAsync();

    const existingPdfBytes = await FileSystem.readAsStringAsync(
      asset.localUri!,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
      ignoreEncryption: true,
    });

    const form = pdfDoc.getForm();

    // 🔥 FORMAT DATE → 04-25-2026
    const formatDate = (iso: string) => {
      const d = new Date(iso);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    };

    // 🔥 FORMAT TIME → 3:06 pm
    const formatTime = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    };

    // 🔥 SAFE SET FIELD (prevents crash)
    const setField = (name: string, value: string) => {
      try {
        form.getTextField(name).setText(value);
      } catch {
        console.log("⚠️ Missing field:", name);
      }
    };

    // 🔥 LOOP ALL RECORDS
    records.forEach((rec) => {
      const n = rec.attendanceNo;

      // BASIC INFO
      setField(`name${n}`, rec.name || "");
      setField(`pos${n}`, rec.position || "");
      setField(`date${n}`, formatDate(rec.IN));

      // ✅ FIXED LOWERCASE
      setField(`in${n}`, formatTime(rec.IN));
      setField(`out${n}`, formatTime(rec.OUT));

      // ITEMS
      rec.items?.forEach((item: string, index: number) => {
        setField(`item${n}-${index + 1}`, item);
      });
    });

    // SAVE PDF
    const pdfBytes = await pdfDoc.save();

    const fileUri = FileSystem.documentDirectory + "filled.pdf";

    await FileSystem.writeAsStringAsync(
      fileUri,
      Buffer.from(pdfBytes).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // 🖨️ PRINT
    await Print.printAsync({ uri: fileUri });

  } catch (err) {
    console.log("❌ PDF Error:", err);
  }
};