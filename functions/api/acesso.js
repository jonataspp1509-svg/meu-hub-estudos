import {authenticate} from './aurora.js';

import {schema,digest,issueSession,limit,migrate,cors,inputJSON} from '../_lib/account-store.js';
const ALPHABET='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
class Problem extends Error{constructor(status,message){super(message);this.status=status;}}
export function normalizeCode(value){if(typeof value!=='string'||value.length>100)return null;let code=value.trim().toUpperCase().replace(/[\s-]/g,'');if(code.length===26&&code.startsWith('SF'))code=code.slice(2);code=code.replaceAll('O','0').replace(/[IL]/g,'1');return /^[0-9A-HJKMNP-TV-Z]{24}$/.test(code)?code:null;}
export function createCode(){const raw=crypto.getRandomValues(new Uint8Array(24));return 'SF-'+Array.from(raw,b=>ALPHABET[b&31]).join('').match(/.{4}/g).join('-');}
function configured(env){return !!env.DB&&env.CODE_LOGIN_ENABLED!=='false';}
export async function onRequest({request,env}){
 const {allowed,headers}=cors(request);
 const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(request.method==='OPTIONS')return new Response(null,{status:allowed?204:403,headers});
 if(request.method==='GET')return respond({available:configured(env)});
 if(request.method!=='POST')return respond({error:'Método não permitido.'},405);
 if(!allowed)return respond({error:'Origem não autorizada.'},403);
 if(!configured(env))return respond({error:'O acesso por código está em preparação. Use o acesso existente por enquanto.'},503);
 try{
  const input=await inputJSON(request,2048);if(!input||!['create','login','rotate','status'].includes(input.action))throw new Problem(400,'Pedido inválido.');
  await schema(env.DB);
  const now=Date.now(),ip=await digest('studyflow-code:'+ (request.headers.get('CF-Connecting-IP')||'unknown'));
  await limit(env.DB,'requests:'+ip,Math.floor(now/900000),40);
  if(input.action==='login'){
   const code=normalizeCode(input.code);if(!code)throw new Problem(401,'Código inválido. Confira os caracteres e tente novamente.');
   const record=await env.DB.prepare('SELECT uid FROM account_codes WHERE code_hash=?').bind(await digest(code)).first();
   if(!record)throw new Problem(401,'Código inválido. Confira os caracteres e tente novamente.');
   return respond({uid:record.uid,code:'SF-'+code.match(/.{4}/g).join('-'),token:await issueSession(env.DB,record.uid)});
  }
  const bearer=request.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');
  let uid=bearer?await authenticate(bearer,{db:env.DB}):null;
  if(uid)await migrate(env.DB,uid,bearer);
  if(input.action==='status'){
   if(!uid)throw new Problem(401,'Conecte sua conta para continuar.');
   const record=await env.DB.prepare('SELECT uid FROM account_codes WHERE uid=?').bind(uid).first();
   return respond({linked:!!record});
  }
  if(input.action==='rotate'&&!uid)throw new Problem(401,'Conecte sua conta para continuar.');
  if(uid){
   const exists=await env.DB.prepare('SELECT uid FROM account_codes WHERE uid=?').bind(uid).first();
   if(exists&&input.action==='create')throw new Problem(409,'Esta conta já tem um código. Use o código guardado ou escolha Gerar novo código.');
   await limit(env.DB,'codes:'+uid,Math.floor(now/900000),5);
  }else{
   await limit(env.DB,'new:'+ip,Math.floor(now/900000),20);
   await limit(env.DB,'new:global',Math.floor(now/900000),500);
   uid='code-'+crypto.randomUUID();
  }
  const code=createCode(),hash=await digest(normalizeCode(code)),token=await issueSession(env.DB,uid);
  if(input.action==='rotate'){
   const result=await env.DB.prepare('UPDATE account_codes SET code_hash=?, updated_at=? WHERE uid=? RETURNING uid').bind(hash,now,uid).first();
   if(!result)throw new Problem(409,'Crie primeiro o código desta conta.');
  }else await env.DB.prepare('INSERT INTO account_codes(code_hash,uid,created_at,updated_at) VALUES(?,?,?,?)').bind(hash,uid,now,now).run();
  return respond({uid,code,token});
 }catch(error){return respond({error:error.status?error.message:'Não foi possível conectar agora. Tente novamente.'},error.status||503);}
}
