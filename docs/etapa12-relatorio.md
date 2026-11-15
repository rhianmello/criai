# CRIAÍ — Relatório Etapa 12 (15/11/2026)

## Escopo e evidência atual

Repositório exclusivo `rhianmello/criai`; domínio `https://criai.xrmovi.com.br/`; Hotmart Leadlovers 42903 / `https://go.hotmart.com/O108508884T`. Não foram feitas compras, despesas de anúncios, cobranças ou alterações nas operações do XRMOVI.

### Google Analytics 4: ainda NÃO conectado

- `assets/config.js` permanece com `ga4MeasurementId: ''`.
- Conector GA4 disponível mostrou somente propriedade **XRMOVI**, que foi explicitamente excluída da configuração.
- Nenhum identificador real do CRIAÍ foi fornecido ou criado por uma ferramenta autorizada; não foi possível executar DebugView/Tag Assistant real.
- Eventos `page_view`, `view_item`, `select_content`, `affiliate_click` (`cta_placement`) e `video_start` permanecem preparados, com consentimento; não são dados coletados enquanto o ID estiver vazio.
- Documento operacional para criação, consentimento e verificação: [docs/etapa12-ga4-ativacao.md](etapa12-ga4-ativacao.md).

### Banco de dados: criação isolada e verificações

Foi aplicada a migração `criai_cta_placement_metrics_private` no projeto Supabase compartilhado já autorizado, **somente** no esquema `criai_private`:

- Nova tabela `affiliate_cta_daily`, chave composta por data, produto, posição, canal e dispositivo, para futuros cliques de GA4 consentidos.
- Não inclui PII; nenhuma linha foi importada ou simulada.
- Total do esquema: **8 tabelas**.
- SQL de verificação: todas as 8 com `RLS=true`, `FORCE RLS=true`, sem leitura `SELECT` para `anon` ou `authenticated`.
- `owner_access`, `traffic_daily`, `ads_daily`, `affiliate_cta_daily`, `commissions` e `sync_status` sem registros reais/integrações ativas. Esses vazios não significam zero visitas ou vendas.
- Sem alteração de tabelas, sessões, usuários ou Edge Functions do XRMOVI.

### Painel privado: código do PR #4, NÃO implantado

- PR: https://github.com/rhianmello/criai/pull/4
- Foram corrigidos relatórios que somariam erroneamente sessões GA4 entre páginas: **sessões e usuários distintos permanecem `null`** até existir uma agregação sem duplicação.
- Leitor server-side preparado para breakdown por `cta_placement`, `product_code` e quantidade de cliques a partir de `affiliate_cta_daily`.
- Fontes desconectadas exibem `not_connected` e `null`, sem números fictícios.
- Testes do PR com mocks autorizados (sem acesso a dados reais): **25 passaram, 0 falhas** em https://github.com/rhianmello/criai/actions/runs/43760246634.
- **Não existe backend hospedado, endpoint de administração ativo ou painel autenticado.** Falta UUID de proprietário comprovado, MFA AAL2 real, pool com privilégios mínimos, servidor seguro/rate limit e testes reais de 401/403/429/200.
- Não mesclar PR #4 até passar pelas dependências acima.

### Interface, links e conversão

- Home e Leadlovers continuam com CTA direto, fallback interno e explicação de afiliação.
- Testes anteriores homologaram 104 checks de navegador em https://github.com/rhianmello/criai/actions/runs/43758367324; **não repetidos nesta etapa**, pois não houve alteração de comportamento da interface pública.
- O problema de botão oculto no navegador do proprietário permanece **não reproduzido** em Chromium limpo e aberto na Issue #5.
- O código público foi preservado; as mudanças da `main` nesta etapa são documentação e prontidão operacional.

### Regras oficiais e comercial

Fontes verificadas em 15/11/2026:
- Leadlovers: https://www.leadlovers.com/politicas-sobre-parcerias
- Google Ads: https://support.google.com/adspolicy/answer/16427718
- GA4: https://support.google.com/analytics/answer/14183469

A Leadlovers exige NFS-e e relatório mensal de transações também de afiliados PF, com envio até o quinto dia útil. A política menciona **recorrência de no máximo um ano**, saque acima de R$ 75, possibilidade de congelamento após quatro meses sem novas vendas e demais condições. A Issue #3 fiscal segue aberta.

A política permite anúncios com URL de conteúdo próprio, proíbe usar Hotlink/destino do produtor em mídia paga e exige negativas de marca; também impede segmentação em marcas concorrentes. O Google Ads pode reprovar páginas-ponte sem conteúdo original relevante.

**Links oficiais de Pagelovers não foram confirmados com segurança.** Não substituir o rodapé por domínio inventado. Falta canal de contato verificável do CRIAÍ; sem inventar CNPJ, endereço ou e-mail.

O checklist comercial/Google Ads foi atualizado em [docs/etapa12-ads-preflight.md](etapa12-ads-preflight.md). Nenhuma campanha foi criada ou ativada.

## Próximas dependências prioritárias

1. Criar propriedade GA4 exclusiva CRIAÍ e obter Measurement ID `G-...` real; validar DebugView com consentimento.
2. Identificar o proprietário real e homologar MFA AAL2 e API no servidor isolado, sem alterar Auth global do XRMOVI.
3. Conectar fontes autorizadas e importar somente visitas, cliques, gastos e vendas reais.
4. Resolver NFS-e/relatório (Issue #3), contato de privacidade e links Pagelovers.
5. Validar URL final e negativas do Google Ads antes de qualquer autorização de gasto.

**Situação final:** site público operacional; GA4 não conectado; painel privado não implantado; sem comissões verificadas; tráfego pago não liberado.
