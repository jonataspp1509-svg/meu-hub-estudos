import {academyEntry} from './aurora-entry-policy.js?v=free20261014';
function update(){
  const entry=academyEntry(window.studyAccess),nav=document.getElementById('auroraNav'),link=document.getElementById('auroraEntryLink'),status=document.getElementById('auroraEntryStatus');
  if(nav){nav.href=entry.href;nav.dataset.locked=String(!entry.available);nav.title='Abrir Fazenda Aurora · gratuito';nav.setAttribute('aria-label','Programação · Fazenda Aurora — '+entry.status);}
  if(link){link.href=entry.href;if(link.textContent!==entry.label)link.textContent=entry.label;}
  if(status&&status.textContent!==entry.status)status.textContent=entry.status;
}
document.addEventListener('studyaccesschange',update);
update();
