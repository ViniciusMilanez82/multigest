"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

interface ProposalItem {
  tipo: string;
  modelo: string;
  quantidade: number;
  valorUnitario: number;
  frete?: number;
}

const STEPS = [
  { id: "tipo", title: "Tipo" },
  { id: "cliente", title: "Cliente" },
  { id: "itens", title: "Itens" },
  { id: "revisao", title: "Revisão" },
];

export default function NovaPropostaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "LOCACAO" as "VENDA" | "LOCACAO" | "EVENTO",
    customerId: "",
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const [items, setItems] = useState<ProposalItem[]>([
    { tipo: "maritimo", modelo: "", quantidade: 1, valorUnitario: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await api.get("/customers", { params: { limit: 500 } });
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  function updateItem(index: number, field: keyof ProposalItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { tipo: "maritimo", modelo: "", quantidade: 1, valorUnitario: 0 },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const valorTotal = items.reduce(
    (acc, i) =>
      acc +
      i.quantidade * i.valorUnitario +
      (i.frete ?? 0),
    0
  );

  function validateStep(): boolean {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.type) newErrors.type = "Tipo é obrigatório";
    }
    if (step === 1) {
      if (!form.customerId && !form.companyName?.trim()) {
        newErrors.companyName = "Informe o cliente ou empresa";
      } else if (!form.customerId && form.companyName) {
        if (!form.contactName?.trim()) newErrors.contactName = "Contato é recomendado";
      }
    }
    if (step === 2) {
      const valid = items.filter(
        (i) => i.modelo?.trim() && i.quantidade > 0 && i.valorUnitario > 0
      );
      if (valid.length === 0) {
        newErrors.items = "Adicione ao menos um item válido";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (step < 3) {
      if (!validateStep()) return;
      setStep((s) => s + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        type: form.type,
        items: items
          .filter((i) => i.modelo?.trim() && i.quantidade > 0 && i.valorUnitario > 0)
          .map((i) => ({
            tipo: i.tipo,
            modelo: i.modelo,
            quantidade: i.quantidade,
            valorUnitario: i.valorUnitario,
            frete: i.frete || undefined,
          })),
      };
      if (form.customerId) payload.customerId = form.customerId;
      else {
        payload.companyName = form.companyName?.trim();
        payload.contactName = form.contactName?.trim();
        payload.phone = form.phone?.trim();
        payload.email = form.email?.trim();
      }

      await api.post("/proposals", payload);
      toast.success("Proposta criada!");
      router.push("/dashboard/proposals");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao criar proposta. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            step > 0 ? setStep((s) => s - 1) : router.push("/dashboard/proposals")
          }
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nova Proposta</h2>
          <p className="text-gray-500 mt-1">
            Etapa {step + 1} de 4 — {STEPS[step].title}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-2 flex-1 rounded ${
              i <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 0: Tipo */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo da Proposta</CardTitle>
              <CardDescription>Venda, locação ou evento</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={form.type}
                onValueChange={(v) => handleChange("type", v)}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENDA">Venda</SelectItem>
                  <SelectItem value="LOCACAO">Locação</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Cliente */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>Vincular a cliente existente ou informar dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente cadastrado</Label>
                <Select
                  value={form.customerId}
                  onValueChange={(v) => {
                    handleChange("customerId", v);
                    if (v) {
                      const c = customers.find((x) => x.id === v);
                      if (c) handleChange("companyName", c.razaoSocial);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum — informar abaixo</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.razaoSocial}
                        {c.nomeFantasia ? ` (${c.nomeFantasia})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Empresa / Razão Social *</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Nome da empresa"
                  disabled={!!form.customerId}
                  className={errors.companyName ? "border-red-500" : ""}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    value={form.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    placeholder="Nome do contato"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Itens */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Itens da Proposta</CardTitle>
                  <CardDescription>Container, módulo, etc.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-wrap gap-3 p-4 rounded-lg border bg-gray-50"
                >
                  <div className="flex-1 min-w-[100px] space-y-2">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={item.tipo}
                      onValueChange={(v) => updateItem(i, "tipo", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maritimo">Marítimo</SelectItem>
                        <SelectItem value="modulo">Módulo</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[150px] space-y-2">
                    <Label className="text-xs">Modelo</Label>
                    <Input
                      value={item.modelo}
                      onChange={(e) => updateItem(i, "modelo", e.target.value)}
                      placeholder="Ex: Container 20 pés"
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Qtd</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        updateItem(i, "quantidade", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-xs">Valor unit. (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario || ""}
                      onChange={(e) =>
                        updateItem(i, "valorUnitario", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-xs">Frete (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.frete ?? ""}
                      onChange={(e) =>
                        updateItem(i, "frete", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(i)}
                      disabled={items.length <= 1}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Revisão */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Revisão</CardTitle>
              <CardDescription>Confira os dados antes de salvar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  {form.type === "VENDA" ? "Venda" : form.type === "LOCACAO" ? "Locação" : "Evento"}
                </div>
                <div>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  {form.customerId
                    ? customers.find((c) => c.id === form.customerId)?.razaoSocial
                    : form.companyName || "—"}
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Modelo</th>
                      <th className="px-4 py-2 text-left">Qtd</th>
                      <th className="px-4 py-2 text-right">Unit.</th>
                      <th className="px-4 py-2 text-right">Frete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((i) => i.modelo?.trim() && i.quantidade > 0)
                      .map((i, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{i.modelo}</td>
                          <td className="px-4 py-2">{i.quantidade}</td>
                          <td className="px-4 py-2 text-right">
                            R$ {i.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-right">
                            R$ {(i.frete ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="text-lg font-semibold">
                Total: R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 mt-6">
          {step < 3 ? (
            <Button type="submit">Próximo</Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Criar Proposta
                </span>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
