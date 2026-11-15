# CRIAÍ — ETAPA 11 — HOMOLOGAÇÃO DE CTA, GA4 E PAINEL PRIVADO
Data: 15/11/2026 · Repositório: rhianmello/criai · Site: https://criai.xrmovi.com.br/

## 1. Ocorrência visual reportada

Screenshot do proprietário: a chamada final da home exibia a descrição e aviso de afiliação, mas o botão verde de acesso à Leadlovers não aparecia.

**Auditoria de fonte:** `index.html` e `leadlovers.html` já continham a âncora `https://go.hotmart.com/O108508884T` com `rel="sponsored noopener noreferrer"`.

**Teste em navegador Chromium limpo:** o botão final apareceu com fundo verde, texto branco, altura >= 46 px e largura adequada em 1440, 768, 390 e 320 px, em ambas as páginas; não houve problema de CSS no teste.

A ausência no Chrome do proprietário **não foi reproduzida**; bloqueadores/extensões ou cache são hipóteses, não causas comprovadas. Não contornar bloqueadores por redirecionamento oculto.

**Mitigação publicada:** agora a home oferece um segundo botão interno `Ver análise e condições`; a análise oferece `Rever vídeos demonstrativos`. Esses links permanecem úteis quando o navegador oculta links externos de afiliados. Issue #5 criada para investigar o navegador afetado: https://github.com/rhianmello/criai/issues/5

## 2. Homologação pública

- GitHub Actions, 104 verificações de navegação aprovadas, zero falhas: https://github.com/rhianmello/criai/actions/runs/43758367324
- HTTPS, links externos, CTA na abertura e no fim, fallback interno, mobile sticky, menu, vídeos somente após clique, calculadora, páginas legais e JavaScript sem exceções.
- Eventos com GA4 **fictício/interceptado** demonstraram `affiliate_click` e seu campo `cta_placement`, sem transmitir dados reais.
- Redirecionamento 302 da Hotmart observado em teste anterior mantendo `ref=O108508884T`; não comprova comissão ou pagamento.
- Os testes desta etapa **não** incluíram compra ou abertura de anúncios.

## 3. Privacidade aprimorada

- No `assets/app.js`, a futura configuração GA4 passa a usar `cookie_domain:'none'` (cookie restrito ao host CRIAÍ) e `cookie_prefix:'criai'`, evitando compartilhamento automático de cookies de estatística entre o CRIAÍ e o XRMOVI.
- Ao revogar consentimento, o script faz `gtag('consent','update', analytics_storage:'denied', ...)`, atualiza preferência local e recarrega, sem voltar a carregar a tag.
- Testes comprovam GA4 não carregado antes da escolha, após rejeição e após revogação. Teste com ID fictício também confirmou a configuração de cookies.
- `privacidade.html` atualizado com explicação de cookie próprio e limite de retirada de consentimento; cabeçalhos numerados corrigidos.
- Importante: esses controles não comprovam coleta, auditoria real de cookies de terceiros ou exclusão retroativa de dados eventualmente já processados pelo Google.

Fonte de cookie_domain: https://developers.google.com/tag-platform/security/guides/customize-cookies
Fonte de consentimento básico: https://developers.google.com/tag-platform/security/concepts/consent-mode

## 4. GA4 real: NÃO CONECTADO

- Consulta às conexões disponíveis encontrou somente a propriedade do XRMOVI. Ela não foi usada.
- `assets/config.js` mantém `ga4MeasurementId: ''`.
- Não foi disponibilizada ferramenta com permissão para criar propriedade GA4 no Google Analytics; não houve configuração externa ou registro de DebugView real.
- `page_view`, `view_item`, `select_content`, `affiliate_click` e `video_start` estão preparados, mas **sem Measurement ID não são métricas capturadas**.
- Para destravar: Analytics > Administrador > Criar propriedade **CRIAÍ** > Fluxo de dados **Web** (https://criai.xrmovi.com.br/) > copiar ID `G-...`. Enviar somente o identificador público, nunca credenciais.
- Depois atualizar config, testar consentimento e DebugView/Tag Assistant real. Registrar `cta_placement` como dimensão personalizada de escopo de evento, se necessário em relatórios.

Fonte: https://support.google.com/analytics/answer/14183469?hl=pt-BR

## 5. Backend privado: PR #4 ainda em rascunho

- PR: https://github.com/rhianmello/criai/pull/4
- Corrigido o agrupamento de datas do futuro relatório de São Paulo usando Intl.DateTimeFormat.formatToParts, sem depender do formato regional de string.
- CI do PR: **25 testes unitários aprovados, zero falhas**: https://github.com/rhianmello/criai/actions/runs/43758637587
- O PR implementa apenas código preparatório para token assinado, sessão ativa, MFA `aal2`, allowlist própria, rate limit e consultas read-only no schema.
- **Não foi mesclado ou implantado.** Nenhuma API, endpoint, login, painel ou Edge Function CRIAÍ foi publicado no Supabase.
- No Supabase compartilhado, foram consultadas (não alteradas) as sete tabelas `criai_private`: todas com RLS forçado, sem SELECT para `anon` ou `authenticated`.
- `owner_access` sem proprietário ativo; tabelas de tráfego, gastos, comissões e estados de integração sem registros reais. Ausência de registros não significa tráfego ou vendas zero.
- Existem outras Edge Functions no projeto compartilhado, mas **nenhuma específica do CRIAÍ**. Não modificar as funções do XRMOVI.
- Sem UUID real de dono autorizado, MFA ativa, servidor seguro de mínimo privilégio, limite de requisições e testes reais de 401/403/429/200, o painel deve ficar indisponível.

## 6. Hotmart, conformidade e anúncios

- Hotlink da Leadlovers/Hotmart produto 42903 permanece `https://go.hotmart.com/O108508884T`, conforme HTML de materiais exibido na conta do afiliado.
- Vendas e comissões devem ser confirmadas na Hotmart; não inferir a partir dos cliques.
- A política da Leadlovers veda anúncio pago com URL final no Hotlink ou domínio do produtor; também exige negativas de marca em campanhas de pesquisa. Permite páginas com conteúdo próprio, sujeitas às regras. https://www.leadlovers.com/politicas-sobre-parcerias
- Google Ads não aprova páginas intermediárias sem valor editorial original suficiente. https://support.google.com/adspolicy/answer/16427718
- Contato verificável do responsável CRIAÍ e endereço próprio do Pagelovers ainda dependem de confirmação. Não inventar e-mail, CNPJ nem páginas oficiais.
- Issue #3 referente a emissão de NFS-e e relatório mensal Leadlovers permanece aberta: https://github.com/rhianmello/criai/issues/3
- Nenhuma campanha, despesa, cobrança, compra ou teste de venda foi realizado.

## 7. Commits e QA principais

- `a9cdcb1d`: inspecionar visibilidade computada do CTA final.
- `82e2ee0f` / `cfc2e211`: fallback interno nos painéis finais da home e análise.
- `18254262`: cookie_domain restrito ao host, prefixo e atualização imediata ao revogar consentimento.
- `725e5323`: teste do fallback, domínio de cookies e revogação.
- `8438f98a`: política de privacidade atualizada.
- `0232e7a1` / `33297152` (PR #4): data local robusta e teste correspondente.

### Gate

**Site público funcionando; GA4 real pendente; painel privado não implantado; publicidade paga não autorizada; fiscal pendente.**

Nenhum arquivo, tabela ou Edge Function do XRMOVI foi modificado.
