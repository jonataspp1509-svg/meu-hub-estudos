import {createMusic} from './study-music.js?v=community-news20261015';
import {imageStore} from './personal-image-store.js?v=2';
import {session,subscribe} from './study-session.js?v=focus-exit-fix20261015';
import {PRODUCTS,owned,shopReady,subscribeShop} from './study-shop.js?v=focus-exit-fix20261015';
export function diamond(){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','diamond-icon');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path d="M6 3h12l5 6-11 13L1 9z" fill="#8878e8"/><path d="M6 3h12l-6 6z" fill="#d8d0ff"/><path d="m1 9 11 13V9z" fill="#aea0fa"/><path d="M18 3 23 9H12z" fill="#6450cf"/>';return svg;}
let galleryURLs=[],galleryGeneration=0;
let uid=null,prefs={theme:'default',sound:'none',volume:25},generation=0,imageURL=null,audio=null,audioNodes=[],audioMaster=null,musicPlayer=null,previewTimer=null,playing=false,menuButton=null;
const dialog=document.createElement('dialog');dialog.className='customize-dialog';dialog.setAttribute('aria-labelledby','customizeTitle');dialog.innerHTML='<div class="tools-row"><h2 id="customizeTitle">Seu espaço, do seu jeito</h2><button type="button" id="customizeClose">Fechar ✕</button></div><p>O site é gratuito. Fundos básicos e sons ambientes estão liberados. Troque diamantes do foco por fundos em degradê e novas músicas.</p><h3>Fundo do site</h3><div class="customize-options" id="themeOptions"></div><h3>Imagem do seu computador</h3><p id="imageAccess"></p><label class="custom-image-upload" for="customImage">＋ Adicionar imagens</label><input id="customImage" type="file" accept="image/jpeg,image/png,image/webp" multiple><div class="summary-actions"><button id="equipImage" type="button">Usar minha imagem</button><button id="removeImage" type="button">Remover imagem salva</button></div><p class="tools-hint">Sua biblioteca é privada e fica neste navegador, separada por conta. JPG, PNG ou WebP de até 8 MB cada.</p><h3>Minha biblioteca de fundos</h3><p id="imageLibraryStatus" role="status"></p><div id="imageLibrary" class="custom-image-library"></div><h3>Músicas e sons</h3><div class="customize-options" id="soundOptions"></div><div class="customize-volume"><label for="customVolume">Volume</label><input id="customVolume" type="range" min="0" max="70" value="25"><span id="customVolumeLabel">25%</span></div><p>O áudio só começa quando você clicar em “Ativar som”. Use o botão para pausar quando quiser. Ao sair da página, o áudio para.</p><p id="customizeStatus" role="status"></p><a href="diamantes.html">Ver diamantes e personalizações →</a>';document.body.append(dialog);
const $=id=>dialog.querySelector('#'+id),status=text=>{$('customizeStatus').textContent=text;};
function readPrefs(){try{return {...prefs,...JSON.parse(localStorage.getItem('studyflow-style:'+uid)||'{}')};}catch{return {theme:'default',sound:'none',volume:25};}}
function save(){if(!uid)return;try{localStorage.setItem('studyflow-style:'+uid,JSON.stringify(prefs));}catch{status('Não consegui guardar a preferência neste navegador.');}}
const personalCSS=document.createElement('link');personalCSS.rel='stylesheet';personalCSS.href=new URL('./personalize.css?v=audio-header20261018',import.meta.url).href;document.head.append(personalCSS);const shellCSS=document.createElement('link');shellCSS.rel='stylesheet';shellCSS.href=new URL('./responsive-shell.css?v=uniform-credits-20261012',import.meta.url).href;document.head.append(shellCSS);
const root=document.documentElement;
if(window.parent!==window)root.dataset.personalEmbedded='true';
async function apply(){
 const stamp=++generation;
 const reset=()=>{delete root.dataset.personalized;delete root.dataset.personalTone;root.style.removeProperty('--personal-background');if(imageURL){URL.revokeObjectURL(imageURL);imageURL=null;}};
 if(!uid||!session.ready){reset();return;}
 const theme=PRODUCTS.find(p=>p.id===prefs.theme&&p.kind==='theme');
 if(theme&&owned.has(theme.id)){reset();root.style.setProperty('--personal-background',theme.color);root.dataset.personalized='color';root.dataset.personalTone=theme.tone||'light';return;}
 if(prefs.theme!=='image'||!session.paid){reset();return;}
 try{
  const owner=uid,items=await imageStore('list',owner);
  if(stamp!==generation||owner!==uid)return;
  const item=items.find(i=>i.id===(prefs.imageId||'legacy'));
  if(!item){reset();return;}
  const nextURL=URL.createObjectURL(item.blob),oldURL=imageURL;imageURL=nextURL;
  root.style.setProperty('--personal-background','url("'+imageURL+'")');root.dataset.personalized='image';root.dataset.personalTone=item.tone||'light';
  if(oldURL)URL.revokeObjectURL(oldURL);
 }catch{if(stamp===generation){reset();status('Não consegui carregar sua imagem salva.');}}
}
async function renderGallery(){
 const stamp=++galleryGeneration,owner=uid;
 if(!owner){$('imageLibrary').replaceChildren();return;}
 try{const items=await imageStore('list',owner);if(stamp!==galleryGeneration||owner!==uid)return;
  galleryURLs.forEach(url=>URL.revokeObjectURL(url));galleryURLs=[];$('imageLibrary').replaceChildren();
  $('imageLibraryStatus').textContent=items.length?items.length+' imagem(ns) salva(s). Clique para usar.':'Adicione uma imagem: ela aparecerá aqui e será aplicada imediatamente.';
  for(const item of items){
   const button=document.createElement('button');button.type='button';button.className='custom-image-tile';button.disabled=!session.paid;
   button.setAttribute('aria-label','Usar '+item.name);button.setAttribute('aria-pressed',String(prefs.theme==='image'&&(prefs.imageId||'legacy')===item.id));
   const img=document.createElement('img');img.src=URL.createObjectURL(item.blob);galleryURLs.push(img.src);img.alt='';
   const label=document.createElement('span');label.textContent=item.name;button.append(img,label);
   button.onclick=async()=>{if(uid!==owner||!session.paid)return;prefs.theme='image';prefs.imageId=item.id;save();await apply();render();status('Imagem equipada em todo o StudyFlow.');};$('imageLibrary').append(button);
  }
 }catch(error){if(stamp===galleryGeneration)$('imageLibraryStatus').textContent=error.message||'Não consegui abrir sua biblioteca.';}
}
function stopAudio(){clearTimeout(previewTimer);musicPlayer?.stop();musicPlayer=null;audioNodes.forEach(n=>{try{n.stop?.();n.disconnect();}catch{}});audioNodes=[];audioMaster?.disconnect();audioMaster=null;playing=false;updateSoundButton();}
const soundButton=document.createElement('button');soundButton.type='button';soundButton.className='site-sound-button';soundButton.hidden=true;soundButton.style.cssText='position:static!important;inset:auto!important;z-index:auto!important;transform:none!important';
function updateSoundButton(){const available=PRODUCTS.some(p=>p.id===prefs.sound&&p.kind==='sound')&&owned.has(prefs.sound);soundButton.hidden=!uid||(!available&&!playing);soundButton.textContent=playing?'Pausar música':'Ativar música';soundButton.setAttribute('aria-pressed',String(playing));}
async function playAudio(){if(playing){stopAudio();return;}if(!owned.has(prefs.sound))return;const selected=prefs.sound,product=PRODUCTS.find(p=>p.id===selected);if(product?.music){await startMusic(product);return;}try{audio??=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();if(prefs.sound!==selected||document.hidden)return;const buffer=audio.createBuffer(1,audio.sampleRate*5,audio.sampleRate),data=buffer.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;brown=(brown+.02*white)/1.02;data[i]=selected==='sound-rain'?white*.28:brown*2.6;}const source=audio.createBufferSource(),filter=audio.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=selected==='sound-rain'?3200:selected==='sound-sea'?1000:500;audioMaster=audio.createGain();audioMaster.gain.value=prefs.volume/100*.35;source.connect(filter);filter.connect(audioMaster);audioMaster.connect(audio.destination);source.start();audioNodes.push(source,filter);if(selected==='sound-sea'){const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=.12;gain.gain.value=280;osc.connect(gain);gain.connect(filter.frequency);osc.start();audioNodes.push(osc,gain);}playing=true;updateSoundButton();status('Som ativo. Use o botão Pausar som quando quiser.');}catch{stopAudio();status('Não consegui iniciar o som. Clique novamente para tentar.');}}
async function startMusic(product,preview=false){stopAudio();try{audio??=new (window.AudioContext||window.webkitAudioContext)();await audio.resume();audioMaster=audio.createGain();audioMaster.gain.value=prefs.volume/100*2.2;audioMaster.connect(audio.destination);musicPlayer=createMusic(audio,audioMaster,product.music);playing=true;updateSoundButton();status((preview?'Prévia de 15 segundos: ':'Tocando: ')+product.name);if(preview)previewTimer=setTimeout(stopAudio,15000);}catch{stopAudio();status('Não consegui tocar a música. Tente novamente.');}}
export async function previewMusic(id){const product=PRODUCTS.find(p=>p.id===id&&p.music);if(product)await startMusic(product,true);}
soundButton.onclick=()=>{if(playing)stopAudio();else playAudio();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});window.addEventListener('pagehide',stopAudio);
function options(container,kind){container.replaceChildren();const base=document.createElement('button');base.type='button';base.textContent=kind==='theme'?'StudyFlow original':'Sem som';base.setAttribute('aria-pressed',String(prefs[kind]===(kind==='theme'?'default':'none')));base.onclick=()=>equip(kind,kind==='theme'?'default':'none');container.append(base);for(const p of PRODUCTS.filter(p=>p.kind===kind)){const button=document.createElement('button');button.type='button';if(p.color){const swatch=document.createElement('span');swatch.className='customize-swatch';swatch.style.background=p.color;button.append(swatch);}const label=document.createElement('span');label.textContent=p.name+(owned.has(p.id)?'':p.exclusive?' · Prêmio do ranking':' · '+p.price+' ◇');button.append(label);button.disabled=(!!p.price||p.exclusive)&&(!shopReady||!owned.has(p.id));button.setAttribute('aria-pressed',String(prefs[kind]===p.id));button.onclick=()=>equip(kind,p.id);container.append(button);}}
function equip(kind,id){if(!uid)return;if(id!=='default'&&id!=='none'&&!owned.has(id))return;prefs[kind]=id;save();if(kind==='sound')stopAudio();apply();render();status('Preferência equipada neste navegador.');}
function render(){options($('themeOptions'),'theme');options($('soundOptions'),'sound');$('customImage').disabled=!uid||!session.ready||!session.paid;$('equipImage').disabled=!uid||!session.ready||!session.paid;$('removeImage').disabled=!uid;$('imageAccess').textContent=session.paid?'Você pode escolher uma imagem para o fundo do site.':'Conecte sua conta para guardar suas preferências.';$('customVolume').value=Number(prefs.volume)||0;$('customVolumeLabel').textContent=(Number(prefs.volume)||0)+'%';updateSoundButton();renderGallery();}
export function openCustomize(){if(!session.user){location.href='conta.html';return;}if(window.parent!==window){try{window.parent.document.dispatchEvent(new CustomEvent('studyflow:customize'));return;}catch{}}render();status('');if(!dialog.open)dialog.showModal();}
document.addEventListener('studyflow:customize',openCustomize);
$('customizeClose').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>menuButton?.focus());
$('customVolume').oninput=()=>{prefs.volume=Math.max(0,Math.min(70,Number($('customVolume').value)||0));$('customVolumeLabel').textContent=prefs.volume+'%';if(audioMaster)audioMaster.gain.setTargetAtTime(prefs.volume/100*(musicPlayer?2.2:.35),audio.currentTime,.05);save();};
$('customImage').onchange=async()=>{
 const files=Array.from($('customImage').files||[]),owner=uid;if(!files.length||!owner||!session.paid)return;
 $('customImage').disabled=true;let added=0;const errors=[];
 for(const file of files){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){errors.push(file.name+': use JPG, PNG ou WebP de até 8 MB.');continue;}
  try{
   const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas'),ratio=Math.min(1,1920/Math.max(bitmap.width,bitmap.height));
   canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const context=canvas.getContext('2d');context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   const sample=document.createElement('canvas');sample.width=32;sample.height=32;const ctx=sample.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,32,32);ctx.drawImage(canvas,0,0,32,32);const pixels=ctx.getImageData(0,0,32,32).data;
   let brightness=0;for(let i=0;i<pixels.length;i+=4)brightness+=(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])/255;
   const tone=brightness/1024<.48?'dark':'light',blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));
   if(!blob)throw Error('Não consegui processar '+file.name);if(uid!==owner||!session.paid)break;
   const id=crypto.randomUUID();await imageStore('put',{uid:owner,id,name:file.name,blob,tone});
   if(uid!==owner||!session.paid)break;prefs.theme='image';prefs.imageId=id;save();added++;await apply();render();
  }catch(error){errors.push(error.message||'Não consegui abrir '+file.name);}
 }
 if(uid===owner){render();status((added?added+' imagem(ns) salva(s). Fundo aplicado em todo o site. ':'')+errors.join(' '));}$('customImage').value='';
};
$('equipImage').onclick=async()=>{const owner=uid;if(!owner||!session.paid)return;try{const items=await imageStore('list',owner);if(uid!==owner||!session.paid)return;const item=items.find(i=>i.id===(prefs.imageId||'legacy'))||items.at(-1);if(!item){status('Adicione primeiro uma imagem do computador.');return;}prefs.theme='image';prefs.imageId=item.id;save();await apply();render();status('Imagem equipada.');}catch{status('Não consegui carregar a imagem.');}};
$('removeImage').onclick=async()=>{const owner=uid,id=prefs.imageId||'legacy';if(!owner)return;try{await imageStore('delete',{uid:owner,id});if(uid!==owner)return;if(prefs.theme==='image')prefs.theme='default';delete prefs.imageId;save();await apply();render();status('Imagem selecionada removida da biblioteca local.');}catch{status('Não consegui remover a imagem salva.');}};
window.addEventListener('storage',event=>{if(uid&&event.key==='studyflow-style:'+uid){prefs=readPrefs();apply();render();}});
const mount=()=>{const host=document.querySelector('.workspace-actions')||document.querySelector('.tools-nav-links')||document.querySelector('.topbar .top-actions')||document.querySelector('.prog-header')||document.querySelector('.tools-nav')||document.querySelector('main>header')||document.querySelector('body>header')||document.querySelector('.top');if(host){const pill=document.createElement('a');pill.className='site-diamond-pill';pill.href='diamantes.html';pill.setAttribute('aria-label','Diamantes: carregando');const amount=document.createElement('span');amount.textContent='—';pill.append(amount,diamond());host.prepend(pill);host.append(soundButton);if(!document.getElementById('accountPopover')){menuButton=document.createElement('button');menuButton.type='button';menuButton.className='personalize-open';menuButton.textContent='Personalizar';menuButton.onclick=openCustomize;host.append(menuButton);}subscribe(s=>{amount.textContent=s.testing?'∞':s.wallet?String(s.wallet.balance):s.user?'—':'0';pill.setAttribute('aria-label',s.wallet?s.wallet.balance+' diamantes · abrir loja':'Diamantes · minha conta');});}
 const panel=document.getElementById('accountPopover');if(panel){menuButton=document.createElement('button');menuButton.type='button';menuButton.className='customize-profile-button';menuButton.textContent='Personalizar meu site';menuButton.onclick=()=>{panel.hidden=true;document.querySelector('.avatar')?.setAttribute('aria-expanded','false');openCustomize();};panel.append(menuButton);}document.querySelectorAll('[data-customize]').forEach(button=>{button.onclick=openCustomize;});};
mount();subscribe(s=>{const next=s.user?.uid||null;if(next!==uid){uid=next;stopAudio();galleryGeneration++;galleryURLs.forEach(url=>URL.revokeObjectURL(url));galleryURLs=[];prefs={theme:'default',sound:'none',volume:25};if(uid)prefs=readPrefs();prefs.volume=Math.max(0,Math.min(70,Number(prefs.volume)||0));dialog.close();}apply();render();});subscribeShop(()=>{apply();render();if(!owned.has(prefs.sound))stopAudio();});
