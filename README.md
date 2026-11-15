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
