import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeAdmin} from '../src/auth.mjs';
import {createAdminHandler} from '../src/handler.mjs';
import {createOverviewReader} from '../src/overview.mjs';
import {makeSupabaseDependencies} from '../src/supabase-adapter.mjs';

const owner='00000000-0000-4000-8000-000000000001';
const outsider='00000000-0000-4000-8000-000000000002';
const session='10000000-0000-4000-8000-000000000001';
const issuer='https://example-ref.supabase.co/auth/v1';
const base={
  expectedIssuer:issuer,nowSeconds:()=>1000,enforceRateLimit:async()=>true,
  verifyToken:async t=>t==='invalid'?null:{verified:true,claims:{
    sub:t==='outsider'?outsider:owner,session_id:session,
    iss:t==='bad-issuer'?'https://different-ref.supabase.co/auth/v1':issuer,
    aud:'authenticated', exp:t==='expired'?900:1200,
    aal:t==='aal1'?'aal1':'aal2',is_anonymous:t==='anonymous'
  }},
  fetchCurrentUser:async t=>t==='revoked'?null:{id:t==='outsider'?outsider:owner},
  isActiveSession:async()=>true,
  isApprovedOwner:async id=>id===owner,
  getOverview:async days=>({range:{days},sources:{ga4:{connection:'not_connected'}}})
};
const req=(token,query='',method='GET')=>new Request('https://private.example/api/criai/admin/overview'+query,{
  method,headers:token?{authorization:'Bearer '+token}:{}
});
const handler=(overrides={})=>createAdminHandler({...base,...overrides});
async function check(token,status,overrides={}){
 const r=await handler(overrides)(req(token));
 assert.equal(r.status,status);
 return r;
}

test('unauthenticated has no data',async()=>{
 const r=await check(null,401);assert.equal((await r.json()).report,undefined);
});
test('invalid token rejected',async()=>check('invalid',401));
test('expired token rejected',async()=>check('expired',401));
test('revoked auth user rejected',async()=>check('revoked',401));
test('wrong Supabase issuer rejected',async()=>check('bad-issuer',401));
test('missing issuer fails closed',async()=>check('owner',503,{expectedIssuer:undefined}));
test('missing active session rejected',async()=>check('owner',401,{isActiveSession:async()=>false}));
test('session backend unavailable fails closed',async()=>check('owner',503,{isActiveSession:async()=>{throw new Error('down')}}));
test('MFA level aal1 denied',async()=>check('aal1',403));
test('outside user with aal2 denied',async()=>check('outsider',403));
test('anonymous Supabase account denied',async()=>check('anonymous',403));
test('owner allowlist outage denies',async()=>check('owner',503,{isApprovedOwner:async()=>{throw new Error('db')}}));
test('owner removed from allowlist denied',async()=>check('owner',403,{isApprovedOwner:async()=>false}));
test('rate limiter missing denies',async()=>check('owner',503,{enforceRateLimit:undefined}));
test('rate limiter throttles requests',async()=>check('owner',429,{enforceRateLimit:async()=>false}));
test('backend unavailable not shown as zero metrics',async()=>check('owner',503,{getOverview:undefined}));
test('restricted methods and route fail',async()=>{
 assert.equal((await handler()(req('owner','','POST'))).status,405);
 assert.equal((await handler()(new Request('https://private.example/api/admin/users'))).status,404);
});
test('owner with aal2 gets no-store actual backend payload only',async()=>{
 const r=await check('owner',200);
 assert.equal(r.headers.get('cache-control'),'no-store, private');
 assert.equal((await r.json()).report.sources.ga4.connection,'not_connected');
});
test('period must be a valid 7, 28 or 90-day value',async()=>{
 assert.equal((await handler()(req('owner','?days=14'))).status,400);
 assert.equal((await handler()(req('owner','?days=7'))).status,200);
 assert.equal((await handler()(req('owner','?days=90'))).status,200);
});

test('reader returns disconnected sources and null metrics without sync rows',async()=>{
 let calls=0;
 const reader=createOverviewReader({pgPool:{query:async()=>{calls++;return {rows:[]}}},getToday:()=> '2026-11-15'});
 const r=await reader(28);
 assert.equal(r.range.start,'2026-10-19');
 assert.equal(r.range.end,'2026-11-15');
 assert.equal(r.sources.ga4.sessions,null);
 assert.equal(r.sources.ga4.connection,'not_connected');
 assert.equal(r.sources.google_ads.spend_brl,null);
 assert.equal(r.sources.hotmart.confirmed_commissions_brl,null);
 assert.equal(calls,1);
});
test('reader queries ONLY criai_private and does not synthesize commissions',async()=>{
 const queries=[];
 const pgPool={query:async (sql,params)=>{
   queries.push({sql,params});
   if(sql.includes('criai_private.sync_status'))return {rows:[
     {source:'ga4',state:'connected',last_success_at:'2026-11-15T09:00:00Z'},
     {source:'google_ads',state:'connected',last_success_at:'2026-11-15T09:00:00Z'},
     {source:'hotmart',state:'connected',last_success_at:'2026-11-15T09:00:00Z'}
   ]};
   if(sql.includes('criai_private.traffic_daily')&&sql.includes('GROUP BY'))return {rows:[{channel:'Organic Search',sessions:'9',affiliate_clicks:'1'}]};
   if(sql.includes('criai_private.traffic_daily'))return {rows:[{records:1,active_users:'7',sessions:'9',page_views:'13',affiliate_clicks:'1'}]};
   if(sql.includes('criai_private.ads_daily'))return {rows:[{records:1,spend_brl:'10.50',ad_clicks:'2'}]};
   if(sql.includes('criai_private.commissions'))return {rows:[{records:1,confirmed:'3.00',paid:null}]};
   throw new Error('Unexpected table');
 }};
 const o=await createOverviewReader({pgPool,getToday:()=> '2026-11-15'})(28);
 assert.equal(o.sources.ga4.sessions,9);
 assert.equal(o.sources.ga4.active_users,null); // distinct users are not additive across page/day/channel
 assert.equal(o.sources.ga4.channels[0].channel,'Organic Search');
 assert.equal(o.sources.google_ads.spend_brl,10.5);
 assert.equal(o.sources.hotmart.confirmed_commissions_brl,3);
 assert.equal(o.sources.hotmart.paid_commissions_brl,null);
 assert.ok(queries.every(q=>q.sql.includes('criai_private.')));
 assert.ok(queries.every(q=>!/xrmovi/i.test(q.sql)));
});
test('connected without source rows remains unknown null, not zero',async()=>{
 const r=await createOverviewReader({pgPool:{query:async sql=>sql.includes('sync_status')?
 {rows:[{source:'ga4',state:'connected',last_success_at:'2026-11-15'}]}:
 {rows:[{records:0,active_users:null,sessions:null,page_views:null,affiliate_clicks:null}]}},
 getToday:()=> '2026-11-15'})(7);
 assert.equal(r.sources.ga4.sessions,null);
});
test('adapter requires trusted client and rejects fake project domain',()=>{
 assert.throws(()=>makeSupabaseDependencies({authClient:{},pgPool:{},projectUrl:'https://wrong.example'}),TypeError);
});
test('adapter checks session and CRIAÍ owner with parameterized PostgreSQL queries',async()=>{
 const queries=[];
 const pgPool={query:async (sql,args)=>{queries.push({sql,args});return {rows:[{active:true}]};}};
 const authClient={auth:{getClaims:async()=>({data:{claims:{sub:owner}}}),getUser:async()=>({data:{user:{id:owner}}})}};
 const d=makeSupabaseDependencies({pgPool,authClient,projectUrl:'https://example-ref.supabase.co'});
 assert.equal(d.expectedIssuer,issuer);
 assert.equal((await d.verifyToken('any')).claims.sub,owner);
 assert.equal((await d.fetchCurrentUser('any')).id,owner);
 assert.equal(await d.isActiveSession(session,owner),true);
 assert.equal(await d.isApprovedOwner(owner),true);
 assert.ok(queries[0].sql.includes('auth.sessions'));
 assert.ok(queries[1].sql.includes('criai_private.owner_access'));
 assert.deepEqual(queries[1].args,[owner]);
});
