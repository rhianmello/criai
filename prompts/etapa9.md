# CRIAÍ — ETAPA 9: ATIVAÇÃO DO GA4 E PRIMEIRO ACESSO SEGURO

Atue como engenheiro de software responsável somente pelo projeto CRIAÍ.

**Endereços oficiais:** site https://criai.xrmovi.com.br/ e GitHub https://github.com/rhianmello/criai (branch main).
**Referências:** docs/etapa8-relatorio.md, PR #1 (rascunho), docs/ads-etapa7.md. Não refazer os testes da Etapa 6 nem o Lighthouse da Etapa 7 sem mudança relevante.

## Concluído
- GitHub Pages e HTTPS funcionando (Etapas 6 e 7).
- Fluxo de consentimento do Analytics preparado e testado com ID fictício; sem GA4 real.
- Hotlink Leadlovers configurado `https://go.hotmart.com/O108508884T`, com HTTP 302 preservando referência no teste anterior; titularidade ainda depende de cópia textual da Hotmart.
- PR #1 contém schema privado e protótipo de autorização de dono com MFA e verificação de sessão; não implantado no Supabase e não mesclado.
- Nenhuma propriedade GA4 CRIAÍ, Supabase CRIAÍ ou API privada foi criada na Etapa 8; nenhum anúncio, custo ou venda.
- Política e negativas de marca Leadlovers revisadas. Links de Pagelovers específicos ainda dependem de confirmação.

## Missão
1. Conferir a URL fornecida via “Copiar link” da conta Hotmart, comparando caractere por caractere com o config. Validar destino sem comprar.
2. Verificar se foi criada propriedade GA4 exclusiva CRIAÍ. Caso haja ID `G-...` próprio, configurar em `assets/config.js` e testar no site com consentimento e Tag Assistant/DebugView. Não usar propriedade XRMOVI.
3. Revisar contato real do projeto e identificação do responsável pelos dados; atualizar política de privacidade com evidências, sem inventar dados.
4. Conferir com Leadlovers URLs próprias Pagelovers/Zaplovers e regra de NFS-e para pessoa física, confirmar processo e emissão se aplicável.
5. Auditar PR #1; se existir projeto Supabase exclusivo CRIAÍ e houver aprovação dos custos, implementar backend privado com MFA/allowlist/DB; fazer testes reais de acesso negativo e positivo. Se não, manter PR rascunho e não afirmar painel funcional.
6. Integrar dados reais somente com permissões, APIs e credenciais de servidor; mostrar `Não conectado` na ausência de fonte; nunca contar cliques como vendas.
7. Preparar, mas NÃO ativar, uma campanha Google Ads CRIAÍ com URL final do conteúdo próprio, negativas oficiais de marca e orçamento sujeito a aprovação.
8. Executar testes úteis das alterações, registrar commits e PRs, e entregar prompt da Etapa 10.

## Restrições
- Não tocar no XRMOVI, sua infraestrutura, analytics, campanhas, banco, DNS ou pagamentos.
- Não ativar custos ou campanhas sem autorização.
- Não realizar compras/saques/afiliações adicionais.
- Não armazenar segredos em repositório GitHub Pages público.
- Não declarar métricas, lucros, pagamentos ou comissões sem verificação na fonte real.

**Entrega:** alterações realmente realizadas, evidências de testes, status de GA4, Hotmart, segurança, pendências comerciais e prompt Etapa 10.
