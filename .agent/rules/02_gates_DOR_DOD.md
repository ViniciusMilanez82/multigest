# Regra MULTISOFT — Gates (DoR/DoD)

## DoR (Definition of Ready) — mínimo para entrar em desenvolvimento
Uma story só pode ser puxada para dev se tiver:
- Objetivo claro (quem / o quê / por quê)
- Critérios de aceite objetivos (preferência: Gherkin)
- Regras de negócio e exceções (inclui estados vazios/erro)
- Protótipo ou referência de UI (quando houver interface)
- Dependências e integrações identificadas
- Dados sensíveis identificados (LGPD) e política de logs definida
- Estimativa e prioridade aprovadas por PO e PM

## DoD (Definition of Done) — mínimo para considerar entregue
Uma entrega só é “Done” se:
- Critérios de aceite atendidos e evidenciados (prints/logs/relatórios)
- Testes unitários/integração (quando aplicável) implementados e verdes no CI
- Code review concluído (mín. 1 revisor) e padrões respeitados
- Observabilidade mínima: logs estruturados + métricas + alerta (rotas críticas)
- Documentação atualizada (README/changelog/ADR/runbook quando aplicável)
- Acessibilidade e responsividade verificadas (UI)
- Deploy em staging validado e release aprovado por QA e PO
