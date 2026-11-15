# CRIAÍ — ETAPA 11: GA4 REAL, AUTENTICAÇÃO HOMOLOGADA E PAINEL PRIVADO

Atue como engenheiro de software sênior responsável pelo CRIAÍ, sem interferir no XRMOVI.

Ambiente:
- Site: https://criai.xrmovi.com.br/
- GitHub: https://github.com/rhianmello/criai, branch main
- Supabase compartilhado: operar SOMENTE o schema criai_private, respeitando as restrições de Auth e infraestrutura XRMOVI.
- Hotmart Leadlovers, produto 42903, Hotlink https://go.hotmart.com/O108508884T
- Relatório Etapa 10: docs/etapa10-relatorio.md
- PR administrativo atual: #4 (RASCUNHO)
- Issue fiscal pendente: #3

## Concluído — NÃO REPETIR
- Site publicado, HTTPS e responsividade homologados; vídeos oficiais carregam somente após clique.
- A Etapa 10 acrescentou evento de clique de afiliado com cta_placement (hero, header, oferta, lateral, rodapé, vídeo, sticky mobile). O GA4 continua DESATIVADO, portanto são somente eventos instrumentados.
- Testes de navegador Etapa 10: 85 verificações aprovadas no GitHub Actions.
- No schema criai_private existem sete tabelas; todas têm RLS habilitado e forçado e nenhum grant SELECT a anon ou authenticated.
- A Etapa 10 criou owner_access, traffic_daily, ads_daily, todas vazias. Não foi criado dono autenticado nem conexão de dados.
- O PR antigo #1 foi fechado sem merge por conter schema incompatível.
- PR #4 prepara autenticação server-side, sessão ativa, MFA AAL2, allowlist de dono, rate limit obrigatório e consultas somente criai_private. Seus 24 testes UNITÁRIOS foram aprovados, mas NÃO houve teste em Auth real ou implantação.
- GA4 exclusivo do CRIAÍ ainda não existe nos conectores; não reutilizar GA4 XRMOVI.
- Sem vendas, comissões ou custos de campanhas confirmados.

## Missão da Etapa 11

1. **GA4 do CRIAÍ:** verificar se foi criada a propriedade exclusiva CRIAÍ no Google Analytics. Somente com Measurement ID real no formato G-..., configurar em assets/config.js e validar com Tag Assistant e DebugView os eventos page_view, view_item, select_content, affiliate_click com cta_placement e video_start. Testar que sem consentimento não há tag e que revogação interrompe a coleta. Não utilizar a propriedade do XRMOVI.
2. **Painel privado:** revisar PR #4 e verificar projeto compartilhado, owner_access e Auth já existentes sem modificar configuração global. Só cadastrar UUID real do proprietário por processo administrativo autorizado. Exigir MFA efetiva (aal2), sessão vigente, allowlist, rate limiting e backend com conexão de banco de mínimo privilégio. Testar em ambiente real 401/403/429/200, inclusive após revogação. Sem esses testes, manter PR em draft e NÃO declarar painel pronto.
3. **Métricas reais:** sincronizar GA4 por API autorizada, despesas de anúncios específicos CRIAÍ e comissões confirmadas pela Hotmart, preservando período e última sincronização. Mostrar fontes desconectadas como Não conectado, não como zeros. NÃO somar usuários únicos por páginas/dias e não confundir clique com comissão.
4. **Privacidade:** obter e validar o contato real do projeto, atualizar controlador e tratamentos de dados, revisar cookies e incorporação de vídeos. Não inventar endereço, e-mail ou CNPJ.
5. **Afiliação e fiscal:** manter Issue #3 aberta até NFS-e e relatórios mensais regularizados, e confirmar link oficial próprio de Pagelovers e demais links exigidos com Leadlovers.
6. **Conversão:** analisar resultados após coleta real e consentida; preparar testes A/B somente com amostra suficiente. Garantir conteúdo próprio que não seja mera ponte de afiliados.
7. **Google Ads:** preparar mas NÃO criar/ativar gastos sem autorização específica. Usar landing CRIAÍ, nunca Hotlink como URL final; negativas de marca conforme política vigente.
8. **QA e documentação:** registrar commits/PRs, executar CI e testes produtivos seguros, conferir implantação, apresentar evidências, bloqueadores e prompt completo para Etapa 12.

Regras:
- Trabalhar somente no repositório rhianmello/criai e no schema criai_private autorizado.
- Não modificar tabelas, dados, Auth global, funções, DNS, campanhas, cobranças ou parâmetros do XRMOVI.
- Não publicar chaves privadas, tokens, dados pessoais, números financeiros ou painel de proprietário no GitHub Pages público.
- Não criar contas fictícias, compras, vendas ou comissões de teste em produção.
- Sem GA4 e backend real, diferenciar claramente preparação de implantação.

Entrega: commits efetivos, evidências 401/403/429/200 se houver backend real, GA4/Hotmart, situação fiscal, parecer de anúncios e prompt Etapa 12.
