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

## Edições de download por idioma (16/11/2026)

O produto base tem duas variantes de **conteúdo integral** e **67 páginas** cada, ambas com 36 etapas (33 lições de execução + 3 etapas do plano de 30 dias), 12 fichas e 10 prompts.

| Variante | SKU fixo no backend | Nome do arquivo privado |
| --- | --- | --- |
| Português brasileiro | `CRIAI-EBOOK-IA-01-PT` | `CRIAI_Guia_Negocio_Digital_com_IA_Edicao_1.pdf` |
| Inglês | `CRIAI-EBOOK-IA-01-EN` | `CRIAI_Create_Your_Digital_Business_with_AI_English_Edition_1.pdf` |

- As duas páginas públicas de venda (`/apostilas.html` e `/en/apostilas.html`) apresentam **Português / English** antes do CTA.
- `assets/ebook-language.js` acrescenta o SKU e o idioma escolhido ao pedido **manual por e-mail**; essa informação ainda não é um registro seguro de ordem paga.
- Depois da integração, a preferência selecionada precisa ser **gravada no pedido do servidor** e imutável para aquele pagamento, e o download deve servir unicamente o PDF associado à variante paga.
- Preço inicial igual para ambas as edições: **R$ 49,90**, sujeito a ajustes comerciais futuros.
- Arquivos integrais nunca entram no GitHub Pages, em links públicos nem na pasta estática do site. Guardar ambos em storage privado e liberar links temporários após confirmação autenticada do pagamento.
- Na homologação: selecionar PT e receber PT, selecionar EN e receber EN, recusar SKU adulterado, link expirado, compra pendente, compra cancelada e troca de variante não autorizada.
- As prévias podem ser públicas, mas devem conter apenas trechos limitados; não usar a mesma URL para o arquivo pago.
- O site oferece as edições em ambos os idiomas independentemente do idioma da interface e do país de residência.

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

## Requisitos internacionais (vendas em português fora do Brasil)

- Mercados prioritários: Brasil, Portugal, EUA, Canadá, Reino Unido, Angola, Moçambique e outros países. Não bloquear por geolocalização nem depender de telefone/CPF brasileiro na página de venda.
- Operação inicial em português do Brasil; textos de pagamento, entrega, suporte e reembolso em português claro. Compatibilizar formulários com endereços internacionais.
- Mercado Pago Brasil Checkout Pro: processa operações em BRL, aceita cartões internacionais das bandeiras elegíveis, mas a aceitação efetiva depende do emissor e análise antifraude. Não assumir aprovação automática ou a disponibilidade de Pix para não residentes.
- Cobrança internacional: deixar R$ 49,90 visível; informar conversão e custos possíveis do banco emissor; não publicar estimativas fixas de USD/EUR como se fossem cotação em tempo real.
- Na criação de pedido: aceitar país selecionado de qualquer território; nunca tomar uma informação controlada pelo navegador como prova de identidade. Não restringir pagamento a `pt-BR` como país de cobrança.
- No pagamento: registrar país informado (quando necessário), moeda de cobrança, valor efetivamente aprovado, identificação do pagamento, estornos e custos por transação. Não recolher documentos pessoais se não forem exigidos para compra/faturamento.
- Preferência por um único checkout no lançamento. Se forem observadas recusas excessivas no exterior, avaliar plataforma de venda de infoprodutos com distribuição internacional (por exemplo, Hotmart como **produtor**, distinta da afiliação Leadlovers), após aferir taxas, repasses e condições fiscais.
- Para UE/Portugal e outros destinos, revisar IVA, regras de consumo e cobrança internacional com contador antes de aumentar escala; nunca deduzir automaticamente isenção só por ser um produto digital.
- Homologar compras em 3 situações: cartão emitido no Brasil, cartão internacional nos EUA e cartão internacional em Portugal; além de pagamento recusado, estorno e comprador sem CPF. Usar ambientes de teste e transações permitidas pelo provedor.
- Não ativar campanha internacional nem prometer entrega instantânea até ocorrer validação ponta a ponta de pagamento aprovado + arquivo privado.

### Referências do provedor
- https://www.mercadopago.com.br/blog/como-receber-pagamentos-internacionais-sem-perder-controle
- https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/overview
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/configure-back-urls
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications

## Bloqueadores reais
- Confirmar identificação do recebedor, ambiente e credenciais de integração de pagamentos para o CRIAÍ, concedendo acesso por painel seguro e não pelo código-fonte.
- Definir serviço de backend e armazenamento privado separado, com política de retenção e backup.
- Validar termos de compra, arrependimento, privacidade, identificação comercial e emissão fiscal com enquadramento adequado.
- Configurar e testar envio automático de e-mails e domínio de remetente.

## Fontes técnicas
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

**Regra de lançamento:** nunca deixar botão “Comprar agora” apontando para fluxo inexistente. Até o checkout estar seguro, a página informa claramente a compra manual por e-mail.