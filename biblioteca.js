// Biblioteca: presentation only; original paths and features remain intact.
const portugueseTitles={quimicas:'químicas',quimico:'químico',quimicos:'químicos',fisicas:'físicas',fisico:'físico',fisicos:'físicos',historica:'histórica',historico:'histórico',historicas:'históricas',historicos:'históricos',organicas:'orgânicas',organicos:'orgânicos',inorganicas:'inorgânicas',inorganicos:'inorgânicos',eletricas:'elétricas',eletricos:'elétricos',eletrons:'elétrons',atomos:'átomos',atomo:'átomo',moleculas:'moléculas',molecula:'molécula',ion:'íon',ions:'íons',ligacoes:'ligações',ligacao:'ligação',geografico:'geográfico',geografica:'geográfica',portugues:'português',ingles:'inglês',redacao:'redação',educacao:'educação',literaria:'literária',analise:'análise',analises:'análises',interpretacao:'interpretação',gramatica:'gramática',gramatical:'gramatical',acentuacao:'acentuação',linguistica:'linguística',linguisticos:'linguísticos',linguistico:'linguístico',questao:'questão',questoes:'questões',reacoes:'reações',reacao:'reação',solucoes:'soluções',solucao:'solução',equacoes:'equações',equacao:'equação',republica:'república',revolucao:'revolução',revolucoes:'revoluções',independencia:'independência',eletrica:'elétrica',eletrico:'elétrico',magnetico:'magnético',mecanica:'mecânica',dinamica:'dinâmica',termica:'térmica',organica:'orgânica',inorganica:'inorgânica',geometria:'geometria',logaritmica:'logarítmica',logaritmo:'logaritmo',estatistica:'estatística',conjuncao:'conjunção',conjuncoes:'conjunções',subordinacao:'subordinação',coordenacao:'coordenação',resolucao:'resolução',cinematica:'cinemática',fisica:'física',matematica:'matemática',quimica:'química',historia:'história',geografia:'geografia',introducao:'introdução',funcoes:'funções',funcao:'função',celulas:'células',celula:'célula',exercicios:'exercícios',exercicio:'exercício',graficos:'gráficos',grafico:'gráfico',uniforme:'uniforme',formacao:'formação',serie:'série',periodo:'período',revisao:'revisão',avaliacao:'avaliação',recuperacao:'recuperação',acidos:'ácidos',optica:'óptica',trigonometria:'trigonometria',hidrostatica:'hidrostática',biotica:'biótica',genetica:'genética',proteinas:'proteínas',nucleicos:'nucleicos',sintese:'síntese',anotacoes:'anotações',probabilidade:'probabilidade',conteudo:'conteúdo',conteudos:'conteúdos',tecnica:'técnica',tecnicas:'técnicas',tecnico:'técnico',agua:'água',comunicacao:'comunicação',industrializacao:'industrialização',populacao:'população',brasil:'Brasil'};
function accentTitle(value){return value.replace(/[A-Za-z]+/g,word=>{const fixed=portugueseTitles[word.toLowerCase()];return !fixed?word:word===word.toUpperCase()?fixed.toLocaleUpperCase('pt-BR'):word[0]===word[0].toUpperCase()?fixed[0].toUpperCase()+fixed.slice(1):fixed;});}
function materialTitle(name,path=''){const key=decodeURIComponent(path).replace(/^.*?Estudos\//,'').replace(/^\//,'');const original=window.studyMaterialTitles?.[key];if(original)return accentTitle(original.replace(/\.(pdf|docx?|pptx?|xlsx?)$/i,''));return name.replace(/(?:_[0-9a-f]{12})+(?=\.[^.]+$)/ig,'').replace(/\.[^.]+$/,'').replace(/_/g,' ').replace(/\s+/g,' ').trim().replace(/[A-Za-z]+/g,word=>{const fixed=portugueseTitles[word.toLowerCase()];return !fixed?word:word===word.toUpperCase()?fixed.toLocaleUpperCase('pt-BR'):word[0]===word[0].toUpperCase()?fixed[0].toUpperCase()+fixed.slice(1):fixed;});}
function folderTitle(name,path){const teacher=window.studyTeachers?.[path];if(teacher)return path.split('/').length===2?teacher.subject.split(' · ')[0]:teacher.name+' — '+teacher.subject;return /^[1-4]p$/i.test(name)?name[0]+'º período':name==='3AnoM'?'3º ano':name==='2AnoM'?'2º ano':name==='1AnoM'?'1º ano':name==='novos'?'Outros materiais':name==='debora'?'Débora':accentTitle(name.replaceAll('_',' '));}
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
      label.textContent=materialTitle(name,url.pathname);item.title=label.textContent;
      const ext=name.split('.').pop().toLowerCase();
      let tag=item.querySelector('.format-tag');if(!tag){tag=document.createElement('small');tag.className='format-tag';item.append(tag);}
      tag.textContent={pdf:'PDF',doc:'Word',docx:'Word',ppt:'Slides',pptx:'Slides',xls:'Excel',xlsx:'Excel',jpg:'Imagem',jpeg:'Imagem',png:'Imagem',gif:'Imagem',webp:'Imagem',mp4:'Vídeo'}[ext]||ext.toUpperCase();
    }else label.textContent=item.dataset.materialFile?materialTitle(item.dataset.materialFile.split('/').pop(),item.dataset.materialFile):folderTitle(label.textContent.trim(),[caminhoAtual,label.textContent.trim()].filter(Boolean).join('/'));
  });
  priorDecoration();
  list.querySelectorAll('a .material-glyph').forEach(glyph=>{const ext=new URL(glyph.parentElement.href).pathname.split('.').pop().toLowerCase();glyph.textContent=/ppt/.test(ext)?'▧':/doc/.test(ext)?'▤':/xls/.test(ext)?'▦':'▤';});
  document.querySelectorAll('#breadcrumb span').forEach((span,index)=>{const parts=caminhoAtual.split('/');span.textContent=folderTitle(index?parts[index-1]:span.textContent.trim(),index?parts.slice(0,index).join('/'):null);});
  if(!document.getElementById('pesquisaMateriais').value.trim()){const parts=caminhoAtual.split('/').filter(Boolean);document.getElementById('pastaAtualTexto').textContent='Pasta atual: '+(parts.length?parts.map((part,i)=>folderTitle(part,parts.slice(0,i+1).join('/'))).join(' / '):'Início');}
  const visible=arquivos.filter(p=>window.studyCanSee?.(p)===true);const total=document.getElementById('totalMateriais');total.textContent=visible.length.toLocaleString('pt-BR');const roots=new Set(visible.map(p=>p.split('/')[0]));document.getElementById('totalPastas').textContent=roots.size;
  const caption=total.parentElement.querySelector(':scope > :last-child');if(caption && caption!==total)caption.textContent='Materiais na biblioteca';
};
const nav=document.getElementById('dashboard');
const extra=document.createElement('details');extra.className='extra-tools';
const summary=document.createElement('summary');summary.textContent='Mais ferramentas';extra.append(summary);
Array.from(nav.querySelectorAll('.dash-card')).forEach(button=>{if(/Calculadora|Boletim|Desafios/.test(button.textContent))extra.append(button);});if(extra.querySelector('.dash-card'))nav.append(extra);
Array.from(nav.querySelectorAll('.dash-card')).filter(b=>/Foco|Caderno/.test(b.textContent)).reverse().forEach(b=>{b.classList.add('study-primary');if(/Caderno/.test(b.textContent))b.setAttribute('onclick',"window.location.href='caderno.html'");nav.insertBefore(b,nav.children[1]);});
const hero=document.querySelector('.study-hero');hero.querySelector('h1').textContent='O que vamos estudar hoje?';
const library=document.getElementById('materiais');
const status=document.createElement('p');status.className='sync-status';status.textContent='Carregando última verificação…';library.prepend(status);
let recentRequest=0;function loadRecent(){const request=++recentRequest;document.querySelectorAll('.recent-materials').forEach(n=>n.remove());fetch('biblioteca-status.json?v='+Date.now()).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{
 if(request!==recentRequest)return;
 status.textContent='Última verificação: '+new Date(data.checked_at).toLocaleString('pt-BR')+' · '+data.failures+' pendência(s). A verificação não garante que todos os materiais já estejam sincronizados.';
 if(!data.recent?.length)return;
 const section=document.createElement('section');section.className='recent-materials';
 const title=document.createElement('h3');title.textContent='Adicionados recentemente';section.append(title);
 data.recent.filter(entry=>window.studyCanSee?.(entry.path)===true).slice(0,6).forEach(entry=>{const a=document.createElement('a');a.href=BASE+'Estudos/'+caminhoSeguro(entry.path);a.target='_blank';a.rel='noopener';a.textContent=materialTitle(entry.path.split('/').pop(),entry.path);const small=document.createElement('small');small.textContent=entry.path.split('/').slice(0,-1).map(folderTitle).join(' / ');a.append(small);section.append(a);});
 library.insertBefore(section,status.nextSibling);
}).catch(()=>status.textContent='A data da última verificação ainda não está disponível.');
}
let lastRecentScope='';document.addEventListener('studyaccesschange',()=>{const s=window.studyAccess;const scope=[s?.uid,s?.ready,s?.grade,s?.paid].join(':');if(scope!==lastRecentScope){lastRecentScope=scope;loadRecent();}});
loadRecent();renderMateriais();


const accountLink=document.createElement('a');accountLink.className='dash-card';accountLink.href='conta.html';accountLink.textContent='Minha conta';nav.prepend(accountLink);

const creatorCredit=document.createElement('footer');creatorCredit.className='site-footer creator-credit';creatorCredit.append(document.createTextNode('StudyFlow · Criado por Jonatas. '));const contact=document.createElement('a');contact.href='mailto:jonataspp1509@gmail.com';contact.textContent='Dúvidas: jonataspp1509@gmail.com';contact.style.cssText='color:inherit;overflow-wrap:anywhere;text-decoration:underline';creatorCredit.append(contact);document.getElementById('siteContent')?.append(creatorCredit);
