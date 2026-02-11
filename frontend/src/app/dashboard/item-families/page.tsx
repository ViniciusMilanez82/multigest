"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Loader2, FolderTree } from "lucide-react";
import { toast } from "sonner";
interface Subfamily {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  assetType?: { id: string; name: string };
}

interface Family {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  subfamilies: Subfamily[];
}

export default function ItemFamiliesPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFamilies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/item-families", {
        params: { includeInactive: "true" },
      });
      setFamilies(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar famílias");
      setFamilies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Famílias e Subfamílias</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro de itens para propostas (ex: Marítimo → Container 20&apos;)
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/item-families/novo")}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Família
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="w-5 h-5" />
            Famílias ({families.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {families.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma família cadastrada</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => router.push("/dashboard/item-families/novo")}
              >
                Criar primeira família
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {families.map((f) => (
                  <React.Fragment key={f.id}>
                    <TableRow>
                      <TableCell className="font-medium">Família</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            f.isActive
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {f.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/item-families/${f.id}/editar`)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Link href={`/dashboard/item-families/${f.id}/subfamilias`}>
                            <Button variant="ghost" size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                    {f.subfamilies?.map((s) => (
                      <TableRow key={s.id} className="bg-muted/30">
                        <TableCell className="pl-8 text-muted-foreground text-sm">
                          Subfamília
                        </TableCell>
                        <TableCell className="pl-8">
                          {s.name}
                          {s.assetType && (
                            <span className="text-muted-foreground text-sm ml-2">
                              → {s.assetType.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              s.isActive
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {s.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/item-families/subfamilias/${s.id}/editar`
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!f.subfamilies || f.subfamilies.length === 0) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={4} className="pl-16 text-muted-foreground text-sm">
                          Sem subfamílias.{" "}
                          <Link
                            href={`/dashboard/item-families/${f.id}/subfamilias`}
                            className="text-blue-600 hover:underline"
                          >
                            Adicionar
                          </Link>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
