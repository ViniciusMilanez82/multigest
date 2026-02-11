"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Check,
  X,
  FileText,
  Trash2,
  Loader2,
  MessageCircle,
  Mail,
  FileDown,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateProposalPdf } from "@/lib/proposal-pdf";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  RASCUNHO: { label: "Rascunho", variant: "outline" },
  ENVIADA: { label: "Enviada", variant: "default" },
  ACEITA: { label: "Aceita", variant: "default" },
  RECUSADA: { label: "Recusada", variant: "destructive" },
  CONVERTIDA: { label: "Convertida", variant: "secondary" },
};

const typeMap: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  EVENTO: "Evento",
};

export default function PropostaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [convertModal, setConvertModal] = useState<"contract" | "invoice" | null>(null);
  const [convertForm, setConvertForm] = useState({ startDate: "", endDate: "", paymentTerms: "", paymentMethod: "" });

  useEffect(() => {
    fetch();
  }, [id]);

  async function fetch() {
    try {
      setLoading(true);
      const { data } = await api.get(`/proposals/${id}`);
      setProposal(data);
    } catch {
      toast.error("Proposta não encontrada");
      router.push("/dashboard/proposals");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    setActionLoading("send");
    try {
      await api.patch(`/proposals/${id}/send`);
      setProposal((p: any) => ({ ...p, status: "ENVIADA" }));
      toast.success("Proposta enviada");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setActionLoading(null);
    }
  }

  async function accept() {
    setActionLoading("accept");
    try {
      await api.patch(`/proposals/${id}/accept`);
      setProposal((p: any) => ({ ...p, status: "ACEITA" }));
      toast.success("Proposta aceita");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setActionLoading(null);
    }
  }

  async function refuse() {
    setActionLoading("refuse");
    try {
      await api.patch(`/proposals/${id}/refuse`);
      setProposal((p: any) => ({ ...p, status: "RECUSADA" }));
      toast.success("Proposta recusada");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setActionLoading(null);
    }
  }

  function downloadPdf() {
    try {
      generateProposalPdf(proposal);
      toast.success("PDF gerado");
    } catch {
      toast.error("Erro ao gerar PDF");
    }
  }

  async function convertToContract() {
    if (!convertForm.startDate) {
      toast.error("Data de início é obrigatória");
      return;
    }
    setActionLoading("convert");
    try {
      const { data } = await api.post(`/proposals/${id}/convert-to-contract`, convertForm);
      setConvertModal(null);
      setProposal((p: any) => ({ ...p, status: "CONVERTIDA", contractId: data?.id, contract: data }));
      toast.success("Proposta convertida em contrato");
      fetch();
      if (data?.id) router.push(`/dashboard/contracts/${data.id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setActionLoading(null);
    }
  }

  async function convertToInvoice() {
    setActionLoading("convert");
    try {
      await api.post(`/proposals/${id}/convert-to-invoice`);
      setConvertModal(null);
      setProposal((p: any) => ({ ...p, status: "CONVERTIDA" }));
      toast.success("Proposta convertida em fatura");
      fetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir esta proposta?")) return;
    try {
      await api.delete(`/proposals/${id}`);
      toast.success("Proposta excluída");
      router.push("/dashboard/proposals");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erro");
    }
  }

  const cliente =
    proposal?.customer?.razaoSocial ||
    proposal?.companyName ||
    proposal?.customer?.nomeFantasia ||
    "—";
  const items = (proposal?.items as any[]) || [];
  const statusBadge = proposal ? statusMap[proposal.status] || { label: proposal.status, variant: "outline" as const } : null;

  const whatsappUrl = (() => {
    if (!proposal?.phone) return null;
    const phone = proposal.phone.replace(/\D/g, "");
    if (phone.length < 10) return null;
    return `https://wa.me/55${phone}`;
  })();

  const mailtoUrl = proposal?.email
    ? `mailto:${proposal.email}?subject=Proposta ${proposal.proposalNumber}`
    : null;

  if (loading || !proposal) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/proposals")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{proposal.proposalNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {typeMap[proposal.type]} — {cliente}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge && (
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          )}
          {proposal.status === "RASCUNHO" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/proposals/${id}/editar`)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                onClick={send}
                disabled={!!actionLoading}
              >
                {actionLoading === "send" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                Enviar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          {proposal.status === "ENVIADA" && (
            <>
              <Button size="sm" onClick={accept} disabled={!!actionLoading}>
                {actionLoading === "accept" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Aceitar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={refuse}
                disabled={!!actionLoading}
              >
                {actionLoading === "refuse" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-1" />
                )}
                Recusar
              </Button>
            </>
          )}
          {proposal.status === "ACEITA" && (
            <>
              {proposal.type !== "VENDA" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setConvertForm({
                      startDate: new Date().toISOString().split("T")[0],
                      endDate: "",
                      paymentTerms: "30 dias",
                      paymentMethod: "BOLETO",
                    });
                    setConvertModal("contract");
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Converter em Contrato
                </Button>
              )}
              {proposal.type === "VENDA" && (
                <Button
                  size="sm"
                  onClick={() => setConvertModal("invoice")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "convert" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-1" />
                  )}
                  Converter em Fatura
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {proposal.status === "ACEITA" && proposal.type !== "VENDA" && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileCheck className="w-5 h-5" />
              Proposta aceita — Fechar e gerar contrato
            </CardTitle>
            <CardDescription className="text-green-700">
              Clique em &quot;Converter em Contrato&quot; para dar continuidade e criar o contrato a partir desta proposta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={() => {
                setConvertForm({
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: "",
                  paymentTerms: "30 dias",
                  paymentMethod: "BOLETO",
                });
                setConvertModal("contract");
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Converter em Contrato
            </Button>
          </CardContent>
        </Card>
      )}

      {proposal.status === "CONVERTIDA" && proposal.contractId && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <FileCheck className="w-5 h-5" />
              Contrato gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 mb-3">
              Esta proposta foi convertida em contrato.
            </p>
            <Button asChild variant="outline">
              <Link href={`/dashboard/contracts/${proposal.contractId}`} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver contrato {proposal.contract?.contractNumber || ""}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Empresa:</span> {cliente}</p>
            {proposal.contactName && (
              <p><span className="text-muted-foreground">Contato:</span> {proposal.contactName}</p>
            )}
            {proposal.phone && (
              <p><span className="text-muted-foreground">Telefone:</span> {proposal.phone}</p>
            )}
            {proposal.email && (
              <p><span className="text-muted-foreground">E-mail:</span> {proposal.email}</p>
            )}
            <div className="flex gap-2 pt-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={downloadPdf}>
                <FileDown className="w-4 h-4 mr-1" />
                PDF
              </Button>
              {whatsappUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </a>
                </Button>
              )}
              {mailtoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={mailtoUrl}>
                    <Mail className="w-4 h-4 mr-1" />
                    E-mail
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Valor total:</span>{" "}
              R$ {Number(proposal.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p><span className="text-muted-foreground">Criada em:</span>{" "}
              {new Date(proposal.createdAt).toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Item</th>
                  <th className="px-4 py-3 text-right font-medium">Qtd</th>
                  <th className="px-4 py-3 text-right font-medium">Valor Unit.</th>
                  <th className="px-4 py-3 text-right font-medium">Frete</th>
                  <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => {
                  const subtotal =
                    item.quantidade * item.valorUnitario + (item.frete ?? 0);
                  const label = item.descricao || item.modelo || item.tipo || "—";
                  return (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3">{label}</td>
                      <td className="px-4 py-3 text-right">{item.quantidade}</td>
                      <td className="px-4 py-3 text-right">
                        R$ {Number(item.valorUnitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        R$ {(item.frete ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!convertModal} onOpenChange={() => setConvertModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {convertModal === "contract"
                ? "Converter em Contrato"
                : "Converter em Fatura"}
            </DialogTitle>
          </DialogHeader>
          {convertModal === "contract" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data de início *</Label>
                <Input
                  type="date"
                  value={convertForm.startDate}
                  onChange={(e) =>
                    setConvertForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de fim</Label>
                <Input
                  type="date"
                  value={convertForm.endDate}
                  onChange={(e) =>
                    setConvertForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Condições de pagamento</Label>
                <Input
                  value={convertForm.paymentTerms}
                  onChange={(e) =>
                    setConvertForm((f) => ({ ...f, paymentTerms: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Input
                  value={convertForm.paymentMethod}
                  onChange={(e) =>
                    setConvertForm((f) => ({ ...f, paymentMethod: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
          {convertModal === "invoice" && (
            <p className="py-4 text-sm text-muted-foreground">
              Será criada uma fatura de venda com o valor total da proposta.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertModal(null)}>
              Cancelar
            </Button>
            <Button
              onClick={
                convertModal === "contract" ? convertToContract : convertToInvoice
              }
              disabled={!!actionLoading}
            >
              {actionLoading === "convert" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
