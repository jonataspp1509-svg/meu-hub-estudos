import {schema} from './account-store.js';
import {rankingPeriodAt,RANKING_START_MONTH} from '../../ranking-period.js';
const ready=new WeakMap();
export async function communitySchema(db){await schema(db);if(!ready.has(db))ready.set(db,db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS study_feedback(id TEXT PRIMARY KEY,uid TEXT NOT NULL,name TEXT NOT NULL,rating INTEGER NOT NULL,message TEXT NOT NULL,created_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_ranking_photos(uid TEXT PRIMARY KEY,enabled INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_profile_details(uid TEXT PRIMARY KEY,bio TEXT NOT NULL,color TEXT NOT NULL,photo TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_spotify(uid TEXT PRIMARY KEY,url TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_profiles(uid TEXT PRIMARY KEY,name TEXT NOT NULL,participating INTEGER NOT NULL,updated_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_months(uid TEXT NOT NULL,month TEXT NOT NULL,seconds INTEGER NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(uid,month))'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_champions(month TEXT PRIMARY KEY,uid TEXT NOT NULL,name TEXT NOT NULL,seconds INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_ranking_champions(period_start TEXT PRIMARY KEY,period_end TEXT NOT NULL,uid TEXT NOT NULL,name TEXT NOT NULL,seconds INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_groups(id TEXT PRIMARY KEY,owner TEXT NOT NULL,name TEXT NOT NULL,code_hash TEXT NOT NULL UNIQUE,created_at INTEGER NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_members(group_id TEXT NOT NULL,uid TEXT NOT NULL,joined_at INTEGER NOT NULL,PRIMARY KEY(group_id,uid))'),
 db.prepare('CREATE INDEX IF NOT EXISTS study_months_month ON study_months(month,seconds DESC,updated_at ASC)'),
 db.prepare('CREATE INDEX IF NOT EXISTS study_members_uid ON study_members(uid)'),
 db.prepare('CREATE TABLE IF NOT EXISTS study_group_pages(group_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,version INTEGER NOT NULL,updated_at INTEGER NOT NULL,PRIMARY KEY(group_id,id))')
 ]).catch(e=>{ready.delete(db);throw e;}));await ready.get(db);}
export const monthAt=(now=Date.now())=>new Date(now-10800000).toISOString().slice(0,7);
export async function settleChampion(db,now=Date.now()){
 const current=rankingPeriodAt(now);
 const months=await db.prepare('SELECT DISTINCT month FROM study_months WHERE month>=? AND month<? ORDER BY month LIMIT 48').bind(RANKING_START_MONTH,current.start).all();
 const periods=new Map((months.results||[]).map(({month})=>{const period=rankingPeriodAt(Date.parse(month+'-15T12:00:00Z'));return [period.start,period];}));
 for(const period of periods.values()){
  if(await db.prepare('SELECT period_start FROM study_ranking_champions WHERE period_start=?').bind(period.start).first())continue;
  const winner=await db.prepare('SELECT m.uid,p.name,SUM(m.seconds) seconds,MAX(m.updated_at) reached_at FROM study_months m JOIN study_profiles p ON p.uid=m.uid WHERE m.month>=? AND m.month<? AND p.participating=1 AND m.seconds>0 GROUP BY m.uid,p.name ORDER BY seconds DESC,reached_at ASC,m.uid ASC LIMIT 1').bind(period.start,period.end).first();
  if(!winner)continue;
  const path='userCosmetics/'+winner.uid+'/items/theme-champion';
  await db.batch([
   db.prepare('INSERT INTO study_ranking_champions(period_start,period_end,uid,name,seconds) VALUES(?,?,?,?,?) ON CONFLICT(period_start) DO NOTHING').bind(period.start,period.last,winner.uid,winner.name,winner.seconds),
   db.prepare('INSERT INTO study_documents(path,data,version) SELECT ?,?,1 WHERE EXISTS(SELECT 1 FROM study_ranking_champions WHERE period_start=? AND uid=?) ON CONFLICT(path) DO NOTHING').bind(path,JSON.stringify({kind:'theme',price:0,month:period.start,periodEnd:period.last,createdAt:{__sfTime:now}}),period.start,winner.uid)
  ]);
 }
}

export async function rankingRows(db,period=rankingPeriodAt()){
 return db.prepare(`SELECT p.uid,p.name,d.color,CASE WHEN r.enabled=1 THEN d.photo ELSE '' END photo,COALESCE(m.seconds,0) seconds
 FROM study_profiles p LEFT JOIN study_profile_details d ON d.uid=p.uid LEFT JOIN study_ranking_photos r ON r.uid=p.uid
 LEFT JOIN (SELECT uid,SUM(seconds) seconds,MAX(CASE WHEN seconds>0 THEN updated_at END) reached_at FROM study_months WHERE month>=? AND month<? GROUP BY uid) m ON m.uid=p.uid
 WHERE p.participating=1 ORDER BY seconds DESC,m.reached_at ASC,p.uid ASC LIMIT 100`).bind(period.start,period.end).all();
}
