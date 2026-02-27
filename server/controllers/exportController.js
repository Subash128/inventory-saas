import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Inventory from "../models/Inventory.js";
//Excel
export const exportExcel = async (req, res) => {
  try {
    const items = await Inventory.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Stage", key: "stage", width: 15 },
      { header: "Tag", key: "tag", width: 15 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    items.forEach((item) => {
      worksheet.addRow({
        name: item.name,
        stage: item.stage,
        tag: item.tag,
        quantity: item.quantity,
        createdAt: item.createdAt,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//PDF 
export const exportPDF = async (req, res) => {
  try {
    const items = await Inventory.find();

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=inventory.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Inventory Report", { align: "center" });
    doc.moveDown();

    items.forEach((item) => {
      doc
        .fontSize(12)
        .text(
          `Name: ${item.name} | Stage: ${item.stage} | Tag: ${item.tag} | Qty: ${item.quantity}`
        );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};