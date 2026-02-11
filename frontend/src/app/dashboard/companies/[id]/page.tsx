"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

function formatAddress(c: Company): string | null {
  if (!c.street) return null;
  const parts = [c.street];
  if (c.number) parts[0] += `, ${c.number}`;
  if (c.complement) parts.push(c.complement);
  if (c.neighborhood) parts.push(c.neighborhood);
  if (c.city && c.state) parts.push(`${c.city}/${c.state}`);
  if (c.zipCode) parts.push(`CEP: ${c.zipCode}`);
  return parts.join(" — ");
}

export default function EmpresaDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/companies/${id}`);
      setCompany(data);
    } catch {
      toast.error("Erro ao carregar empresa.");
      router.push("/dashboard/companies");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Carregando empresa...</span>
      </div>
    );
  }

  if (!company) return null;

  const address = formatAddress(company);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/companies")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {company.razaoSocial}
              </h2>
              <Badge
                variant="secondary"
                className={
                  company.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {company.isActive ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            {company.nomeFantasia && (
              <p className="text-gray-500 mt-1">{company.nomeFantasia}</p>
            )}
          </div>
        </div>

        <Button onClick={() => router.push(`/dashboard/companies/${id}/editar`)}>
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  CNPJ
                </div>
                <p className="font-medium font-mono">{company.cnpj}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-4 h-4" />
                  Razão Social
                </div>
                <p className="font-medium">{company.razaoSocial}</p>
              </div>

              {company.nomeFantasia && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="w-4 h-4" />
                    Nome Fantasia
                  </div>
                  <p className="font-medium">{company.nomeFantasia}</p>
                </div>
              )}

              {company.inscricaoEstadual && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Inscrição Estadual</p>
                  <p className="font-medium">{company.inscricaoEstadual}</p>
                </div>
              )}

              {company.inscricaoMunicipal && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Inscrição Municipal</p>
                  <p className="font-medium">{company.inscricaoMunicipal}</p>
                </div>
              )}

              {company.phone && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </div>
                  <p className="font-medium">{company.phone}</p>
                </div>
              )}

              {company.email && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <p className="font-medium">{company.email}</p>
                </div>
              )}
            </div>

            {address && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </div>
                <p className="text-sm font-medium">{address}</p>
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
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="secondary"
                className={
                  company.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {company.isActive ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            {company.createdAt && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Cadastrada em</p>
                <p className="font-medium text-sm">
                  {formatDate(company.createdAt)}
                </p>
              </div>
            )}
            {company.updatedAt && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Última atualização</p>
                <p className="font-medium text-sm">
                  {formatDate(company.updatedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
