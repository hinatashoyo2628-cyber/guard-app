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

    // 🔥 FORMAT DATE
    const formatDate = (iso: string) => {
      if (!iso) return "";
      const d = new Date(iso);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    };

    // 🔥 FORMAT TIME
    const formatTime = (iso: string) => {
      if (!iso) return "";
      const d = new Date(iso);
      return d
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();
    };

    // 🔥 SAFE TEXT SET
  const setField = (name: string, value: string) => {
  try {
    const field = form.getTextField(name);

    field.setText(value);

    // 🔥 make IN/OUT smaller
    if (name.startsWith("in") || name.startsWith("out")) {
      field.setFontSize(8); // adjust if needed (7–10)
    }
  } catch {}
};

    // 🔥 SIGNATURE POSITIONS
    const sigPositions: any = {
      1: { x: 200, y: 600 },
      2: { x: 465, y: 600 },
      3: { x: 250, y: 500 },
      4: { x: 480, y: 500 },
      5: { x: 250, y: 350 },
      6: { x: 480, y: 350 },
      7: { x: 250, y: 200 },
      8: { x: 480, y: 200 },
      9: { x: 250, y: 50 },
    };

    const page = pdfDoc.getPages()[0];

    // 🔥 LOOP RECORDS
    for (const rec of records) {
      const n = rec.attendanceNo;

      if (!n || n < 1 || n > 9) continue;

      // TEXT
      setField(`name${n}`, rec.name || "");
      setField(`pos${n}`, rec.position || "");
      setField(`date${n}`, formatDate(rec.IN));

      setField(`in${n}`, formatTime(rec.IN));
      setField(`out${n}`, formatTime(rec.OUT));

      rec.items?.forEach((item: string, index: number) => {
        setField(`item${n}-${index + 1}`, item);
      });

      // 🔥 FIXED SIGNATURE DRAW (STABLE VERSION)
      if (rec.signature) {
        try {
          let base64 = rec.signature;

          // ✅ REMOVE PREFIX (important)
          if (base64.includes(",")) {
            base64 = base64.split(",")[1];
          }

          // ❌ skip invalid signatures
          if (!base64 || base64.length < 100) continue;

          let img;

          // ✅ SAFE FORMAT DETECTION
          if (rec.signature.startsWith("data:image/png")) {
            img = await pdfDoc.embedPng(base64);
          } else {
            img = await pdfDoc.embedJpg(base64);
          }

          const pos = sigPositions[n];

          if (pos) {
            page.drawImage(img, {
              x: pos.x - 20,
              y: pos.y - 23,
              width: 100,
              height: 40,
            });
          }
        } catch (e) {
          console.log("❌ Signature error:", e);
        }
      }
    }

    // 🔥 MAKE NON-EDITABLE
    form.flatten();

    // SAVE
    const pdfBytes = await pdfDoc.save();

    // 🔥 FILE NAME = DATE
    const fileName = formatDate(
      records[0]?.IN || new Date().toISOString()
    );

    const fileUri = FileSystem.documentDirectory + `${fileName}.pdf`;

    await FileSystem.writeAsStringAsync(
      fileUri,
      Buffer.from(pdfBytes).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // PRINT
    await Print.printAsync({ uri: fileUri });

  } catch (err) {
    console.log("❌ PDF Error:", err);
  }
};