# CRIAÍ — ETAPA 8: INTEGRAÇÕES REAIS E LIBERAÇÃO COMERCIAL CONTROLADA

Atue como engenheiro de software sênior responsável exclusivamente pelo CRIAÍ.

## Ambiente
- Site: https://criai.xrmovi.com.br/
- GitHub: https://github.com/rhianmello/criai (branch main)
- Leadlovers/Hotmart produto 42903
- Hotlink configurado: https://go.hotmart.com/O108508884T (titularidade ainda sem confirmação textual)
- **Não tocar no XRMOVI**, suas bases, anúncios, domínios ou GA4.

## Etapa 7 concluída — não refazer
- Auditoria Lighthouse real (execução https://github.com/rhianmello/criai/actions/runs/43751040687):
  - Mobile performance 88, acessibilidade 96, boas práticas 100, SEO 100.
  - Desktop performance 100, acessibilidade 96, boas práticas 100, SEO 100.
  - LCP 1,3 s mobile; TBT 480 ms; CLS 0 (medição de laboratório).
- Adicionados workflow `.github/workflows/lighthouse.yml` e relatório em `docs/etapa7-auditoria.md`.
- Documentos `docs/ga4-etapa7.md` e `docs/ads-etapa7.md` com checklist sem nenhuma campanha ativada.
- Rodapé revisado para não chamar URL genérica de produto específico.
- Rascunho seguro de dados do painel em PR #1, branch `feature/etapa7-backend-privado`; **não foi implantado**.
- GA4 existente conectado é apenas XRMOVI propriedade 562156312; não usar.

## Objetivos da Etapa 8

1. **Hotmart**: comparar o texto copiado do Hotlink oficial por quem tem acesso à conta e a URL no código, sem criar venda de teste. Confirmar destino e registrar atribuição como não comprovada até haver dados de transações reais.
2. **GA4 CRIAÍ**: obter propriedade exclusiva e Measurement ID `G-...`, inserir só o identificador público no config, testar Tag Assistant/DebugView com consentimento real, validar page_view, view_item, select_content e affiliate_click. Não compartilhar métricas ou IDs do XRMOVI.
3. **Painel privado**: revisar PR #1 de segurança; só provisionar backend separado depois de confirmação da conta/projeto e de autorização para eventual custo. Configurar Auth com MFA, allowlist de proprietário e RLS; testes negativos são obrigatórios (sem token, outro usuário, sem MFA, token expirado). Não expor dados financeiros em GitHub Pages ou em código público.
4. **Integração de relatórios**: GA4 para visitas e cliques, Google Ads CRIAÍ para custos e Hotmart para comissões aprovadas, sempre pelo fonte oficial e com data da última atualização. Se não houver dados ou integração, mostrar explicitamente “Não conectado”, não números fictícios.
5. **Comercial**: obter contato verificável para CRIAÍ e revisar LGPD; validar URLs específicas Pagelovers/Zaplovers/Copymaker com Leadlovers; confirmar emissão de NFS-e e relatório mensal mesmo como pessoa física.
6. **Google Ads (somente preparação)**: revisar `docs/ads-etapa7.md` e regras de palavras negativas e destino de conteúdo próprio. Não criar/anunciar/gastar sem autorização específica.
7. **QA**: rodar testes GitHub Pages, Lighthouse e regressões de analytics/segurança; documentar links de execuções e commits.

## Regras
- Não alterar XRMOVI nem propriedade GA4 562156312.
- Não inventar Hotlinks, e-mails, identificadores, métricas, usuários ou pagamentos.
- Não expor tokens, chaves, service_role ou dados pessoais no repositório público.
- Não realizar compras, cobranças ou gastos.
- Sem backend isolado e testes reais, não afirmar “painel privado implantado”.

## Entrega
Relatório com evidências, commits, GA4 e Hotmart reais, resultado do painel privado, bloqueadores de lançamento e prompt para Etapa 9.
