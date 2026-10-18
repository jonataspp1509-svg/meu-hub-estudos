(()=>{
const key='studyflow-app-installed',standalone=matchMedia('(display-mode: standalone)'),minimal=matchMedia('(display-mode: minimal-ui)');
let remembered=false;try{remembered=localStorage.getItem(key)==='1';}catch{}
function remember(value){remembered=value;try{if(value)localStorage.setItem(key,'1');else localStorage.removeItem(key);}catch{}}
function update(){const app=standalone.matches||minimal.matches||navigator.standalone===true;if(app)remember(true);const installed=app||remembered;document.querySelectorAll('.design-install-button,#installBtn').forEach(button=>{button.hidden=installed;});if(installed)document.querySelector('.design-install-guide[open]')?.close();}
window.addEventListener('appinstalled',()=>{remember(true);update();});
window.addEventListener('beforeinstallprompt',()=>{remember(false);update();});
window.addEventListener('storage',event=>{if(event.key===key){remembered=event.newValue==='1';update();}});
standalone.addEventListener?.('change',update);minimal.addEventListener?.('change',update);
update();
})();
