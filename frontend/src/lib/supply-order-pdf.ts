import { jsPDF } from "jspdf";

interface SupplyOrderForPdf {
  supplyNumber: string;
  customerName?: string;
  mobilization?: boolean;
  equipmentCount?: number;
  deliveryDate?: string;
  layoutNotes?: string;
  technicalNotes?: string;
  contractNumber?: string;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

export function generateSupplyOrderPdf(
  order: SupplyOrderForPdf,
  companyName?: string
): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Documento AF — Ficha de Fornecimento", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName || "MultiGest", margin, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Nº ${order.supplyNumber}`, margin, y);
  if (order.contractNumber) doc.text(`Contrato: ${order.contractNumber}`, 120, y);
  y += 10;

  doc.setFontSize(10);
  doc.text("Cliente:", margin, y);
  doc.text(order.customerName || "—", margin + 30, y);
  y += 6;

  doc.text("Mobilização:", margin, y);
  doc.text(order.mobilization ? "Sim" : "Não", margin + 30, y);
  y += 6;

  doc.text("Qtd equipamentos:", margin, y);
  doc.text(String(order.equipmentCount ?? "—"), margin + 45, y);
  y += 6;

  doc.text("Data entrega:", margin, y);
  doc.text(order.deliveryDate ? formatDate(order.deliveryDate) : "—", margin + 35, y);
  y += 10;

  if (order.layoutNotes) {
    doc.setFont("helvetica", "bold");
    doc.text("Layout / Observações:", margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    const layoutLines = doc.splitTextToSize(order.layoutNotes, 170);
    doc.text(layoutLines, margin, y);
    y += layoutLines.length * 5 + 4;
  }

  if (order.technicalNotes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notas técnicas (220V, suíte):", margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    const techLines = doc.splitTextToSize(order.technicalNotes, 170);
    doc.text(techLines, margin, y);
    y += techLines.length * 5 + 6;
  }

  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")} — AF ${order.supplyNumber}`,
    margin,
    y
  );

  doc.save(`documento-af-${order.supplyNumber}.pdf`);
}
