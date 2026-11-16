# CRIAÍ — ativação de checkout e entrega da apostila (16/11/2026)

**Situação:** código integrado, função implantada e armazenamento privado criado. O checkout só aceita novos pedidos quando os segredos da integração e os PDFs pagos estiverem configurados. Não se deve anunciar que a venda está ativa antes de homologar uma transação aprovada.

## Componentes implantados

- Páginas: `apostilas.html` (R$ 49,90 / BRL), `en/apostilas.html` (US$ 9,00 / USD), `compra.html` (retorno do pagamento).
- Scripts: `assets/ebook-checkout.js` e `assets/ebook-delivery.js`.
- Backend: Supabase Edge Function `criai-ebook-gateway`, em `https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-ebook-gateway`.
- Banco: `criai_private.ebook_orders`, com RLS + FORCE RLS e sem permissões para visitantes.
- Arquivos: bucket privado `criai-paid-ebooks`, sem URLs públicas. O checkout exige a presença do PDF escolhido.
- O CRIAÍ não utiliza as funções de pagamento ou os registros de cobrança do XRMOVI.

## Pendência 1 — enviar os PDFs pagos ao armazenamento PRIVADO

No Supabase, projeto `ztqtcbzjesrkuaijmylm`, acesse **Storage > criai-paid-ebooks**. Envie os dois PDFs originais com estes nomes **exatos**:

| Idioma | Nome no bucket |
| --- | --- |
| Português | `criai-ia-pt-2026.pdf` |
| English | `criai-ia-en-2026.pdf` |

Não marque o bucket como público e **não** coloque PDFs integrais no repositório público do GitHub Pages. Verifique 67 páginas em cada arquivo. Os PDFs originais estão na Biblioteca do proprietário.

## Pendência 2 — configurar Mercado Pago exclusivo do CRIAÍ

No Mercado Pago Developers, crie ou selecione **integração própria para CRIAÍ** e obtenha o access token apropriado e o segredo de assinatura de Webhooks. Não compartilhe os segredos no chat, no frontend ou no GitHub.

No Supabase > Edge Functions > Secrets, cadastre:

- `CRIAI_MP_ACCESS_TOKEN` = **Access Token privado** da integração CRIAÍ
- `CRIAI_MP_WEBHOOK_SECRET` = **Assinatura secreta de Webhooks** da integração CRIAÍ

Configure as notificações de **pagamento/payment** para:

`https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-ebook-gateway/webhook`

O endereço também é enviado na `notification_url` da preferência de Checkout Pro.

**Moeda:** português cria preferência em BRL 49,90; inglês tenta USD 9,00 **sem conversão silenciosa**. Confirmar na integração Mercado Pago se a conta brasileira permite Checkout Pro em USD. Se o provedor recusar, a venda EN é bloqueada sem cobrança. Não exibir preço USD e cobrar BRL sem informar valor final e consentimento.

## Fluxo de segurança

1. Cliente informa e-mail e escolhe idioma da edição. O servidor fixa preço e moeda por idioma **do site**, sem aceitar preço do navegador.
2. O servidor verifica se o PDF escolhido está no bucket privado e cria preferência pelo backend no Mercado Pago. Chave do provedor jamais vai ao navegador.
3. A chave aleatória de acesso é armazenada no `sessionStorage` do navegador; o banco guarda somente o hash SHA-256. O retorno do Mercado Pago usa apenas o ID do pedido.
4. A página de retorno recebe um ID de pagamento como pista, mas **consulta a API do Mercado Pago**. Valida referência externa, valor, moeda e situação. Notificações Webhook são validadas com HMAC-SHA256.
5. Somente após pagamento `approved`, a função `/download` faz nova verificação no provedor e gera um link de Storage assinado com validade de **120 segundos**. Em reembolso ou chargeback não libera link.
6. Caso o navegador seja fechado ou o token da sessão seja perdido, o comprador deve contatar `suporte@xrmovi.com.br` pelo e-mail usado no pedido. **Envio automático por e-mail ainda não foi implementado.**

## Como homologar antes de anunciar

1. Visitar `/functions/v1/criai-ebook-gateway/health`: os campos `configured`, `portuguese_pdf` e `english_pdf` devem estar `true` para ambos os idiomas.
2. Com credenciais de teste e usuários de teste do Mercado Pago, criar um pedido em cada idioma. Verificar suporte a USD antes da campanha internacional.
3. Testar compra pendente (download bloqueado), pagamento aprovado (download habilitado), idioma PT/EN, expiração do link, reembolso e múltiplos cliques.
4. Confirmar que o pedido não contém dados de cartões e que nenhum arquivo pago aparece em `https://criai.xrmovi.com.br/assets/`.
5. Validar o endereço de retorno `https://criai.xrmovi.com.br/compra.html` após publicação no GitHub Pages.
6. Revisar políticas de reembolso e obrigações de NFS-e aplicáveis às vendas próprias.

## Diagnóstico inicial de 16/11/2026

- Endpoint `/health` respondeu **HTTP 200** com `configured=false`, `portuguese_pdf=false` e `english_pdf=false`.
- `/checkout` sem credenciais respondeu **HTTP 503**, sem criar pedido.
- `/download` com ID/token inventados respondeu **HTTP 404**.
- Não houve pagamento real de teste nem entrega de PDF homologada. Nunca afirmar que está 100% funcional até concluir os itens acima.
