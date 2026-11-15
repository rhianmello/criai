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

## Etapa 8 (15/11/2026) — integração bloqueada por dependências externas

- [Relatório da Etapa 8](docs/etapa8-relatorio.md): verificação do GA4, Hotmart, regras comerciais e backend independente.
- [PR #1](https://github.com/rhianmello/criai/pull/1): protótipo de autorização/estrutura privada, **não mesclado nem implantado**. Testes de autorização são simulados, não segurança homologada em banco real.
- [Issue #2](https://github.com/rhianmello/criai/issues/2): checklist das dependências externas para liberação de anúncios.
- [Prompt Etapa 9](prompts/etapa9.md): continuidade com dados reais e autorização de serviço isolado.
- GA4 exclusivo CRIAÍ e backend separado ainda **não existem**; Hotlink precisa ser comparado com texto copiado da Hotmart.
- Não existe campanha ativa do CRIAÍ, nem métricas reais, pagamentos ou comissões comprovados.

**Regra de isolamento:** não usar recursos ou credenciais do XRMOVI para operar o CRIAÍ.

## Etapa 9 — Links de afiliado claros e vídeos oficiais

- Site publicado com CTAs diretos para a Leadlovers na home, análise, navegação e barra fixa mobile. Os links usam `https://go.hotmart.com/O108508884T` e `rel=sponsored`.
- Cinco vídeos oferecidos pelo produtor na área de materiais da Hotmart estão na página da Leadlovers em cartões: player do YouTube é carregado **só após clique**, reduzindo carregamentos externos automáticos.
- [84 testes externos aprovados, 0 falhas](https://github.com/rhianmello/criai/actions/runs/43754899585): resoluções 1440, 768, 390, 320 px; menu, botões, vídeos e clique dos CTAs.
- A pedido do proprietário, foi criado o schema `criai_private` com quatro tabelas no projeto Supabase pré-existente (infraestrutura compartilhada). RLS fechado e sem acesso direto de visitantes. Nenhum dado de venda simulado.
- **GA4 ainda desativado**; não afirmar que os cliques reais estão sendo contabilizados em painel.
- [Relatório Etapa 9](docs/etapa9-conversao-supabase.md) · [Prompt Etapa 10](prompts/etapa10.md).
- [NFS-e e relatório mensal pendentes — Issue #3](https://github.com/rhianmello/criai/issues/3). Não há lembrete automático agendado (limite de cinco tarefas atingido).

## Etapa 10 — métricas e administração (15/11/2026)

- Evento affiliate_click recebeu cta_placement, com consentimento obrigatório. GA4 do CRIAÍ ainda NÃO configurado.
- [85 verificações reais do site](https://github.com/rhianmello/criai/actions/runs/43756802688) aprovadas em desktop/tablet/mobile, incluindo teste de consentimento com ID fictício.
- No Supabase já compartilhado com XRMOVI, o schema privado criai_private contém sete tabelas e nenhuma liberação de leitura pública. Novas tabelas criadas: owner_access, traffic_daily e ads_daily. Nenhuma fonte real conectada.
- [PR #4 (rascunho)](https://github.com/rhianmello/criai/pull/4): API PRIVADA apenas preparada, não implantada, [24 testes unitários aprovados](https://github.com/rhianmello/criai/actions/runs/43756922025).
- PR #1 antigo fechado sem merge porque seu SQL não corresponde ao banco real.
- [Relatório Etapa 10](docs/etapa10-relatorio.md) · [Prompt Etapa 11](prompts/etapa11.md).
- Obrigações fiscais pendentes: [Issue #3](https://github.com/rhianmello/criai/issues/3). Nenhum anúncio foi ativado.

**Não interpretar testes unitários como homologação de segurança em produção ou ausência de dados como zero visitantes.**

## Etapa 11 (15/11/2026) — Botões de conversão, consentimento e backend privado

- **CTA no navegador do proprietário:** print mostrou botão final aparentemente oculto. Chromium limpo mostra botão normalmente (1440, 768, 390 e 320 px). Hipóteses incluem extensões e cache, mas causa não comprovada. [Issue #5](https://github.com/rhianmello/criai/issues/5).
- Home e análise Leadlovers agora oferecem também links internos de navegação junto ao Hotlink final. Não mascarar destino nem contornar bloqueadores.
- Consentimento GA4 preparado com cookies **somente no subdomínio CRIAÍ** (`cookie_domain:'none'`, `cookie_prefix:'criai'`), atualização ao revogar e relatório de privacidade. **GA4 real ainda não conectado**.
- [104 verificações de navegador aprovadas](https://github.com/rhianmello/criai/actions/runs/43758367324) para layout, CTAs finais, vídeos e retirada de consentimento com ID fictício.
- [PR #4 — backend privado em rascunho](https://github.com/rhianmello/criai/pull/4) com correção de data para São Paulo e [25 testes unitários aprovados](https://github.com/rhianmello/criai/actions/runs/43758637587). **Não implantado**.
- Supabase: continuam sete tabelas do `criai_private` com RLS forçado e sem acesso de visitantes; nenhuma Edge Function CRIAÍ nem conta proprietária habilitada automaticamente.
- [Relatório Etapa 11](docs/etapa11-relatorio.md) · [Prompt Etapa 12](prompts/etapa12.md).
- [Pendência fiscal — Issue #3](https://github.com/rhianmello/criai/issues/3) ainda aberta.

**Gate de publicidade ainda pendente:** falta GA4 exclusivo real, identificação e contato comercial, confirmação das obrigações fiscais e revisão da página pelo Google Ads.

## Etapa 12 (15/11/2026) — Métricas de CTA e integração bloqueada

- [Relatório Etapa 12](docs/etapa12-relatorio.md) · [Checklist GA4](docs/etapa12-ga4-ativacao.md) · [Preflight Google Ads](docs/etapa12-ads-preflight.md) · [Prompt Etapa 13](prompts/etapa13.md).
- O Supabase compartilhado contém **oito tabelas somente em `criai_private`**; nova tabela `affiliate_cta_daily` preparada para cliques GA4 por CTA/canal/dispositivo, sem dados fictícios, com RLS forçado e sem leitura por visitantes.
- [PR #4](https://github.com/rhianmello/criai/pull/4) segue rascunho e **não implantado**; corrigido risco de somar sessões/usuários GA4 entre páginas. Agregação por posição de botão preparada. [25 testes aprovados](https://github.com/rhianmello/criai/actions/runs/43760246634).
- GA4 exclusivo CRIAÍ não criado/conectado; `ga4MeasurementId` vazio. Propriedade XRMOVI não usada.
- Sem dados reais sincronizados de visitantes, despesas ou comissões; nenhum proprietário cadastrado com MFA real nem endpoint administrativo.
- Política Leadlovers revalidada: NFS-e + relatório mensal, recorrência no máximo um ano e restrições em mídia paga. [Issue fiscal #3](https://github.com/rhianmello/criai/issues/3) e [CTA no navegador #5](https://github.com/rhianmello/criai/issues/5) continuam abertas.
- Nenhum anúncio, gasto, compra ou mudança no XRMOVI foi realizado.

**Não confundir CI aprovado com segurança homologada em produção; não interpretar falta de dados como ausência de visitantes ou vendas.**
