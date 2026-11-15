# CRIAÍ — ETAPA 12: CRIAR GA4 EXCLUSIVO, TESTAR PROPRIETÁRIO E MEDIR CONVERSÕES REAIS

Atue como engenheiro de software sênior do CRIAÍ, preservando XRMOVI.

## Ambiente oficial
- Site: https://criai.xrmovi.com.br/
- GitHub: https://github.com/rhianmello/criai (branch main)
- Supabase: schema lógico `criai_private` no projeto compartilhado existente
- Leadlovers Hotmart: produto 42903; Hotlink `https://go.hotmart.com/O108508884T`
- Relatório atual: `docs/etapa11-relatorio.md`
- PR #4: backend privado PREPARATÓRIO, não implantado
- Issue #3: NFS-e e relatório mensal pendentes
- Issue #5: CTA oculto em um navegador, não reproduzido em Chromium limpo

## CONCLUÍDO — NÃO REPETIR
- Site publicado e HTTPS aprovado, com conteúdo de análise próprio e CTA direto para Hotmart.
- Etapa 11 corrigiu acesso secundário ao fim da home e da análise, para não deixar usuários sem navegação se links externos forem ocultados. Não usar redirecionamento disfarçado para ignorar bloqueadores.
- 104 testes de navegador aprovados (desktop/tablet/mobile e 320 px): https://github.com/rhianmello/criai/actions/runs/43758367324
- Confirmado no Chromium limpo que o botão de Hotmart tem tamanho e contraste corretos; eventual bloqueio por extensões/caches do navegador do proprietário ainda não foi provado. Issue #5.
- `assets/app.js` preparado para GA4 com consentimento prévio, evento `affiliate_click` e `cta_placement`, futura configuração de cookies restrita ao subdomínio CRIAÍ, e retirada de consentimento. **NÃO existe GA4 ativo.**
- PR #4 contém código privado com JWT verificado, verificação de sessão, MFA, allowlist CRIAÍ, rate limiter obrigatório e consultas isoladas; após correção de data local, **25 testes unitários aprovados**, sem backend implantado.
- No Supabase, sete tabelas `criai_private` têm RLS forçado, sem leitura para `anon` ou `authenticated`, sem dados inventados e sem proprietário ativo. Não existem Edge Functions CRIAÍ.
- Não criar, comprar, faturar ou alterar as campanhas XRMOVI.

## MISSÃO

### 1. GA4 CRIAÍ — maior prioridade externa
Verificar se foi criada uma propriedade exclusiva **CRIAÍ** e fluxo Web `https://criai.xrmovi.com.br/`. Se a conta já tiver fornecido o Measurement ID real `G-...`, configurar **somente** `assets/config.js` e testar na produção, com consentimento explícito:
- page_view, view_item, select_content, affiliate_click e video_start;
- parâmetro `cta_placement` como dimensão personalizada de evento;
- origem de tráfego, páginas, sessões e dispositivo;
- ausência de requisições antes do consentimento e após sua retirada;
- cookies isolados por `cookie_domain:'none'` e `cookie_prefix:'criai'`.

Confirmar DebugView/Tag Assistant reais e documentar evidências. Nunca usar a propriedade GA4 do XRMOVI nem afirmar coleta sem observação real.

### 2. Autenticação e API do proprietário
Revisar PR #4 em relação ao schema real. Utilizar somente UUID comprovado do proprietário com autorização explícita, sem inferir proprietário de nomes/e-mails nem modificar globalmente Auth do XRMOVI.

Somente habilitar endpoint privado se puder comprovar MFA AAL2 real, allowlist de proprietário, sessão ativa, infraestrutura de segredo seguro, conexão DB com privilégio mínimo e rate limiting server-side.

Testar em ambiente real:
- 401: sem autenticação, expiração ou revogação;
- 403: usuário externo e proprietário sem MFA;
- 429: rate limit;
- 200: proprietário autorizado com MFA ativo.

Se não houver capacidade de executar esses testes, manter PR #4 em draft e não declarar painel operacional. Não implantar servidor parcial aberto ao público.

### 3. Métricas de vendas e despesas
Importar de forma autenticada e autorizada apenas dados reais:
- GA4 CRIAÍ: sessões, eventos, origem, períodos, dispositivos;
- Google Ads: gastos apenas de campanha CRIAÍ autorizada;
- Hotmart: comissões, status de aprovação, recebimentos, estornos.

Registrar fonte e último sincronismo. Não inferir venda de clique, não somar indevidamente visitantes distintos, não inventar zeros para fontes desconectadas. Conferir integridade de importação e relação de cada compra com o produto correto.

### 4. UX e Google Ads
Rever Issue #5 caso o proprietário continue vendo a caixa final sem o botão em Chrome. Comparar janela sem extensões, cache limpo e janela com extensões. Não contornar bloqueadores.
Analisar conversão apenas depois da coleta real e consentida. Preservar valor editorial próprio para cumprir a política do Google Ads. Usar URL final em página de conteúdo CRIAÍ, nunca no Hotlink.
Não publicar anúncios ou definir orçamento sem autorização específica.

### 5. Transparência comercial e fiscal
Verificar o contato verdadeiro para privacidade do CRIAÍ. Atualizar controlador de dados e tratamento após confirmações.
Manter Issue #3 aberta até regularização de NFS-e e relatório de transações do produtor.
Confirmar URL própria de Pagelovers exigida no rodapé diretamente com Leadlovers.

## REGRAS
Trabalhar somente em `rhianmello/criai` e no schema `criai_private` autorizado. Não modificar tabelas, Auth, Edge Functions, campanhas, DNS, pagamentos ou dados do XRMOVI. Não efetuar compras nem cadastrar usuários fictícios. Não armazenar segredos no GitHub público.

## ENTREGA
Apresentar commits, testes, resultados reais de GA4 e Hotmart, homologação do acesso do proprietário, estado do painel, pendências fiscais/comerciais, autorização de campanha e prompt completo para Etapa 13.

**Sem evidências reais, declarar cada integração como "Não conectado" e o painel "Não implantado".**
