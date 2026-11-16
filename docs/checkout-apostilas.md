# CRIAÍ — checkout e entrega automática da apostila (pendência de produção)

**Situação em 16/11/2026:** catálogo, página e arquivo completo existem; compra por e-mail (manual). Nenhum checkout automático ou liberação automática foi ativado. A campanha 2 de Google Ads promove a Leadlovers, **não** a apostila própria.

## Produto
- SKU: `CRIAI-EBOOK-IA-01`
- Título: Crie Seu Negócio Digital com Inteligência Artificial
- Valor de lançamento proposto: R$ 49,90, pagamento único
- PDF: 67 páginas, 36 etapas, 12 fichas, 10 prompts
- Arquivo completo: privado, não hospedado em `rhianmello/criai`, GitHub Pages ou outra URL aberta
- Página comercial: `/apostilas.html` com amostra textual gratuita
- Contato: suporte@xrmovi.com.br

## Implementação de produção — arquitetura recomendada

1. Criar ambiente de pagamentos **separado do XRMOVI**, com titular e recebedor corretos do CRIAÍ. Não reutilizar credenciais, dados de clientes ou webhooks do XRMOVI.
2. Usar Checkout Pro do Mercado Pago para Pix/cartão; criar pedido e checkout **no backend**, com preço e SKU fixados no servidor e sem aceitar valores arbitrários do navegador.
3. Manter credenciais e chave de assinatura do webhook apenas em segredos do backend. Nunca comitar credenciais no GitHub, publicar no JS ou enviá-las por chat.
4. Receber webhooks HTTPS, validar a assinatura recebida, consultar a API do Mercado Pago e conferir vendedor, ambiente, valor, moeda, produto, status e duplicidade antes de marcar o pedido como pago.
5. Gravar pedidos numa base separada com política de acesso restritivo, idempotência e logs de auditoria sem informações financeiras excessivas. Nunca confiar apenas no retorno visual do navegador.
6. Guardar PDF em armazenamento privado; liberar acesso mediante link de expiração curta, associado a pedido pago, limitando reenvio/uso conforme contrato e evitando links públicos permanentes.
7. Enviar notificação de compra com orientações de entrega e suporte. Registrar baixa, estorno, reembolso e eventual revogação conforme política informada ao comprador.
8. Integrar relatórios próprios: valor bruto, taxa, repasse líquido, devoluções, canal de origem, notas fiscais conforme o enquadramento aplicável. Separar das comissões de afiliado.
9. Antes de divulgar checkout: homologar status aprovado, recusado, pendente, repetição do webhook, callback inválido, comprador não autenticado, tentativa de download sem pagar, reembolso, links vencidos e fluxo mobile.
10. Substituir o CTA manual pelo checkout **somente depois** da homologação, sem inventar vendas ou aprovações.

## Bloqueadores reais
- Confirmar identificação do recebedor, ambiente e credenciais de integração de pagamentos para o CRIAÍ, concedendo acesso por painel seguro e não pelo código-fonte.
- Definir serviço de backend e armazenamento privado separado, com política de retenção e backup.
- Validar termos de compra, arrependimento, privacidade, identificação comercial e emissão fiscal com enquadramento adequado.
- Configurar e testar envio automático de e-mails e domínio de remetente.

## Fontes técnicas
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

**Regra de lançamento:** nunca deixar botão “Comprar agora” apontando para fluxo inexistente. Até o checkout estar seguro, a página informa claramente a compra manual por e-mail.