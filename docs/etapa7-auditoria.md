# CRIAÍ — ETAPA 7 — Auditoria e implementação controlada
Data: 15/11/2026. Alterações limitadas a `rhianmello/criai`.

## Evidências reais da etapa

### Infraestrutura e performance
- Site: `https://criai.xrmovi.com.br/`; Pages/HTTPS já haviam sido homologados na Etapa 6.
- A Etapa 7 adicionou CI Lighthouse em `.github/workflows/lighthouse.yml`, com `tests/lighthouse_summary.mjs`.
- Execução real aprovada: https://github.com/rhianmello/criai/actions/runs/43751040687
- Página auditada: `/leadlovers.html`. Lighthouse 13.5.0; única execução em runner GitHub, não são Core Web Vitals reais de campo.
- **Mobile:** desempenho 88, acessibilidade 96, boas práticas 100, SEO 100; LCP 1,3 s; TBT 480 ms; CLS 0.
- **Desktop:** desempenho 100, acessibilidade 96, boas práticas 100, SEO 100; LCP 0,2 s; TBT 0 ms; CLS 0.
- Resultados são pontuais, sensíveis às condições do runner. TBT móvel merece investigação em nova amostra antes de mudanças.
- Não foram criadas credenciais, capturas de visitantes, compras ou integrações financeiras.

### Hotmart
- Produto **Leadlovers** / Hotmart ID **42903**; código atualmente no site: `https://go.hotmart.com/O108508884T`.
- Teste anterior: HTTP 302 para `https://llovers.com.br/?sck=afill&ref=O108508884T`.
- O redirecionamento preserva o código `ref` **nessa etapa**, mas não comprova titularidade do Hotlink na conta, cookies, venda, liberação ou comissão.
- **Pendente:** URL textual copiada diretamente do botão Hotmart “Copiar link”. Não houve login no painel nem compra.

### Google Analytics 4
- Conector de GA4 conferido: somente propriedade **XRMOVI**, ID **562156312**.
- Não houve identificação de propriedade específica CRIAÍ nem permissão de criação de propriedades pela conexão de leitura disponível.
- `assets/config.js` mantém `ga4MeasurementId: ''`; nenhum dado real de visitantes/eventos chegou ao GA4 do CRIAÍ.
- Fluxo de consentimento havia passado em teste com ID **fictício e requests bloqueadas**. DebugView real continua pendente.
- Preparadas instruções sem credenciais em `docs/ga4-etapa7.md`. Jamais reutilizar propriedade XRMOVI.

### Painel administrativo: preparação sem implantação
- Criada a branch `feature/etapa7-backend-privado`.
- [PR de rascunho #1](https://github.com/rhianmello/criai/pull/1), **não mesclado**: `admin-private/schema-proposta.sql` e `admin-private/README.md`.
- O schema proposto usa tabelas em schema privado, sem concessões para `anon`/`authenticated`, com RLS habilitado e sem políticas permissivas. É apenas estrutura/blueprint.
- **Não existe** projeto backend independente provisionado, banco implantado, login seguro, MFA ativo, painel administrativo funcionando, integrações com GA4, Google Ads ou Hotmart.
- Não foram publicados dados financeiros no Pages. Código proposto contém nenhuma senha, API key ou dado de cliente.
- **Não afirmar segurança homologada:** nenhum teste de banco/RLS foi executado em projeto real. Uma implantação exigiria projeto CRIAÍ isolado do XRMOVI e testes de autorização positiva e negativa.

### Regras comerciais, legais e Google Ads
- Política atual Leadlovers consultada: https://www.leadlovers.com/politicas-sobre-parcerias
  - Páginas próprias podem ser usadas na divulgação; **proibido** anúncio para Hotlink ou domínio da Leadlovers.
  - Palavras de marca são reservadas e devem entrar como negativas nas campanhas de pesquisa; não segmentar marcas concorrentes.
  - Afiliação pessoa física não dispensa **NFS-e** e envio de relatório mensal e NFS-e até o **5º dia útil**, conforme o programa.
  - Recorrência de comissões limitada a **até 12 meses**; sujeito a outras condições da política.
- Google Ads exige valor original no destino, não aceitará necessariamente uma simples bridge page: https://support.google.com/adspolicy/answer/6368661?hl=pt-BR
- Adicionada `docs/ads-etapa7.md` com palavras genéricas candidatas, palavras negativas oficiais e checklist. **Nada aplicado em uma conta Google Ads**.
- Revisados rótulos de rodapé; páginas genéricas não são mais identificadas como URL oficial separada de Pagelovers/Zaplovers.
- **Pendências de URLs:** obter do produtor endereços oficiais específicos Pagelovers/Zaplovers. Página `copymaker.com.br` apresentou 404 em uma tentativa e sucesso em outra fonte de busca; requer revalidação de navegação no destino.
- URLs `99webinar.com`, `leadlovers.com/termos-de-uso`, `leadlovers.com/politica-de-privacidade` abriram em consultas públicas.
- **Privacidade**: ainda não há identificação e contato verificável do responsável pelo CRIAÍ. Não inventar e-mail, CNPJ ou titularidade.
- **Fiscal**: não se confirmou regularização de emissão de nota por pessoa física ou jurídica; não declarar pronta para comissionamento operacional.

## Arquivos e commits principais

- `.github/workflows/lighthouse.yml`: 36b283f6a30e394bce5cb1cb6013c49fafadf29e
- `tests/lighthouse_summary.mjs`: 95deea6afc7ddefaac2f365dbbbb721f3ef0aed9
- `docs/ads-etapa7.md`: 7d1498a69d0dad5d1a2e284c70d5738b1f04c440
- `docs/ga4-etapa7.md`: e81e4d2bd4288725e6a2e03dae4956e6db988cd0
- Rótulos informativos do rodapé: 2a08cf45b80d2799c4bdb7cc92a4b2cedc7901d6; 8a055dfbc7c5689d834756fe3c8c7fc2f3576414; eaa1e5abf85e791ed7b09f831bd890902d0f6ba7.
- PR #1: https://github.com/rhianmello/criai/pull/1 (branch não implantada).

## Gate de lançamento — NÃO APROVADO

Falta: (1) confirmação do Hotlink copiado da Hotmart, (2) GA4 exclusivo real e DebugView, (3) contato e privacidade, (4) links do produtor, (5) operação de NFS-e/relatórios e (6) aprovação de uma futura campanha e orçamento. Não anunciar, cobrar ou declarar métricas e comissões sem essas etapas.

**XRMOVI permaneceu intacto.**
