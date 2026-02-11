# Regra MULTISOFT — Segurança, privacidade e LGPD

- **Coleta mínima**: só pedir o dado necessário para o fluxo.
- **Mascarar dados sensíveis** em logs e telas de suporte (nunca logar senha/token/cartão/PII desnecessária).
- **Least privilege**: permissões mínimas para usuários e serviços.
- **Auditoria**: ações críticas precisam de registro (quem/quando/o quê), sem vazar PII.
- **Erros sem vazamento**: mensagens técnicas ficam em logs; UI mostra mensagens úteis.
- **Segredos**: nunca hardcode em código/repo; usar secret manager.
