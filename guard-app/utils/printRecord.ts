import * as Print from "expo-print";

export const printRecord = async (record: any) => {
  const html = `
    <html>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Employee Record</h2>

        <p><b>Name:</b> ${record.name}</p>
        <p><b>Employee ID:</b> ${record.employeeno}</p>

        <p><b>IN:</b> ${record.IN || "-"}</p>
        <p><b>OUT:</b> ${record.OUT || "-"}</p>

        <p><b>Items:</b> ${(record.items || []).join(", ")}</p>
      </body>
    </html>
  `;

  await Print.printAsync({ html });
};