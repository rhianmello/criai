# CRIAÍ — curadoria independente de ferramentas digitais

**Site:** https://criai.xrmovi.com.br/  
**Repositório:** `rhianmello/criai` (branch `main`)  
**Hospedagem:** GitHub Pages, `CNAME` para `criai.xrmovi.com.br`  
**Escopo:** separado do XRMOVI; nenhum arquivo ou campanha XRMOVI modificado.

O CRIAÍ publica análises e exemplos práticos sobre soluções digitais, com identificação de links comerciais. O checkout e o suporte dos produtos são responsabilidades dos fornecedores.

## Etapas concluídas

- Páginas `index.html`, `leadlovers.html`, `sobre.html`, `privacidade.html`.
- Identidade clean white e layout responsivo em `assets/style.css`.
- `assets/app.js`: menu mobile, botões de afiliado e eventos opcionais de GA4 com consentimento.
- `assets/config.js`: Hotlink e campo de configuração `ga4MeasurementId` (ainda **vazio**).
- `robots.txt`, `sitemap.xml`, `canonical` e metadados revisados para `criai.xrmovi.com.br`.
- `.github/workflows/criai-audit.yml` e `tests/site_check.py`: CI de links locais, arquivos, domínios e sintaxe JavaScript.
- Configuração do domínio e Enforce HTTPS exibidos como válidos nas capturas do proprietário; publicação automática confirmada por GitHub Actions para revisões anteriores.

## Primeira indicação

**Leadlovers** (Hotmart ID 42903), afiliação confirmada em captura do painel.

Hotlink presente em `leadlovers.html` e `assets/config.js`:

`https://go.hotmart.com/O108508884T`

**Pendente**: o link foi transcrito de uma captura. O proprietário precisa copiar da Hotmart, confirmar caracteres e testar o redirecionamento real sem compra. Eventos `affiliate_click` medem apenas cliques, **não** vendas/comissões.

## Analytics

O GA4 só será carregado se houver um Measurement ID válido (formato `G-...`) **e** consentimento para estatísticas. Atualmente o campo `ga4MeasurementId` está vazio, sem coleta analítica. A interface oferece opção de aceitação/recusa e revisão de preferências. Não foram criadas propriedades GA4, credenciais ou métricas fictícias.

## Política e anúncios

Antes de ativar anúncios pagos, conferir os requisitos de conteúdo original do Google Ads e a política da Leadlovers. A Leadlovers não permite campanhas com URL final de Hotlink ou de seus próprios domínios, exige negativas para marcas reservadas e obrigações mensais de NFS-e e relatórios (inclusive para afiliados pessoa física).

**Não há campanhas, cobranças ou pagamentos criados nesta etapa.**

## Auditoria técnica e próximas tarefas

- [Relatório técnico e pendências da Etapa 5](docs/etapa5-auditoria.md)
- [Proposta de painel privado, ainda não implementado](docs/painel-gerencial.md)
- [Checklist de Google Ads sem ativação](docs/google-ads-preflight.md)
- [Prompt de continuidade da Etapa 6](prompts/etapa6.md)

### Pendências essenciais

1. Validar a publicação e o HTTPS externamente com acesso real ao domínio.
2. Confirmar o link Hotmart diretamente do painel e a página final do fornecedor.
3. Conferir todos os links oficiais exigidos no rodapé, principalmente Pagelovers.
4. Disponibilizar contato real e revisar obrigações de privacidade e notas fiscais.
5. Criar GA4 do CRIAÍ, obter identificador, testar eventos com consentimento e validar dados no DebugView.
6. Preparar painel administrativo privado e separar métricas reais de estimativas.
7. Somente após esses testes, planejar a ativação de campanhas.

**Importante:** GitHub Pages é site estático público. Nunca gravar chaves, dados pessoais de visitantes, segredos ou dashboard administrativo sensível neste repositório.

## Etapa 6 (15/11/2026) — homologação em produção

- **48 testes externos passaram**, nenhum erro: site, quatro páginas, assets, HTTPS, 1440/768/390/320 px, menu mobile, botões, simulador de assinatura e consentimento analítico com ID fictício (nenhum dado GA enviado). Evidências: https://github.com/rhianmello/criai/actions/runs/43749802506
- Acesse o relatório técnico: [docs/etapa6-homologacao.md](docs/etapa6-homologacao.md).
- Hotlink HTTP 302 redireciona para `llovers.com.br/?sck=afill&ref=O108508884T`; isso **não comprova titularidade do afiliado nem atribuição comercial**.
- **GA4 CRIAÍ não configurado**: campo Measurement ID segue em branco. A propriedade GA4 conectada do XRMOVI não deve ser reutilizada.
- **Painel administrativo ainda não implantado**: aguardando backend isolado e autenticação segura; não usar GitHub Pages para dados privados.
- Não houve anúncio pago, venda, pagamento nem alteração no XRMOVI.
- [Prompt completo para Etapa 7](prompts/etapa7.md).

## Etapa 7 — verificação de produção e preparação de integrações (15/11/2026)

- Lighthouse da oferta Leadlovers realizado no GitHub Actions: **mobile 88/96/100/100** e **desktop 100/96/100/100** (performance/acessibilidade/boas práticas/SEO). [Execução com relatórios brutos](https://github.com/rhianmello/criai/actions/runs/43751040687). Métricas de laboratório, não tráfego real.
- GA4 CRIAÍ **não conectado**. Não reutilizar propriedade do XRMOVI (ID (ID omitido por isolamento entre projetos)).
- Hotlink redireciona, mas titularidade não confirmada por cópia direta da Hotmart e não houve transação.
- **Admin privado não implantado:** esquema preliminar em [PR de rascunho #1](https://github.com/rhianmello/criai/pull/1), sem projeto separado, login, MFA ou dados.
- Regras para futura campanha somente documentadas: [docs/ads-etapa7.md](docs/ads-etapa7.md). Nenhuma campanha criada, nem negativas aplicadas em conta Google Ads.
- [Relatório e pendências da Etapa 7](docs/etapa7-auditoria.md).
- [Instruções GA4 exclusivo](docs/ga4-etapa7.md).
- [Prompt da Etapa 8](prompts/etapa8.md).

**Gate comercial permanece pendente** até verificar Hotlink e conta, GA4 exclusivo, identificação e contato reais, links exigidos pelo produtor e emissão de NFS-e/relatórios.
