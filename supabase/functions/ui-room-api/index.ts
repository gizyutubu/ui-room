import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST,GET,PUT,PATCH,DELETE,OPTIONS', 'Content-Type': 'application/json' };
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const ITERATIONS = 120000;
const json = (body: unknown, status=200) => new Response(JSON.stringify(body), { status, headers: cors });
const bytes = (s:string) => new TextEncoder().encode(s);
function b64(a:ArrayBuffer|Uint8Array){return btoa(String.fromCharCode(...new Uint8Array(a instanceof ArrayBuffer?a:a.buffer))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function token(){const a=new Uint8Array(32);crypto.getRandomValues(a);return b64(a)}
async function digest(s:string){return b64(await crypto.subtle.digest('SHA-256',bytes(s)))}
async function derive(password:string,salt:Uint8Array){const key=await crypto.subtle.importKey('raw',bytes(password),'PBKDF2',false,['deriveBits']);return b64(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,256))}
async function hashPassword(password:string){const salt=new Uint8Array(16);crypto.getRandomValues(salt);return `${b64(salt)}.${await derive(password,salt)}`}
async function verifyPassword(password:string,stored:string){const [s,want]=stored.split('.');const salt=Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));return (await derive(password,salt))===want}
async function currentUser(req:Request){const h=req.headers.get('Authorization')||'';if(!h.startsWith('Bearer '))return null;const tokenHash=await digest(h.slice(7));const {data}=await supabase.from('ui_sessions').select('user_id,expires_at').eq('token_hash',tokenHash).maybeSingle();if(!data||new Date(data.expires_at)<new Date())return null;const {data:user}=await supabase.from('ui_users').select('id,name,color').eq('id',data.user_id).maybeSingle();return user}
function cleanName(name:string){return name.trim().normalize('NFKC').slice(0,32)}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{const url=new URL(req.url),action=url.pathname.split('/').filter(Boolean).at(-1);const body=req.method==='GET'?{}:await req.json().catch(()=>({}));
  if(action==='register'||action==='login'){
    const name=cleanName(body.name||''),password=String(body.password||'');if(name.length<2||password.length<6)return json({error:'名前は2文字以上、パスワードは6文字以上で入力してください'},400);
    let {data:user}=await supabase.from('ui_users').select('id,name,color,password_hash').eq('name_key',name.toLowerCase()).maybeSingle();
    if(action==='register'){if(user)return json({error:'その名前はすでに使われています'},409);const password_hash=await hashPassword(password);const {data:created,error}=await supabase.from('ui_users').insert({name,name_key:name.toLowerCase(),password_hash,color:body.color||'#8d7cff'}).select('id,name,color').single();if(error)throw error;user=created}else{if(!user||!(await verifyPassword(password,user.password_hash)))return json({error:'名前またはパスワードが違います'},401)}
    const raw=token(),expires=new Date(Date.now()+1000*60*60*24*30).toISOString();await supabase.from('ui_sessions').insert({user_id:user.id,token_hash:await digest(raw),expires_at:expires});return json({token:raw,user:{id:user.id,name:user.name,color:user.color,user_metadata:{display_name:user.name}}});
  }
  const user=await currentUser(req);if(!user)return json({error:'ログインが必要です'},401);
  if(action==='logout'){const h=req.headers.get('Authorization')!.slice(7);await supabase.from('ui_sessions').delete().eq('token_hash',await digest(h));return json({ok:true})}
  if(action==='me')return json({user:{id:user.id,name:user.name,color:user.color,user_metadata:{display_name:user.name}}});
  const path=String(body.path||url.searchParams.get('path')||'');const parts=path.split('/').filter(Boolean);const root=parts[0]==='users'?'user_store':'room_store';const key=parts[1];const nested=parts.slice(2);if(!key)return json({error:'invalid path'},400);
  const {data:row}=await supabase.from(root).select('data').eq(root==='user_store'?'user_id':'room_id',key).maybeSingle();let doc=row?.data||{};
  const getNested=(o:any,ps:string[])=>ps.reduce((v,k)=>v==null?undefined:v[k],o);const setNested=(o:any,ps:string[],v:any)=>{let c=o;ps.slice(0,-1).forEach(k=>{c[k]??={};c=c[k]});c[ps.at(-1)!]=v};const delNested=(o:any,ps:string[])=>{let c=o;ps.slice(0,-1).forEach(k=>c=c?.[k]);if(c)delete c[ps.at(-1)!]};
  if(req.method==='GET')return json({value:nested.length?getNested(doc,nested):doc});if(req.method==='DELETE')delNested(doc,nested);else if(req.method==='PUT'){if(nested.length)setNested(doc,nested,body.value);else doc=body.value||{};}else if(req.method==='PATCH'){if(nested.length){const cur=getNested(doc,nested)||{};setNested(doc,nested,{...cur,...(body.value||{})})}else doc={...doc,...(body.value||{})}}
  const keyCol=root==='user_store'?'user_id':'room_id';const payload={ [keyCol]:key, data:doc, updated_at:new Date().toISOString() };await supabase.from(root).upsert(payload);return json({value:nested.length?getNested(doc,nested):doc});
}catch(e){console.error(e);return json({error:e instanceof Error?e.message:'server error'},500)}});
