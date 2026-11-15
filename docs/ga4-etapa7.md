# CRIAÍ — GA4 exclusivo: instruções e estado real (Etapa 7)

**Estado constatado:** o conector de Google Analytics 4 disponível possui apenas a propriedade **XRMOVI, ID 562156312**. Não existe no conector uma propriedade CRIAÍ identificável. O arquivo `assets/config.js` continua com `ga4MeasurementId: ''`. **Dados de visitantes, cliques e vendas do CRIAÍ não estão sendo coletados pelo GA4.**

## Configuração externa necessária

1. Abrir https://analytics.google.com/ e selecionar a conta Google que administrará o CRIAÍ. Em **Administrador**, criar **nova propriedade** chamada CRIAÍ (sem reutilizar a do XRMOVI). Ajustar fuso horário e moeda corretos.
2. Criar **fluxo de dados Web** para `https://criai.xrmovi.com.br/`.
3. Copiar o **ID de medição real** do fluxo (formato `G-...`) e enviar o ID ao responsável técnico; o ID público não é uma chave secreta.
4. Configurar esse valor em `assets/config.js` e publicar; **não** copiar ID do XRMOVI. O código atual só carrega a tag de analytics se o visitante autorizar estatísticas.
5. Testar consentimento com Tag Assistant / Network e eventos no GA4 **DebugView**: `page_view`, `view_item`, `select_content`, `affiliate_click`.
6. Definir parâmetros/dimensões personalizadas se quiser ver `product_id` e `destination` nos relatórios. Verificar atribuição de origem e filtros internos de acordo com o escopo.
7. Conectar a nova propriedade a ferramenta de relatório autorizada somente depois que os dados estiverem reais.

## Limites importantes

- O clique em `affiliate_click` é uma **saída para Hotmart**, não é venda confirmada.
- Vendas, reembolsos e comissões são confirmados na Hotmart, pela fonte oficial, não inferidos a partir de analytics.
- Testes com ID fictício e requests bloqueadas em GitHub Actions não geram dados reais.
- Usuários que negarem estatísticas ou bloquearem cookies não entram completamente nos relatórios; não prometer contagem exata universal.
- Nenhuma configuração externa do GA4 foi alterada, porque o conector disponível só lê métricas e não cria propriedades.

Referência: https://support.google.com/analytics/answer/14183469?hl=pt-BR
