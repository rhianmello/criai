// CRIAÍ: isolated Stripe Checkout *TEST MODE* prototype for US$ 9.90 guide.
// Never deploy this function to production or flip the public CTA before
// required tax review, keys, webhook endpoint and end-to-end tests are done.
import postgres from "npm:postgres@3.4.5";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const SITE = "https://criai.xrmovi.com.br";
const API = "https://api.stripe.com/v1";
const PRICE = 990;
// Inline server-side price avoids Stripe cross-sandbox Price ID mismatches.

const TABLE = "criai_private.stripe_ebook_orders";
const FILES = {pt:"criai-ia-pt-2026.pdf",en:"criai-ia-en-2026.pdf"} as const;
const SECRET = Deno.env.get("CRIAI_STRIPE_TEST_SECRET_KEY") || "";
const WEBHOOK_SECRET = Deno.env.get("CRIAI_STRIPE_TEST_WEBHOOK_SECRET") || "";
const DATABASE_URL = Deno.env.get("SUPABASE_DB_URL") || "";
const sql = DATABASE_URL ? postgres(DATABASE_URL,{max:1,prepare:false,idle_timeout:10}) : null;
const SERVICE_KEY = (()=>{try{return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";}catch{return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";}})();
const store = SERVICE_KEY ? createClient(Deno.env.get("SUPABASE_URL")||"",SERVICE_KEY) : null;
const headers = {"Access-Control-Allow-Origin":SITE,"Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin","Cache-Control":"no-store"};
const respond = (obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...headers,"Content-Type":"application/json; charset=utf-8"}});
const validEmail=(s:unknown):s is string=>typeof s==="string" && s.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const safeId=(s:unknown):s is string=>typeof s==="string" && /^[a-f0-9-]{36}$/i.test(s);
const safeToken=(s:unknown):s is string=>typeof s==="string" && /^[A-Za-z0-9_-]{40,80}$/.test(s);
const ready=()=>/^(sk|rk)_test_/.test(SECRET) && WEBHOOK_SECRET.startsWith("whsec_") && Boolean(sql&&store);
function token(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");}
async function sha(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,"0")).join("");}
function form(obj:Record<string,string>){return new URLSearchParams(obj).toString();}
async function stripeGet(path:string){
  if(!/^(sk|rk)_test_/.test(SECRET))throw Error("Stripe test credentials missing");
  const response=await fetch(API+path,{headers:{Authorization:"Bearer "+SECRET},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error("Stripe verification unavailable");
  return await response.json();
}
async function getOrder(input:any){
  if(!sql||!safeId(input?.order_id)||!safeToken(input?.access_token))return null;
  const hash=await sha(input.access_token);
  const found=await sql`select id,buyer_email,edition,stripe_session_id,amount_cents,currency,status
    from criai_private.stripe_ebook_orders where id=${input.order_id}::uuid
    and access_token_sha256=${hash} limit 1`;
  return found[0]||null;
}
async function syncOrder(order:any){
  if(!sql||!order?.stripe_session_id)return {status:"pending"};
  const session=await stripeGet("/checkout/sessions/"+encodeURIComponent(order.stripe_session_id));
  if(session.id!==order.stripe_session_id ||
     session.livemode!==false || session.mode!=="payment" ||
     session.client_reference_id!==order.id ||
     session.currency!=="usd" || session.amount_total!==PRICE ||
     Number(order.amount_cents)!==PRICE ||
     (session.customer_details?.email||session.customer_email||"").toLowerCase()!==String(order.buyer_email).toLowerCase())
    throw Error("Stripe session does not match the order");
  let paymentState="pending";
  if(session.payment_status==="paid" && typeof session.payment_intent==="string"){
    const pi=await stripeGet("/payment_intents/"+encodeURIComponent(session.payment_intent)+"?expand[]=latest_charge");
    const charge=pi.latest_charge;
    if(pi.livemode!==false || pi.currency!=="usd" || pi.amount_received!==PRICE ||
       pi.status!=="succeeded" || !charge || charge.paid!==true)
       throw Error("Stripe payment verification failed");
    if(charge.refunded || Number(charge.amount_refunded)>0 || charge.disputed || charge.status!=="succeeded") paymentState="refunded";
    else paymentState="paid";
  }else if(session.status==="expired")paymentState="cancelled";
  const rows=await sql`update criai_private.stripe_ebook_orders
    set status=${paymentState},stripe_payment_intent_id=${typeof session.payment_intent==="string"?session.payment_intent:null},
    updated_at=now(),paid_at=case when ${paymentState}='paid' then coalesce(paid_at,now()) else paid_at end
    where id=${order.id}::uuid and stripe_session_id=${session.id} returning status`;
  return rows[0]||{status:"pending"};
}
async function hmac(secret:string,data:string){
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(data)))).map(x=>x.toString(16).padStart(2,"0")).join("");
}
function ctEqual(a:string,b:string){if(!/^[0-9a-f]{64}$/.test(a)||!/^[0-9a-f]{64}$/.test(b))return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}

/* Separate passwordless recovery for Stripe test orders.
   Does not grant access to any Mercado Pago order or public PDF.
   Challenges are 10 min, five attempts, sessions 1 hour and payment rechecked. */
const emailKey=Deno.env.get("CRIAI_RESEND_API_KEY")||Deno.env.get("XRMOVI_RESEND_API_KEY")||"";
const emailSender=(()=>{
  const preferred=(Deno.env.get("CRIAI_RECOVERY_FROM")||"").trim();
  if(preferred.includes("@"))return preferred;
  const shared=(Deno.env.get("XRMOVI_SUPPORT_MAIL_FROM")||"").trim();
  const match=shared.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return match?"CRIAÍ <"+match[0]+">":"";
})();
const recoveryReady=()=>ready()&&emailKey.startsWith("re_")&&emailSender.includes("@")&&Boolean(SERVICE_KEY);
async function fingerprint(kind:string,value:string){return sha("criai-stripe-test-recovery:"+kind+":"+SERVICE_KEY+":"+value);}
function randomCode(){
  const n=new Uint32Array(1);crypto.getRandomValues(n);
  return String(n[0]%1000000).padStart(6,"0");
}
async function mailCode(id:string,email:string,code:string){
  const message={
    from:emailSender,to:[email],
    subject:"CRIAÍ TEST: verify your guide purchase (no real payment)",
    text:"Your CRIAÍ test purchase verification code is: "+code+
      "\nValid for 10 minutes. Enter it at https://criai.xrmovi.com.br/en/stripe-test-recover.html"+
      "\nThis is test mode. No real money was charged. If you did not request this code, ignore this message."
  };
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{
      "Authorization":"Bearer "+emailKey,"Content-Type":"application/json",
      "Idempotency-Key":"criai-stripe-test-recovery-"+id
    },body:JSON.stringify(message),signal:AbortSignal.timeout(12000)});
    if(response.ok) await sql!`update criai_private.stripe_ebook_recovery_challenges set sent_at=now() where id=${id}::uuid`;
    else console.warn("CRIAI test recovery email provider error",response.status);
  }catch(_){console.warn("CRIAI test recovery email unavailable");}
}
async function requestTestRecovery(req:Request){
  if(!recoveryReady())return respond({error:"Test email recovery is unavailable"},503);
  const input=await req.json().catch(()=>null);
  if(!validEmail(input?.email))return respond({error:"Enter a valid email"},400);
  const email=String(input.email).trim().toLowerCase();
  const ip=req.headers.get("cf-connecting-ip")||"unknown";
  const emailHash=await fingerprint("email",email),ipHash=await fingerprint("ip",ip);
  await sql!`delete from criai_private.stripe_ebook_recovery_challenges where created_at<now()-interval '2 days'`;
  await sql!`delete from criai_private.stripe_ebook_recovery_sessions where expires_at<now()-interval '2 days'`;
  const limits=await sql!`select
    (select count(*)::int from criai_private.stripe_ebook_recovery_challenges where email_key=${emailHash} and created_at>now()-interval '1 hour') as by_email,
    (select count(*)::int from criai_private.stripe_ebook_recovery_challenges where requester_key=${ipHash} and created_at>now()-interval '1 hour') as by_ip,
    (select count(*)::int from criai_private.stripe_ebook_recovery_challenges where email_key=${emailHash} and created_at>now()-interval '60 seconds') as cooldown`;
  const id=crypto.randomUUID(),answer={ok:true,challenge_id:id,expires_in:600,message:"If this email has a paid test order, a code will be sent."};
  if(Number(limits[0]?.by_email)>=3||Number(limits[0]?.by_ip)>=15||Number(limits[0]?.cooldown)>=1)return respond(answer);
  const matches=await sql!`select exists(select 1 from criai_private.stripe_ebook_orders where buyer_email=${email}
    and status='paid' and stripe_session_id is not null) as eligible`;
  const eligible=Boolean(matches[0]?.eligible),code=randomCode();
  const digest=await fingerprint("otp",id+":"+code);
  await sql!`insert into criai_private.stripe_ebook_recovery_challenges
    (id,email_key,requester_key,buyer_email,code_digest,eligible)
    values (${id}::uuid,${emailHash},${ipHash},${eligible?email:null},${digest},${eligible})`;
  if(eligible)EdgeRuntime.waitUntil(mailCode(id,email,code));
  return respond(answer);
}
async function verifyTestRecovery(req:Request){
  if(!recoveryReady())return respond({error:"Test recovery unavailable"},503);
  const input=await req.json().catch(()=>null);
  const id=input?.challenge_id,otp=input?.code;
  if(!safeId(id)||typeof otp!=="string"||!/^\d{6}$/.test(otp))
    return respond({error:"Invalid or expired code"},401);
  const rows=await sql!`update criai_private.stripe_ebook_recovery_challenges
    set attempts=attempts+1 where id=${id}::uuid and eligible=true and attempts<5
    and sent_at is not null and verified_at is null and expires_at>now()
    returning buyer_email,code_digest`;
  const expected=await fingerprint("otp",id+":"+otp);
  if(!rows.length||!ctEqual(String(rows[0].code_digest),expected))
    return respond({error:"Invalid or expired code"},401);
  const changed=await sql!`update criai_private.stripe_ebook_recovery_challenges
    set verified_at=now() where id=${id}::uuid and verified_at is null and expires_at>now()
    returning buyer_email`;
  if(!changed.length)return respond({error:"Already used or expired"},401);
  const accessToken=token(),digest=await fingerprint("session",accessToken);
  await sql!`insert into criai_private.stripe_ebook_recovery_sessions(buyer_email,token_digest)
    values (${changed[0].buyer_email},${digest})`;
  return respond({access_token:accessToken,expires_in:3600,test_mode:true});
}
async function downloadRecoveredTest(req:Request){
  if(!recoveryReady())return respond({error:"Test recovery unavailable"},503);
  const input=await req.json().catch(()=>null);
  const access=input?.access_token,edition=input?.edition;
  if(!safeToken(access)||!["en","pt"].includes(edition))return respond({error:"Invalid recovery access"},401);
  const digest=await fingerprint("session",access);
  const sessions=await sql!`select buyer_email from criai_private.stripe_ebook_recovery_sessions
    where token_digest=${digest} and revoked_at is null and expires_at>now() limit 1`;
  if(!sessions.length)return respond({error:"Recovery session expired"},401);
  const orders=await sql!`select id,buyer_email,edition,stripe_session_id,amount_cents,currency,status
    from criai_private.stripe_ebook_orders where buyer_email=${sessions[0].buyer_email}
    and status='paid' and stripe_session_id is not null order by paid_at desc nulls last limit 10`;
  if(!orders.length)return respond({error:"No approved Stripe test purchase"},403);
  let valid=false,temporaryFailure=false;
  for(const order of orders){
    try{
      const status=await syncOrder(order);
      if(status?.status==="paid"){valid=true;break;}
    }catch(_){temporaryFailure=true;}
  }
  if(!valid)return respond({error:temporaryFailure?"Stripe test verification unavailable":"Purchase was not approved"},
    temporaryFailure?503:403);
  const file=FILES[edition as "en"|"pt"];
  const {data,error}=await store!.storage.from("criai-paid-ebooks").createSignedUrl(file,120,{download:file});
  if(error||!data?.signedUrl)return respond({error:"Secure PDF unavailable"},503);
  return respond({download_url:data.signedUrl,edition,expires_in:120,test_mode:true});
}

Deno.serve(async(req)=>{
  const url=new URL(req.url),parts=url.pathname.split("/").filter(Boolean),last=parts.at(-1);
  const route=parts.at(-2)==="recovery"?"recovery/"+last:last;
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(route!=="webhook" && req.headers.get("origin") && req.headers.get("origin")!==SITE)return respond({error:"Forbidden origin"},403);
  if(route==="health"&&req.method==="GET"){
    let api_connected=false;
    if(ready()){
      try {
        const response=await stripeGet("/checkout/sessions?limit=1");
        api_connected=response?.object==="list" && Array.isArray(response?.data) &&
          response.data.every((session:any)=>session.livemode===false);
      }catch(_){api_connected=false;}
    }
    return respond({configured:ready(),api_connected,recovery_ready:recoveryReady(),test_mode:true,currency:"usd",amount_cents:PRICE});
  }
  try{
    if(route==="recovery/request"&&req.method==="POST")return await requestTestRecovery(req);
    if(route==="recovery/verify"&&req.method==="POST")return await verifyTestRecovery(req);
    if(route==="recovery/download"&&req.method==="POST")return await downloadRecoveredTest(req);
    if(route==="checkout"&&req.method==="POST"){
      if(!ready())return respond({error:"International checkout is not ready. No charge was made."},503);
      const input=await req.json();
      if(!validEmail(input?.email)||!["pt","en"].includes(input?.edition))return respond({error:"Valid email and PDF language required"},400);
      const buyerEmail=String(input.email).trim().toLowerCase(),edition: "pt"|"en"=input.edition;
      const recent=await sql!`select count(*)::int as n from criai_private.stripe_ebook_orders
        where buyer_email=${buyerEmail} and created_at>now()-interval '1 hour'`;
      if(Number(recent[0]?.n)>=5)return respond({error:"Too many checkout attempts. Try later."},429);
      const file=await sql!`select exists(select 1 from storage.objects
        where bucket_id='criai-paid-ebooks' and name=${FILES[edition]}) as ready`;
      if(!file[0]?.ready)return respond({error:"Selected PDF is unavailable"},503);
      const id=crypto.randomUUID(),accessToken=token();
      await sql!`insert into criai_private.stripe_ebook_orders
        (id,buyer_email,edition,amount_cents,currency,access_token_sha256)
        values(${id}::uuid,${buyerEmail},${edition},990,'usd',${await sha(accessToken)})`;
      const success=SITE+"/en/stripe-test-return.html?order="+encodeURIComponent(id);
      const params=form({
        mode:"payment",success_url:success,cancel_url:SITE+"/en/apostilas.html#offer",
        client_reference_id:id,customer_email:buyerEmail,
        "line_items[0][price_data][currency]":"usd",
        "line_items[0][price_data][unit_amount]":String(PRICE),
        "line_items[0][price_data][product_data][name]":"CRIAÍ — Build Your Digital Business with AI (PDF)",
        "line_items[0][quantity]":"1",
        "metadata[criai_order_id]":id,
        "locale":"en"
      });
      const response=await fetch(API+"/checkout/sessions",{method:"POST",
        headers:{Authorization:"Bearer "+SECRET,"Content-Type":"application/x-www-form-urlencoded",
          "Idempotency-Key":"criai-stripe-"+id},body:params,signal:AbortSignal.timeout(15000)});
      const session=await response.json().catch(()=>({}));
      if(!response.ok || !/^cs_test_/.test(String(session.id||"")) ||
        session.currency!=="usd" || session.amount_total!==PRICE || session.livemode!==false ||
        !/^https:\/\/checkout\.stripe\.com\//.test(String(session.url||""))){
        await sql!`update criai_private.stripe_ebook_orders set status='failed' where id=${id}::uuid`;
        return respond({error:"Test Checkout could not be started. No payment was made."},503);
      }
      await sql!`update criai_private.stripe_ebook_orders set stripe_session_id=${session.id},status='pending',
        updated_at=now() where id=${id}::uuid`;
      return respond({checkout_url:session.url,order_id:id,access_token:accessToken,test_mode:true});
    }
    if(["status","download"].includes(String(route))&&req.method==="POST"){
      if(!ready())return respond({error:"Checkout test environment unavailable."},503);
      const input=await req.json(),order=await getOrder(input);
      if(!order)return respond({error:"Order not found"},404);
      const state=await syncOrder(order);
      if(route==="status")return respond({status:state.status==="paid"?"approved":state.status,
        ready:state.status==="paid",edition:order.edition,test_mode:true});
      if(state.status!=="paid")return respond({error:"Verified payment required"},403);
      const edition=input.edition==="pt"?"pt":input.edition==="en"?"en":order.edition;
      const {data,error}=await store!.storage.from("criai-paid-ebooks").createSignedUrl(FILES[edition as "pt"|"en"],120,{download:FILES[edition as "pt"|"en"]});
      if(error||!data?.signedUrl)return respond({error:"Secure download unavailable"},503);
      return respond({download_url:data.signedUrl,edition,expires_in:120});
    }
    if(route==="webhook"&&req.method==="POST"){
      if(!WEBHOOK_SECRET.startsWith("whsec_"))return respond({error:"Webhook unavailable"},503);
      const signature=req.headers.get("stripe-signature")||"",raw=await req.text();
      const stamp=signature.split(",").find(x=>x.startsWith("t="))?.slice(2)||"";
      const signatures=signature.split(",").filter(x=>x.startsWith("v1=")).map(x=>x.slice(3));
      if(!/^\d{10}$/.test(stamp)||Math.abs(Date.now()-Number(stamp)*1000)>300000)return respond({error:"Invalid webhook timestamp"},401);
      const expected=await hmac(WEBHOOK_SECRET,stamp+"."+raw);
      if(!signatures.some(s=>ctEqual(expected,s)))return respond({error:"Invalid webhook signature"},401);
      const event=JSON.parse(raw);
      if(event.livemode!==false||!/^checkout\.session\./.test(String(event.type||"")))return respond({ok:true});
      const session=event.data?.object;
      if(!sql||!/^cs_test_/.test(String(session?.id||"")))return respond({ok:true});
      const found=await sql`select id,buyer_email,edition,stripe_session_id,amount_cents,currency,status
        from criai_private.stripe_ebook_orders where stripe_session_id=${session.id} limit 1`;
      if(found[0])await syncOrder(found[0]); // The event never authorizes a PDF without Stripe API verification.
      return respond({ok:true});
    }
    return respond({error:"Not found"},404);
  }catch(error){console.error("CRIAI Stripe test gateway error",String(error));return respond({error:"Service temporarily unavailable"},503);}
});
