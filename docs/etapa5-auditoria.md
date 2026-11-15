# CRIAÍ — Etapa 5 — relatório de auditoria (15/11/2026)

## Escopo e método

Repositório: https://github.com/rhianmello/criai — branch `main`.
Site: https://criai.xrmovi.com.br/ — GitHub Pages com subdomínio próprio.
Foram revisados o código e a árvore de arquivos pelo GitHub, bem como as políticas públicas da Leadlovers e Google Ads. **A ferramenta de consulta externa não conseguiu abrir o domínio ou o Hotlink**, portanto não há homologação de jornada real em produção nesta etapa.

### Correções efetivamente implantadas

- Corrigido o domínio antigo `criar.xrmovi.com.br` em `robots.txt`, `sitemap.xml` e `assets/config.js` para `criai.xrmovi.com.br`.
- Inseridos `canonical`, `og:title`, `og:site_name`, `og:url` e `robots` nas quatro páginas principais.
- Atualizada a página de privacidade para refletir a publicação e explicar métricas opcionais.
- Corrigido link ao blog oficial da Leadlovers para `https://leadlovers.blog/`.
- Melhorado contraste do CTA verde e adicionado estilo explícito de foco de teclado.
- Aprimorada lógica JS: menu mobile, opção de consentimento em todas as páginas, GA4 carregado apenas após autorização, modo de consentimento básico, eventos `view_item`, `select_content` e `affiliate_click` quando GA4 estiver configurado e houver consentimento.
- Mantido o Hotlink **direto**, sem encurtadores, parâmetros ou redirecionamento intermediário no CRIAÍ.
- Adicionada CI automatizada `.github/workflows/criai-audit.yml` com `tests/site_check.py`, verificação sintática via `node --check`.

## Resultado das verificações

| Verificação | Resultado |
|---|---|
| Repositório correto e `main` | Confirmado pelo GitHub |
| Arquivos HTML, CSS, JS, sitemap e CNAME | Confirmados pelo GitHub |
| DOMÍNIO CNAME `criai.xrmovi.com.br` | Confirmado no arquivo do repositório; GitHub Pages/DNS/HTTPS mostrados no print do proprietário |
| Testes estáticos/JS por GitHub Actions | Aprovado na execução CI |
| Menu e responsividade em produção | **Não homologados ao vivo**; CSS responsivo revisado e testes locais de etapa anterior |
| Console JS em navegador real, Lighthouse e cabeçalhos HTTP | **Não verificados** |
| Resposta HTTP do site público e certificados TLS | **Não verificadas nesta consulta**, apesar do status de Pages no print |
| Hotlink da Hotmart — URL exata copiada da conta | **Pendente**; URL foi transcrita de captura |
| Hotlink — destino real/cookies de atribuição | **Não homologado**; sem acesso externo bem-sucedido |
| GA4 | **Desativado**, `ga4MeasurementId: ''` |
| Estatísticas, comissões e vendas reais | **Nenhuma integração/dado validado** |
| Google Ads | **Não ativado**; campanha existente do XRMOVI não alterada |

## Política de afiliados — principais alertas

Fontes: https://www.leadlovers.com/politicas-sobre-parcerias e https://support.google.com/adspolicy/answer/16427718

- Leadlovers permite páginas de conteúdo do parceiro com links próprios; anúncios direcionando ao Hotlink ou aos domínios do fornecedor são proibidos pelo produtor.
- As palavras-chave reservadas da marca e suas variações devem ser **negativas**, assim como termos de concorrentes não devem ser usados na oferta da Leadlovers.
- Comissão de 20% indicada; **recorrência limitada a 12 meses** conforme política oficial. Pode haver suspensão de saque por inatividade e exigência de documentação fiscal.
- É necessária **NFS-e por pessoa física ou jurídica** e relação mensal de transações/documentos, encaminhadas ao email contabilidade@leadlovers.com.br, conforme o texto oficial.
- O Google Ads pode reprovar páginas cujo único propósito é encaminhar a outro site. O CRIAÍ precisa manter conteúdo próprio e útil, sem promessas indevidas.
- Alguns links do rodapé ainda exigem validação específica do fornecedor, sobretudo **Pagelovers**; links genéricos do grupo não substituem necessariamente páginas oficiais exigidas nas regras.

## Bloqueadores antes de investimento

1. Copiar o Hotlink Página de Vendas diretamente da área de Hotlinks e comparar com `https://go.hotmart.com/O108508884T`; confirmar o destino no navegador sem concluir compras.
2. Validar HTTP 200, TLS, links e layout no domínio público em desktop e celular.
3. Publicar contato verificável, esclarecer controlador de dados e revisar política de privacidade/LGPD.
4. Confirmar todos os URLs de marcas exigidas no rodapé e regras vigentes com a Leadlovers.
5. Resolver a emissão de NFS-e e relatórios mensais e revisar obrigações tributárias.
6. Criar propriedade GA4 própria do CRIAÍ, configurar o ID G- real e homologar consentimento com Tag Assistant e DebugView. Nenhuma medição deve ocorrer antes do consentimento.
7. Preparar campanhas Google Ads próprias, termos negativos e acompanhamento de custo; **não ativar** antes de validar tudo. `affiliate_click` não é venda.
8. Criar painel admin privado fora de GitHub Pages, com acesso autenticado; não publicar credenciais ou dados de clientes no repositório público.

## Segurança

- Não há credenciais nem tokens adicionados nesta etapa.
- GA4 ID de medição é público por design, mas ainda está em branco.
- HTTPS depende da configuração Pages e do certificado gerenciado pelo GitHub; não equivale a uma auditoria de segurança completa.
- GitHub Pages não permite configurar livremente todos os cabeçalhos de segurança HTTP; avaliar hospedagem/proxy compatível no futuro, sem modificar agora o XRMOVI.
- Link de afiliado comercial em `rel=sponsored noopener noreferrer`; não há checkout próprio ou dados de pagamento.

**Escopo respeitado:** nenhum arquivo do repositório XRMOVI, configuração DNS ou campanha de anúncios foi alterado.
