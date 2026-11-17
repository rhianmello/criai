# CRIAÍ — regularização fiscal e controles de vendas de apostilas digitais
> Preparação factual em 16/11/2026. Não é parecer contábil nem cadastro fiscal concluído.

## Situação encontrada
- Produto próprio: guia/ebook digital de 67 páginas, edições PT/EN, PDF com acesso posterior por email.
- Brasil: Mercado Pago, R$ 49,90. Internacional: Stripe com preço US$ 9,90 **somente em teste**.
- O proprietário informou que ainda não iniciou a organização fiscal e não sabe emitir documentos.
- **Não há CNPJ, inscrição estadual ou habilitação de NF-e confirmados** nesta auditoria.
- Stripe test account acessível via ChatGPT: XRmovi, modo teste. API `GetTaxSettings` e `GetTaxRegistrations` respondeu “Stripe Tax isn't yet supported for your country”; não foi ativado cálculo automático de imposto.
- Venda em países estrangeiros pode gerar obrigações locais de VAT/GST/sales tax mesmo para operação a partir do Brasil. A avaliação dependerá dos países atendidos, tipo de cliente, estabelecimento e limite/regra aplicável.
- **Não aplicar uma alíquota arbitrária nem cadastrar uma suposta isenção de todas as receitas.**
- [Stripe, requisitos para contas brasileiras](https://support.stripe.com/questions/brazil-specific-information-to-open-a-stripe-account?locale=pt-BR): conta tipo pessoa física pode operar com CPF (CNPJ opcional nesse formulário), mas os repasses exigem conta bancária brasileira em BRL vinculada ao mesmo CPF. A possibilidade técnica de abrir conta com CPF **não dispensa regularização tributária**.
- O Stripe Tax retornou erro de indisponibilidade para o país da conta em teste. Não oferecer 'cálculo automático de VAT/GST' ao comprador nem simular tributação.


## Base oficial brasileira
1. [STF, Súmula Vinculante 57](https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=5966): a imunidade tributária do art. 150, VI, “d” alcança o livro eletrônico. A imunidade objetiva de livros não implica dispensa de todos os tributos ou deveres de documentação fiscal.
2. [IBGE, CNAE 5811-5/00 Edição de livros](https://cnae.ibge.gov.br/?subclasse=5811500&tipo=cnae&versao=9&view=subclasse): engloba explicitamente “apostilas”, “livros eletrônicos” e “livros digitais”.
3. [Receita Federal, Anexo XI ocupações do MEI](https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/Anexo_XI.pdf): “Editor(a) de livros independente”, CNAE 5811-5/00, aparece na lista oficial. Confirmar elegibilidade pessoal e faturamento antes de formalizar.
4. [Rio de Janeiro, Consulta Tributária 076/2024](https://portal.fazenda.rj.gov.br/consulta-tributaria/wp-content/uploads/sites/45/2024/10/C076-24-SEI-040006-016553-2024.pdf): e-books têm imunidade de ICMS, mas comercialização habitual pode envolver inscrição estadual, emissão e escrituração fiscal. Verificar enquadramento específico, inclusive exceções e simplificações aplicáveis ao MEI.
5. [Portal Gov.br, perguntas frequentes MEI](https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/itens-inativo/perguntas-frequentes): regras simplificadas para emissão de NF a consumidores PF e empresas; CLT não impede automaticamente MEI, mas pode afetar direitos de seguro-desemprego.
6. [Governo federal, limites MEI](https://www.gov.br/memp/pt-br/prospera-mei/teto-do-mei): atualmente R$ 81 mil/ano em 2026, proporcional se abrir no meio do ano; verificar alterações posteriores.

## Como regularizar, sem inventar registros
1. Confirmar existência de CNPJ/MEI e localização formal da atividade com o titular. Não usar cadastro do XRMOVI para vendas CRIAÍ sem autorização e verificação.
2. Contador especializado em e-commerce/editoras deve classificar a **atividade real** (edição própria 5811-5/00, varejo de livros 4761-0/01, ou composição), enquadramento MEI/ME e elegibilidade da imunidade de livros. Esse passo é essencial para regime e obrigações fiscais.
3. Confirmar na SEFAZ-RJ cadastro estadual e **tipo correto de nota fiscal** (NF-e de mercadoria digital pode ser aplicável; não pressupor NFS-e). Diferenciar venda própria, comissão de afiliado e prestação de serviço, pois documentos e tributos podem ser diferentes.
4. Separar escrituração de venda de ebook próprio e comissões de afiliado do CRIAÍ. Para cada venda: ID do provedor, data, valor/ moeda, cotação aplicada no repasse, taxa, restituições, país, tomador e documento fiscal.
5. Confirmar formalização, obrigações e permissões em cada país relevante antes de ativar venda internacional em produção. Stripe Tax não está habilitado/suportado nessa conta conforme API consultada.
6. Depois de habilitada a emissão fiscal junto ao órgão competente, integrar relatório de vendas conciliado ao procedimento de nota. **Não emitir documentos fiscais automaticamente até validar dados e classificação.**

## Controle mínimo para conciliação
Há um modelo CSV nesta branch: `docs/criai-vendas-modelo.csv`.
- Manter dados pessoais de compradores e documentos fiscais fora do GitHub público; usar banco privado.
- Nunca incluir CPF, dados de cartão, email real, chaves Stripe ou documentos do comprador nos commits.
- A base de Stripe do Supabase é isolada e protegida por RLS. Deixar acesso financeiro restrito ao proprietário.

## Portas de liberação
- [x] Produto Stripe de teste criado, USD 9,90.
- [x] Banco privado Stripe criado no Supabase e RLS verificada.
- [x] Edge Function de teste publicada, exigindo credenciais de teste.
- [ ] Configurar secret Stripe restrita e assinatura do webhook via área restrita (sem compartilhar em chat/GitHub).
- [ ] Finalizar autenticação, email recovery, webhooks, antifraude e testes ponta a ponta.
- [ ] Definir obrigações fiscais e autorização empresarial com contador/SEFAZ, incluindo vendas internacionais.
- [ ] Abrir/conectar conta de produção CRIAÍ e registrar Stripe live apenas após validação.
