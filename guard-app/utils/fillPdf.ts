import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { PDFDocument } from "pdf-lib";

export const fillAndPrintPdf = async (records: any[]) => {
  try {
    console.log("📄 Loading PDF template...");

    const asset = Asset.fromModule(require("../assets/images/tickler.pdf"));
    await asset.downloadAsync();

    const existingPdfBytes = await FileSystem.readAsStringAsync(
      asset.localUri!,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
      ignoreEncryption: true,
    });

    // 🔥 SAFE FORM ACCESS (NO CRASH)
    let form: any = null;
    try {
      form = pdfDoc.getForm();
    } catch (e) {
      console.log("⚠️ PDF form not supported, skipping fields");
    }

    const cleanText = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\u202f/g, " ")
        .replace(/[^\x00-\xFF]/g, "");
    };

    const formatDate = (iso: string) => {
      if (!iso) return "";
      const d = new Date(iso);
      return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}-${d.getFullYear()}`;
    };

    const formatTime = (iso: string) => {
      if (!iso) return "";
      return new Date(iso)
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase();
    };

    const setField = (name: string, value: string) => {
      try {
        if (!form) return; // 🔥 skip if no form

        const field = form.getTextField(name);
        field.setText(cleanText(value));

        if (name.startsWith("in") || name.startsWith("out")) {
          field.setFontSize(8);
        }
      } catch (e) {
        console.log("⚠️ Field error:", name);
      }
    };

    const sigPositions: any = {
      1: { x: 200, y: 600 },
      2: { x: 465, y: 600 },
      3: { x: 200, y: 460 },
      4: { x: 465, y: 460 },
      5: { x: 200, y: 320 },
      6: { x: 465, y: 320 },
      7: { x: 200, y: 195 },
      8: { x: 465, y: 195 },
      9: { x: 200, y: 75 },
    };

    const page = pdfDoc.getPages()[0];

    for (const rec of records) {
      const n = rec.attendanceNo;
      if (!n || n < 1 || n > 9) continue;

      setField(`name${n}`, rec.name || "");
      setField(`pos${n}`, rec.position || "");
      setField(`date${n}`, formatDate(rec.IN));
      setField(`in${n}`, formatTime(rec.IN));
      setField(`out${n}`, formatTime(rec.OUT));

      rec.items?.forEach((item: string, index: number) => {
        setField(`item${n}-${index + 1}`, cleanText(item));
      });

      // 🔥 SIGNATURE (ALWAYS WORKS EVEN WITHOUT FORM)
      if (rec.signature) {
        try {
          let base64 = rec.signature;

          if (base64.includes(",")) {
            base64 = base64.split(",")[1];
          }

          if (!base64 || base64.length < 50) continue;

          let img;

          if (rec.signature.includes("png")) {
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

    // 🔥 FLATTEN ONLY IF FORM EXISTS
    if (form) {
      form.flatten();
    }

    const pdfBytes = await pdfDoc.save();

    const fileName = formatDate(
      records[0]?.IN || new Date().toISOString()
    );

    const fileUri = FileSystem.documentDirectory + `${fileName}.pdf`;

    await FileSystem.writeAsStringAsync(
      fileUri,
      Buffer.from(pdfBytes).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    console.log("📁 PDF saved at:", fileUri);

    // 🔥 PRINT OR SHARE (100% RELIABLE)
    try {
      await Print.printAsync({ uri: fileUri });
    } catch {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    }

  } catch (err) {
    console.log("❌ PDF Error:", err);
  }
};