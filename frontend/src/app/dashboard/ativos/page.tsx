"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface AssetType {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  code: string;
  status: string;
  condition: string;
  currentLocation: string;
  dailyRate: number | string;
  assetType?: AssetType;
}

interface PaginatedResponse {
  data: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "AVAILABLE", label: "Disponível" },
  { value: "RENTED", label: "Alugado" },
  { value: "IN_MAINTENANCE", label: "Em Manutenção" },
  { value: "IN_TRANSIT", label: "Em Trânsito" },
  { value: "DECOMMISSIONED", label: "Baixado" },
];

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponível",
  RENTED: "Alugado",
  IN_MAINTENANCE: "Em Manutenção",
  IN_TRANSIT: "Em Trânsito",
  DECOMMISSIONED: "Baixado",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RENTED: "bg-blue-100 text-blue-800",
  IN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
  IN_TRANSIT: "bg-orange-100 text-orange-800",
  DECOMMISSIONED: "bg-red-100 text-red-800",
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: "Excelente",
  GOOD: "Bom",
  FAIR: "Regular",
  POOR: "Ruim",
};

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AtivosPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.assetTypeId = typeFilter;

      const { data } = await api.get<PaginatedResponse>("/assets", { params });
      setAssets(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error("Erro ao carregar dados");
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  const fetchAssetTypes = useCallback(async () => {
    try {
      const { data } = await api.get("/asset-types");
      setAssetTypes(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error("Erro ao carregar dados");
      setAssetTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchAssetTypes();
  }, [fetchAssetTypes]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ativos</h2>
          <p className="text-gray-500 mt-1">
            Gerencie containers, módulos e equipamentos
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/ativos/novo")}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ativo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por código, série..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Tipos</SelectItem>
                {assetTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Package className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum ativo encontrado</p>
              <p className="text-sm mt-1">
                Ajuste os filtros ou cadastre um novo ativo
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Valor Diário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {asset.code}
                      </TableCell>
                      <TableCell>
                        {asset.assetType?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[asset.status] || ""}
                        >
                          {STATUS_LABELS[asset.status] || asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {CONDITION_LABELS[asset.condition] || asset.condition || "—"}
                      </TableCell>
                      <TableCell>{asset.currentLocation || "—"}</TableCell>
                      <TableCell>{formatCurrency(asset.dailyRate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/dashboard/ativos/${asset.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/dashboard/ativos/${asset.id}/editar`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  {total} ativo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
