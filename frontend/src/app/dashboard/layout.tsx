"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Container,
  LayoutDashboard,
  FileText,
  FileCheck,
  Package,
  Truck,
  DollarSign,
  Users,
  Building2,
  MapPin,
  ClipboardList,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Factory,
  Gavel,
  UserCheck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

const navGroups = [
  {
    title: "Visão Geral",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operacional",
    items: [
      { name: "Contratos", href: "/dashboard/contracts", icon: FileText },
      { name: "Expedição", href: "/dashboard/expedition", icon: ClipboardList },
      { name: "Propostas", href: "/dashboard/proposals", icon: FileCheck },
      { name: "Ativos", href: "/dashboard/ativos", icon: Package },
      { name: "Estoque", href: "/dashboard/stock-locations", icon: MapPin },
      { name: "Frota", href: "/dashboard/fleet", icon: Truck },
      { name: "Motoristas", href: "/dashboard/drivers", icon: UserCheck },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { name: "Cobrança", href: "/dashboard/invoices", icon: DollarSign },
      { name: "Clientes", href: "/dashboard/customers", icon: Users },
      { name: "Fornecedores", href: "/dashboard/suppliers", icon: Factory },
      { name: "Licitações", href: "/dashboard/biddings", icon: Gavel },
    ],
  },
  {
    title: "Administração",
    items: [{ name: "Empresas", href: "/dashboard/companies", icon: Building2 }],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeCompany, logout, loadFromStorage, setActiveCompany } =
    useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const token = localStorage.getItem("multigest_token");
      if (!token) router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 p-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Container className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">MultiGest</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gestão Integrada</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company selector */}
        {user.companies.length > 1 && (
          <div className="p-3 border-b border-slate-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <span className="truncate text-sm">
                    {activeCompany?.name || "Selecione"}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Trocar Empresa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    onClick={() => setActiveCompany(company)}
                    className={
                      activeCompany?.id === company.id ? "bg-accent" : ""
                    }
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {company.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex-1" />

          {activeCompany && (
            <span className="hidden sm:inline text-sm text-gray-500">
              {activeCompany.name}
            </span>
          )}

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
