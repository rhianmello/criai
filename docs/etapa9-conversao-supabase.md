# CRIAÍ — Etapa 9: conversão, Hotmart, vídeos e consultas (15/11/2026)

## Mudanças efetivamente publicadas no CRIAÍ

- **Home:** novo texto de abertura com Leadlovers e botão acima da dobra `Conhecer planos da Leadlovers` indo DIRETAMENTE ao Hotlink. Botão secundário para vídeos/análise; CTA também na oferta e seção final.
- **Análise Leadlovers:** CTA direto no topo, navegação superior, lado da análise, após vídeos, fim de página e barra fixa em celulares.
- **Material do produtor:** 5 vídeos retirados dos URLs fornecidos em prints da Hotmart. Cartões de vídeo usam fachada visual interna e só instanciam player `youtube-nocookie` após o clique — sem iframe e sem requisições de vídeo prévias.
- **Responsividade:** estilos para desktop/tablet/celular, barra móvel de CTA; sem banners Imgur quebrados (as prévias dos banners na Hotmart apareciam quebradas).
- **Privacidade:** informação de carregamento manual de vídeos de terceiros na página de privacidade.
- **Acompanhamento:** cliques nos Hotlinks são instrumentados para GA4 somente se a propriedade própria for configurada e houver consentimento; `video_start` é opcional e também condicionado a consentimento. Não representa venda.

## Evidência de homologação

- GitHub Actions `CRIAI production browser acceptance` em https://github.com/rhianmello/criai/actions/runs/43754899585
- **84 verificações aprovadas; zero falhas**: HTTPS, páginas, assets, 1440/768/390/320 px, botões diretos, vídeos com carregamento só no clique, menu mobile, calculadora, consentimento em simulação e destino do clique do CTA.
- Cliques simulados nos dois CTAs de abertura: ambos abriram `https://go.hotmart.com/O108508884T`, com tráfego interceptado em teste; nenhuma compra.
- Consulta de leitura separada ao Hotlink respondeu **302** para `https://llovers.com.br/?sck=afill&ref=O108508884T`. Isso não prova uma venda, cookie persistente ou comissão creditada.
- O GitHub Pages foi publicado e testes estáticos também passaram nas mudanças de interface. Verificar ação final da documentação antes de concluir status do último commit.

## O que cada aba da Hotmart representa

- **Links para afiliados:** Hotlinks disponibilizados pelo produtor; já há link em uso.
- **Links criados por mim:** URL personalizada para conteúdo/página específica do produtor (opcional), útil quando houver campanhas segmentadas. Não necessário agora.
- **Material de divulgação:** vídeos e banners do produtor; 5 vídeos foram selecionados para a análise. Banners com prévias quebradas não foram reutilizados.

O HTML de banner mostrado na própria Hotmart exibia `https://go.hotmart.com/O108508884T`. Essa correspondência é evidência visual direta da área de divulgação fornecida pelo usuário, mas não é relatório financeiro.

## Supabase — decisão do proprietário

- O usuário autorizou explicitamente na Etapa 9 utilizar **o projeto Supabase existente do XRMOVI** para consultas do CRIAÍ, em vez de provisionar novo projeto.
- Criado esquema privado `criai_private`, com tabelas `offer_catalog`, `daily_metrics`, `commissions` e `sync_status`.
- Gravada apenas a oferta Leadlovers / produto 42903, Hotlink e status `pending_confirmation`. **Sem dados artificiais de métricas, cliques ou comissões.**
- Todas as quatro tabelas têm RLS habilitado e forçado. Nem `anon` nem `authenticated` possuem `USAGE` no schema ou `SELECT` nas tabelas. Validação SQL e advisors conferidos.
- **Isolamento é lógico, não físico.** Os sistemas compartilham infraestrutura, recursos, configurações e risco operacional do mesmo Supabase; não anunciar isolamento absoluto. Nenhuma tabela ou regra do XRMOVI foi alterada.
- **Nenhuma API privada nem painel conectados.** Consultas futuras requerem serviço autorizado no servidor, autorização de proprietário e regras de acesso auditadas, sem chave privilegiada no GitHub Pages.
- O PR #1, inicialmente feito para backend separado, está em draft e precisa reconciliar modelo/tabelas antes de merge; não executar seu `schema-proposta.sql` no projeto atual.

## GA4 e comércio

- Propriedade GA4 exclusiva CRIAÍ ainda indisponível; único conector listado pertence a outro projeto. `ga4MeasurementId: ''` permanece vazio.
- `page_view`, `view_item`, `select_content`, `affiliate_click` ainda não foram validados no DebugView real.
- Nenhum Google Ads do CRIAÍ foi ativado, nenhum orçamento alterado, nenhuma venda/comissão confirmada.
- Falta contato comercial e controlador real para atualizar privacidade; não inventar.
- Verificar com Leadlovers URLs exigidas de marcas (especialmente Pagelovers) e regra fiscal.
- Nota fiscal/NFS-e e relatório mensal foram registrados em [Issue #3](https://github.com/rhianmello/criai/issues/3) como pendência persistente. Automação de lembrete NÃO foi criada porque a conta está no limite de 5 tarefas agendadas. O issue não notifica em data programada.

## Pendências da Etapa 10

1. Criar propriedade GA4 CRIAÍ em https://analytics.google.com/, obter ID real `G-...` e testar com consentimento/DebugView.
2. Aprovar modelo de API privada para consultar `criai_private` no projeto existente, com MFA, allowlist e teste de negação a usuários externos.
3. Confirmar comissões reais apenas por Hotmart/relatórios; sem converter `affiliate_click` em venda fictícia.
4. Obter e-mail de contato verificável e revisão LGPD.
5. Verificar NFS-e/relatórios (Issue #3) e URL oficial de Pagelovers.
6. Revisar Google Ads antes de qualquer gasto: conteúdo próprio, negativas obrigatórias, URL final CRIAÍ e nunca Hotlink direto em anúncio.
7. Auditar experiência com usuários reais, CTR de visitantes consentidos e possíveis experimentos A/B após GA4 ativado.

**Nenhuma compra, cobrança, campanha ou integração de dados de clientes foi criada nesta etapa.**
