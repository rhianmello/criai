# CRIAÍ — Recuperação da apostila pelo e-mail

Implementação: 16/11/2026. Repositório: rhianmello/criai.

## Objetivo

O comprador de uma apostila CRIAÍ poderá acessar a página:
https://criai.xrmovi.com.br/recuperar-apostila.html

Sem precisar manter a aba de compra aberta, ele informa o e-mail registrado no pedido e recebe um código de 6 dígitos. Somente após a verificação do código é criada uma sessão temporária para emissão de links de download de qualquer uma das duas edições (Português / English). **E-mail sozinho não autoriza downloads**.

## Estrutura implementada

- UI: recuperar-apostila.html e assets/ebook-recovery.js; via ?lang=en em inglês.
- Links no rodapé/área de ofertas de apostilas.html e en/apostilas.html, e na tela compra.html.
- API em Supabase Edge Function criai-ebook-gateway:
  - GET /health — inclui indicador booleano recovery_ready;
  - POST /recovery/request — solicitação do código; resposta não denuncia se o e-mail tem compra;
  - POST /recovery/verify — valida o código e emite sessão curta;
  - POST /recovery/download — exige sessão verificada e revisa pagamento no provedor antes de assinar link.
- Tabelas privadas: criai_private.ebook_recovery_challenges, criai_private.ebook_recovery_sessions. RLS habilitado/forçado e acesso público revogado.
- OTP válido por 10 minutos, uso único, cinco tentativas no máximo; até três pedidos/hora por e-mail, 15/hora por origem e intervalo de 60 segundos.
- Token de recuperação válido por uma hora. A qualquer momento depois disso, o comprador pode solicitar novo código.
- Link final Supabase Storage privado: 120 segundos; o arquivo já baixado não expira.

## ATIVAÇÃO DO REMETENTE — NÃO CONFUNDIR CÓDIGO PUBLICADO COM ENVIO REAL

O envio transacional é feito pelo Resend. A função **prioriza uma chave específica do CRIAÍ** quando estiver configurada e, caso contrário, utiliza temporariamente a infraestrutura Resend já existente no mesmo projeto Supabase, com nome do remetente CRIAÍ e o endereço verificado do domínio. As credenciais permanecem somente em variáveis de ambiente no servidor.

1. Confirmar, no painel do Resend, que o domínio de envio do XRMOVI continua validado (SPF/DKIM) e que os e-mails transacionais chegam normalmente.
2. Não é necessário criar nova conta nem chave de imediato se `XRMOVI_RESEND_API_KEY` e `XRMOVI_SUPPORT_MAIL_FROM` estiverem operacionais no Supabase. Uma chave dedicada ao CRIAÍ continua recomendada para isolar quotas e revogação.
3. Se optar por configurar credenciais separadas, abra o projeto Supabase ztqtcbzjesrkuaijmylm > Edge Functions > Secrets.
4. Cadastrar:
   - CRIAI_RESEND_API_KEY = chave secreta da integração CRIAÍ no Resend.
   - CRIAI_RECOVERY_FROM = endereço/remetente verificado, por exemplo: CRIAÍ <suporte@xrmovi.com.br>.
5. Nunca colar essas chaves no GitHub, frontend ou mensagens de chat.
6. Confirmar GET /health com recovery_ready=true, e somente depois fazer a homologação de envio.

Sem o provedor habilitado (seja por chave dedicada ou pelo serviço compartilhado), a UI informa que o envio está indisponível; nenhum código falso é gerado para o cliente. O campo `recovery_ready` no endpoint /health indica a disponibilidade das credenciais, mas o envio real ainda exige teste com uma compra aprovada.

## Homologação antes de publicar anúncios

- Confirmar que os dois PDFs estão no bucket PRIVADO criai-paid-ebooks.
- Criar uma compra de teste legítima com pagamento aprovado no provedor (nenhuma linha de pedido pago deve ser simulada como real).
- Solicitar recuperação pelo e-mail usado, receber o código real e validar o limite de dez minutos.
- Tentar código errado, código já usado, código expirado, 5 tentativas falhas.
- Testar redownload PT e EN depois de fechar a aba original de compra e abrir uma nova sessão.
- Simular compra recusada/pendente e reembolso; download deve continuar bloqueado.
- Verificar que o download só gera URL assinada após confirmação atual na API do Mercado Pago.
- Testar em computador e celular, e conferir acessibilidade/fluxo em PT/EN.
- Só então liberar a Campanha 3 — Apostila.

Observação: em 16/11/2026, ainda não havia pedidos reais no estado paid em criai_private.ebook_orders. O teste automatizado de navegador e o teste anônimo de download passaram. O envio por e-mail e a recuperação de uma compra paga ainda exigem integração real do remetente e homologação.
