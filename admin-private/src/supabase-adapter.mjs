// CRIAÍ admin-only adapter. Unpublished, requiring injected SERVER ONLY Auth
// and PostgreSQL clients for the existing shared Supabase project.
// Reads auth.sessions; NEVER mutates Auth or any XRMOVI table.
// Do not place a Postgres connection string or Supabase secret in GitHub Pages.
export function makeSupabaseDependencies({authClient,pgPool,projectUrl,nowSeconds, getOverview, enforceRateLimit}) {
  if (!authClient?.auth?.getClaims || !authClient?.auth?.getUser || !pgPool?.query ||
      !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl || '')) {
    throw new TypeError('Trusted Supabase Auth + private DB pool + project URL required');
  }
  return {
    expectedIssuer:projectUrl + '/auth/v1',
    nowSeconds,
    enforceRateLimit,
    getOverview,
    verifyToken:async token=>{
      const {data,error}=await authClient.auth.getClaims(token);
      return error || !data?.claims ? null : {verified:true,claims:data.claims};
    },
    fetchCurrentUser:async token=>{
      const {data,error}=await authClient.auth.getUser(token);
      return error || !data?.user ? null : data.user;
    },
    isActiveSession:async (sessionId,userId)=>{
      const {rows}=await pgPool.query(
        'SELECT EXISTS(SELECT 1 FROM auth.sessions WHERE id=$1::uuid AND user_id=$2::uuid) AS active',
        [sessionId,userId]
      );
      return rows?.[0]?.active===true;
    },
    isApprovedOwner:async userId=>{
      const {rows}=await pgPool.query(
        'SELECT active FROM criai_private.owner_access WHERE user_id=$1::uuid LIMIT 1',
        [userId]
      );
      return rows?.length===1 && rows[0].active===true;
    }
  };
}
