# MULTISOFT — Guia rápido (para colar em prompts)

## Princípios
- Usuário em primeiro lugar (clareza e fricção mínima).
- Simplicidade vence (MVP real).
- Acessibilidade é requisito.
- Segurança e privacidade por padrão (LGPD).
- Qualidade contínua (testes + evidência + observabilidade).
- Automação como multiplicador (CI/CD, lint, testes, deploy, rollback).
- Documentação viva e rastreável (PRD → US → testes → release).

## Gates
### Definition of Ready (DoR)
Uma story só entra em dev se tiver:
- Objetivo claro (quem/o quê/por quê)
- Critérios de aceite verificáveis (preferência: Gherkin)
- Regras de negócio e exceções (inclui vazio/erro)
- Protótipo/referência de UI quando houver interface
- Dependências e integrações identificadas
- Dados sensíveis identificados (LGPD) e política de logs
- Prioridade/estimativa aprovadas

### Definition of Done (DoD)
Uma entrega só é “Done” se tiver:
- Critérios de aceite atendidos e evidenciados
- Testes automáticos (unit/integration) verdes no CI
- Code review concluído
- Observabilidade mínima (logs estruturados + métricas + alerta)
- Documentação atualizada (README/changelog/ADR/runbook quando aplicável)
- Acessibilidade/responsividade verificadas (UI)
- Deploy em staging validado e release aprovado por QA + PO

## Formato de saída padrão (para qualquer agente)
Sempre entregar em Markdown com:
1) Resumo
2) Entregáveis (artefatos/arquivos gerados)
3) Decisões
4) Riscos
5) Assunções
6) Perguntas em aberto
7) Próximos passos (com donos)
