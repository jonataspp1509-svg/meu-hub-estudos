import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth as firebaseGetAuth,onAuthStateChanged as firebaseWatch,signOut,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
const app=getApps().some(a=>a.name==='[DEFAULT]')?getApp():initializeApp({apiKey:'AIzaSyAUcyfIrmue8JDpcNNjkT8QViLB5bnuawY',authDomain:'studyflow-788a2.firebaseapp.com',projectId:'studyflow-788a2'});
const firebaseAuth=firebaseGetAuth(app),listeners=new Set();let legacy=null,codeUser=null,initialized=false;
export const auth={get currentUser(){return codeUser||legacy;}};
export const getAuth=()=>auth;
export function onAuthStateChanged(_auth,fn){listeners.add(fn);if(initialized)queueMicrotask(()=>fn(auth.currentUser));return()=>listeners.delete(fn);}
function notifyAuth(){for(const fn of listeners)fn(auth.currentUser);emit();}
function restoreSession(){try{const v=JSON.parse(localStorage.getItem('studyflow-code-session')||'null');if(v&&v.expires>Date.now()&&/^SFSESSION_[A-Za-z0-9_-]{43}$/.test(v.token))return {uid:v.uid,email:null,emailVerified:false,providerData:[],displayName:'Estudante',getIdToken:async()=>v.token};}catch{}return null;}
codeUser=restoreSession();
export async function signInLegacyGoogle(){const result=await signInWithPopup(firebaseAuth,new GoogleAuthProvider());localStorage.removeItem('studyflow-code-session');codeUser=null;legacy=result.user;stopAuto(false);notifyAuth();return result;}
const endpoint='https://meu-hub-estudos.pages.dev/api/acesso';
let operation=null,statusPromise=null;
export let codeAvailable=false,authProvider=null;
const codeKey=uid=>'studyflow-access-code:'+uid;
function emit(){document.dispatchEvent(new CustomEvent('studyidentitychange'));}
export function savedCode(uid=auth.currentUser?.uid){if(!uid)return '';try{return localStorage.getItem(codeKey(uid))||'';}catch{return '';}}
function saveCode(uid,code){try{localStorage.setItem(codeKey(uid),code);localStorage.setItem('studyflow-last-code-account',uid);return true;}catch{return false;}}
function stopped(){try{return localStorage.getItem('studyflow-signed-out')==='true';}catch{return false;}}
function stopAuto(value){try{if(value)localStorage.setItem('studyflow-signed-out','true');else localStorage.removeItem('studyflow-signed-out');}catch{}}
async function call(action,code){const user=auth.currentUser,controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const headers={'Content-Type':'application/json'};if(user)headers.Authorization='Bearer '+await user.getIdToken();const response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({action,...(code?{code}:{})}),cache:'no-store',signal:controller.signal});let result;try{result=await response.json();}catch{throw Error('Não foi possível conectar agora. Tente novamente.');}if(!response.ok){const error=new Error(result.error||'Não foi possível conectar.');error.status=response.status;throw error;}return result;}catch(error){if(error.name==='AbortError')throw Error('A conexão demorou. Confira a internet e tente novamente.');throw error;}finally{clearTimeout(timeout);}}
export async function availability(){if(!statusPromise)statusPromise=(async()=>{try{const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)return false;const result=await response.json();codeAvailable=result.available===true;emit();return codeAvailable;}catch{return false;}})();return statusPromise;}
async function exclusive(fn){if(operation)await operation.catch(()=>{});const task=fn();operation=task;try{return await task;}finally{if(operation===task)operation=null;}}
async function connect(result){if(result.code)saveCode(result.uid,result.code);localStorage.setItem('studyflow-code-session',JSON.stringify({uid:result.uid,token:result.token,expires:Date.now()+29*86400000}));codeUser=restoreSession();stopAuto(false);notifyAuth();return {user:codeUser,code:result.code,stored:!!savedCode(result.uid)};}
export function createAccount(){return exclusive(async()=>{if(!await availability())throw Error('O acesso por código ainda está em preparação.');return connect(await call('create'));});}
export function loginCode(code){return exclusive(async()=>{if(!await availability())throw Error('O acesso por código ainda está em preparação.');return connect(await call('login',code));});}
export async function linkedCode(){if(!auth.currentUser||!await availability())return false;return Boolean((await call('status')).linked);}
export function rotateCode(){return exclusive(async()=>{if(!auth.currentUser)throw Error('Abra sua conta antes de gerar um novo código.');const result=await call('rotate');const stored=saveCode(result.uid,result.code);emit();return {...result,stored};});}
export async function leaveAccount(){stopAuto(true);localStorage.removeItem('studyflow-code-session');codeUser=null;await signOut(firebaseAuth);legacy=null;notifyAuth();}
firebaseWatch(firebaseAuth,user=>{legacy=user;initialized=true;window.studyAuthProvider=codeUser?'code':user?'google.com':null;notifyAuth();if(auth.currentUser||stopped())return;availability().then(async available=>{if(!available||auth.currentUser||stopped())return;try{let last='';try{last=localStorage.getItem('studyflow-last-code-account')||'';}catch{}const code=savedCode(last);if(code)await loginCode(code);else await createAccount();}catch(error){document.dispatchEvent(new CustomEvent('studyidentityerror',{detail:{message:error.message}}));}});});
window.addEventListener('storage',e=>{if(e.key==='studyflow-code-session'||e.key==='studyflow-signed-out'){codeUser=restoreSession();notifyAuth();}});
availability();
