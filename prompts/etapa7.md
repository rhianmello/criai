# CRIAÍ — ETAPA 7: GA4 EXCLUSIVO, AFILIAÇÃO E PAINEL ADMINISTRATIVO PRIVADO

Atue como engenheiro sênior responsável apenas pelo CRIAÍ.

## Ambiente oficial
- Site https://criai.xrmovi.com.br/
- GitHub https://github.com/rhianmello/criai
- Branch `main`; Pages com HTTPS
- Primeira afiliação: Leadlovers, Hotmart produto 42903.
- Hotlink **ainda a confirmar pela cópia direta da Hotmart**: `https://go.hotmart.com/O108508884T`.
- Repositório XRMOVI, seus bancos e Google Ads NÃO podem ser alterados.

## Estado comprovado da Etapa 6
- 48 testes externos de HTTPS, páginas, CSS/JS, quatro tamanhos, links e simulador de custo aprovados, zero falhas.
- Redirecionamento GET do Hotlink: HTTP 302 para `https://llovers.com.br/?sck=afill&ref=O108508884T`. O código `ref` está presente, mas **não comprova atribuição nem titularidade**.
- Fluxo de consentimento GA4 aprovado com Measurement ID fictício e rede analítica interceptada; **não há GA4 real instalado**.
- A única propriedade GA4 conectada atualmente pertence ao XRMOVI (562156312). Não a reutilize.
- Site possui análise independente, simulação financeira local e identificação de afiliação.
- Relatório em `docs/etapa6-homologacao.md`; arquitetura do painel em `docs/painel-gerencial.md`.

## Missão

1. **Hotmart:** obter o valor textual copiado no botão "Copiar link" da oferta Leadlovers na conta do proprietário e comparar, sem adivinhar caracteres; testar destino e código REF sem compra. Não declarar comissão até haver confirmação em relatório real da Hotmart.
2. **GA4 exclusivo:** verificar se há propriedade específica para `criai.xrmovi.com.br`. Se não houver, orientar criação e vinculação com conta autorizada; não usar propriedade do XRMOVI. Com Measurement ID real, configurar `assets/config.js`, testar Consent Mode básico com Tag Assistant/DebugView e verificar eventos `page_view`, `view_item`, `select_content`, `affiliate_click`. Distinguir cliques de vendas.
3. **Privacidade:** obter e publicar canal real de contato do CRIAÍ e informação adequada do controlador, sem inventar dados; revisar a política conforme tecnologias efetivamente ativadas.
4. **Leadlovers:** conferir URLs obrigatórias de Pagelovers, Zaplovers, 99Webinar, Copymaker, termos, privacidade e blog diretamente com o produtor. Não confundir página genérica do grupo com página oficial de marca.
5. **Fiscal:** confirmar com o responsável como cumprir NFS-e para pessoa física e relatório mensal exigido pela Leadlovers, sem simular notas ou inventar CNPJ.
6. **Admin privado:** só prosseguir para backend com projeto isolado do XRMOVI. Implementar autenticação e autorização exclusivas do proprietário, MFA quando disponível, RLS/validação server-side e secrets seguros. Nada de dashboard financeiro público no GitHub Pages, nem credenciais de serviço no JS.
7. **Integrações do painel:** receber dados reais GA4, gastos de anúncios próprios do CRIAÍ e vendas/comissões confirmadas da Hotmart por fontes oficiais; se indisponíveis, apresentar estado "Sem integração" em vez de números inventados.
8. **SEO/performance:** executar Lighthouse e analisar SEO, acessibilidade, imagens, JavaScript e Core Web Vitals (com distinção entre campo e laboratório); corrigir problemas comprovados e retestar.
9. **Google Ads:** avaliar conteúdo original, regras de URL de destino, palavras-chave de marca negativas obrigatórias, proibição de anúncios diretamente ao Hotlink e termos concorrentes. Não ativar nem gastar sem autorização explícita.
10. **Entrega:** fazer somente alterações permitidas no `rhianmello/criai`, registrar commits, conferir GitHub Pages/Actions e apresentar pendências com evidência. Entregar prompt Etapa 8.

## Regras
- Não editar `rhianmello/XRMOVI`, sua propriedade GA4, campanhas, DNS ou pagamentos.
- Não publicar dados pessoais, credenciais, senhas, chaves de serviço ou relatórios financeiros sensíveis em repositório público.
- Não criar campanhas pagas, compras, cobranças ou assinaturas.
- Não inferir vendas/comissões a partir de cliques.
- Informar precisamente os bloqueios de acesso e dependências externas.
