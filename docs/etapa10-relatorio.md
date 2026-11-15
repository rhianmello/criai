# CRIAÍ — Etapa 10: métricas e administração segura
Auditoria de 15/11/2026. Ambiente: https://criai.xrmovi.com.br/ — repositório rhianmello/criai.

## Resultado efetivamente executado

### Site de afiliados
- A versão atual permanece publicada via GitHub Pages. Não houve mudança comercial na página nem no Hotlink Leadlovers produto 42903.
- Em assets/app.js, o evento opcional affiliate_click ganhou parâmetro cta_placement (hero, header, offer_card, video_section, final_cta, review_sidebar, mobile_sticky ou content).
- O evento select_content agora também inclui links relativos para a análise com fragmento, como leadlovers.html#videos.
- O evento só é registrado após aceite de estatísticas e quando há Measurement ID GA4 válido. Nenhuma coleta foi habilitada por esta alteração.
- Teste com ID falso, carregamento GA4 interceptado e popup Hotmart simulado comprovou o evento no CTA hero.
- Execução GitHub Actions: https://github.com/rhianmello/criai/actions/runs/43756802688 — 85 checks aprovados, zero falhas, desktop/tablet/mobile (incluindo 320px), vídeo carregado somente após clique.
- Hotlink verificado em teste de leitura com HTTP 302 preservando ref=O108508884T, sem compra, atribuição de comissão ou pagamento.

### Supabase compartilhado — somente criai_private
- Com autorização anterior do usuário, o CRIAÍ compartilha infraestrutura do projeto Supabase do XRMOVI com um schema lógico privado. Não há isolamento físico, custos ou Auth independentes.
- Na Etapa 10 foram criadas SOMENTE no schema criai_private as tabelas owner_access, traffic_daily e ads_daily, vazias. Juntas às anteriores, há sete tabelas no esquema.
- Todas as sete foram verificadas via SQL: RLS habilitado e forçado, sem SELECT para anon ou authenticated.
- O security advisor apresenta INFO rls_enabled_no_policy nas tabelas: esperado porque não se abriu acesso a usuários comuns; não significa aprovação de runtime privilegiado.
- Estado verificado: 0 proprietários cadastrados; 0 linhas em traffic_daily, ads_daily, commissions e sync_status. Ausência de registros não é prova de zero tráfego ou zero vendas.
- owner_access fica com active=false por padrão. Nenhum usuário Auth foi criado, modificado ou elevado.
- Nenhuma tabela do XRMOVI, configuração de Auth, Edge Function ou campanha foi alterada.

### Backend privado em desenvolvimento
- O PR #1 era incompatível com o esquema realmente criado na Etapa 9; foi fechado SEM MERGE para prevenir implantação do SQL antigo.
- O novo PR #4 (https://github.com/rhianmello/criai/pull/4) está em draft e deriva da main atual.
- Criados contrato de autorização com JWT verificado, emissor, expiração, usuário atual, sessão ativa, AAL2/MFA e allowlist criai_private.owner_access; adaptador server-only com consultas parametrizadas, handler somente GET e rate limiter obrigatório.
- Uma consulta privada planejada agrega dados do schema CRIAÍ para 7/28/90 dias somente após passar no controle de acesso. Fontes desconectadas retornam not_connected e NULL, nunca métricas simuladas em produção.
- Contagem de usuários distintos do GA4 NÃO é somada entre páginas ou dias, para impedir inflação de visitantes.
- A rotina é apenas código PR: não existe API hospedada, JWT real validado, conexão do servidor, rate limiting em produção, usuário proprietário com MFA, nem painel administrativo habilitado.
- GitHub Actions do PR #4: https://github.com/rhianmello/criai/actions/runs/43756922025 — 24 testes automatizados aprovados e zero falhas. São testes simulados do código, não homologação de login real.
- CI estático do PR também passou.

## Google Analytics 4
- Única propriedade GA4 visível na conexão disponível pertence ao XRMOVI; não foi utilizada.
- Nenhuma ferramenta conectada disponível cria uma propriedade GA4 nesta sessão. Não foi criado fluxo Web nem ID G-... do CRIAÍ.
- O arquivo assets/config.js continua com ga4MeasurementId vazio.
- Eventos reais page_view, view_item, select_content, affiliate_click e video_start não foram confirmados no DebugView. Só houve teste isolado do código com ID fictício.
- Próxima ação na conta do responsável: https://analytics.google.com/ → Administrador → Criar propriedade CRIAÍ → Fluxo Web https://criai.xrmovi.com.br/ → copiar Measurement ID G-....
- Depois configurar ID público, conferir consentimento, Tag Assistant, DebugView e parâmetros de relatórios; sem reaproveitar dados XRMOVI.

## Conformidade e Ads
- Leadlovers: https://www.leadlovers.com/politicas-sobre-parcerias
- Política exige NFS-e e relatório de transações todo mês até o quinto dia útil, por pessoa física ou jurídica. Issue #3 permanece aberta: https://github.com/rhianmello/criai/issues/3.
- O produtor permite anúncios para conteúdo autoral do afiliado, mas proíbe anúncio direcionado ao Hotlink e palavras de marca como alvos; negativas obrigatórias estão documentadas em docs/ads-etapa7.md.
- Google Ads também reprova páginas intermediárias cujo único propósito é encaminhar usuários para outros sites: https://support.google.com/adspolicy/answer/16427718
- O CRIAÍ tem análise própria, explicação de recursos e calculadora, mas aprovação de anúncios não é garantida. A landing precisa passar por revisão comercial, contato verificável e políticas.
- Não foi confirmado URL próprio oficial de Pagelovers; manter a referência corretamente rotulada e pedir ao produtor o endereço exigido.
- Não existe contato verificável específico do CRIAÍ informado; não reutilizar automaticamente e-mail do XRMOVI nem inventar endereço ou CNPJ.
- Nenhuma campanha ou orçamento Google Ads foi criado/alterado; não há gasto informado nem métricas de CPC, ROAS ou ROI.

## Experimentos de conversão — somente proposta
Aguardar pelo menos a integração GA4 real com consentimento e uma amostra adequada para comparar resultados. Propostas: comparar texto do CTA na home, ordem entre vídeo e descrição, e desempenho de mobile_sticky versus hero. Métrica principal: taxa de cliques de afiliado por sessões consentidas, reportada com limites de consentimento. Vendas e comissões precisam da Hotmart; não podem ser inferidas de cliques.

## Próximas dependências
1. Criar GA4 exclusivo e fornecer ID G-... real.
2. Informar um canal de contato verificável para o CRIAÍ, revisando LGPD e a página de privacidade.
3. Identificar proprietário real e concluir MFA/allowlist, runtime seguro, acesso mínimo ao banco e testes reais antes de liberar PR #4.
4. Conectar origens de dados por serviços autorizados, sem segredos públicos.
5. Resolver Issue #3 (NFS-e/relatório) e confirmar URLs exigidas junto à Leadlovers.
6. Somente então avaliar Google Ads CRIAÍ com orçamento previamente autorizado.

**Gate de tráfego pago: PENDENTE. Painel privado: NÃO IMPLANTADO. Métricas reais: NÃO CONECTADAS.**
