# Análise: Gravações Plaud × Sistema MULTIGEST

**Objetivo:** Verificar se tudo que foi dito por cada pessoa (comercial e contratos) está contemplado no sistema.

**Fonte:** Transcrições e summaries das gravações (Maria, Kelly, Fernanda, Débora, Damiana).

---

## 1. Resumo por pessoa

### Maria (Comercial) — 4 gravações

| Requisito | Descrição |
|-----------|-----------|
| Proposta | Elaboração em Word, versionamento REV1/REV2, PDF |
| Canais de entrada | E-mail, formulário site, WhatsApp |
| Dados da proposta | CNPJ, e-mail, local entrega, frete, modelo equipamento, valor mensalidade |
| Aceite de proposta | Documento com CNPJ, endereço, valor, responsável, testemunha |
| Análise de crédito | SPC manual: índice pagamento, protestos, Serasa, capital >20k, fundação >2 anos |
| Validação signatário | Verificar no contrato social se responsável é sócio/diretor/procurador |
| Fechamento no sistema | Pedido → processar → número contrato |
| Layout/imagens | Melhorar descrições e imagens nas propostas |
| Atributos técnicos | Ex: abertura ar-condicionado, tomada por modelo |
| Documento AF | Word com contrato, cliente, mobilização, datas, layout, 220V, suíte |
| Ordem de Serviço | Word: cliente, endereço, equipamentos, 220V, data serviço |
| Painel de expedição | Produção e logística visualizam, designam equipamento, vistoria |
| **Trava expedição** | **Eventos:** bloquear OS até pagamento antecipado confirmado; **Locação:** bloquear até contrato assinado |
| Assinatura D4 | Equipamento só sai após assinatura digital; envio link por e-mail |
| Análise crítica | Planilha Excel: proposta, contrato, CNPJ, endereços, contatos, modelos, valor, meses |
| Confirmação acesso | Texto ao cliente: solo, espaço, fiações, árvores antes da entrega |

### Kelly (Comercial)

| Requisito | Descrição |
|-----------|-----------|
| Emissão contratos | Portal externo; preenchimento manual; planilha Excel resumo |
| Contrato do sistema | Gerar contrato a partir das informações já no sistema |
| Serviços adicionais | Modificação/avaria → proposta serviço → produção orçamento → OS → faturamento |
| Troca de titularidade | Encerrar contrato atual, abrir novo, entrada/saída fictícia; coordenação por e-mail |
| Reajuste IGPM | Reajuste em massa (200+ itens); sistema falha → manual |
| Suporte | Cancelar locações, tratar OS abertas; treinamento setores |

### Fernanda (Comercial/Contratos)

| Requisito | Descrição |
|-----------|-----------|
| Retirada | Formulário → Nasajon encerramento → editar OS (endereço, telefone, NF, frete) → texto cliente |
| Remoção | Transferência endereço: 2 OSs (retirada + entrega), taxa R$150 |
| Troca ar-condicionado | 2 OSs, 2 ordens expedição, sem frete |
| Análise crítica | Planilha Excel com dados do aceite |
| Cadastro clientes | CNPJ, inscrição estadual, Nasajon |
| Manutenções | WhatsApp/e-mail → OS no sistema → verifica inadimplência → planilha Excel para Leandro/Sérgio |

### Débora (Licitação)

| Requisito | Descrição |
|-----------|-----------|
| Prospecção | Diário Oficial, Comprasnet, Brasil Licitação, Siga, Petronet |
| Validação Ana | Encaminhar para Ana validar pertinência técnica |
| Documentação | Cronograma, resumo, habilitação jurídica/fiscal/técnica |
| Vencimentos | Verificar diariamente certidões, SICAF |
| Resultados | Registrar ganhas/perdidas para análise estratégica |

### Damiana (Contratos/Faturamento)

| Requisito | Descrição |
|-----------|-----------|
| Syscac | Entrada/saída contêineres; numeração fictícia |
| Contratos | Públicos e privados (Petrobras, Transpetro); vigência, renovações, garantias |
| Faturamento | Medições, conferência valores, NF serviço e venda |
| Portais | Ariba/Petrobras para protocolo |
| ARTs, atestados | Emissão, averbação CREA |
| CREA | Controle pagamentos anuais |
| Plataformas | DIN, Policita, Petronect, Banco do Brasil |
| Nasajon | Cadastro contratos, OS, agendamento |

---

## 2. Cruzamento: Requisito × MULTIGEST

| Requisito | Contemplado | Onde no sistema | Observação |
|-----------|-------------|-----------------|-------------|
| Proposta com wizard, PDF, WhatsApp, Email | ✅ Sim | Propostas | Implementado |
| Converter proposta em contrato | ✅ Sim | Propostas → Contrato | Implementado |
| Converter proposta em fatura (venda) | ✅ Sim | Propostas → Fatura | Implementado |
| Contratos CRUD, itens, medições | ✅ Sim | Contratos | Implementado |
| Movimentações entrega/recolhimento | ✅ Sim | ContractMovement | DELIVERY, PICKUP, SWAP, RETIRADA, REMOCAO, TROCA_AR |
| Faturamento por contrato | ✅ Sim | Invoices | Implementado |
| Cadastro clientes | ✅ Sim | Customers | Implementado |
| Análise de crédito SPC | ❌ Não | — | Integração externa |
| Validação signatário (contrato social) | ❌ Não | — | Checklist/documentos |
| **Documento AF (ficha fornecimento)** | ✅ Sim | SupplyOrder | CRUD + PDF |
| **Ordem de Serviço (OS)** | ✅ Sim | ServiceOrder | INSTALACAO, RETIRADA, REMOCAO, TROCA_AR, MANUTENCAO |
| **Painel de expedição** | ✅ Sim | Dashboard / Expedição | GET /dashboard/expedition |
| **Trava por pagamento/assinatura** | ✅ Sim | ContractItem | deliveryBlockedReason |
| **Assinatura digital D4** | ⚠️ Parcial | Contract.contractSignedAt | Marcação manual; integração externa futura |
| **Análise crítica** | ✅ Sim | ContractAnalysis | CRUD vinculado ao contrato |
| Versionamento proposta REV1/REV2 | ⚠️ Parcial | Propostas | Tem status; sem histórico versões |
| Atributos técnicos (220V, tomada) | ⚠️ Parcial | Asset.notes | Pode usar notes; sem campos estruturados |
| **Retirada/Remoção/Troca ar** | ✅ Sim | ServiceOrder + MovementType | Tipos + OS |
| **Troca de titularidade** | ✅ Sim | POST /contracts/:id/troca-titularidade | Encerra A, cria B |
| **Reajuste IGPM em massa** | ✅ Sim | POST /contracts/reajuste-igpm | Percentual em contratos |
| **Licitações: prospecção automática** | ❌ Não | — | Integração portais |
| **Licitações: vencimento documentos** | ❌ Não | — | Alertas |
| Integração Ariba/Petrobras | ❌ Não | — | RPA/API |
| ARTs, CREA, atestados | ❌ Não | — | Módulo compliance |
| Catálogo serviços (modificações) | ❌ Não | — | Proposta serviço |

---

## 3. Estratégia de implantação

### Fase 1 — Já implementado ✓
- Propostas (CRUD, wizard, PDF, conversão)
- Contratos, medições, faturamento
- Clientes, ativos, frota

### Fase 2 — Prioridade alta (P0)

| # | Item | Ação | Esforço |
|---|------|------|---------|
| 1 | **Trava expedição** | Adicionar status/bloqueio em ContractMovement ou ContractItem: `bloqueadoPorPagamento`, `bloqueadoPorContrato`; regra: Logística não emite OS se bloqueado | Médio |
| 2 | **Análise crítica** | Criar entidade `ContractAnalysis` ou formulário vinculado ao contrato; campos: proposta, contrato, CNPJ, endereços, contatos, modelos, valor, meses; substituir Excel | Médio |
| 3 | **Documento AF** | Criar `SupplyOrder` ou `DeliveryInstruction` ligado ao contrato: número, cliente, mobilização, datas, observações (layout, 220V); gerar PDF | Médio |

### Fase 3 — Prioridade P1

| # | Item | Ação | Esforço |
|---|------|------|---------|
| 4 | **Ordem de Serviço** | Criar `ServiceOrder`: tipo (Retirada, Remoção, TrocaAr, Instalação, Manutenção), contrato, endereço, data, observações; integrar com frota | Alto |
| 5 | **Painel de expedição** | Tela/rota: listar contratos com entrega programada; itens por data; status (preparação, vistoriado, bloqueado, liberado) | Médio |
| 6 | **Tipos de movimento** | Expandir ContractMovement: RETIRADA, REMOCAO, TROCA_AR além de DELIVERY, PICKUP, SWAP | Baixo |
| 7 | **Troca de titularidade** | Endpoint/workflow: encerrar contrato A, criar contrato B com mesmos itens, mesmo cliente de destino; sem movimentação física | Alto |
| 8 | **Reajuste IGPM** | Endpoint PATCH /contracts/reajuste: recebe índice (%), aplica em itens de contratos elegíveis (ex: >12 meses) | Médio |

### Fase 4 — Prioridade P2

| # | Item | Ação | Esforço |
|---|------|------|---------|
| 9 | Integração D4 | Webhook status assinatura; flag no contrato; bloquear expedição se não assinado | Alto |
| 10 | Análise crédito SPC | Integração API bureau; checklist no Customer ou Proposta | Alto |
| 11 | Versionamento proposta | Histórico de versões (REV1, REV2); comparação | Médio |
| 12 | Atributos técnicos ativo | Campos estruturados em Asset (voltagem, tomada, aberturaAC) | Baixo |
| 13 | Licitações: vencimento docs | Cadastro de documentos com validade; alertas 30/15/7 dias | Médio |
| 14 | Licitações: prospecção | RPA/script para portais (Comprasnet etc); importação oportunidades | Muito alto |

### Fase 5 — Escopo futuro

| # | Item | Observação |
|---|------|------------|
| 15 | Integração Ariba | RPA ou API conforme disponibilidade |
| 16 | ARTs, CREA | Módulo compliance/documentos |
| 17 | Catálogo serviços | Proposta de serviço (modificação/avaria) → OS → Fatura |

---

## 4. Ordem sugerida de execução

1. **Sprint 1:** Análise crítica (formulário no sistema)
2. **Sprint 2:** Documento AF + Painel de expedição básico
3. **Sprint 3:** Trava expedição (bloqueio por pagamento/contrato)
4. **Sprint 4:** Ordem de Serviço (tipos: Retirada, Remoção, Troca, Instalação)
5. **Sprint 5:** Troca de titularidade
6. **Sprint 6:** Reajuste IGPM

---

## 5. Resumo executivo

**O que está contemplado:** Propostas, conversão em contrato/fatura, contratos, medições, faturamento, clientes, ativos, movimentações básicas.

**Principais gaps:** (1) Trava de expedição por pagamento/assinatura, (2) Análise crítica digital, (3) Documento AF, (4) Ordem de Serviço estruturada, (5) Painel de expedição, (6) Troca de titularidade, (7) Reajuste IGPM.

**Estimativa Fase 2–3:** 4–6 sprints para cobrir os itens P0 e P1.
