"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  contracts: "Contratos",
  contract: "Contrato",
  ativos: "Ativos",
  ativo: "Ativo",
  fleet: "Frota",
  drivers: "Motoristas",
  invoices: "Cobrança",
  invoice: "Fatura",
  customers: "Clientes",
  customer: "Cliente",
  suppliers: "Fornecedores",
  supplier: "Fornecedor",
  biddings: "Licitações",
  bidding: "Licitação",
  companies: "Empresas",
  company: "Empresa",
  "stock-locations": "Estoque",
  novo: "Novo",
  editar: "Editar",
  "from-contract": "Faturar Contrato",
};

function getLabel(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (/^[0-9a-f-]{36}$/i.test(segment)) return "Detalhe";
  return segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;
  if (pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  const crumbs: { href: string; label: string }[] = [];
  let cum = "";
  for (let i = 0; i < segments.length; i++) {
    cum += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    const label = getLabel(segments[i]);
    crumbs.push({ href: cum, label: isLast ? label : label });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        Início
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
