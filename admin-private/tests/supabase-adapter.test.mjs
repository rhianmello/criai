import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSupabaseAuthDependencies} from '../src/supabase-adapter.mjs';
const authClient={auth:{
  getClaims:async jwt=>({data:{claims:{sub:jwt}},error:null}),
  getUser:async jwt=>({data:{user:{id:jwt}},error:null})
}};
test('rejects absent backends and arbitrary project domains',()=>{
  assert.throws(()=>makeSupabaseAuthDependencies({authClient,projectUrl:'https://test.example'}),TypeError);
});
test('queries isolated private owner table with parameterized ID',async()=>{
  let sql,args;
  const pgPool={query:async (s,a)=>{sql=s;args=a;return {rows:[{active:true}]};}};
  const d=makeSupabaseAuthDependencies({authClient,pgPool,projectUrl:'https://criai-ref.supabase.co'});
  assert.equal(d.expectedIssuer,'https://criai-ref.supabase.co/auth/v1');
  assert.equal((await d.verifyToken('uid')).claims.sub,'uid');
  assert.equal((await d.fetchCurrentUser('uid')).id,'uid');
  assert.equal(await d.isApprovedOwner('uid'),true);
  assert.ok(sql.includes('criai_private.owner_access WHERE user_id = $1'));
  assert.deepEqual(args,['uid']);
});
test('missing owner denies',async()=>{
 const d=makeSupabaseAuthDependencies({authClient,pgPool:{query:async()=>({rows:[]})},projectUrl:'https://criai-ref.supabase.co'});
 assert.equal(await d.isApprovedOwner('not-authorized'),false);
});
