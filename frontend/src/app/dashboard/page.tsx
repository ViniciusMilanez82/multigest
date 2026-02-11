"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Package,
  Truck,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardData {
  totalCustomers: number;
  totalAssets: number;
  activeContracts: number;
  totalVehicles: number;
  openInvoices: number;
  overdueInvoices: number;
  paidThisMonth: number;
  revenueThisMonth: number;
  recentContracts: any[];
  overdueList: any[];
  monthlyRevenue: { month: string; value: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await api.get("/api/dashboard/overview");
      setData(res.data);
    } catch (e) {
      console.error("Erro ao carregar dashboard:", e);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(v: number) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const stats = [
    {
      title: "Contratos Ativos",
      value: data?.activeContracts ?? "—",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/contracts",
    },
    {
      title: "Ativos Cadastrados",
      value: data?.totalAssets ?? "—",
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/dashboard/ativos",
    },
    {
      title: "Veículos",
      value: data?.totalVehicles ?? "—",
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/dashboard/fleet",
    },
    {
      title: "Clientes",
      value: data?.totalCustomers ?? "—",
      icon: Users,
      color: "text-teal-600",
      bg: "bg-teal-50",
      href: "/dashboard/customers",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral do sistema MultiGest</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando dados...</div>
      ) : (
        <>
          {/* KPIs principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(stat.href)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-orange-50">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Faturas em Aberto</p>
                    <p className="text-2xl font-bold">{data?.openInvoices ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-50">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Faturas Vencidas</p>
                    <p className="text-2xl font-bold text-red-600">{data?.overdueInvoices ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Receita do Mês</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(data?.revenueThisMonth ?? 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de receita mensal */}
          {data?.monthlyRevenue && data.monthlyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita Mensal (últimos 6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {data.monthlyRevenue.map((m, i) => {
                    const max = Math.max(...data.monthlyRevenue.map(x => x.value), 1);
                    const height = Math.max((m.value / max) * 100, 4);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{formatCurrency(m.value)}</span>
                        <div
                          className="w-full rounded-t-md bg-blue-500 transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contratos recentes + Faturas vencidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contratos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/contracts")}>
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {!data?.recentContracts || data.recentContracts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum contrato</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentContracts.map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/contracts/${c.id}`)}
                      >
                        <div>
                          <p className="font-medium text-sm">{c.contractNumber}</p>
                          <p className="text-xs text-muted-foreground">{c.customer?.nomeFantasia || c.customer?.razaoSocial}</p>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {c.status === "ACTIVE" && (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/invoices/from-contract?contractId=${c.id}`)}>
                              Faturar
                            </Button>
                          )}
                          <Badge variant={c.status === "ACTIVE" ? "default" : "outline"}>
                            {c.status === "ACTIVE" ? "Ativo" : c.status === "DRAFT" ? "Rascunho" : c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Faturas Vencidas
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/invoices")}>
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {!data?.overdueList || data.overdueList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma fatura vencida</p>
                ) : (
                  <div className="space-y-3">
                    {data.overdueList.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/30 hover:bg-red-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                      >
                        <div>
                          <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{inv.customer?.nomeFantasia || inv.customer?.razaoSocial}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-red-600">{formatCurrency(Number(inv.amount))}</p>
                          <p className="text-xs text-muted-foreground">Venc: {new Date(inv.dueDate).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
