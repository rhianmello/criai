# CRIAÍ — Etapa 8: integrações reais e liberação comercial controlada
Data: 15/11/2026. Repositório público: `rhianmello/criai`; domínio: `https://criai.xrmovi.com.br/`.

## Escopo e verificações

- O branch principal `main` permanece exclusivo do site CRIAÍ, sem alteração de arquivos do XRMOVI, do DNS ou de campanhas.
- A configuração `assets/config.js` usa `https://go.hotmart.com/O108508884T` e mantém `ga4MeasurementId: ''`.
- O GitHub Pages e o teste de páginas em produção foram homologados nas etapas anteriores (48 testes externos aprovados). Não há necessidade de repetir deploy sem alteração de interface.
- O PR #1 **continua em rascunho e NÃO foi mesclado**: https://github.com/rhianmello/criai/pull/1 .

## Hotmart e Leadlovers

- Produto Hotmart 42903 (informação do painel enviado pelo responsável). A afiliação consta como aprovada nos prints anteriores.
- Hotlink em código `https://go.hotmart.com/O108508884T`. Teste de navegação anterior confirmou redirecionamento HTTP 302 preservando `ref=O108508884T`.
- **PENDENTE:** conferência textual do botão “Copiar link” dentro da conta do afiliado, sem acesso à sessão da Hotmart nesta etapa. Não inferir titularidade ou rastreamento real das comissões.
- Não houve compra, cobrança, saque, venda ou comissão comprovada.

## Google Analytics 4

- A conexão de GA4 disponível é somente de outro projeto (XRMOVI); não há propriedade identificável do CRIAÍ.
- Nenhuma ação disponível nesta sessão cria propriedades GA4; conector de analytics disponível é **somente leitura**.
- Consequentemente, nenhum Measurement ID próprio foi configurado, eventos reais não foram vistos no DebugView e não há dados reais para `page_view`, `view_item`, `select_content` ou `affiliate_click`.
- **Ação externa pendente:** em https://analytics.google.com/ → Administrador → Criar propriedade “CRIAÍ” → Fluxos de dados → Web → `https://criai.xrmovi.com.br/` → obter Measurement ID público `G-...`.
- Com ID real, atualizar somente `assets/config.js` e testar consentimento, Tag Assistant, DebugView e origem/campanha. Não reaproveitar o GA4 do XRMOVI.
- Fonte oficial: https://support.google.com/analytics/answer/14183469?hl=pt-BR

## Painel administrativo privado

- Supabase vinculado tem dois projetos existentes, nenhum chamado CRIAÍ; **nenhum deles foi alterado**.
- Criar projeto novo pode ter custo/limites de plano; como não há confirmação de custo e do destino, **nenhum projeto ou banco foi criado**.
- Ampliado PR de rascunho #1 na branch `feature/etapa7-backend-privado` com:
  - `admin-private/schema-proposta.sql`: schema privado e RLS default-deny (NÃO executado).
  - `admin-private/src/auth.mjs`: verificação de token, expiração, emissor/audiência, sessão ativa, MFA `aal2`, allowlist do proprietário.
  - `admin-private/src/handler.mjs`: rota somente leitura `/api/admin/overview`; dados indisponíveis são explicitamente `not_connected` e `null`, não métricas inventadas.
  - `admin-private/src/supabase-adapter.mjs`: contratos de integração para Auth e consultas parametrizadas ao Postgres *do futuro projeto exclusivo*; sem chave no repositório.
  - `admin-private/tests/*.test.mjs`: simulações de bloqueios para tokens expirados/revogados, ausência de MFA, usuários não autorizados, sessões ausentes e indisponibilidade do banco.
  - `.github/workflows/admin-private-audit.yml`: GitHub Actions do rascunho.
- **Não existe painel implantado**. Testes em CI são simulações, não auditoria de RLS/DB do projeto real. Antes de produção, exigir projeto isolado, login/MFA de verdade, configuração de roles, verificação de sessão, teste real 401/403/200, limites de taxa e infraestrutura segura.
- Fontes de segurança: https://supabase.com/docs/guides/auth/auth-mfa e https://supabase.com/docs/guides/auth/sessions

## Preparação comercial

- Política da Leadlovers: https://www.leadlovers.com/politicas-sobre-parcerias
- **Comprovados como páginas públicas do fornecedor:** `https://www.leadlovers.com/`, `https://99webinar.com/`, `https://copymaker.com.br/`, `https://leadlovers.blog/`; a página oficial `https://www.leadlovers.com/planos/` inclui planos com nome Zaplovers, mas não comprova um domínio independente da marca.
- **Pagelovers:** ainda não foi encontrado um URL próprio verificável. Rótulos do site já esclarecem que há apenas uma referência na política de parceria. Solicitar confirmação ao produtor para satisfazer a exigência do rodapé.
- É necessário fornecer canal de contato realmente administrado pelo CRIAÍ e identificar corretamente o responsável/controlador na política de privacidade, sem inventar endereço ou CNPJ. Não feito nesta etapa.
- A política requer NFS-e e relatórios mensais (até o quinto dia útil) enviados a `contabilidade@leadlovers.com.br` inclusive para pessoa física. Não foi possível confirmar cadastro municipal ou emissão viável na situação individual do responsável.
- A campanha Google Ads permanece **não criada/não ativada**. Não há CPC, ROAS, conversões ou vendas mensuradas.
- URL final candidata: `https://criai.xrmovi.com.br/leadlovers.html`, nunca o Hotlink. Revisar negativas de marca documentadas em `docs/ads-etapa7.md` e a regra Google de conteúdo original.
- Fonte Google: https://support.google.com/adspolicy/answer/16427718

## Decisão de liberação

**NÃO LIBERADO PARA ANÚNCIOS PAGOS.** Acesso público do site está operacional; operações de marketing e financeiro seguem bloqueadas pelas dependências externas acima.

Pendências na próxima etapa:
1. Copiar/confirmar Hotlink da Hotmart;
2. Criar GA4 exclusivo e fornecer Measurement ID;
3. Confirmar e-mail/canal de contato e política LGPD;
4. Confirmar Pagelovers e eventuais URLs de Zaplovers com Leadlovers;
5. Verificar emissão de NFS-e e relatórios;
6. Provisionar backend **somente após avaliação de custos e projeto isolado** e testar credenciais reais;
7. Revisar e aprovar o investimento/campanha CRIAÍ separadamente, sem afetar XRMOVI.

Não há alteração de XRMOVI, DNS, anúncios, pagamentos ou dados de clientes.
