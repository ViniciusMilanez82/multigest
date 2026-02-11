import { jsPDF } from "jspdf";

interface ProposalForPdf {
  proposalNumber: string;
  type: string;
  status: string;
  valorTotal: number | string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  items: Array<{
    tipo?: string;
    modelo?: string;
    quantidade: number;
    valorUnitario: number;
    frete?: number;
  }>;
}

const typeMap: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  EVENTO: "Evento",
};

export function generateProposalPdf(proposal: ProposalForPdf, companyName?: string): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Proposta Comercial", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName || "MultiGest", margin, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Nº ${proposal.proposalNumber}`, margin, y);
  doc.text(typeMap[proposal.type] || proposal.type, 120, y);
  y += 10;

  doc.setFontSize(10);
  doc.text("Cliente:", margin, y);
  doc.text(
    proposal.companyName || proposal.contactName || "—",
    margin + 30,
    y
  );
  y += 6;

  if (proposal.contactName || proposal.phone || proposal.email) {
    doc.text("Contato:", margin, y);
    const contact = [proposal.contactName, proposal.phone, proposal.email]
      .filter(Boolean)
      .join(" | ");
    doc.text(contact || "—", margin + 30, y);
    y += 6;
  }

  y += 5;
  doc.setFontSize(10);
  doc.text("Itens", margin, y);
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 190, y);
  y += 2;

  doc.setFont("helvetica", "bold");
  doc.text("Modelo", margin, y);
  doc.text("Qtd", 100, y);
  doc.text("Unit.", 120, y);
  doc.text("Frete", 150, y);
  doc.text("Subtotal", 170, y);
  doc.setFont("helvetica", "normal");
  y += 6;

  for (const item of proposal.items) {
    const subtotal =
      item.quantidade * item.valorUnitario + (item.frete ?? 0);
    doc.text(item.modelo || "—", margin, y);
    doc.text(String(item.quantidade), 100, y);
    doc.text(
      `R$ ${Number(item.valorUnitario).toFixed(2)}`,
      120,
      y
    );
    doc.text(
      `R$ ${(item.frete ?? 0).toFixed(2)}`,
      150,
      y
    );
    doc.text(
      `R$ ${subtotal.toFixed(2)}`,
      170,
      y
    );
    y += 6;
  }

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total: R$ ${Number(proposal.valorTotal).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    margin,
    y
  );
  doc.setFont("helvetica", "normal");

  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")} — Proposta ${proposal.proposalNumber}`,
    margin,
    y
  );

  doc.save(`proposta-${proposal.proposalNumber}.pdf`);
}
