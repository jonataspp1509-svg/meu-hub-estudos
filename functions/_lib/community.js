import {schema} from './account-store.js';
const ready=new WeakMap();
export async function communitySchema(db){await schema(db);if(!ready.has(db))ready.set(db,db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS study_feedback(id TEXT PRIMARY KEY,uid TEXT NOT NULL,name TEXT NOT NULL,rating INTEGER NOT NULL,message TEXT NOT NULL,created_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_spotify(uid TEXT PRIMARY KEY,url TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_profiles(uid TEXT PRIMARY KEY,name TEXT NOT NULL,participating INTEGER NOT NULL,updated_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_months(uid TEXT NOT NULL,month TEXT NOT NULL,seconds INTEGER NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(uid,month))'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_champions(month TEXT PRIMARY KEY,uid TEXT NOT NULL,name TEXT NOT NULL,seconds INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_groups(id TEXT PRIMARY KEY,owner TEXT NOT NULL,name TEXT NOT NULL,code_hash TEXT NOT NULL UNIQUE,created_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_members(group_id TEXT NOT NULL,uid TEXT NOT NULL,joined_at INTEGER NOT NULL,PRIMARY KEY(group_id,uid))'),
 db.prepare('CREATE INDEX IF NOT EXISTS study_months_month ON study_months(month,seconds DESC,updated_at ASC)'),
 db.prepare('CREATE INDEX IF NOT EXISTS study_members_uid ON study_members(uid)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_group_pages(group_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,version INTEGER NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(group_id,id))')
 ]).catch(e=>{ready.delete(db);throw e;}));await ready.get(db);}
export const monthAt=(now=Date.now())=>new Date(now-10800000).toISOString().slice(0,7);
export async function settleChampion(db,now=Date.now()){
 const months=await db.prepare('SELECT DISTINCT m.month FROM study_months m WHERE m.month<? AND NOT EXISTS(SELECT 1 FROM study_champions c WHERE c.month=m.month) ORDER BY m.month LIMIT 24').bind(monthAt(now)).all();
 for(const {month}of months.results||[]){const winner=await db.prepare('SELECT m.uid,p.name,m.seconds FROM study_months m JOIN study_profiles p ON p.uid=m.uid WHERE m.month=? AND p.participating=1 AND m.seconds>0 ORDER BY m.seconds DESC,m.updated_at ASC,m.uid ASC LIMIT 1').bind(month).first();if(!winner)continue;const path='userCosmetics/'+winner.uid+'/items/theme-champion';await db.batch([
 db.prepare('INSERT INTO study_champions(month,uid,name,seconds) VALUES(?,?,?,?) ON CONFLICT(month) DO NOTHING').bind(month,winner.uid,winner.name,winner.seconds),
 db.prepare('INSERT INTO study_documents(path,data,version) SELECT ?,?,1 WHERE EXISTS(SELECT 1 FROM study_champions WHERE month=? AND uid=?) ON CONFLICT(path) DO NOTHING').bind(path,JSON.stringify({kind:'theme',price:0,month,createdAt:{__sfTime:now}}),month,winner.uid)
 ]);}
}
