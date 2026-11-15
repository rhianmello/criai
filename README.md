# CRIAÍ — versão inicial de site independente de afiliados

Site estático (`HTML`, `CSS` e `JavaScript`) pronto para ser colocado em repositório novo, **sem alterações no XRMOVI**. Visual claro e responsivo, com página inicial, análise Leadlovers, sobre e privacidade.

## Situação verificada em 15/11/2026

- GitHub: `rhianmello/CRIAI` **não existe** na conta conectada; `rhianmello/XRMOVI` existe e não foi alterado.
- Primeira afiliação: Hotmart / Leadlovers (ID 42903), mostrada pelo usuário como **"Você já é afiliado!"**.
- Hotlink inserido no código, transcrito visualmente do print, opção **Página de Vendas**: `https://go.hotmart.com/O108508884T`.
- **Atenção:** não foi possível abrir/seguir o Hotlink pelo mecanismo de consulta automática. Antes de publicar, COPIE o link diretamente da Hotmart e compare com `assets/config.js` e com as âncoras de `leadlovers.html`. A página está montada, mas a atribuição real da comissão só poderá ser validada com o link copiado do painel e testes de navegação.
- GA4 não configurado, sem coleta analítica em produção no pacote. O evento `affiliate_click` é preparado, mas não existe painel de métricas funcional sem o ID de medição e consentimento.
- DNS do subdomínio ainda não foi configurado. O pacote **não** faz nenhuma alteração no DNS.

## Arquivos

- `index.html` — página inicial, curadoria, critérios de escolha e indicação da Leadlovers.
- `leadlovers.html` — guia original da oferta, requisitos e botões de afiliado.
- `sobre.html` — transparência editorial e comercial.
- `privacidade.html` — descrição do tratamento de dados desta versão.
- `assets/style.css` — layout responsivo, menu mobile.
- `assets/config.js` — Hotlink e GA4 opcional.
- `assets/app.js` — menu, link e consentimento/GA4 somente quando ativado.
- `robots.txt`, `sitemap.xml`, `.nojekyll` — preparação para hospedagem.

## Publicação sugerida (sem interferir no XRMOVI)

1. Crie o repositório público **`CRIAI`** em `github.com/rhianmello` (não usar o repositório `XRMOVI`).
2. Envie o conteúdo desta pasta para a raiz de `main` (não envie o ZIP como arquivo único; envie os arquivos extraídos).
3. Em **Settings → Pages**, selecione **Deploy from a branch**, `main` e `/ (root)`. Confira primeiro a URL de prévia `https://rhianmello.github.io/CRIAI/`.
4. **Só quando estiver funcionando**, em **Settings → Pages → Custom domain**, escolha `criar.xrmovi.com.br`. No DNS do domínio, crie um registro `CNAME` com host `criar` e valor `rhianmello.github.io`, conforme documentação oficial do GitHub. Não altere os registros do domínio principal `xrmovi.com.br`.
5. Aguarde a propagação de DNS e habilite **Enforce HTTPS** após o certificado estar disponível.
6. Confira o site no celular, menu, páginas legais, navegação externa e link de afiliado.
7. Antes de ativar Google Ads, revise a identificação/contato do responsável, política de privacidade, links oficiais do rodapé, originalidade e qualidade editorial.

Documentação de domínio: https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Google Ads — REGRAS IMPORTANTES

**Ainda NÃO há campanha criada.** A política Leadlovers permite anunciar conteúdo próprio do afiliado, mas proíbe campanhas cujo destino seja diretamente o Hotlink, páginas Leadlovers e afins.

- Link final do anúncio: página de conteúdo original do CRIAÍ (não o Hotlink da Hotmart).
- Incluir palavras-chave da marca Leadlovers, suas variações e marcas do grupo como **negativas**, conforme lista exata e atualizada no regulamento. Não disputar as palavras-chave de marcas concorrentes em anúncios para promover Leadlovers.
- O Google pode reprovar páginas que são apenas ponte para outros sites; manter guias e conteúdo editorial original.
- Não usar a identidade visual oficial do fabricante sem autorização, nem alegar ser o produtor.
- Antes de investir, verificar rastreamento de conversão: evento `affiliate_click` **não é venda comprovada**. Vendas e comissões devem ser conciliadas com o relatório Hotmart.

Documentos:
- https://www.leadlovers.com/politicas-sobre-parcerias
- https://leadlovers.com/afiliados
- https://support.google.com/adspolicy/answer/16427718?hl=en

## Exigências administrativas da Leadlovers

- Conforme a política consultada, é exigida **NFS-e**, inclusive de afiliados pessoa física, e envio de relatório relacionado às transações até o quinto dia útil de cada mês.
- Recorrência da comissão limitada a até **um ano** por indicação; apenas assinaturas ativas e pagas elegíveis geram comissão.
- Comissão mínima para saque, prazos e critérios de inatividade devem ser conferidos no regulamento atualizado.
- Não prometer renda garantida nem afirmar que a assinatura rende comissões para sempre.

## Pendências antes de divulgar com orçamento

- [ ] Copiar/validar o Hotlink exato da conta Hotmart, preferindo colagem em texto para evitar erro de leitura visual.
- [ ] Criar o repositório `CRIAI` na conta GitHub e publicar a prévia.
- [ ] Configurar e verificar DNS e HTTPS do subdomínio `criar.xrmovi.com.br`.
- [ ] Revisar os links **Pagelovers** e **Zaplovers** no rodapé (foram usados destinos verificados do grupo, não páginas específicas verificadas desses produtos). Confirmar com o programa de afiliação o endereço oficial desejado.
- [ ] Providenciar um meio de contato verificável do CRIAÍ e revisar a política de privacidade antes da primeira campanha.
- [ ] Definir e conferir fluxo de emissão de NFS-e como pessoa física, antes de comissões elegíveis.
- [ ] Criar GA4 e inserir Measurement ID em `assets/config.js` se desejar coletar dados; confirmar banner de consentimento.
- [ ] Definir acompanhamento de conversões na Hotmart. Clique em link não equivale a venda.
- [ ] Revisar a qualidade editorial e condições do produto regularmente.
- [ ] Somente então planejar pequena campanha independente do XRMOVI.

## Teste local

Execute `python -m http.server 8000` na pasta e acesse `http://localhost:8000`.
