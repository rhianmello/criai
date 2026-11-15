# CRIAÍ — Etapa 6: homologação externa e métricas reais

Data de verificação: 15/11/2026. Escopo: somente `rhianmello/criai`. Nenhuma alteração em XRMOVI, DNS, anúncios ou pagamentos.

## Evidências técnicas

- Publicação do GitHub Pages aprovada e HTTPS validado em navegação externa via GitHub-hosted runner.
- [Execução de aceitação em produção (48 checks, 0 falhas)](https://github.com/rhianmello/criai/actions/runs/43749802506).
- [Último teste estático antes do relatório](https://github.com/rhianmello/criai/actions/runs/43749802498).
- Respostas HTTP 200: `/`, `/leadlovers.html`, `/sobre.html`, `/privacidade.html`, `/assets/style.css`, `/assets/app.js`, `/assets/config.js`, `/robots.txt` e `/sitemap.xml`.
- Chromium em 1440×900, 768×1024, 390×844, 320×700: títulos e cabeçalhos presentes, nenhum overflow horizontal, nenhum erro de execução JavaScript, Hotlinks com `rel="sponsored"`, menu mobile aberto/fechado corretamente.
- Simulador próprio de custo na página Leadlovers: mensalidade R$ 100 × 12 meses + R$ 50 de custos extras = R$ 1.250; validado em quatro viewports; sem envio/armazenamento do valor digitado.
- Fluxo de consentimento (Measurement ID **fictício em navegador de teste**, requests para Analytics bloqueadas): diálogo aparece, script não carrega antes da escolha, nem após recusa, preferências podem ser reabertas e script é injetado após aceitação.
- Este teste verifica comportamento do navegador **sem comprovar eventos reais no DebugView**, porque o CRIAÍ não tem GA4 de produção configurado.
- Screenshots e JSON disponíveis como artefato na execução GitHub Actions acima.

## Hotlink — avaliação limitada

- Hotlink no código: `https://go.hotmart.com/O108508884T`.
- GET de leitura: HTTP **302** para `https://llovers.com.br/?sck=afill&ref=O108508884T`.
- O parâmetro `ref` conserva o código **O108508884T**; o domínio de destino apresenta conteúdo da Leadlovers.
- **Não foi possível comprovar que o Hotlink pertence à conta Hotmart do proprietário** sem comparar o texto copiado diretamente do painel.
- **Não houve transação ou teste de venda**. O redirecionamento não prova cookies efetivos, atribuição, pagamento ou comissão.
- Fontes: https://suportehotmart.zendesk.com/hc/pt-br/articles/209119037-Como-funciona-o-processo-de-rastreamento-dos-Links-de-Divulga%C3%A7%C3%A3o-HotLinks e https://www.leadlovers.com/politicas-sobre-parcerias

## GA4 e painel privado

- `ga4MeasurementId` segue **vazio** em `assets/config.js`, logo o CRIAÍ não coleta métricas GA4.
- A conta analítica conectada ao assistente tem apenas a propriedade **XRMOVI** (ID (ID omitido por isolamento entre projetos)). **Não reutilizar** no CRIAÍ.
- Sem propriedade GA4 própria, não há validação de `page_view`, `view_item`, `select_content` e `affiliate_click` no DebugView.
- A arquitetura de um painel gerencial privado está em `docs/painel-gerencial.md`; **não há dashboard implantado, autenticação configurada, banco de dados ou integração de receitas**.
- Requer projeto/back-end isolado, autenticação de proprietário, controle de acesso server-side/RLS e segredo fora do GitHub Pages. Sem esses pré-requisitos, não divulgar um painel como seguro ou funcional.

## Regras comerciais

- A Leadlovers permite conteúdo próprio com mídia paga, mas **proíbe usar Hotlink ou seus domínios como destino de anúncios**. Exige negativas de suas marcas e impede segmentação com marcas de concorrentes na oferta. Fonte: https://www.leadlovers.com/politicas-sobre-parcerias.
- O Google Ads rejeita páginas com pouco valor original ou cuja única finalidade é redirecionar. Fonte: https://support.google.com/adspolicy/answer/16427718.
- O CRIAÍ contém conteúdo editorial próprio e simulador de custo, mas isso não equivale à aprovação de anúncios pelo Google.
- A Leadlovers exige NFS-e e relatório mensal do parceiro, inclusive pessoa física; as exigências fiscais **ainda não foram cumpridas ou homologadas**.
- Não foi criado anúncio, campanha, cobrança, venda, saque ou gasto.
- Contato verificável/identificação do controlador do CRIAÍ ainda pendentes na política de privacidade.
- Links de rodapé para Leadlovers, 99Webinar, Copymaker, termos e privacidade e blog foram revisados em fontes oficiais/públicas. **Pagelovers não teve URL própria comprovada**; há somente referência à fornecedora, que não deve ser confundida com link oficial específico. Confirmar com o programa antes do tráfego.
- Performance: páginas carregaram em navegadores externos e dimensões móveis foram testadas. **Não foi executado Lighthouse nem aferidos indicadores Core Web Vitals completos**; não há alegação de nota de performance.

## Alterações da Etapa 6

- `tests/remote_smoke.py` e `.github/workflows/remote-acceptance.yml`: testes reais de URL, TLS, responsividade, Hotlink e consentimento, com evidências.
- Atualização de workflow para `ubuntu-24.04` (Playwright não suporta ainda o Ubuntu 26 do runner padrão).
- `index.html`: catálogo apresentado como curadoria, sem mensagem de site em construção.
- `leadlovers.html`, `assets/style.css`, `assets/app.js`: calculadora própria de custo de assinatura, inteiramente local e com acessibilidade.
- Inclusão de teste da calculadora em todas as resoluções.

## Bloqueadores do lançamento com Ads

1. Comparar Hotlink com **Copiar link** dentro da conta Hotmart.
2. Criar GA4 exclusivo do CRIAÍ, informar Measurement ID real e validar DebugView, consentimento e eventos.
3. Definir contato real e identificação adequada de privacidade.
4. Confirmar links obrigatórios das marcas, inclusive Pagelovers, com a Leadlovers.
5. Resolver como emitir NFS-e e relatórios mensais e obter orientação fiscal aplicável.
6. Se houver painel privado, criar backend independente, proprietário autorizado, MFA e integração com credenciais em secrets, testando negação a terceiros.
7. Auditar Lighthouse e aprovar anúncios na própria conta Google Ads, com palavras-chave genéricas e negativas; gastos só após autorização.

**Status final:** o site está funcional e os testes externos passaram; **não está pronto para anunciar nem para declarar métricas, vendas ou comissões reais**.
