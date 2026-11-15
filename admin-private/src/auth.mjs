// Etapa 10 — CRIAÍ only, PRIVATE backend code. Not deployed.
// Auth issuer belongs to the shared Supabase project, but authorization is
// ALWAYS scoped to criai_private.owner_access and requires verified MFA (aal2).
// Never use user_metadata, raw decoded tokens, or XRMOVI roles for access.
// CRIAÍ — future PRIVATE API authorization boundary (not deployed).
// verifyToken MUST cryptographically verify JWT; NEVER accept decoded-only tokens.
// isApprovedOwner MUST query trusted CRIAÍ-only server-side owner allowlist.
export class AdminAccessError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const deny = (status, code) => { throw new AdminAccessError(status, code); };

export async function authorizeAdmin(header, {
  verifyToken, fetchCurrentUser, isActiveSession, isApprovedOwner, expectedIssuer,
  expectedAudience = 'authenticated', nowSeconds = () => Math.floor(Date.now() / 1000)
}) {
  if (typeof header !== 'string') deny(401, 'MISSING_BEARER_TOKEN');
  const m = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(header);
  if (!m || m[1].length > 8192) deny(401, 'INVALID_BEARER_TOKEN');
  if (typeof expectedIssuer !== 'string' || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/auth\/v1$/.test(expectedIssuer)) deny(503, 'ISSUER_NOT_CONFIGURED');
  let verified;
  try { verified = await verifyToken(m[1]); }
  catch (_) { deny(401, 'TOKEN_VERIFICATION_FAILED'); }
  if (!verified || verified.verified !== true || !verified.claims) deny(401, 'UNVERIFIED_TOKEN');
  const claims = verified.claims;
  if (!claims.sub || !claims.session_id || typeof claims.exp !== 'number' || claims.exp <= nowSeconds()) deny(401, 'EXPIRED_OR_INVALID_TOKEN');
  if (claims.iss !== expectedIssuer) deny(401, 'WRONG_ISSUER');
  if (claims.aud !== expectedAudience) deny(401, 'WRONG_AUDIENCE');
  if (claims.is_anonymous === true) deny(403, 'ANONYMOUS_NOT_ALLOWED');

  let user;
  try { user = await fetchCurrentUser(m[1]); }
  catch (_) { deny(401, 'USER_VERIFICATION_FAILED'); }
  if (!user || user.id !== claims.sub) deny(401, 'USER_MISMATCH');
  if (typeof isActiveSession !== 'function') deny(503, 'SESSION_STORE_UNAVAILABLE');
  let sessionActive;
  try { sessionActive = await isActiveSession(claims.session_id, claims.sub); }
  catch (_) { deny(503, 'SESSION_STORE_UNAVAILABLE'); }
  if (sessionActive !== true) deny(401, 'SESSION_REVOKED');
  if (claims.aal !== 'aal2') deny(403, 'MFA_REQUIRED');

  let approved;
  try { approved = await isApprovedOwner(claims.sub); }
  catch (_) { deny(503, 'AUTHORIZATION_STORE_UNAVAILABLE'); }
  if (approved !== true) deny(403, 'OWNER_ONLY');
  return { userId: claims.sub, sessionId: claims.session_id ?? null };
}
