# CRIAÍ — curadoria independente de ferramentas digitais

Site estático com conteúdo editorial sobre ferramentas de automação, inteligência artificial e negócios digitais. Primeira indicação: **Leadlovers**, divulgada como parceria comercial. O projeto é **independente** do XRMOVI.

## Estado verificado em 15/11/2026 — Etapa 3

- Repositório público criado pelo proprietário: **[rhianmello/criai](https://github.com/rhianmello/criai)**, branch `main`.
- `index.html`, `leadlovers.html`, `sobre.html`, `privacidade.html`, `robots.txt`, `sitemap.xml` e `.nojekyll` presentes.
- **Recuperados no GitHub:** `assets/style.css`, `assets/app.js`, `assets/config.js`, `assets/favicon.svg`.
- Testes locais em Chromium (1440, 768, 390 e 320 px): sem erros de JavaScript e sem overflow horizontal; menu mobile funcional; apresentação dos Hotlinks configurada; consentimento GA4 testado com identificador *fictício* injetado apenas no teste.
- **A ativação do GitHub Pages e o acesso externo não estão confirmados.** É necessário conferir em `Settings → Pages`. Nenhuma configuração DNS foi alterada.
- **GA4 desativado**: `ga4MeasurementId` ainda vazio, sem rastreamento real de visitas ou cliques.
- **Sem Google Ads ativo** e sem validação de compra ou comissão real.

## Estrutura

- `index.html`: apresentação e critérios de escolha;
- `leadlovers.html`: guia independente da Leadlovers com botões para Hotmart;
- `sobre.html`, `privacidade.html`: transparência editorial e privacidade;
- `assets/style.css`: estilo clean white e responsividade;
- `assets/app.js`: menu mobile, Hotlink, consentimento e evento `affiliate_click`;
- `assets/config.js`: Hotlink, campo do GA4 e domínio planejado.

## Hotlink da Leadlovers

Produto Hotmart **42903**. Na versão atual, consta em `assets/config.js` e nos botões `leadlovers.html`:

`https://go.hotmart.com/O108508884T`

**Ainda depende de confirmação por texto:** o link foi transcrito de uma captura de tela. O proprietário deverá clicar em **Copiar link** na Hotmart e comparar a URL original, caractere por caractere, antes de divulgar. A navegação de destino e a atribuição de comissões não foram homologadas.

## Como colocar no ar (ação do proprietário no GitHub)

1. No repositório, acesse **Settings → Pages**.
2. Em **Build and deployment**, defina **Deploy from a branch**; branch **main**, pasta **/(root)**; clique **Save**.
3. Quando o GitHub apresentar **Visit site**, confirme a prévia: `https://rhianmello.github.io/criai/`.
4. Teste os arquivos, links, celular e HTTPS no endereço público.
5. **Depois da prévia estar correta**, em **Settings → Pages → Custom domain** insira `criar.xrmovi.com.br`.
6. No provedor DNS responsável por `xrmovi.com.br`, crie **somente** o registro `CNAME` do host `criar`, com valor `rhianmello.github.io`; não altere o domínio raiz ou os registros do XRMOVI.
7. Confirme o DNS e ative **Enforce HTTPS** quando o certificado estiver disponível. O GitHub normalmente registra o domínio customizado também no arquivo `CNAME`.

Referência: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Pendências antes de Google Ads

- Confirmar Hotlink por cópia direta da Hotmart e checar o destino em navegação real.
- Confirmar GitHub Pages, DNS, domínio personalizado, HTTPS e arquivos servidos em produção.
- Revisar páginas legais: informar responsável e canal de contato verificável, sem criar dados fictícios.
- Corrigir/verificar os links oficiais de marcas do grupo Leadlovers no rodapé — alguns apontam para páginas gerais, não para o serviço indicado.
- Resolver emissão de NFS-e e relatórios mensais exigidos pela Leadlovers, também para pessoa física.
- Usar **conteúdo próprio** no CRIAÍ como URL final do Google Ads; a política da Leadlovers **proíbe direcionar anúncios ao Hotlink** e determina palavras-chave de marca como negativas.
- Reforçar conteúdo útil e original: o Google Ads reprova páginas que são apenas intermediárias para links externos.
- Criar uma propriedade GA4, inserir ID real em `assets/config.js` e testar consentimento antes de coletar métricas. O evento `affiliate_click` é **clique**, não venda: conversões reais são comprovadas na Hotmart.
- Não ativar tráfego pago sem completar verificações de política, transparência, destinação e rastreamento.

Fontes:
- https://www.leadlovers.com/politicas-sobre-parcerias
- https://leadlovers.com/afiliados
- https://support.google.com/adspolicy/answer/16427718
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Segurança de isolamento

Nenhum arquivo deste site depende do repositório `rhianmello/XRMOVI`, e nenhum arquivo ou configuração do XRMOVI foi alterado nesta etapa.
