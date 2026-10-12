import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
const app=initializeApp({apiKey:'AIzaSyAUcyfIrmue8JDpcNNjkT8QViLB5bnuawY',authDomain:'studyflow-788a2.firebaseapp.com',projectId:'studyflow-788a2'});
const auth=getAuth(app);
const oldAvatar=document.querySelector('.avatar');
const button=document.createElement('button');
button.className='avatar';button.type='button';button.textContent='?';
button.setAttribute('aria-label','Abrir minha conta');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','accountPopover');
oldAvatar?.replaceWith(button);
const panel=document.createElement('div');panel.id='accountPopover';panel.hidden=true;
panel.style.cssText='position:absolute;right:0;top:46px;z-index:1000;background:white;color:#293249;border:1px solid #d8dcec;border-radius:16px;padding:18px;box-shadow:0 10px 32px #29324922;max-width:min(300px,80vw);overflow-wrap:anywhere';
const heading=document.createElement('strong');heading.textContent='Minha conta';
const email=document.createElement('p');email.textContent='Carregando conta…';
const link=document.createElement('a');link.href='conta.html';link.textContent='Acessar minha conta';
panel.append(heading,email,link);
button.parentElement.style.position='relative';button.parentElement.append(panel);
button.style.cssText='border:0;cursor:pointer;font:inherit;font-weight:700;flex-shrink:0';
function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');}
button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));};
document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!button.contains(event.target))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){close();button.focus();}});
const badge=document.createElement('span');badge.className='plan-badge';badge.style.cssText='display:inline-block;font:600 12px system-ui;padding:5px 9px;margin-left:10px;border-radius:20px;background:#eeebfa;color:#514475;vertical-align:middle;letter-spacing:0;-webkit-text-fill-color:#514475';badge.textContent='Entrar com Google';
document.querySelector('.logo')?.append(badge);
onAuthStateChanged(auth,user=>{
 button.textContent=user?(user.displayName||user.email||'?').trim().charAt(0).toUpperCase():'?';
 email.textContent=user?.email||'Você ainda não entrou com Google.';
 link.textContent=user?'Gerenciar minha conta':'Entrar com Google';
 refreshBadge();
});


function refreshBadge(){const state=window.studyAccess;badge.textContent=state?.ready?state.plan:auth.currentUser?'Carregando…':'Entrar com Google';}
document.addEventListener('studyaccesschange',refreshBadge);refreshBadge();
const logo=document.querySelector('#siteContent .logo');if(logo){logo.replaceChildren();const icon=document.createElement('span');icon.className='brand-icon';icon.textContent='S';icon.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='brand-name';name.textContent='StudyFlow';logo.append(icon,name,badge);}
const planLink=document.createElement('a');planLink.className='dash-card';planLink.href='plano.html';planLink.textContent='Planos e benefícios';document.getElementById('dashboard')?.prepend(planLink);

for(const card of document.querySelectorAll('.dash-card')){if(card.textContent.includes('Caderno Inteligente'))card.onclick=()=>{location.href='caderno.html';};}


import('./study-personalize.js?v=contrast-20261012').catch(()=>{console.warn('Personalizações temporariamente indisponíveis.');});
