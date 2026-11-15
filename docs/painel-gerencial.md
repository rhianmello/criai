# CRIAÍ — desenho técnico do painel gerencial privado (proposta, não implantado)

## Objetivo

Mostrar indicadores comprováveis sem expor dados comerciais no GitHub Pages público. O front público deve continuar somente com conteúdo e `GA4` opcional mediante consentimento.

## Indicadores e definição

| Indicador | Fonte real e lógica |
|---|---|
| Visitantes e sessões | GA4 Data API; somente dados coletados legitimamente após consentimento |
| Origem de tráfego | GA4: dimensões de canal, source/medium, campanha |
| Páginas mais vistas | GA4: `page_path`, `page_view` |
| Visualizações da oferta | GA4: `view_item`, produto `hotmart_42903` |
| Cliques em links afiliados | GA4: `affiliate_click`, `product_id` |
| Taxa de cliques nas ofertas | `affiliate_click / visualizações da página da oferta`, no mesmo período |
| Custo de anúncios | Google Ads API/relatório exportado da campanha do CRIAÍ, nunca do XRMOVI |
| Comissões reais | Hotmart por exportação autorizada/API oficial, status de cada transação e estorno |
| Lucro estimado | Comissões previstas menos gasto, marcado expressamente como estimativa |
| Resultado financeiro efetivo | Comissões confirmadas/recebidas menos gasto comprovado, com critérios contábeis claros |

Atribuição entre GA4, anúncios e Hotmart pode ser incompleta por bloqueadores de cookies, opt-out, múltiplos dispositivos e regras de atribuição. Não equiparar `affiliate_click` com venda nem prometer rastreio de todos os clientes.

## Arquitetura recomendada

- Um novo backend isolado do XRMOVI (pode ser um novo projeto privado Supabase), com autenticação e autorização somente para proprietário.
- Rotinas de consulta à GA4 Data API e à conta de anúncios pelo servidor, usando credenciais armazenadas apenas em secrets.
- Importação autorizada de relatórios Hotmart ou API oficial com atualização auditável, sem presumir que tenha API disponível.
- Políticas de acesso restritas por usuário/role, MFA para proprietário, logs de acesso e trilha de alterações.
- Agregações por dia, canal, campanha e produto; evitar persistir dados pessoais dos visitantes ou dados financeiros sensíveis sem necessidade.
- Interface privada e separada do repositório GitHub Pages, com métricas em estado vazio até dados reais estarem conectados.
- Exibir quando cada integração foi atualizada e alertas de dados faltantes.

## Fases

1. Confirmar acesso à GA4 e identidade/propriedade.
2. Conectar GA4 e testar contagem de eventos com consentimento em DebugView.
3. Criar painel privado sem publicar URL/token administrativo.
4. Integrar despesas de campanha do CRIAÍ.
5. Integrar receitas comprovadas da Hotmart com autorização.
6. Implementar indicadores, filtro por período, exportação e auditoria de qualidade.

**Status:** somente proposta técnica. Nenhum banco, dashboard administrativo ou integração de dados foi criado nesta etapa.
