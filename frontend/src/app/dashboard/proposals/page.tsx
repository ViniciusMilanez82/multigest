"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch();
  }, [search, status, type]);

  async function fetch() {
    try {
      setLoading(true);
      const p: any = {};
      if (search) p.search = search;
      if (status !== "ALL") p.status = status;
      if (type !== "ALL") p.type = type;
      const r = await api.get("/proposals", { params: p });
      setProposals(Array.isArray(r.data) ? r.data : r.data?.data || []);
    } catch {
      toast.error("Erro ao carregar propostas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propostas</h1>
          <p className="text-muted-foreground">
            {proposals.length} proposta(s)
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/proposals/novo")}>
          <Plus className="mr-2 h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="RASCUNHO">Rascunho</SelectItem>
            <SelectItem value="ENVIADA">Enviada</SelectItem>
            <SelectItem value="ACEITA">Aceita</SelectItem>
            <SelectItem value="RECUSADA">Recusada</SelectItem>
            <SelectItem value="CONVERTIDA">Convertida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="VENDA">Venda</SelectItem>
            <SelectItem value="LOCACAO">Locação</SelectItem>
            <SelectItem value="EVENTO">Evento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando...
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma proposta</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Número</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const s = statusMap[p.status] || {
                  label: p.status,
                  variant: "outline" as const,
                };
                const cliente =
                  p.customer?.razaoSocial ||
                  p.companyName ||
                  p.customer?.nomeFantasia ||
                  "—";
                return (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/proposals/${p.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{p.proposalNumber}</td>
                    <td className="px-4 py-3">{typeMap[p.type] || p.type}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {cliente}
                    </td>
                    <td className="px-4 py-3">
                      R${" "}
                      {Number(p.valorTotal).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "CONVERTIDA" && p.contractId && (
                        <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/dashboard/contracts/${p.contractId}`} title="Ver contrato">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
