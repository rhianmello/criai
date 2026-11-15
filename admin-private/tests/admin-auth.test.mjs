import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAdmin } from '../src/auth.mjs';
import { createAdminHandler } from '../src/handler.mjs';

const owner='00000000-0000-4000-8000-000000000001';
const outsider='00000000-0000-4000-8000-000000000002';
const issuer='https://isolated-criai-project.supabase.co/auth/v1';
const deps={
  expectedIssuer:issuer,
  nowSeconds:()=>1000,
  verifyToken:async t=>t==='bad' ? null : {verified:true,claims:{
    sub:t==='outsider'?outsider:owner,
    iss:issuer,aud:'authenticated',aal:t==='aal1'?'aal1':'aal2',
    exp:t==='expired'?900:1200,is_anonymous:t==='anonymous',session_id:'10000000-0000-4000-8000-000000000001'
  }},
  fetchCurrentUser:async t=>t==='revoked'?null:{id:t==='outsider'?outsider:owner},
  isActiveSession:async (sessionId,userId)=>sessionId==='10000000-0000-4000-8000-000000000001',
  isApprovedOwner:async id=>id===owner
};
const auth=(token,overrides={})=>authorizeAdmin(token?'Bearer '+token:null,{...deps,...overrides});
test('missing token 401',async()=>assert.rejects(auth(null),{status:401}));
test('unverified JWT 401',async()=>assert.rejects(auth('bad'),{status:401}));
test('expired JWT 401',async()=>assert.rejects(auth('expired'),{status:401}));
test('revoked session check 401',async()=>assert.rejects(auth('revoked'),{status:401}));
test('MFA aal1 403',async()=>assert.rejects(auth('aal1'),{status:403,code:'MFA_REQUIRED'}));
test('other user 403',async()=>assert.rejects(auth('outsider'),{status:403,code:'OWNER_ONLY'}));
test('revoked session 401',async()=>assert.rejects(auth('owner',{isActiveSession:async()=>false}),{status:401,code:'SESSION_REVOKED'}));
test('session backend unreachable fails closed',async()=>assert.rejects(auth('owner',{isActiveSession:async()=>{throw Error('unavailable')}}),{status:503}));
test('anonymous user 403',async()=>assert.rejects(auth('anonymous'),{status:403}));
test('incorrect issuer 401',async()=>assert.rejects(auth('owner',{expectedIssuer:'https://wrong.example/auth/v1'}),{status:401}));
test('missing issuer fails closed',async()=>assert.rejects(auth('owner',{expectedIssuer:undefined}),{status:503,code:'ISSUER_NOT_CONFIGURED'}));
test('incorrect audience 401',async()=>assert.rejects(auth('owner',{expectedAudience:'other'}),{status:401}));
test('missing allowlist backend fails closed 503',async()=>assert.rejects(auth('owner',{isApprovedOwner:async()=>{throw new Error('db down')}}),{status:503}));
test('verified owner aal2 accepted',async()=>assert.equal((await auth('owner')).userId,owner));
test('method and route restricted',async()=>{
  const h=createAdminHandler(deps);
  assert.equal((await h(new Request('https://admin.example/api/admin/overview',{method:'POST'}))).status,405);
  assert.equal((await h(new Request('https://admin.example/unknown'))).status,404);
});
test('unauthenticated requests return no financial data',async()=>{
  const r=await createAdminHandler(deps)(new Request('https://admin.example/api/admin/overview'));
  assert.equal(r.status,401);assert.ok(!(await r.text()).includes('sources'));
});
test('other users cannot retrieve metrics',async()=>{
  const r=await createAdminHandler(deps)(new Request('https://admin.example/api/admin/overview',{headers:{authorization:'Bearer outsider'}}));
  assert.equal(r.status,403);
});
test('owner gets explicitly disconnected sources, never fabricated zeros',async()=>{
  const r=await createAdminHandler(deps)(new Request('https://admin.example/api/admin/overview',{headers:{authorization:'Bearer owner'}}));
  assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store, private');
  const data=await r.json();assert.equal(data.sources.ga4.sessions,null);
  assert.equal(data.sources.hotmart.connection,'not_connected');
  assert.equal(data.sources.google_ads.spend_brl,null);
});
test('untrusted user metadata cannot grant access',async()=>{
  await assert.rejects(auth('owner',{isApprovedOwner:async()=>false}),{status:403});
});
