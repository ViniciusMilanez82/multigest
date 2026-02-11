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
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  code?: string;
  type: string;
  cpfCnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  segment?: string;
  isActive: boolean;
  isDefaulter: boolean;
  contacts?: { name: string; phone?: string; email?: string }[];
}

const TYPE_LABELS: Record<string, string> = {
  FISICA: "Pessoa Física",
  JURIDICA: "Pessoa Jurídica",
};

const TYPE_COLORS: Record<string, string> = {
  FISICA: "bg-purple-100 text-purple-800",
  JURIDICA: "bg-blue-100 text-blue-800",
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await api.get("/customers", { params });
      const list = Array.isArray(data) ? data : data.data || [];
      setCustomers(list);
    } catch {
      toast.error("Erro ao carregar dados");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered =
    typeFilter === "ALL"
      ? customers
      : customers.filter((c) => c.type === typeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-500 mt-1">
            Gerencie os clientes da empresa
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/customers/novo")}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ/CPF, código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os Tipos</SelectItem>
                <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
                <SelectItem value="FISICA">Pessoa Física</SelectItem>
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Users className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm mt-1">
                Ajuste os filtros ou cadastre um novo cliente
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => {
                  const mainContact = customer.contacts?.[0];
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.code || "—"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.razaoSocial}</p>
                          {customer.nomeFantasia && (
                            <p className="text-xs text-gray-500">
                              {customer.nomeFantasia}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {customer.cpfCnpj}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={TYPE_COLORS[customer.type] || ""}
                        >
                          {TYPE_LABELS[customer.type] || customer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.segment || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {mainContact
                          ? mainContact.phone || mainContact.email || mainContact.name
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/customers/${customer.id}/editar`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
