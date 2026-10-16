import {communitySchema,monthAt} from '../_lib/community.js';
import {authenticate} from './aurora.js';
import {schema,migrate,cors,inputJSON,AccountProblem} from '../_lib/account-store.js';
export function elapsed(state,now=Date.now()){if(!state)return 0;return Math.min(1500,Math.max(0,Number(state.activeSeconds)||0)+(state.running?Math.max(0,now-(Number(state.anchorTime)||now))/1000:0));}
export async function updateFocus(db,uid,action){await communitySchema(db);const fp='focusSessions/'+uid,wp='studyWallets/'+uid;for(let attempt=0;attempt<5;attempt++){const [row,wrow]=await Promise.all([db.prepare('SELECT data,version FROM study_documents WHERE path=?').bind(fp).first(),action==='claim'?db.prepare('SELECT data,version FROM study_documents WHERE path=?').bind(wp).first():Promise.resolve(null)]);let state=row?JSON.parse(row.data):null;const now=Date.now(),seconds=elapsed(state,now);if(action==='state')return {state,serverNow:now,revision:row?.version||0};if(action==='claim'&&(!state||seconds<1500))throw new AccountProblem(409,'A sessão ainda está em andamento.');if(action==='claim'&&state.claimed)return {state,serverNow:now,revision:row?.version||0};
 const fresh=()=>({sessionId:crypto.randomUUID(),activeSeconds:0,claimed:false,running:false,anchorTime:now,startedAt:{__sfTime:now},updatedAt:{__sfTime:now}});
 if(action==='reset'||!state||(action==='start'&&state.claimed))state=fresh();else state={...state,activeSeconds:seconds,anchorTime:now,updatedAt:{__sfTime:now}};
 if(action==='start')state.running=state.activeSeconds<1500;
 if(action==='pause'||action==='reset')state.running=false;
 const guard=crypto.randomUUID(),statements=[db.prepare('INSERT INTO study_tx_guards(id,ok) VALUES(?,CASE WHEN COALESCE((SELECT version FROM study_documents WHERE path=?),0)=? THEN 1 ELSE 0 END)').bind(guard+':f',fp,row?.version||0)];
 if(action==='claim'){statements.push(db.prepare('INSERT INTO study_months(uid,month,seconds,updated_at) VALUES(?,?,1500,?) ON CONFLICT(uid,month) DO UPDATE SET seconds=study_months.seconds+1500,updated_at=excluded.updated_at').bind(uid,monthAt(now),now));state.claimed=true;state.running=false;state.activeSeconds=1500;const day=Number(new Date(now-3*3600000).toISOString().slice(0,10).replaceAll('-','')),wallet=wrow?JSON.parse(wrow.data):{balance:0,earnedToday:0,day,sessionStarted:null};wallet.balance+=5;wallet.earnedToday=(wallet.day===day?wallet.earnedToday:0)+5;wallet.day=day;wallet.updatedAt={__sfTime:now};statements.push(db.prepare('INSERT INTO study_tx_guards(id,ok) VALUES(?,CASE WHEN COALESCE((SELECT version FROM study_documents WHERE path=?),0)=? THEN 1 ELSE 0 END)').bind(guard+':w',wp,wrow?.version||0),db.prepare('INSERT INTO study_documents(path,data,version) VALUES(?,?,1) ON CONFLICT(path) DO UPDATE SET data=excluded.data,version=study_documents.version+1').bind(wp,JSON.stringify(wallet)));}
 statements.push(db.prepare('INSERT INTO study_documents(path,data,version) VALUES(?,?,1) ON CONFLICT(path) DO UPDATE SET data=excluded.data,version=study_documents.version+1').bind(fp,JSON.stringify(state)),db.prepare('DELETE FROM study_tx_guards WHERE id LIKE ?').bind(guard+':%'));try{await db.batch(statements);return {state,serverNow:now,revision:(row?.version||0)+1,rewarded:action==='claim'};}catch(e){if(attempt===4)throw new AccountProblem(409,'A sessão mudou em outro aparelho. Tente novamente.');}}
}
const browserSchemas=new WeakMap();
export async function browserFocus(db,uid,action,input={}){
 if(!/^[a-f0-9-]{36}$/.test(input.client||''))throw new AccountProblem(400,'Sessão do navegador inválida.');
 if(!/^[a-f0-9-]{36}$/.test(input.browser||''))throw new AccountProblem(400,'Navegador inválido.');
 await schema(db);if(!browserSchemas.has(db))browserSchemas.set(db,db.prepare('CREATE TABLE IF NOT EXISTS focus_views(uid TEXT NOT NULL,id TEXT NOT NULL,browser TEXT NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(uid,id))').run().catch(e=>{browserSchemas.delete(db);throw e;}));await browserSchemas.get(db);
 const now=Date.now(),fp='focusSessions/'+uid,client=input.client,known=await db.prepare('SELECT id FROM focus_views WHERE uid=? AND id=? AND expires>?').bind(uid,client,now).first();
 const fresh=JSON.stringify({sessionId:crypto.randomUUID(),activeSeconds:0,claimed:false,running:false,anchorTime:now,startedAt:{__sfTime:now},updatedAt:{__sfTime:now}});
 if(action==='close'){
  if(known){const statements=[input.handoff===true?db.prepare('UPDATE focus_views SET expires=? WHERE uid=? AND id=?').bind(now+15000,uid,client):db.prepare('DELETE FROM focus_views WHERE uid=? AND id=?').bind(uid,client)];
   if(input.handoff!==true&&typeof input.sessionId==='string')statements.push(db.prepare("UPDATE study_documents SET data=?,version=version+1 WHERE path=? AND json_extract(data,'$.sessionId')=? AND NOT EXISTS(SELECT 1 FROM focus_views WHERE uid=? AND expires>?)").bind(fresh,fp,input.sessionId,uid,now));
   await db.batch(statements);
  }
  return updateFocus(db,uid,'state');
 }
 if(action!=='open'&&!known)throw new AccountProblem(409,'A sessão de foco deste navegador terminou. Reabra a página para começar novamente.');
 if(action==='open'){
  const statements=[db.prepare('DELETE FROM focus_views WHERE uid=? AND expires<=?').bind(uid,now)];
  if(input.freshBrowser===true&&!input.previous)statements.push(db.prepare('DELETE FROM focus_views WHERE uid=? AND browser=?').bind(uid,input.browser));
  statements.push(db.prepare('UPDATE study_documents SET data=?,version=version+1 WHERE path=? AND NOT EXISTS(SELECT 1 FROM focus_views WHERE uid=? AND expires>?)').bind(fresh,fp,uid,now),db.prepare('INSERT INTO focus_views(uid,id,browser,expires) VALUES(?,?,?,?) ON CONFLICT(uid,id) DO UPDATE SET expires=excluded.expires').bind(uid,client,input.browser,now+120000));
  if(/^[a-f0-9-]{36}$/.test(input.previous||'')&&input.previous!==client)statements.push(db.prepare('DELETE FROM focus_views WHERE uid=? AND id=?').bind(uid,input.previous));
  await db.batch(statements);
 }else await db.prepare('UPDATE focus_views SET expires=? WHERE uid=? AND id=?').bind(now+120000,uid,client).run();
 return updateFocus(db,uid,action==='open'?'state':action);
}
export async function onRequest({request,env}){const {allowed,headers}=cors(request),respond=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers});if(request.method==='OPTIONS')return new Response(null,{status:allowed?204:403,headers});if(request.method!=='POST'||!allowed)return respond({error:'Acesso negado.'},403);try{const token=request.headers.get('Authorization')?.replace(/^Bearer\s+/i,''),uid=await authenticate(token,{db:env.DB}),input=await inputJSON(request,2048);if(!['state','start','pause','reset','claim','open','close'].includes(input.action))throw new AccountProblem(400,'Ação inválida.');await schema(env.DB);await migrate(env.DB,uid,token);return respond(await (input.client?browserFocus(env.DB,uid,input.action,input):['open','close'].includes(input.action)?Promise.reject(new AccountProblem(400,'Sessão do navegador inválida.')):updateFocus(env.DB,uid,input.action)));}catch(e){return respond({error:e.status?e.message:'Não consegui sincronizar o foco agora.'},e.status||503);}}
