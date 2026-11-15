// Etapa 10 — ONLY future protected server runtime, NEVER GitHub Pages.
// No deployment, public endpoint or credentials are included here.
import { authorizeAdmin, AdminAccessError } from './auth.mjs';
const headers = {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, private',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"
};
const response=(status,data)=>new Response(JSON.stringify(data),{status,headers});
export function createAdminHandler(deps) {
  return async function handle(request) {
    if (request.method !== 'GET') return response(405,{error:'METHOD_NOT_ALLOWED'});
    const url = new URL(request.url);
    if (url.pathname !== '/api/criai/admin/overview') return response(404,{error:'NOT_FOUND'});
    // A production adapter must use trusted server-side identity/IP context and
    // not allow a client to override rate-limiter keys through HTTP headers.
    if (typeof deps.enforceRateLimit !== 'function') return response(503,{error:'RATE_LIMITER_UNAVAILABLE'});
    let permitted;
    try { permitted = await deps.enforceRateLimit(request); }
    catch { return response(503,{error:'RATE_LIMITER_UNAVAILABLE'}); }
    if (permitted !== true) return response(429,{error:'TOO_MANY_REQUESTS'});
    try {
      await authorizeAdmin(request.headers.get('authorization'), deps);
      const daysParam = url.searchParams.get('days');
      const days = daysParam === null ? 28 : Number(daysParam);
      if (![7,28,90].includes(days)) return response(400,{error:'INVALID_PERIOD'});
      if (typeof deps.getOverview !== 'function') return response(503,{error:'REPORTING_BACKEND_UNAVAILABLE'});
      const report = await deps.getOverview(days);
      if (!report || !report.sources) return response(503,{error:'REPORTING_BACKEND_UNAVAILABLE'});
      return response(200,{status:'authorized',report});
    } catch (error) {
      if (error instanceof AdminAccessError) return response(error.status,{error:error.code});
      return response(503,{error:'REPORTING_BACKEND_UNAVAILABLE'});
    }
  };
}
