/* Attachment metadata stays in the note; local bytes stay in the existing account store. */
(() => {
  const list=document.getElementById('attachmentList');if(!list)return;
  const viewer=document.createElement('dialog');viewer.id='notebookAttachmentViewer';viewer.setAttribute('aria-label','Leitor de anexo');
  viewer.innerHTML='<header><div><span>ANEXO DO CADERNO</span><h2 id="attachmentViewerTitle"></h2></div><button type="button" data-close>✕ Fechar</button></header><div class="attachment-viewer-body"></div><footer><p role="status"></p><div><a data-origin target="_blank" rel="noopener noreferrer" hidden>Abrir na origem ↗</a><a data-download hidden>↓ Baixar arquivo</a></div></footer>';
  document.body.append(viewer);
  const body=viewer.querySelector('.attachment-viewer-body'),status=viewer.querySelector('footer p'),downloadLink=viewer.querySelector('[data-download]'),originLink=viewer.querySelector('[data-origin]');
  let generation=0,controller,objectURL=null,active=null,previousOverflow='';
  function cleanup(){
    generation++;controller?.abort();body.replaceChildren();
    if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;active=null;
    downloadLink.removeAttribute('href');downloadLink.hidden=true;originLink.hidden=true;
    document.body.style.overflow=previousOverflow;
  }
  viewer.querySelector('[data-close]').onclick=()=>viewer.close();viewer.addEventListener('close',()=>{if(!viewer.open)cleanup();});
  function kind(item){
    const name=String(item.name||'');let path='';try{if(item.url)path=new URL(item.url).pathname;}catch{}
    const ext=(path||name).split('.').pop().toLowerCase();
    if(item.type==='application/pdf'||ext==='pdf'||/\.pdf$/i.test(name))return 'PDF';
    if(/^image\/(jpeg|png|webp|gif)$/.test(item.type||'')||/^(jpe?g|png|webp|gif)$/.test(ext))return 'Imagem';
    return item.url?'Link':'Arquivo';
  }
  function ownerMatches(owner){return current?.id===owner.page&&(window.studioOwner||null)===owner.account;}
  function showMessage(message){const p=document.createElement('p');p.className='attachment-viewer-message';p.textContent=message;body.replaceChildren(p);status.textContent=message;}
  async function open(item,owner){
    if(!ownerMatches(owner))return;
    if(active||viewer.open){if(viewer.open)viewer.close();cleanup();}
    previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const version=++generation;controller=new AbortController();active={id:item.id,...owner};
    viewer.querySelector('h2').textContent=item.name||'Anexo';
    body.replaceChildren();downloadLink.hidden=true;originLink.hidden=true;
    status.textContent='Carregando anexo…';
    const loading=document.createElement('p');loading.className='attachment-viewer-message';loading.textContent='Abrindo seu arquivo…';body.append(loading);viewer.showModal();
    try{
      const type=kind(item);let blob;
      if(item.url){
        const url=new URL(item.url,document.baseURI);if(!['http:','https:'].includes(url.protocol))throw Error('Referência inválida.');
        originLink.href=url.href;originLink.hidden=false;
        if(type==='Link'){showMessage('Esta referência abre na página de origem. Use “Abrir na origem” para continuar.');return;}
        const response=await fetch(url.href,{signal:controller.signal,credentials:'omit'});
        if(!response.ok)throw Error('Não consegui abrir a referência aqui. Use “Abrir na origem” para conferir o acesso.');
        blob=await response.blob();
      }else{
        blob=await blobStore('get',item.id);
        if(!blob)throw Error('Arquivo indisponível neste navegador. Adicione o arquivo original novamente.');
      }
      if(version!==generation||!ownerMatches(owner))return;
      if(type==='PDF'&&!(await blob.slice(0,1024).text()).includes('%PDF-'))throw Error('O arquivo recebido não é um PDF legível. Confira o original ou abra na origem.');
      if(version!==generation||!ownerMatches(owner))return;
      objectURL=URL.createObjectURL(blob);downloadLink.href=objectURL;downloadLink.download=item.name||'anexo';downloadLink.hidden=false;
      if(type==='PDF'){
        const frame=document.createElement('iframe');frame.title=item.name||'Documento PDF';
        frame.src=new URL('vendor/pdfjs/web/viewer.html',document.baseURI).href+'?file='+encodeURIComponent(objectURL)+'#zoom=page-width';body.replaceChildren(frame);
      }else if(type==='Imagem'){
        const img=document.createElement('img');img.alt=item.name||'Imagem anexada';img.src=objectURL;body.replaceChildren(img);
      }else showMessage('Use “Baixar arquivo” para guardar e abrir este formato no seu dispositivo.');
      status.textContent='Leia aqui. Baixe apenas se quiser guardar uma cópia.';
    }catch(error){
      if(version!==generation||error.name==='AbortError')return;
      showMessage(item.url?'Não consegui carregar esta referência aqui. Abra na origem para conferir o arquivo e as permissões.':error.message||'Não consegui carregar o anexo. Tente novamente.');
    }
  }
  function render(){
    const owner={page:current?.id,account:window.studioOwner||null},items=current?.attachments||[];
    if(viewer.open&&(!active||!ownerMatches(active)||!items.some(item=>item.id===active.id)))viewer.close();
    // No iframes, thumbnails or blob reads until the reader requests one file.
    list.replaceChildren();document.getElementById('attachmentCount').textContent=items.length||'';
    if(!items.length){const empty=document.createElement('p');empty.className='attachment-list-empty';empty.textContent='Os arquivos anexados aparecem aqui, um abaixo do outro.';list.append(empty);return;}
    for(const item of items){
      const row=document.createElement('article');row.className='notebook-attachment-row';
      const openButton=document.createElement('button');openButton.type='button';openButton.className='notebook-attachment-open';openButton.setAttribute('aria-label','Abrir anexo: '+item.name);
      const icon=document.createElement('span');icon.className='attachment-file-icon';icon.setAttribute('aria-hidden','true');icon.textContent='▤';
      const name=document.createElement('span');name.className='attachment-file-name';name.textContent=item.name||'Anexo';
      const badge=document.createElement('span');badge.className='attachment-file-kind';badge.textContent=kind(item);
      if(badge.textContent==='Imagem')badge.textContent=(item.type?.split('/')[1]||item.name?.match(/\.(jpe?g|png|webp|gif)$/i)?.[1]||'Imagem').toUpperCase().replace('JPEG','JPG');
      openButton.append(icon,name,badge);openButton.onclick=()=>open(item,owner);
      const remove=document.createElement('button');remove.type='button';remove.className='notebook-attachment-remove';remove.textContent='×';remove.title='Remover anexo';remove.setAttribute('aria-label','Remover anexo: '+item.name);remove.disabled=!!window.STUDIO_READONLY;
      remove.onclick=()=>{if(window.STUDIO_READONLY||!ownerMatches(owner))return;current.attachments=current.attachments.filter(a=>a.id!==item.id);flush();render();};
      row.append(openButton,remove);list.append(row);
    }
  }
  window.studyNotebookAttachments={render};
  const bridge=window.notebookBridge,reset=bridge.reset,access=bridge.access;
  bridge.reset=function(){if(viewer.open)viewer.close();reset();render();};
  bridge.access=function(allowed){access(allowed);list.querySelectorAll('.notebook-attachment-remove').forEach(b=>b.disabled=!allowed);if(!allowed&&viewer.open)viewer.close();};
})();
