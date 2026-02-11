"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Hash,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  cellphone?: string;
  email?: string;
  isMain: boolean;
}

interface Address {
  id: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  label?: string;
  isMain: boolean;
}

interface Customer {
  id: string;
  code?: string;
  type: string;
  cpfCnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  segment?: string;
  notes?: string;
  isActive: boolean;
  isDefaulter: boolean;
  createdAt?: string;
  updatedAt?: string;
  addresses?: Address[];
  contacts?: Contact[];
  contracts?: { id: string; code?: string; status: string }[];
}

const TYPE_LABELS: Record<string, string> = {
  FISICA: "Pessoa Física",
  JURIDICA: "Pessoa Jurídica",
};

const TYPE_COLORS: Record<string, string> = {
  FISICA: "bg-purple-100 text-purple-800",
  JURIDICA: "bg-blue-100 text-blue-800",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatAddress(addr: Address): string {
  const parts = [addr.street];
  if (addr.number) parts[0] += `, ${addr.number}`;
  if (addr.complement) parts.push(addr.complement);
  if (addr.neighborhood) parts.push(addr.neighborhood);
  parts.push(`${addr.city}/${addr.state}`);
  if (addr.zipCode) parts.push(`CEP: ${addr.zipCode}`);
  return parts.join(" — ");
}

export default function ClienteDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/customers/${id}`);
      setCustomer(data);
    } catch {
      toast.error("Erro ao carregar cliente.");
      router.push("/dashboard/customers");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  async function handleDelete() {
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Cliente excluído com sucesso!");
      router.push("/dashboard/customers");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao excluir cliente."
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando cliente...</span>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/customers")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {customer.razaoSocial}
              </h2>
              <Badge
                variant="secondary"
                className={TYPE_COLORS[customer.type] || ""}
              >
                {TYPE_LABELS[customer.type] || customer.type}
              </Badge>
              {customer.isDefaulter && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Inadimplente
                </Badge>
              )}
            </div>
            {customer.nomeFantasia && (
              <p className="text-gray-500 mt-1">{customer.nomeFantasia}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá desativar o cliente{" "}
                  <strong>{customer.razaoSocial}</strong>. O registro não será
                  removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={() => router.push(`/dashboard/customers/${id}/editar`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Hash className="w-4 h-4" />
                  Código
                </div>
                <p className="font-medium">{customer.code || "—"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  {customer.type === "FISICA" ? "CPF" : "CNPJ"}
                </div>
                <p className="font-medium font-mono">{customer.cpfCnpj}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-4 h-4" />
                  Razão Social
                </div>
                <p className="font-medium">{customer.razaoSocial}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="w-4 h-4" />
                  Nome Fantasia
                </div>
                <p className="font-medium">
                  {customer.nomeFantasia || "—"}
                </p>
              </div>

              {customer.inscricaoEstadual && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Inscrição Estadual</p>
                  <p className="font-medium">{customer.inscricaoEstadual}</p>
                </div>
              )}

              {customer.inscricaoMunicipal && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Inscrição Municipal</p>
                  <p className="font-medium">{customer.inscricaoMunicipal}</p>
                </div>
              )}

              {customer.segment && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Segmento</p>
                  <p className="font-medium">{customer.segment}</p>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Tipo</p>
              <Badge
                variant="secondary"
                className={`text-sm ${TYPE_COLORS[customer.type] || ""}`}
              >
                {TYPE_LABELS[customer.type] || customer.type}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="secondary"
                className={
                  customer.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {customer.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {customer.createdAt && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Cadastrado em</p>
                <p className="font-medium text-sm">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
            )}
            {customer.contracts && customer.contracts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Contratos</p>
                <p className="font-medium text-sm">
                  {customer.contracts.length} contrato
                  {customer.contracts.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Endereços */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Endereços
          </CardTitle>
          <CardDescription>Endereços cadastrados do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {!customer.addresses || customer.addresses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Nenhum endereço cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50"
                >
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {formatAddress(addr)}
                      </p>
                      {addr.isMain && (
                        <Badge variant="secondary" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </div>
                    {addr.label && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {addr.label}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Contatos
          </CardTitle>
          <CardDescription>Pessoas de contato do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {!customer.contacts || customer.contacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Nenhum contato cadastrado
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-lg border bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{contact.name}</p>
                    {contact.isMain && (
                      <Badge variant="secondary" className="text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                  {contact.role && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {contact.role}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {contact.phone}
                      </span>
                    )}
                    {contact.cellphone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {contact.cellphone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {contact.email}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
