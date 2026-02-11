# FASE 04 — PRD (Product Requirements Document)

## MultiGest — Sistema de Gestão Integrada

### Versão: 1.0 | Data: 2026-02-10

---

## 1) Visão do Produto

O **MultiGest** é um sistema web de gestão integrada para empresas de **aluguel de containers e módulos habitacionais**. Unifica em uma única plataforma as operações de contratos, controle de ativos, gestão de frota e recuperação de créditos, substituindo 4 sistemas legados em Visual FoxPro.

### Público-alvo
- Gestores e operadores de empresas de aluguel de containers/módulos
- 6 a 20 usuários simultâneos
- Multi-empresa: Multi Macaé, Multi Rio, Petroteiner

---

## 2) Módulos e User Stories

### M1 — Core (Autenticação e Administração)

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-001 | Como administrador, quero fazer login com email e senha para acessar o sistema | ALTA | Login com JWT; senha criptografada com bcrypt; sessão expira em 8h; tela de "esqueci senha" |
| US-002 | Como administrador, quero cadastrar usuários com perfil e permissões | ALTA | CRUD de usuários; vinculação a empresa/filial; perfis: Admin, Gerente, Operador, Financeiro, Consulta |
| US-003 | Como administrador, quero cadastrar empresas/filiais | ALTA | CRUD de empresas (CNPJ, razão social, nome fantasia, endereço); cada empresa pode ter múltiplas filiais |
| US-004 | Como administrador, quero que cada ação importante seja registrada em log de auditoria | MÉDIA | Registro automático de: quem, quando, o quê, de onde (IP); consulta com filtros |
| US-005 | Como usuário, quero trocar de empresa/filial sem sair do sistema | ALTA | Seletor de empresa no header; dados filtrados automaticamente pela empresa ativa |

### M2 — Cadastros Compartilhados

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-010 | Como operador, quero cadastrar clientes com dados completos | ALTA | CNPJ/CPF, razão social, nome fantasia, inscrição estadual/municipal, endereços (múltiplos), contatos (múltiplos), segmento, observações |
| US-011 | Como operador, quero cadastrar fornecedores | MÉDIA | Mesma estrutura de clientes + categorias de fornecimento |
| US-012 | Como operador, quero buscar clientes por nome, CNPJ ou código | ALTA | Busca com autocomplete; filtros por status (ativo/inativo), segmento, cidade |
| US-013 | Como operador, quero ver o histórico completo de um cliente | ALTA | Em uma única tela: contratos, ativos alocados, títulos em aberto, inadimplência, transportes realizados |
| US-014 | Como operador, quero importar/exportar cadastros em planilha | BAIXA | Export CSV/Excel; import com validação e preview antes de salvar |

### M3 — Contratos (ex-SisCaC)

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-020 | Como operador, quero criar um contrato de aluguel | ALTA | Cliente, empresa, vigência (início/fim), tipo de contrato, valor mensal, forma de pagamento, condições especiais, itens (quais ativos serão alugados) |
| US-021 | Como operador, quero adicionar itens ao contrato (containers/módulos) | ALTA | Selecionar ativos disponíveis; quantidade; valor unitário; automaticamente muda status do ativo para "alocado" |
| US-022 | Como operador, quero registrar aditivos contratuais | ALTA | Tipo (prorrogação, inclusão de itens, reajuste, encerramento parcial); histórico de alterações |
| US-023 | Como operador, quero registrar medições mensais | ALTA | Período, quantidade de dias, itens medidos, valores calculados; gera título financeiro |
| US-024 | Como operador, quero registrar movimentações de entrada/saída | ALTA | Tipo (entrega, recolhimento, troca); data; ativo; endereço de entrega; observações; vincula ordem de transporte (M5) |
| US-025 | Como gestor, quero ver todos os contratos ativos com filtros | ALTA | Filtro por: cliente, empresa, status (ativo/encerrado/suspenso), vigência, valor |
| US-026 | Como gestor, quero receber alerta de contratos próximos do vencimento | MÉDIA | Notificação no dashboard; contratos vencendo nos próximos 30/60/90 dias |
| US-027 | Como operador, quero encerrar um contrato | ALTA | Encerramento com motivo; verifica se todos os ativos foram devolvidos; gera última medição; verifica títulos em aberto |

### M4 — Ativos (ex-SCC)

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-030 | Como operador, quero cadastrar containers e módulos habitacionais | ALTA | Tipo (container 20', 40', módulo hab.), código/patrimônio, número de série, ano fabricação, dimensões, estado de conservação, empresa proprietária |
| US-031 | Como operador, quero rastrear o status de cada ativo | ALTA | Status: Disponível, Alugado, Em Manutenção, Em Trânsito, Baixado; histórico de mudanças de status com data e responsável |
| US-032 | Como operador, quero saber onde cada ativo está fisicamente | ALTA | Localização atual (pátio da empresa, no cliente X, em trânsito); endereço completo |
| US-033 | Como operador, quero registrar manutenções em ativos | MÉDIA | Tipo (preventiva, corretiva), descrição, custo, fornecedor, data início/fim; ativo fica com status "Em Manutenção" |
| US-034 | Como gestor, quero ver o inventário consolidado de ativos | ALTA | Totais por tipo, por status, por empresa; taxa de ocupação (% alugados vs disponíveis) |
| US-035 | Como operador, quero dar baixa em um ativo | MÉDIA | Motivo (sucata, venda, perda); data; valor residual |
| US-036 | Como gestor, quero ver o histórico completo de um ativo | ALTA | Em uma tela: todos os contratos que já utilizaram, manutenções, movimentações, status ao longo do tempo |

### M5 — Frota (ex-FrotaN)

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-040 | Como operador, quero cadastrar veículos da frota | ALTA | Placa, tipo (caminhão, carreta, cavalo mecânico), marca/modelo, ano, RENAVAM, capacidade de carga, empresa proprietária |
| US-041 | Como operador, quero cadastrar motoristas | ALTA | Nome, CPF, CNH (número, categoria, validade), contato, empresa |
| US-042 | Como operador, quero preencher checklist de inspeção do veículo | ALTA | Itens configuráveis (pneus, freios, luzes, documentação, etc.); status OK/NOK por item; observações; foto (futuro) |
| US-043 | Como operador, quero criar ordens de transporte | ALTA | Veículo, motorista, ativo a transportar, origem, destino, data/hora prevista, vinculação com contrato/movimentação |
| US-044 | Como operador, quero registrar abastecimentos | MÉDIA | Veículo, data, litros, valor, km atual, posto; cálculo automático de km/l |
| US-045 | Como operador, quero registrar manutenções de veículos | MÉDIA | Tipo (preventiva, corretiva), descrição, custo, fornecedor, km, peças trocadas |
| US-046 | Como gestor, quero ver o painel da frota | ALTA | Veículos disponíveis vs em operação; alertas de CNH vencendo; alertas de manutenção preventiva; consumo médio |
| US-047 | Como gestor, quero alerta de vencimento de CNH e documentos | MÉDIA | Notificação automática quando CNH ou documento vence nos próximos 30 dias |

### M6 — Cobrança (ex-SisReC)

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-050 | Como financeiro, quero gerar títulos/faturas a partir de medições | ALTA | Título com: cliente, contrato, valor, vencimento, empresa emissora; status: aberto, pago, vencido, em acordo, cancelado |
| US-051 | Como financeiro, quero registrar pagamentos recebidos | ALTA | Data pagamento, valor pago, forma de pagamento, banco; baixa automática ou parcial do título |
| US-052 | Como financeiro, quero ver todos os títulos em aberto com filtros | ALTA | Filtro: cliente, vencimento (a vencer, vencidos), valor, empresa; totalizadores |
| US-053 | Como financeiro, quero identificar automaticamente inadimplentes | ALTA | Regra configurável (ex: vencido há X dias); marcação automática; bloqueio de novas operações para inadimplentes |
| US-054 | Como financeiro, quero registrar ações de cobrança | ALTA | Tipo (telefonema, email, carta, protesto, jurídico); data; responsável; resultado; próxima ação |
| US-055 | Como financeiro, quero criar acordos de pagamento | MÉDIA | Parcelamento do débito; novas datas de vencimento; desconto negociado; acompanhamento do acordo |
| US-056 | Como financeiro, quero relatório de aging (vencimentos) | ALTA | Títulos agrupados por faixa de atraso: a vencer, 1-30d, 31-60d, 61-90d, >90d; por cliente e empresa |
| US-057 | Como gestor, quero gestão de licitações | MÉDIA | Cadastro de licitações, documentos necessários, prazos, status, itens |

### M7 — Dashboard

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-060 | Como gestor, quero um dashboard consolidado | ALTA | KPIs: contratos ativos, ativos alugados vs disponíveis, receita mensal, inadimplência, frota em operação |
| US-061 | Como gestor, quero ver alertas no dashboard | ALTA | Contratos vencendo, CNH vencendo, títulos vencidos, ativos em manutenção há muito tempo |

### M8 — Relatórios

| ID | User Story | Prioridade | Critérios de Aceite |
|----|-----------|------------|---------------------|
| US-070 | Como gestor, quero relatório de receita por cliente/empresa/período | ALTA | Filtros flexíveis; export PDF/Excel |
| US-071 | Como gestor, quero relatório de ocupação de ativos | ALTA | Taxa de ocupação por tipo, período, empresa |
| US-072 | Como gestor, quero relatório de custos de frota | MÉDIA | Combustível, manutenção, por veículo e período |
| US-073 | Como gestor, quero relatório de inadimplência | ALTA | Por cliente, faixa de atraso, valor total |

---

## 3) Regras de Negócio Globais

| # | Regra | Módulos afetados |
|---|-------|-----------------|
| RN-001 | Todo dado pertence a uma empresa. Usuário só vê dados da(s) empresa(s) que tem acesso | Todos |
| RN-002 | Cliente inadimplente não pode ter novos contratos criados (bloqueio configurável) | M3, M6 |
| RN-003 | Ativo só pode estar em um contrato ativo por vez | M3, M4 |
| RN-004 | Encerramento de contrato exige devolução de todos os ativos | M3, M4 |
| RN-005 | Medição gera título automaticamente (valor = qtd dias × valor diário do item) | M3, M6 |
| RN-006 | Ordem de transporte requer veículo disponível e motorista com CNH válida | M5 |
| RN-007 | Mudança de status de ativo é registrada em histórico com timestamp e usuário | M4 |
| RN-008 | Exclusão lógica (soft delete) para todas as entidades principais | Todos |

---

## 4) Ordem de Implementação (Roadmap)

```
Sprint 1 (Base):      M1 Core + M2 Cadastros
Sprint 2 (Ativos):    M4 Ativos
Sprint 3 (Contratos): M3 Contratos
Sprint 4 (Frota):     M5 Frota  
Sprint 5 (Cobrança):  M6 Cobrança
Sprint 6 (Visão):     M7 Dashboard + M8 Relatórios
```

### Justificativa da ordem:
1. **Core + Cadastros** primeiro porque todos os outros módulos dependem de autenticação, empresas e clientes
2. **Ativos** antes de Contratos porque contrato precisa referenciar ativos existentes
3. **Contratos** é o coração do negócio — conecta clientes a ativos
4. **Frota** depende de contratos/movimentações para fazer sentido
5. **Cobrança** depende de contratos/medições para gerar títulos
6. **Dashboard/Relatórios** por último porque precisa de dados de todos os módulos

---

## 5) Status: FASE 04 CONCLUÍDA ✅
