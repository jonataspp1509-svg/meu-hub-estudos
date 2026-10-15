import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from './code-account.js?v=free20261014';
const app=initializeApp({apiKey:'AIzaSyAUcyfIrmue8JDpcNNjkT8QViLB5bnuawY',authDomain:'studyflow-788a2.firebaseapp.com',projectId:'studyflow-788a2'});
const auth=getAuth(app);
const oldAvatar=document.querySelector('.avatar');
const button=document.createElement('button');
button.className='avatar';button.type='button';button.textContent='?';
button.setAttribute('aria-label','Abrir minha conta');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','accountPopover');
oldAvatar?.replaceWith(button);
const panel=document.createElement('div');panel.id='accountPopover';panel.hidden=true;
panel.style.cssText='position:fixed;z-index:10000;background:white;color:#293249;border:1px solid #d8dcec;border-radius:16px;padding:18px;box-shadow:0 10px 32px #29324922;max-width:min(300px,80vw);overflow-wrap:anywhere';
const heading=document.createElement('strong');heading.textContent='Minha conta';
const email=document.createElement('p');email.textContent='Carregando conta…';
const link=document.createElement('a');link.href='conta.html';link.textContent='Acessar minha conta';
panel.append(heading,email,link);
document.body.append(panel);
button.style.cssText='border:0;cursor:pointer;font:inherit;font-weight:700;flex-shrink:0';
function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');}
function positionPanel(){
 const anchor=button.getBoundingClientRect(),width=panel.getBoundingClientRect().width,height=panel.getBoundingClientRect().height;
 panel.style.left=Math.max(12,Math.min(anchor.right-width,window.innerWidth-width-12))+'px';
 panel.style.top=Math.max(12,Math.min(anchor.bottom+10,window.innerHeight-height-12))+'px';
}
button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)positionPanel();};
window.addEventListener('resize',()=>{if(!panel.hidden)positionPanel();});
window.addEventListener('scroll',close,{passive:true});
document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!button.contains(event.target))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){close();button.focus();}});
const badge=document.createElement('span');badge.className='plan-badge';badge.style.cssText='display:inline-block;font:600 12px system-ui;padding:5px 9px;margin-left:10px;border-radius:20px;background:#eeebfa;color:#514475;vertical-align:middle;letter-spacing:0;-webkit-text-fill-color:#514475';badge.textContent='Conectar minha conta';

onAuthStateChanged(auth,user=>{
 button.textContent=user?(user.displayName||user.email||'?').trim().charAt(0).toUpperCase():'?';
 email.textContent=user?.email||'Conecte sua conta para guardar seus estudos.';
 link.textContent=user?'Gerenciar minha conta':'Conectar minha conta';
 refreshBadge();
});


function refreshBadge(){const state=window.studyAccess;badge.textContent=state?.ready?state.plan:auth.currentUser?'Carregando…':'Conectar minha conta';}
document.addEventListener('studyaccesschange',refreshBadge);refreshBadge();
const logo=document.querySelector('#siteContent .logo');if(logo){logo.replaceChildren();const icon=document.createElement('span');icon.className='brand-icon';icon.textContent='S';icon.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='brand-name';name.textContent='StudyFlow';logo.append(icon,name);}


for(const card of document.querySelectorAll('.dash-card')){if(card.textContent.includes('Caderno Inteligente'))card.onclick=()=>{location.href='caderno.html';};}


import('./study-personalize.js?v=together20261015').catch(()=>{console.warn('Personalizações temporariamente indisponíveis.');});
