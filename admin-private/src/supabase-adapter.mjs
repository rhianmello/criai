// CRIAÍ private backend adapter contract. Requires external, separately provisioned
// Supabase Auth client and DIRECT SERVER-ONLY Postgres pool. No secrets in repo.
// Production integrator must enforce network firewall, TLS, MFA enrollment,
// session invalidation and request rate-limits separately.
export function makeSupabaseAuthDependencies({authClient,pgPool,projectUrl,nowSeconds}) {
  if (!authClient?.auth || !pgPool?.query || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl||'')) {
    throw new TypeError('Dedicated CRIAÍ Auth, Postgres and project URL are required');
  }
  return {
    expectedIssuer: projectUrl + '/auth/v1',
    nowSeconds,
    verifyToken: async token => {
      // getClaims verifies JWT signature/expiry against the project's key;
      // simply base64 decoding the browser token is NEVER sufficient.
      const {data,error} = await authClient.auth.getClaims(token);
      if (error || !data?.claims) return null;
      return {verified:true,claims:data.claims};
    },
    fetchCurrentUser: async token => {
      // Remote Auth check; stricter revocation may require session_id validation.
      const {data,error} = await authClient.auth.getUser(token);
      if (error || !data?.user) return null;
      return data.user;
    },
    isApprovedOwner: async userId => {
      const {rows} = await pgPool.query(
        'SELECT active FROM criai_private.owner_access WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      return rows?.length===1 && rows[0].active===true;
    }
  };
}
