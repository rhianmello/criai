import { authorizeAdmin, AdminAccessError } from './auth.mjs';

// Dependency-injected handler, NOT deployed as a public endpoint.
// No database, credentials, or private reporting integrations exist yet.
const disconnected = Object.freeze({
  ga4: { connection: 'not_connected', last_synced: null, sessions: null, users: null, affiliate_clicks: null, sources: null },
  google_ads: { connection: 'not_connected', last_synced: null, spend_brl: null },
  hotmart: { connection: 'not_connected', last_synced: null, confirmed_commissions_brl: null, received_commissions_brl: null }
});
function respond(status, data) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
  }});
}
export function createAdminHandler(deps) {
  return async request => {
    if (request.method !== 'GET') return respond(405, { error:'METHOD_NOT_ALLOWED' });
    if (new URL(request.url).pathname !== '/api/admin/overview') return respond(404, {error:'NOT_FOUND'});
    try {
      await authorizeAdmin(request.headers.get('authorization'), deps);
      const data = deps.getOverview ? await deps.getOverview() : disconnected;
      return respond(200, {status:'authorized', sources:data});
    } catch (error) {
      if (error instanceof AdminAccessError) return respond(error.status,{error:error.code});
      return respond(503,{error:'SERVICE_UNAVAILABLE'});
    }
  };
}
