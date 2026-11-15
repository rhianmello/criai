# CRIAÍ — Ativação real do GA4 (Etapa 12, pendente)

**Estado verificado em 15/11/2026:** `assets/config.js` possui `ga4MeasurementId: ''`. A conexão Windsor.ai retornou apenas uma propriedade `XRMOVI`, que **não deve ser usada**. Não há evento do CRIAÍ validado no DebugView real.

## Configuração exclusiva no Google Analytics

1. Entrar em https://analytics.google.com/ com a conta Google responsável.
2. Menu **Administrador** → **Criar** → **Propriedade**. Nome: `CRIAÍ`. Fuso recomendado: `Brasil — São Paulo`; moeda: `BRL`.
3. Em **Coleta e modificação de dados** → **Fluxos de dados** → **Web**, criar fluxo para `https://criai.xrmovi.com.br/` e nomear `CRIAÍ — Site de afiliados`.
4. Copiar somente o **Measurement ID público**, de formato `G-XXXXXXXXXX`. Não copiar token, segredo de API, chave privada ou credenciais.
5. Após confirmar que ele pertence ao CRIAÍ e não ao XRMOVI, preencher `ga4MeasurementId` em `assets/config.js` da `main`.
6. A tag do GA4 continua carregando **apenas quando a pessoa clicar em “Aceitar estatísticas”**. A recusa não deve gerar `gtag/js`, e revogação da preferência recarrega sem tag.
7. Testar Tag Assistant e DebugView com sessão consentida e ações:
   - entrada na home → `page_view`;
   - abrir `leadlovers.html` → `page_view`, `view_item`;
   - clicar na análise interna → `select_content`;
   - clicar no botão da Hotmart (sem comprar) → `affiliate_click` e parâmetro `cta_placement`;
   - iniciar um dos vídeos oficiais → `video_start`.
8. Em **Administrador → Definições personalizadas**, registrar `cta_placement` como dimensão personalizada **de escopo de evento** (nome sugerido: `Posição do botão`). Pode haver atraso até aparecer em relatórios padrão.
9. Verificar hostname e propriedade de destino, origem `Google Ads / Organic Search / Direct / Referral`, páginas, eventos, dispositivos. Não interpretar os acessos de teste como clientes reais e não importar métricas do XRMOVI.
10. Para o painel privado, integrar dados do GA4 por API autorizada e com credenciais no servidor. **GitHub Pages não contém segredo nem backend**. A sincronização com Supabase ainda não foi implementada.

## Testes que devem falhar se houver risco

- `G-...` do XRMOVI conectado ao CRIAÍ → **bloquear a alteração**.
- Tags de medição antes do consentimento → **falha**.
- Medição após revogar consentimento → **falha**.
- Eventos de teste contabilizados como vendas da Hotmart → **falha conceitual**.
- Valores de sessões calculados somando páginas diferentes → **risco de duplicação**.

**Nunca publicar anúncios só porque o GA4 começou a receber eventos.** O gate comercial/fiscal é separado.

Fontes:
- https://support.google.com/analytics/answer/14183469
- https://support.google.com/analytics/answer/12270356
- https://support.google.com/analytics/answer/14240153
