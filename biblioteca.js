// Biblioteca: presentation only; original paths and features remain intact.
function materialTitle(name){return name.replace(/(?:_[0-9a-f]{12})+(?=\.[^.]+$)/ig,'').replace(/\.[^.]+$/,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();}
function folderTitle(name){return /^[1-4]p$/i.test(name)?name[0]+'º período':name==='2AnoM'?'2º ano':name==='1AnoM'?'1º ano':name==='novos'?'Outros materiais':name==='debora'?'Débora':name;}
const priorDecoration=decorateRows;
decorateRows=function(){
  const list=document.getElementById('lista');
  list.querySelectorAll('.item').forEach(item=>{
    if(item.tagName!=='A' && !item.querySelector('span')){
      item.className='empty-state';item.textContent='Nenhum material sincronizado ainda.';return;
    }
    const label=item.querySelector('span:not(.material-glyph):not(.format-tag)');
    if(!label)return;
    if(item.tagName==='A'){
      const url=new URL(item.href);const name=decodeURIComponent(url.pathname.split('/').pop());
      label.textContent=materialTitle(name);item.title=name;
      const ext=name.split('.').pop().toLowerCase();
      let tag=item.querySelector('.format-tag');if(!tag){tag=document.createElement('small');tag.className='format-tag';item.append(tag);}
      tag.textContent={pdf:'PDF',doc:'Word',docx:'Word',ppt:'Slides',pptx:'Slides',xls:'Excel',xlsx:'Excel'}[ext]||ext.toUpperCase();
    }else label.textContent=folderTitle(label.textContent.trim());
  });
  priorDecoration();
  list.querySelectorAll('a .material-glyph').forEach(glyph=>{const ext=new URL(glyph.parentElement.href).pathname.split('.').pop().toLowerCase();glyph.textContent=/ppt/.test(ext)?'▧':/doc/.test(ext)?'▤':/xls/.test(ext)?'▦':'▤';});
  document.querySelectorAll('#breadcrumb span').forEach(span=>span.textContent=folderTitle(span.textContent.trim()));
  const total=document.getElementById('totalMateriais');total.textContent=arquivos.length.toLocaleString('pt-BR');
  const caption=total.parentElement.querySelector(':scope > :last-child');if(caption && caption!==total)caption.textContent='Materiais na biblioteca';
};
const nav=document.getElementById('dashboard');
const extra=document.createElement('details');extra.className='extra-tools';
const summary=document.createElement('summary');summary.textContent='Mais ferramentas';extra.append(summary);
Array.from(nav.querySelectorAll('.dash-card')).forEach(button=>{if(/Calculadora|Boletim|Desafios|Foco|Caderno/.test(button.textContent))extra.append(button);});nav.append(extra);
const hero=document.querySelector('.study-hero');hero.querySelector('h1').textContent='O que vamos estudar hoje?';
const library=document.getElementById('materiais');
const status=document.createElement('p');status.className='sync-status';status.textContent='Carregando última verificação…';library.prepend(status);
fetch('biblioteca-status.json?v='+Date.now()).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{
 status.textContent='Última verificação: '+new Date(data.checked_at).toLocaleString('pt-BR')+' · '+data.failures+' pendência(s). A verificação não garante que todos os materiais já estejam sincronizados.';
 if(!data.recent?.length)return;
 const section=document.createElement('section');section.className='recent-materials';
 const title=document.createElement('h3');title.textContent='Adicionados recentemente';section.append(title);
 data.recent.slice(0,6).forEach(entry=>{const a=document.createElement('a');a.href=BASE+'Estudos/'+caminhoSeguro(entry.path);a.target='_blank';a.rel='noopener';a.textContent=materialTitle(entry.path.split('/').pop());const small=document.createElement('small');small.textContent=entry.path.split('/').slice(0,-1).map(folderTitle).join(' / ');a.append(small);section.append(a);});
 library.insertBefore(section,status.nextSibling);
}).catch(()=>status.textContent='A data da última verificação ainda não está disponível.');
renderMateriais();

