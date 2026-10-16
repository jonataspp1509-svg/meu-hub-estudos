import './study-focus.js?v=focus-exit20261015';
import {auth,onAuthStateChanged} from './code-account.js?v=free20261014';
import {db,doc,getDoc,setDoc,onSnapshot,runTransaction,serverTimestamp,Timestamp} from './study-storage.js?v=free20261014';
export {auth,db,doc,getDoc,setDoc,onSnapshot,runTransaction,serverTimestamp,Timestamp};
export const localDay=()=>Number(new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll('-',''));
export let session={user:null,wallet:null,testing:false,paid:false,ready:false,items:new Set(),error:''};
const subscribers=new Set();let stop=null,epoch=0;
export function ownerTesting(){const u=session.user;return !!(u&&u.email==='jonataspp1509@gmail.com'&&u.emailVerified&&u.providerData.some(p=>p.providerId==='google.com'));}
function publish(){session.testing=ownerTesting();for(const fn of subscribers)fn(session);document.dispatchEvent(new CustomEvent('studysessionchange'));}
export function subscribe(fn){subscribers.add(fn);fn(session);return()=>subscribers.delete(fn);}
onAuthStateChanged(auth,async user=>{const generation=++epoch;stop?.();session={user,wallet:null,testing:false,paid:!!user,ready:true,items:new Set(),error:''};publish();if(!user)return;try{const ref=doc(db,'studyWallets',user.uid),snap=await getDoc(ref);if(generation!==epoch)return;if(!snap.exists())await runTransaction(db,async tx=>{if(!(await tx.get(ref)).exists())tx.set(ref,{balance:0,day:localDay(),earnedToday:0,sessionStarted:null,updatedAt:serverTimestamp()});});if(generation!==epoch)return;stop=onSnapshot(ref,s=>{if(generation!==epoch)return;session.wallet=s.data();publish();},()=>{session.error='Não consegui atualizar seus diamantes.';publish();});}catch{if(generation!==epoch)return;session.error='Não consegui conectar o armazenamento. Tente novamente.';publish();}});
export const walletRef=()=>doc(db,'studyWallets',session.user.uid);
