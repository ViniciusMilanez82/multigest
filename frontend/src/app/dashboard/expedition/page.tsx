"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Truck, Ban, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ExpeditionItem {
  id: string;
  contractId: string;
  contractNumber: string;
  customer: string;
  assetCode: string;
  assetType: string;
  scheduledDeliveryDate: string;
  deliveryBlockedReason: string | null;
  isBlocked: boolean;
  contractSignedAt: string | null;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

export default function ExpeditionPage() {
  const router = useRouter();
  const [items, setItems] = useState<ExpeditionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const fetchExpedition = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      const { data } = await api.get(`/dashboard/expedition?${params}`);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar painel de expedição.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const defaultStart = now.toISOString().slice(0, 10);
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const s = start || defaultStart;
    const e = end || defaultEnd;
    if (!start) setStart(s);
    if (!end) setEnd(e);
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("start", s);
        params.set("end", e);
        const { data } = await api.get(`/dashboard/expedition?${params}`);
        setItems(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Erro ao carregar painel de expedição.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando...</span>
      </div>
    );
  }

  const blockedCount = items.filter((i) => i.isBlocked).length;
  const releasedCount = items.length - blockedCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Expedição</h1>
        <p className="text-gray-500 mt-1">
          Entregas programadas e status de bloqueio
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Filtro de Período
            </CardTitle>
            <CardDescription>
              Defina o intervalo de datas para visualizar entregas programadas
            </CardDescription>
          </div>
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Início</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" />
            </div>
            <Button variant="outline" size="sm" onClick={fetchExpedition}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Itens</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bloqueados</p>
                <p className="text-2xl font-bold">{blockedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Liberados</p>
                <p className="text-2xl font-bold">{releasedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entregas Programadas</CardTitle>
          <CardDescription>
            Itens com data de entrega definida no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="w-10 h-10 mb-2 text-gray-300" />
              <p>Nenhum item com entrega programada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {formatDate(row.scheduledDeliveryDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/contracts/${row.contractId}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {row.contractNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell className="font-mono">{row.assetCode || "—"}</TableCell>
                    <TableCell>{row.assetType || "—"}</TableCell>
                    <TableCell>
                      {row.isBlocked ? (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="w-3 h-3" />
                          {row.deliveryBlockedReason === "PAGAMENTO_PENDENTE"
                            ? "Pagamento"
                            : row.deliveryBlockedReason === "CONTRATO_NAO_ASSINADO"
                            ? "Contrato"
                            : row.deliveryBlockedReason || "Bloqueado"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Liberado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.contractSignedAt ? (
                        <Badge variant="outline" className="text-green-700">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700">
                          Não
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/contracts/${row.contractId}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
