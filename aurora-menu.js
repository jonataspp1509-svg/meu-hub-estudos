const sidebar=document.getElementById('sidebar'),toggle=document.getElementById('menuButton');
const close=()=>{sidebar.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
document.addEventListener('pointerdown',event=>{if(sidebar.classList.contains('open')&&!sidebar.contains(event.target)&&!toggle.contains(event.target))close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
