import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Inventory from "../models/Inventory.js";

// Excel Export
export const exportExcel = async (req, res) => {
  try {
    const items = await Inventory.find().populate("createdBy", "name");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Report");

    // Header styling
    worksheet.columns = [
      { header: "Tag No", key: "tagNo", width: 12 },
      { header: "Location", key: "locationName", width: 25 },
      { header: "Item Name", key: "itemName", width: 25 },
      { header: "Stage", key: "stage", width: 22 },
      { header: "Quantity", key: "quantity", width: 12 },
      //{ header: "Tons", key: "tons", width: 12 },
      { header: "Added By", key: "createdBy", width: 18 },
      { header: "Date", key: "createdAt", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    items.forEach((item) => {
      worksheet.addRow({
        tagNo: item.tagNo,
        locationName: item.locationName,
        itemName: item.itemName,
        stage: item.stage,
        quantity: item.quantity,
        // tons: item.tons,
        createdBy: item.createdBy?.name || "N/A",
        createdAt: item.createdAt?.toLocaleDateString("en-IN"),
      });
    });

    // Summary row
    const totalQty = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
    //const totalTons = items.reduce((acc, i) => acc + (i.tons || 0), 0);

    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      tagNo: "",
      locationName: "",
      itemName: "TOTAL",
      stage: "",
      quantity: totalQty,
      //tons: totalTons,
      createdBy: "",
      createdAt: "",
    });
    summaryRow.font = { bold: true, size: 12 };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PDF Export
export const exportPDF = async (req, res) => {
  try {
    const items = await Inventory.find().populate("createdBy", "name");

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory-report.pdf"
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("JHI Inventory Report", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, {
        align: "center",
      });
    doc.moveDown(1);

    // Table header
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text(
      "Tag No   | Location              | Item Name             | Stage                 | Qty    ",
      { width: 520 }
    );
    doc.moveDown(0.3);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font("Helvetica").fontSize(8);
    items.forEach((item) => {
      const line = `${String(item.tagNo).padEnd(9)}| ${(item.locationName || "").padEnd(22)}| ${(item.itemName || "").padEnd(22)}| ${(item.stage || "").padEnd(22)}| ${String(item.quantity || 0).padEnd(7)}`;
      doc.text(line, { width: 520 });
      doc.moveDown(0.15);
    });

    // Summary
    const totalQty = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
    //const totalTons = items.reduce((acc, i) => acc + (i.tons || 0), 0);

    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke();
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Total Items: ${items.length}  |  Total Qty: ${totalQty}`);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
