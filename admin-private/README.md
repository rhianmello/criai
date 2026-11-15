# Etapa 10 — Backend privado CRIAÍ (não implantado)

Este é um protótipo de servidor seguro, não um painel em produção. O CRIAÍ compartilha a infraestrutura Supabase com XRMOVI por decisão do proprietário, mas usa somente o schema privado criai_private. Não são compartilhadas as permissões de relatórios ou comissões.

## Estrutura REAL em Supabase

- offer_catalog: 1 oferta Leadlovers/Hotmart, ID 42903.
- daily_metrics: legado, sem divisão por canais; vazio.
- traffic_daily: GA4 agregado por canal, dispositivo e página; vazio.
- ads_daily: gastos de campanhas CRIAÍ; vazio.
- commissions: somente transações reais da Hotmart; vazio.
- sync_status: estado de fontes; vazio.
- owner_access: allowlist para proprietário, criada na Etapa 10; vazia.

O SQL antigo do PR #1 pressupõe um projeto isolado com tabelas diferentes e NÃO pode ser executado sobre o banco compartilhado. Este PR parte da estrutura REAL acima e não contém migração destrutiva.

## Controle de acesso

1. O backend deve verificar JWT assinado no Auth Supabase do projeto compartilhado, e audiência e emissor corretos.
2. Exigir consulta online ao usuário, checagem da sessão ativa no banco, AAL2/MFA real e allowlist exclusiva em criai_private.owner_access.
3. Um usuário do XRMOVI logado no mesmo Auth não pode consultar o CRIAÍ sem autorização explícita de proprietário e MFA.
4. Exigir rate limiting fornecido pelo runtime confiável. CORS não é autorização.
5. A consulta de métricas deve vir somente de criai_private e com credenciais mantidas exclusivamente no servidor, usando o mínimo de privilégios.
6. Não publicar painel financeiro, segredos ou conexão de banco em GitHub Pages. A autorização do usuário não depende de metadados editáveis no navegador.

A API planejada é GET /api/criai/admin/overview?days=7,28,90. Não está publicada. Sem configuração de rate limiter ou conexão, o endpoint falha fechado.

## Implementação neste PR

- src/auth.mjs — verificação da identidade, MFA, sessão e proprietário.
- src/supabase-adapter.mjs — adapter de Auth e consultas parametrizadas a auth.sessions e criai_private.owner_access, sem mudar o XRMOVI.
- src/overview.mjs — relatórios read-only das tabelas reais, com valores NULL ou not_connected quando não houver integração.
- src/handler.mjs — porta HTTP somente leitura com cache proibido, rate limit obrigatório, autenticação e períodos restritos.
- tests/etapa10.test.mjs — testes automatizados simulados, sem login externo ou dados reais.

## Pendências antes de implantar

- GA4 exclusivo CRIAÍ e Measurement ID real; não usar XRMOVI.
- Confirmar UUID real do proprietário e cadastrar owner_access somente por operador confiável; MFA real, sem mexer em configuração global de Auth.
- Definir runtime de API não exposto pelo Pages, segredos privados e conexão mínima ao banco.
- Testar com sessões reais 401 (ausente, expirada, revogada), 403 (não proprietário, sem MFA), 429 (rate limit) e 200 (dono com MFA).
- Conectar GA4, Google Ads CRIAÍ e Hotmart por integrações autorizadas. Não inserir dados inventados.
- Confirmar contato para privacidade, NFS-e e regras Leadlovers antes de anúncios.

O PR é de rascunho. Testes de código não comprovam segurança ou coleta real na produção.
