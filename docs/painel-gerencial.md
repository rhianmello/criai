# CRIAÍ — Painel de gestão fiscal (implantação local inicial)

**Publicação:** 16/11/2026. **Acesso:** /admin/ ou /admin/index.html no domínio CRIAÍ.

## O que foi implementado

- Painel responsivo com menu lateral à esquerda.
- Cofre local criptografado com Web Crypto AES-256-GCM e chave derivada de senha por PBKDF2-SHA256 com 600.000 iterações.
- Cadastro de e-mail e **nova senha criada no primeiro acesso**. **Não há autenticação de servidor**. Nenhum par usuário/senha foi gravado no repositório.
- Transações Hotmart cadastradas manualmente ou via CSV. Duplicatas identificadas por ID de transação.
- NFS-e registradas **somente após emissão externa válida**; associação por transação. O painel não gera documento fiscal real.
- Geração de relatório mensal CSV e impressão para PDF com dados de comissão, transação, número e emissão da NFS-e.
- Preparação de e-mail para contabilidade@leadlovers.com.br **sem envio nem anexos automáticos**; marcação manual de envio.
- Despesas manuais do CRIAÍ, indicadores sem valores fictícios, checklist fiscal e estimativa do 5º dia útil.
- Exportação/restauração de backup **criptografado** entre navegadores. Bloqueio após 15 minutos inativos.
- Links oficiais: https://www.nfse.gov.br/EmissorNacional/Login e https://www.leadlovers.com/politicas-sobre-parcerias.

## Segurança e limitações importantes

Esta implementação é **local-first**, não é um sistema privado completo com autenticação server-side:
- O HTML/JS/CSS é público por se tratar de GitHub Pages. Dados são criptografados antes de gravados no armazenamento do navegador, e a chave só existe em memória durante a sessão.
- No primeiro acesso qualquer pessoa consegue criar o seu próprio cofre em **outro** navegador; isso não concede acesso ao cofre do proprietário. O cofre não pode ser compartilhado automaticamente entre dispositivos.
- Com senha fraca, dispositivo comprometido, extensão maliciosa ou falha de XSS no mesmo domínio, há riscos residuais. Não registre CPF de compradores, dados de cartão, segredos ou PDFs fiscais de terceiros no cofre.
- Dados do cofre **não são backups na nuvem**. Faça download do backup criptografado frequentemente e guarde com segurança. Limpar dados do site remove o cofre do navegador.
- Nenhuma API Hotmart/GA4/Google Ads/NFS-e foi conectada. Não há consulta de comissões ou faturamento em tempo real.
- Não existe recuperação de senha. A senha que foi escrita na conversa do usuário não foi incorporada ao código; no primeiro acesso, o usuário deve definir uma **senha nova, exclusiva e robusta**.
- O projeto do Supabase XRMOVI contém o esquema isolado criai_private documentado anteriormente, porém este painel fiscal **não consulta nem altera** aquele esquema ou os dados do XRMOVI. Para um painel online sincronizado recomenda-se projeto isolado, Auth, RLS e auditoria de acesso.

## Regras fiscais e prazo

Fonte oficial: https://www.leadlovers.com/politicas-sobre-parcerias

A Leadlovers exige nota fiscal de serviço pela atuação comissionada, de pessoa física ou jurídica, e relatório que relacione as transações às notas. Os documentos devem ser enviados mensalmente até o quinto dia útil para contabilidade@leadlovers.com.br.

A tela informa uma **estimativa** do quinto dia útil do mês seguinte à competência, desconsiderando apenas fins de semana e feriados nacionais fixos. Feriados municipais/estaduais e móveis devem ser conferidos manualmente.

O portal https://www.nfse.gov.br/EmissorNacional/Login pode ser usado por PF apenas quando cadastrado e habilitado conforme a legislação do município. O emissor oficial é quem gera documentos fiscais válidos.

## Evolução posterior

Para autenticação pelo mesmo e-mail em todos os dispositivos, armazenamento centralizado, anexos fiscais e integração API oficial, será necessário provisionar backend dedicado ou aprovar o uso de outro ambiente, validar custos e estabelecer RLS, MFA, backups e integração fiscal autorizada. **Não usar senha hardcoded nem credencial de serviço no frontend.**
