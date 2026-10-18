// Keep each tab's place when a mobile browser unloads it in the background.
(()=>{
const key='studyflow-reading-position-v1',search=document.getElementById('pesquisaMateriais');
if(!search||typeof renderMateriais!=='function')return;
let saved=null,restored=false,timer;
try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
if(!saved||typeof saved.path!=='string')restored=true;
function save(){if(!restored)return;try{sessionStorage.setItem(key,JSON.stringify({path:caminhoAtual,query:search.value.slice(0,250),scroll:window.scrollY,media:window.studyReadingState?.()||null}));}catch{}}
function restore(){if(restored||!arquivos.length)return;restored=true;const path=saved.path;
caminhoAtual=path&&arquivos.some(p=>p.startsWith(path+'/'))&&window.studyCanSee?.(path+'/')?path:'';
search.value=typeof saved.query==='string'?saved.query.slice(0,250):'';
history.replaceState({...history.state,libraryPath:caminhoAtual},'');
renderMateriais();
requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo(0,Math.max(0,Number(saved.scroll)||0));window.studyResumeMaterial?.(saved.media);}));
}
const render=renderMateriais;renderMateriais=function(...args){const result=render.apply(this,args);restore();return result;};
window.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(save,180);},{passive:true});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
document.addEventListener('studyaccesschange',restore);
window.addEventListener('load',restore,{once:true});
restore();
})();
