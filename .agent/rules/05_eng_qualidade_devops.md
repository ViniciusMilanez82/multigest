# Regra MULTISOFT — Engenharia, testes, CI/CD e observabilidade

## Testes (pirâmide)
- Unitários: rápidos e isolados, cobrir regras de negócio.
- Integração: banco/filas/serviços internos e contratos de API.
- E2E: poucos e críticos (fluxos principais).

## CI/CD
- Pipeline: build, lint, testes, análise estática, scan de vulnerabilidades, deploy.
- Branch protection: PR obrigatório + checks obrigatórios.
- Feature flags para rollout gradual e redução de risco.

## Observabilidade (SRE-lite)
- Logs estruturados + request_id/trace_id quando aplicável.
- Métricas de latência/erros nas rotas críticas.
- Alertas acionáveis + runbooks.

## Documentação técnica mínima
- README atualizado
- ADR para decisões relevantes
- Runbook para operação crítica
