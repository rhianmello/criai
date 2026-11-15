// Etapa 10: read ONLY aggregate data scoped to criai_private.
// NO client tokens, PII, sales inference or access to XRMOVI tables.
// Call this function exclusively AFTER authorizeAdmin() has succeeded.
const sources = ['ga4', 'google_ads', 'hotmart'];
const validDays = [7, 28, 90];

function numericalOrNull(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function subtractDays(iso, number) {
  const date = new Date(iso + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() - number);
  return date.toISOString().slice(0, 10);
}
function blank(name) {
  switch (name) {
    case 'ga4': return {connection:'not_connected',last_synced:null,active_users:null,sessions:null,session_count_note:'Sessions require a non-duplicated session-level or landing-page aggregate',page_views:null,affiliate_clicks:null,channels:null,cta_placements:null};
    case 'google_ads':return {connection:'not_connected',last_synced:null,spend_brl:null,ad_clicks:null,campaigns:null};
    case 'hotmart':return {connection:'not_connected',last_synced:null,confirmed_commissions_brl:null,paid_commissions_brl:null,transactions:null};
  }
}
export function todaySaoPaulo(date = new Date()) {
  // Intl formatToParts is stable regardless of locale ordering.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value;
  return [get('year'),get('month'),get('day')].join('-');
}
export function createOverviewReader({pgPool, getToday = todaySaoPaulo}) {
  if (!pgPool || typeof pgPool.query !== 'function') throw new TypeError('Server-only Postgres pool is required');
  return async function getOverview(days = 28) {
    if (!validDays.includes(days)) throw new RangeError('INVALID_PERIOD');
    const end = getToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) throw new TypeError('INVALID_REPORT_DATE');
    const start = subtractDays(end, days - 1);
    const result = {range:{days,start,end,time_zone:'America/Sao_Paulo'},sources:{
      ga4:blank('ga4'),google_ads:blank('google_ads'),hotmart:blank('hotmart')
    }};
    const status = await pgPool.query(
      'SELECT source, state, last_success_at FROM criai_private.sync_status WHERE source = ANY($1::text[])',
      [sources]
    );
    for (const row of status.rows || []) {
      if (!sources.includes(row.source)) continue;
      const target = result.sources[row.source];
      // Distinct users and sessions are NOT safely additive across page_path.
      // Leave these fields unknown until a GA4 period-level aggregate exists.
      if (row.state !== 'connected' || !row.last_success_at) {
        target.connection = row.state === 'error' ? 'error' : 'not_connected';
        continue;
      }
      target.connection = 'connected';
      target.last_synced = row.last_success_at;
      if (row.source === 'ga4') {
        const [totals,channels] = await Promise.all([
          pgPool.query(
            'SELECT count(*)::int records, sum(page_views) page_views, sum(affiliate_clicks) affiliate_clicks FROM criai_private.traffic_daily WHERE provider = $1 AND day BETWEEN $2::date AND $3::date',
            ['ga4',start,end]
          ),
          pgPool.query(
            'SELECT channel, sum(affiliate_clicks) affiliate_clicks FROM criai_private.traffic_daily WHERE provider = $1 AND day BETWEEN $2::date AND $3::date GROUP BY channel ORDER BY sum(affiliate_clicks) DESC NULLS LAST LIMIT 15',
            ['ga4',start,end]
          )
        ]);
        const r = totals.rows?.[0];
        if (r && r.records > 0) {
          for (const k of ['page_views','affiliate_clicks']) target[k] = numericalOrNull(r[k]);
          target.channels = (channels.rows || []).map(v=>({
            channel:String(v.channel),sessions:null,affiliate_clicks:numericalOrNull(v.affiliate_clicks)
          }));
        }
        const placementRows = await pgPool.query(
          'SELECT product_code, cta_placement, sum(affiliate_clicks) clicks FROM criai_private.affiliate_cta_daily WHERE provider=$1 AND day BETWEEN $2::date AND $3::date GROUP BY product_code, cta_placement ORDER BY sum(affiliate_clicks) DESC NULLS LAST LIMIT 80',
          ['ga4',start,end]
        );
        if ((placementRows.rows || []).length > 0) {
          target.cta_placements = placementRows.rows.map(v=>({
            product_code:String(v.product_code),
            placement:String(v.cta_placement),
            affiliate_clicks:numericalOrNull(v.clicks)
          }));
        }
      } else if (row.source === 'google_ads') {
        const totals = await pgPool.query(
          'SELECT count(*)::int records, sum(spend_brl) spend_brl, sum(clicks) ad_clicks FROM criai_private.ads_daily WHERE provider = $1 AND day BETWEEN $2::date AND $3::date',
          ['google_ads',start,end]
        );
        const r = totals.rows?.[0];
        if (r && r.records > 0) {
          target.spend_brl = numericalOrNull(r.spend_brl);
          target.ad_clicks = numericalOrNull(r.ad_clicks);
        }
      } else if (row.source === 'hotmart') {
        const totals = await pgPool.query(
          "SELECT count(*)::int records, sum(commission_brl) FILTER (WHERE status IN ('approved','paid')) confirmed, sum(commission_brl) FILTER (WHERE status='paid') paid FROM criai_private.commissions WHERE occurred_at >= $1::date AND occurred_at < ($2::date + INTERVAL '1 day')",
          [start,end]
        );
        const r = totals.rows?.[0];
        if (r && r.records > 0) {
          target.transactions = numericalOrNull(r.records);
          target.confirmed_commissions_brl = numericalOrNull(r.confirmed);
          target.paid_commissions_brl = numericalOrNull(r.paid);
        }
      }
    }
    return result;
  };
}
