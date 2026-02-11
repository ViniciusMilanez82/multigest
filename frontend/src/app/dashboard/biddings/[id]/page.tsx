"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusMap: Record<string, string> = { ABERTA: "Aberta", EM_ANALISE: "Em Análise", ADJUDICADA: "Adjudicada", CANCELADA: "Cancelada", ENCERRADA: "Encerrada" };

export default function BiddingDetailPage() {
  const router = useRouter(); const params = useParams();
  const [bidding, setBidding] = useState<any>(null); const [loading, setLoading] = useState(true);

  useEffect(() => { api.get(`/api/biddings/${params.id}`).then(r => setBidding(r.data)).catch(() => { toast.error("Não encontrado"); router.push("/dashboard/biddings"); }).finally(() => setLoading(false)); }, []);
  async function handleDelete() { try { await api.delete(`/api/biddings/${params.id}`); toast.success("Excluído"); router.push("/dashboard/biddings"); } catch (e: any) { toast.error(e.response?.data?.message || "Erro"); } }
  async function changeStatus(s: string) { try { await api.put(`/api/biddings/${params.id}`, { status: s }); setBidding((p: any) => ({ ...p, status: s })); toast.success("Status atualizado"); } catch { toast.error("Erro"); } }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!bidding) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/biddings")}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-2xl font-bold">Licitação {bidding.number}</h1><p className="text-muted-foreground">{bidding.agency || "Sem órgão"}</p></div></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/biddings/${bidding.id}/editar`)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar</AlertDialogTitle><AlertDialogDescription>Excluir licitação {bidding.number}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Informações</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Número</span><span className="font-mono">{bidding.number}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Modalidade</span><span>{bidding.modality || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Órgão</span><span>{bidding.agency || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Data Abertura</span><span>{bidding.openingDate ? new Date(bidding.openingDate).toLocaleDateString("pt-BR") : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Valor Estimado</span><span>{bidding.estimatedValue ? `R$ ${Number(bidding.estimatedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</span></div>
          {bidding.object && <div className="pt-2 border-t"><p className="text-sm font-medium mb-1">Objeto</p><p className="text-sm text-muted-foreground">{bidding.object}</p></div>}
          {bidding.notes && <div className="pt-2 border-t"><p className="text-sm font-medium mb-1">Observações</p><p className="text-sm text-muted-foreground">{bidding.notes}</p></div>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent className="space-y-4">
          <Badge className="text-lg px-4 py-1">{statusMap[bidding.status] || bidding.status}</Badge>
          <div><label className="text-sm font-medium block mb-2">Alterar Status</label>
            <Select value={bidding.status} onValueChange={changeStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ABERTA">Aberta</SelectItem><SelectItem value="EM_ANALISE">Em Análise</SelectItem><SelectItem value="ADJUDICADA">Adjudicada</SelectItem><SelectItem value="CANCELADA">Cancelada</SelectItem><SelectItem value="ENCERRADA">Encerrada</SelectItem></SelectContent></Select>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
