// Apresentação e busca; os recursos originais continuam no index.html.
document.querySelectorAll('#dashboard .dash-card').forEach((card,index)=>{
  const icons=['▣','⌗','▤','◇','◷','▱','◎','▦','◉','▧','↓'];
  const label=card.textContent.trim().replace(/^[^\p{L}]+/u,'');
  card.textContent='';
  const icon=document.createElement('span'); icon.className='nav-symbol'; icon.textContent=icons[index]||'·'; icon.setAttribute('aria-hidden','true');
  const text=document.createElement('span'); text.textContent=label;
  card.append(icon,text);
  if(card.tagName!=='BUTTON'){card.setAttribute('role','button');card.tabIndex=0;card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});}
});
const originalRenderMateriais=renderMateriais;
const search=document.getElementById('pesquisaMateriais');
function decorateRows(){
  document.querySelectorAll('#lista .item').forEach(item=>{
    const label=item.querySelector('span:not(.material-glyph)');
    if(label?.textContent.trim()==='debora')label.textContent='Débora';
    if(item.querySelector('.material-glyph'))return;
    Array.from(item.childNodes).filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>node.remove());
    const glyph=document.createElement('span');glyph.className='material-glyph'+(item.tagName==='A'?' pdf':'');glyph.textContent=item.tagName==='A'?'▤':'▱';glyph.setAttribute('aria-hidden','true');item.prepend(glyph);
  });
}
renderMateriais=function(){
  const query=(search.value||'').trim().toLocaleLowerCase('pt-BR');
  document.getElementById('totalMateriais').textContent=arquivos.filter(path=>path.toLowerCase().endsWith('.pdf')).length.toLocaleString('pt-BR');
  document.getElementById('totalPastas').textContent=new Set(arquivos.map(path=>path.split('/')[0])).size;
  if(!query){originalRenderMateriais();decorateRows();return;}
  const list=document.getElementById('lista');list.replaceChildren();
  document.getElementById('pastaAtualTexto').textContent='Resultados em todas as pastas';
  document.getElementById('breadcrumb').textContent='Busca por: '+search.value;
  const matches=arquivos.filter(path=>path.toLocaleLowerCase('pt-BR').includes(query));
  matches.forEach(path=>{
    const anchor=document.createElement('a');anchor.className='item';anchor.href=BASE+'Estudos/'+caminhoSeguro(path);anchor.target='_blank';anchor.rel='noopener';
    const text=document.createElement('span');text.textContent=path.split('/').pop();anchor.title=path;anchor.append(text);list.append(anchor);
  });
  if(!matches.length){const empty=document.createElement('div');empty.className='empty-state';empty.textContent='Nenhum material encontrado. Tente outra palavra.';list.append(empty);}
  decorateRows();
};
search.addEventListener('input',renderMateriais);
document.querySelector('#dashboard .dash-card').addEventListener('click',()=>{search.value='';renderMateriais();});
document.getElementById('dataHoje').textContent=new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
renderMateriais();

function abrirFerramenta(nome, botao){
  let secao=document.getElementById('ferramenta-'+nome);
  if(!secao){
    secao=document.createElement('section');secao.id='ferramenta-'+nome;secao.className='section panel tool-panel';
    const frame=document.createElement('iframe');frame.src=nome+'.html?integrado=1&v=5';
    frame.title={flashcards:'Flashcards',metas:'Metas',calendario:'Calendário'}[nome];
    frame.className='tool-frame';secao.append(frame);document.getElementById('siteContent').append(secao);
  }
  abrirSecao(secao.id,botao);
  document.querySelector('.study-hero').style.display='none';
  document.querySelector('.summary-strip').style.display='none';
}
document.querySelectorAll('#dashboard .dash-card').forEach(botao=>botao.addEventListener('click',()=>{
  if(!botao.getAttribute('onclick')?.includes('abrirFerramenta')){
    document.querySelector('.study-hero').style.display='';document.querySelector('.summary-strip').style.display='';
  }
}));
