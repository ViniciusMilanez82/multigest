"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "JURIDICA",
    cpfCnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    code: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    segment: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/customers/${id}`);
      setForm({
        type: data.type || "JURIDICA",
        cpfCnpj: data.cpfCnpj || "",
        razaoSocial: data.razaoSocial || "",
        nomeFantasia: data.nomeFantasia || "",
        code: data.code || "",
        inscricaoEstadual: data.inscricaoEstadual || "",
        inscricaoMunicipal: data.inscricaoMunicipal || "",
        segment: data.segment || "",
        notes: data.notes || "",
      });
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

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.cpfCnpj.trim()) newErrors.cpfCnpj = "CPF/CNPJ é obrigatório";
    if (!form.razaoSocial.trim())
      newErrors.razaoSocial = "Razão social é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        cpfCnpj: form.cpfCnpj.trim(),
        razaoSocial: form.razaoSocial.trim(),
      };

      if (form.nomeFantasia.trim()) payload.nomeFantasia = form.nomeFantasia.trim();
      if (form.code.trim()) payload.code = form.code.trim();
      if (form.inscricaoEstadual.trim())
        payload.inscricaoEstadual = form.inscricaoEstadual.trim();
      if (form.inscricaoMunicipal.trim())
        payload.inscricaoMunicipal = form.inscricaoMunicipal.trim();
      if (form.segment.trim()) payload.segment = form.segment.trim();
      if (form.notes.trim()) payload.notes = form.notes.trim();

      await api.patch(`/customers/${id}`, payload);
      toast.success("Cliente atualizado com sucesso!");
      router.push(`/dashboard/customers/${id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Erro ao atualizar cliente. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/customers/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Cliente</h2>
          <p className="text-gray-500 mt-1">
            Atualize os dados de <strong>{form.razaoSocial}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Principais</CardTitle>
              <CardDescription>
                Informações básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Pessoa</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
                    <SelectItem value="FISICA">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">
                  {form.type === "FISICA" ? "CPF" : "CNPJ"} *
                </Label>
                <Input
                  id="cpfCnpj"
                  value={form.cpfCnpj}
                  onChange={(e) => handleChange("cpfCnpj", e.target.value)}
                  className={errors.cpfCnpj ? "border-red-500" : ""}
                />
                {errors.cpfCnpj && (
                  <p className="text-sm text-red-500">{errors.cpfCnpj}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial">
                  {form.type === "FISICA" ? "Nome Completo" : "Razão Social"} *
                </Label>
                <Input
                  id="razaoSocial"
                  value={form.razaoSocial}
                  onChange={(e) => handleChange("razaoSocial", e.target.value)}
                  className={errors.razaoSocial ? "border-red-500" : ""}
                />
                {errors.razaoSocial && (
                  <p className="text-sm text-red-500">{errors.razaoSocial}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={form.nomeFantasia}
                  onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Complementares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Informações Complementares
              </CardTitle>
              <CardDescription>
                Dados fiscais e segmentação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscricaoEstadual"
                  value={form.inscricaoEstadual}
                  onChange={(e) =>
                    handleChange("inscricaoEstadual", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscricaoMunicipal"
                  value={form.inscricaoMunicipal}
                  onChange={(e) =>
                    handleChange("inscricaoMunicipal", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Input
                  id="segment"
                  value={form.segment}
                  onChange={(e) => handleChange("segment", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/customers/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
