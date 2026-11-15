# CRIAÍ — ETAPA 13: GA4 EXCLUSIVO, CONEXÕES REAIS E ADMINISTRAÇÃO HOMOLOGADA

Atue como engenheiro de software sênior responsável **somente** pelo CRIAÍ. Não altere XRMOVI.

## Ambiente
- Site: https://criai.xrmovi.com.br/
- GitHub: https://github.com/rhianmello/criai, branch main
- Supabase compartilhado autorizado: **somente schema `criai_private`**, atualmente com 8 tabelas RLS fechado.
- Hotmart/Leadlovers: produto 42903, Hotlink `https://go.hotmart.com/O108508884T`
- Código do painel privado: PR #4 em DRAFT (não mesclado, não implantado).
- Relatório anterior: `docs/etapa12-relatorio.md`
- Checklist GA4: `docs/etapa12-ga4-ativacao.md`
- Checklist Ads: `docs/etapa12-ads-preflight.md`
- Issue fiscal #3; Issue CTA/navegador #5.

## CONCLUÍDO — NÃO REPETIR

1. Site GitHub Pages no ar, HTTPS, páginas e CTAs homologados em testes anteriores. Não há mudança de interface na Etapa 12.
2. Eventos opcionais `page_view`, `view_item`, `select_content`, `affiliate_click` (com `cta_placement`), `video_start` já instrumentados com carregamento de GA4 só após consentimento.
3. `assets/config.js` continua com `ga4MeasurementId: ''`: não existe GA4 CRIAÍ conectado. A única propriedade visível no conector atual é a do XRMOVI, que NÃO deve ser reutilizada.
4. `criai_private.affiliate_cta_daily` foi criada sem dados fictícios, para futuros cliques por botão/canal/dispositivo. As 8 tabelas CRIAÍ possuem RLS forçado e sem SELECT público.
5. PR #4 já foi corrigido para não somar sessões nem usuários únicos de GA4 por páginas (duplicaria números). Ele agrega futuros cliques por posição; sem fonte os dados permanecem null/not_connected. CI do PR: **25 testes aprovados** em https://github.com/rhianmello/criai/actions/runs/43760246634.
6. Não há proprietário ativo cadastrado em `criai_private.owner_access`, sessão MFA real homologada, API/Edge Function CRIAÍ ou painel administrativo implantado.
7. Sem visitas, vendas, pagamentos, comissões ou gastos de Ads reais conectados. Nenhum dado fictício foi registrado.
8. Política Leadlovers consultada: NFS-e e relatório mensal até quinto dia útil; recorrência no máximo um ano e demais condições. Issue #3 aberta.
9. Texto do Google Ads preparado, com palavras-chave genéricas, negativas de marca, destino em conteúdo original CRIAÍ; **nenhuma campanha criada/ativada**.

## MISSÃO

### 1. GA4 REAL — desbloqueio principal

Verifique primeiro se foi criada a propriedade exclusiva `CRIAÍ` e fluxo Web para `https://criai.xrmovi.com.br/`. Se houver Measurement ID real `G-...` comprovadamente dessa propriedade, configure **somente** `assets/config.js` e teste no site com consentimento:

- ausência total do script antes do consentimento;
- page_view na home e análise;
- view_item;
- select_content;
- affiliate_click e cta_placement;
- video_start após iniciar vídeo;
- recusa e revogação sem carregamento;
- DebugView/Tag Assistant real, sem enviar eventos ao GA4 do XRMOVI.

Registrar `cta_placement` como dimensão personalizada de evento quando possível. Se não houver propriedade ou permissão para criá-la, manter GA4 desativado e explicar o passo externo necessário.

### 2. Painel e MFA

Revisar PR #4 contra o schema real; manter DRAFT se faltarem elementos de implantação.

Identificar o UUID real do proprietário somente após confirmação verificável e autorização para registrá-lo na allowlist. Não inferir a partir de um e-mail pessoal e não alterar Auth global do XRMOVI.

Testar autenticação JWT verificada, usuário/sessão ativos, MFA AAL2, allowlist server-side, proteção contra abusos, credenciais de mínimo privilégio e CORS estrito. Realizar testes de ponta a ponta 401/403/429/200 antes de liberar endpoint. Não publicar API parcial ou dados financeiros no GitHub Pages.

### 3. Conectar dados REAIS

- GA4 CRIAÍ: sessões, visitantes distintos no período, eventos de cliques por CTA, origem do tráfego e dispositivo.
- Google Ads: campanhas *exclusivamente* do CRIAÍ, custo e origem; não usar conta/campanhas XRMOVI sem autorização específica.
- Hotmart: transações, aprovação, comissões pagas, canceladas e estornos do produto certo, usando fonte autenticada.

Registrar data de sincronização; estados desconectados sempre `Não conectado` / null. Não interpretar `affiliate_click` como venda nem somar sessões de páginas diferentes.

### 4. Ajustes de interface

Se a Issue #5 ainda ocorrer no Chrome do proprietário, comparar navegador com extensões e sem extensões; não mascarar Hotlink nem contornar bloqueadores. Manter CTAs claros, clean white e mobile.

### 5. Conformidade

Resolver NFS-e e relatório (Issue #3), confirmar contato verificável do CRIAÍ para privacidade e link oficial Pagelovers. Não inventar contatos, documentos ou CNPJ.

### 6. Ads

Confirmar política Leadlovers e a regra Google de conteúdo original. Revisar palavras-chave, negativas, URL final e medição com consentimento. Não criar/ativar campanha nem gastar sem autorização específica do proprietário.

## REGRAS

- Somente repositório `rhianmello/criai` e schema `criai_private`. Nenhum dado, tabela, Auth global, função, DNS, campanhas ou recursos críticos do XRMOVI podem ser alterados.
- Nunca expor chaves privadas no Pages/repositório.
- Não criar usuários, transações, métricas, cookies de afiliado ou vendas fictícias.
- Validar testes e registrar commits, PR e evidência; não chamar código em PR de sistema implantado.
- Não duplicar trabalho já concluído.

## ENTREGA

Relatório real de GA4/DebugView, API e MFA (401/403/429/200), métricas e comissões confirmadas, checklist fiscal/Google Ads, commits, testes, problemas e prompt completo Etapa 14. Se bloqueado, declarar dependências sem presumir conclusão.
