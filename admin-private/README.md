# CRIAÍ — protótipo de backend financeiro PRIVADO (não implantado)

**Status:** somente código preparatório em branch de desenvolvimento; sem banco criado, autenticação implementada em servidor, credenciais ou acesso público. Não é um painel funcional.

## Isolamento obrigatório

- Criar um **novo projeto** separado para CRIAÍ, não compartilhar o projeto Supabase do XRMOVI.
- Não publicar nenhum dashboard com informações financeiras ou o SQL migrado no site GitHub Pages.
- Nenhum segredo pode entrar neste repositório público, mesmo em branch; usar secrets do provedor para `SUPABASE_SECRET_KEY` e integração de APIs.
- Não aplicar a migração em produção até confirmar o projeto específico e testar com usuários autorizados e não autorizados.

## Estrutura provisória

`schema-proposta.sql` prepara tabelas privadas, sem linhas ou permissões para visitantes. Elas não ficam na API de dados exposta nem possuem políticas que autorizem `anon`/`authenticated`. O acesso somente poderá ser desenvolvido por backend futuro com verificação independente e auditada de:

1. Token JWT válido via Auth do projeto CRIAÍ (`auth.getUser(token)` no servidor).
2. Identidade explícita do proprietário cadastrada por processo administrativo (user ID, não nome nem e-mail no código público).
3. MFA efetivamente confirmada no token (AAL2) e sessão ativa, não apenas um booleano enviado pelo navegador.
4. Autorizações da origem e CSRF quando usar cookies; CORS não é controle de autorização.
5. Limites de taxa, expiração de sessões, logs sem dados pessoais, auditoria de acesso.
6. Privilégios mínimos e credenciais mantidas exclusivamente no servidor.

O backend deve servir apenas agregações autorizadas, nunca retornar transações completas a visitantes. Os dados são nulos/ausentes até as integrações reais estarem disponíveis; **não inventar números zero para fontes sem conexão**.

## Fontes previstas

- GA4 exclusiva do CRIAÍ: visitantes, sessões, origem, páginas e eventos após consentimento.
- Google Ads da campanha exclusiva do CRIAÍ: custo comprovado, separado do XRMOVI.
- Hotmart: comissões confirmadas, estornos e pagamentos reais via exportação/API autorizada.
- Todas as importações precisam de `source_updated_at` e status de sincronização.

## Sequência segura de implantação

1. Criar/autorizar novo projeto isolado com plano de custo aprovado.
2. Confirmar que o schema privado não está exposto no Data API; revisão com ferramentas de segurança.
3. Criar um usuário Auth, habilitar MFA e inserir o UUID na allowlist somente com SQL administrativo autenticado.
4. Desenvolver backend privado em ambiente autenticado, sem secret em GitHub.
5. Testar 401 sem token, 403 com outro usuário, 403 sem AAL2, 200 para proprietário AAL2, expiração e revogação.
6. Conectar GA4/Hotmart/Ads com autorização e testar isoladamente.
7. Só então criar interface administrativa externa ao GitHub Pages público.

Referências: https://supabase.com/docs/guides/auth/auth-mfa e https://supabase.com/docs/guides/database/postgres/row-level-security

**Este arquivo não autoriza aplicar scripts no projeto do XRMOVI.**
