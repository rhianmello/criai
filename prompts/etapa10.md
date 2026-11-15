# CRIAÍ — ETAPA 10: MÉTRICAS REAIS E ADMINISTRAÇÃO SEGURA

Atue como engenheiro sênior. Trabalhe somente no GitHub `rhianmello/criai` e no esquema `criai_private` autorizado dentro do Supabase existente. Não altere tabelas, Auth, funções, DNS ou campanhas do XRMOVI.

## Estado concluído — não repetir
- Site HTTPS publicado em https://criai.xrmovi.com.br/.
- Hotlink configurado `https://go.hotmart.com/O108508884T`; HTML de materiais da Hotmart mostrado pelo usuário confirma os caracteres no código. HTTP 302 preservou `ref=O108508884T`. Não houve venda/comissão comprovada.
- Homepage e análise possuem CTAs diretos acima da dobra, CTA na oferta e barra fixa mobile, todos com identificação de afiliado.
- Cinco vídeos do produtor integrados via `youtube-nocookie` somente após clique.
- GitHub Actions: **84 testes externos aprovados** em https://github.com/rhianmello/criai/actions/runs/43754899585.
- Projeto Supabase compartilhado autorizado: schema privado `criai_private` com `offer_catalog`, `daily_metrics`, `commissions`, `sync_status`; RLS habilitado/forçado; nenhuma permissão a roles públicas. Uma oferta cadastrada, zero vendas fictícias.
- PR #1 antigo continua draft, não executar migrations sem reconciliar. A infraestrutura é compartilhada com XRMOVI (isolamento lógico, não físico).
- GA4 CRIAÍ ainda não criado, Measurement ID em branco.
- NFS-e pendente em Issue #3; tarefas agendadas no ChatGPT estão no limite, logo não existe lembrete automático.

## Missão
1. **GA4 exclusivo:** validar se há fluxo Web CRIAÍ. Caso haja ID `G-...` real, inserir em `assets/config.js`, respeitar consentimento, testar page_view, view_item, affiliate_click, select_content e video_start no DebugView. Não usar GA4 do XRMOVI.
2. **Painel privado:** reconciliar o PR #1 com o esquema `criai_private` real. Implementar servidor autenticado com MFA/allowlist/checagem de sessão, proteção contra abuso e escopo CRIAÍ. Não expor segredos nem tabelas ao navegador. Só liberar após testes reais 401/403/200 e aprovação para alterar infraestrutura compartilhada além do schema. Não prejudicar XRMOVI.
3. **Dados de vendas:** só inserir comissões reais confirmadas pela Hotmart. Estado de fontes sem conexão deve aparecer como `Não conectado`, nunca como zero fictício.
4. **Conformidade:** obter contato verificável para privacidade, revisar marcas/URLs com Leadlovers, NFS-e e relatórios. Issue #3 permanece aberta até regularização comprovada.
5. **Conversão:** testar navegação real do CTA e vídeos; analisar comportamento consentido se houver GA4; melhorar CTAs sem promessas irreais ou artifícios enganosos.
6. **Ads:** preparar campanhas específicas do CRIAÍ para conteúdo próprio, com negativas de marca da Leadlovers e orçamento a aprovar. Não ativar gastos ou compras.
7. **Entrega:** commits, evidências, resultados de acesso autorizado, status de GA4, Hotmart, NFS-e e prompt Etapa 11.

Relatório anterior: `docs/etapa9-conversao-supabase.md`.

**Não mexa em XRMOVI, exceto no schema `criai_private` expressamente autorizado.** Não reimplemente o que já passou nos testes.
