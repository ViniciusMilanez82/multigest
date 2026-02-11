"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NovoClientePage() {
  const router = useRouter();
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

      await api.post("/customers", payload);
      toast.success("Cliente cadastrado com sucesso!");
      router.push("/dashboard/customers");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Erro ao cadastrar cliente. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h2 className="text-2xl font-bold text-gray-900">Novo Cliente</h2>
          <p className="text-gray-500 mt-1">Cadastre um novo cliente</p>
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
                  placeholder={
                    form.type === "FISICA"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
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
                  placeholder={
                    form.type === "FISICA"
                      ? "Nome completo"
                      : "Razão social da empresa"
                  }
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
                  placeholder="Nome fantasia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="Ex: CLI-001"
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
                  placeholder="Inscrição estadual"
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
                  placeholder="Inscrição municipal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Input
                  id="segment"
                  value={form.segment}
                  onChange={(e) => handleChange("segment", e.target.value)}
                  placeholder="Ex: Petróleo e Gás, Construção Civil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Informações adicionais sobre o cliente..."
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
            onClick={() => router.push("/dashboard/customers")}
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
                Salvar Cliente
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
