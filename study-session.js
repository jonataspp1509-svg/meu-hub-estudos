import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,onSnapshot,runTransaction,serverTimestamp,Timestamp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
export const app=getApps().some(a=>a.name==='[DEFAULT]')?getApp():initializeApp({apiKey:'AIzaSyAUcyfIrmue8JDpcNNjkT8QViLB5bnuawY',authDomain:'studyflow-788a2.firebaseapp.com',projectId:'studyflow-788a2'});
export const auth=getAuth(app),db=getFirestore(app);
export {doc,getDoc,setDoc,onSnapshot,runTransaction,serverTimestamp,Timestamp};
export const localDay=()=>Number(new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll('-',''));
export let session={user:null,wallet:null,testing:false,paid:false,ready:false,items:new Set(),error:''};
const subscribers=new Set();let stops=[],epoch=0;
export function ownerTesting(){const u=session.user;return !!(u&&u.email==='jonataspp1509@gmail.com'&&u.emailVerified&&u.providerData.some(p=>p.providerId==='google.com'));}
function publish(){session.testing=ownerTesting();for(const fn of subscribers)fn(session);document.dispatchEvent(new CustomEvent('studysessionchange'));}
export function subscribe(fn){subscribers.add(fn);fn(session);return()=>subscribers.delete(fn);}
onAuthStateChanged(auth,async user=>{const generation=++epoch;stops.forEach(stop=>stop());stops=[];session={user,wallet:null,testing:false,paid:false,ready:!user,items:new Set(),error:''};publish();if(!user)return;let vip=false,walletReady=false,vipReady=false;const sync=()=>{session.paid=vip||Boolean(session.wallet?.premiumUntil?.toMillis()>Date.now());session.ready=walletReady&&vipReady;publish();};
 try{const ref=doc(db,'studyWallets',user.uid),snap=await getDoc(ref);if(generation!==epoch)return;if(!snap.exists())await setDoc(ref,{balance:0,day:localDay(),earnedToday:0,sessionStarted:null,premiumUntil:Timestamp.fromMillis(0),updatedAt:serverTimestamp()});if(generation!==epoch)return;
 stops.push(onSnapshot(ref,s=>{session.wallet=s.data();walletReady=true;sync();},()=>{walletReady=true;session.error='Não consegui atualizar seus diamantes.';sync();}),onSnapshot(doc(db,'vipMembers',user.uid),s=>{vip=s.exists();vipReady=true;sync();},()=>{vipReady=true;session.error='Não consegui confirmar seu plano.';sync();}));
 }catch{if(generation!==epoch)return;session.ready=true;session.error='Não consegui conectar sua conta. Tente novamente.';publish();}
});
export const walletRef=()=>doc(db,'studyWallets',session.user.uid);
export async function redeemPremium(){const user=session.user;if(!user||!session.ready||session.paid)throw Error('Confira sua conta e seu plano antes de resgatar.');await runTransaction(db,async tx=>{const ref=doc(db,'studyWallets',user.uid),snap=await tx.get(ref),w=snap.data();if(!w||w.balance<100||w.premiumUntil.toMillis()>Date.now())throw Error('Você precisa de 100 diamantes e não pode ter um Premium ativo.');tx.update(ref,{balance:w.balance-100,premiumUntil:Timestamp.fromMillis(Date.now()+7*86400000),updatedAt:serverTimestamp()});});}
