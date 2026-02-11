"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Gavel } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ABERTA: { label: "Aberta", variant: "default" },
  EM_ANALISE: { label: "Em Análise", variant: "outline" },
  ADJUDICADA: { label: "Adjudicada", variant: "default" },
  CANCELADA: { label: "Cancelada", variant: "destructive" },
  ENCERRADA: { label: "Encerrada", variant: "secondary" },
};

export default function BiddingsPage() {
  const router = useRouter();
  const [biddings, setBiddings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [search, status]);
  async function fetch() { try { setLoading(true); const p: any = {}; if (search) p.search = search; if (status !== "ALL") p.status = status; const r = await api.get("/api/biddings", { params: p }); setBiddings(Array.isArray(r.data) ? r.data : r.data.data || []); } catch { toast.error("Erro ao carregar dados"); } finally { setLoading(false); } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Licitações</h1><p className="text-muted-foreground">{biddings.length} licitação(ões)</p></div>
        <Button onClick={() => router.push("/dashboard/biddings/novo")}><Plus className="mr-2 h-4 w-4" /> Nova Licitação</Button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos</SelectItem><SelectItem value="ABERTA">Aberta</SelectItem><SelectItem value="EM_ANALISE">Em Análise</SelectItem><SelectItem value="ADJUDICADA">Adjudicada</SelectItem><SelectItem value="CANCELADA">Cancelada</SelectItem><SelectItem value="ENCERRADA">Encerrada</SelectItem></SelectContent></Select>
      </div>
      {loading ? <div className="text-center py-12 text-muted-foreground">Carregando...</div> : biddings.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Gavel className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhuma licitação</p></CardContent></Card>
      ) : (
        <div className="rounded-md border overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left font-medium">Número</th><th className="px-4 py-3 text-left font-medium">Modalidade</th><th className="px-4 py-3 text-left font-medium">Órgão</th><th className="px-4 py-3 text-left font-medium">Objeto</th><th className="px-4 py-3 text-left font-medium">Abertura</th><th className="px-4 py-3 text-left font-medium">Valor Est.</th><th className="px-4 py-3 text-left font-medium">Status</th></tr></thead>
        <tbody>{biddings.map(b => {
          const s = statusMap[b.status] || { label: b.status, variant: "outline" as const };
          return (<tr key={b.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/biddings/${b.id}`)}>
            <td className="px-4 py-3 font-medium">{b.number}</td><td className="px-4 py-3">{b.modality || "—"}</td><td className="px-4 py-3">{b.agency || "—"}</td>
            <td className="px-4 py-3 max-w-[200px] truncate">{b.object || "—"}</td><td className="px-4 py-3">{b.openingDate ? new Date(b.openingDate).toLocaleDateString("pt-BR") : "—"}</td>
            <td className="px-4 py-3">{b.estimatedValue ? `R$ ${Number(b.estimatedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</td>
            <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
          </tr>);
        })}</tbody></table></div>
      )}
    </div>
  );
}
