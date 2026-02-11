"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Contratos Ativos",
    value: "—",
    description: "contratos em vigor",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Ativos Alugados",
    value: "—",
    description: "containers/módulos",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Frota em Operação",
    value: "—",
    description: "veículos ativos",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Títulos em Aberto",
    value: "—",
    description: "a receber",
    icon: DollarSign,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const alerts = [
  {
    type: "warning",
    icon: AlertTriangle,
    message: "Sistema em implantação — módulos sendo configurados",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    type: "info",
    icon: Clock,
    message: "Dashboard será populado quando os módulos estiverem ativos",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Visão geral do sistema MultiGest
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-4 rounded-lg border ${alert.bg}`}
          >
            <alert.icon className={`w-5 h-5 shrink-0 ${alert.color}`} />
            <p className={`text-sm ${alert.color}`}>{alert.message}</p>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Módulos Implementados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Autenticação (login/logout/JWT)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Gestão de Empresas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Cadastro de Clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Contratos (em construção)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Ativos (em construção)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Frota (pendente)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Cobrança (pendente)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Banco de Dados
            </CardTitle>
            <CardDescription>30 tabelas modeladas</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Core: companies, users, user_companies, audit_logs</li>
              <li>Cadastros: customers, suppliers, addresses, contacts</li>
              <li>Ativos: assets, asset_types, status_history, maintenances</li>
              <li>Contratos: contracts, items, addendums, measurements</li>
              <li>Frota: vehicles, drivers, checklists, transport_orders</li>
              <li>Cobrança: invoices, payments, defaulters, agreements</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
