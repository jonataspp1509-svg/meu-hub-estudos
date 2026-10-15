(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'mediaViewer';
  dialog.setAttribute('aria-label', 'Visualizador de material');
  const style = document.createElement('style');
  style.textContent = `
    #mediaViewer{position:fixed;inset:0;margin:0;width:100%;height:100vh;height:100dvh;max-width:none;max-height:none;padding:0;border:0;border-radius:0;box-sizing:border-box;overflow:hidden;color:#f2f0fa;background:#202535}
    #mediaViewer[open]{display:flex;flex-direction:column}
    #mediaViewer::backdrop{background:#15142e99}
    #mediaViewer header{position:relative;display:flex;flex:none;align-items:center;justify-content:space-between;gap:16px;margin:0;padding:14px 20px;border-radius:0;background:#202535;box-shadow:none;color:#f2f0fa}
    #mediaViewer header::before,#mediaViewer header::after{content:none;display:none;pointer-events:none}
    #mediaViewer h2{font-size:clamp(16px,2vw,22px);line-height:1.3;margin:0;overflow-wrap:anywhere;color:inherit}
    #mediaViewer button{position:relative;z-index:2;flex:none;border:0;border-radius:12px;padding:12px 18px;background:#5543df;color:white;cursor:pointer;white-space:nowrap;pointer-events:auto}
    #mediaViewer .media-body{display:flex;flex:1;min-height:0;align-items:center;justify-content:center;overflow:auto;background:#101827}
    #mediaViewer img{display:block;max-width:100%;max-height:100%;object-fit:contain;margin:0}
    #mediaViewer iframe,#mediaViewer video{display:block;width:100%;height:100%;border:0;border-radius:0;margin:0;object-fit:contain}
    #mediaViewer footer{display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:10px 20px;background:#202535}
    #mediaViewer a{display:inline-block;flex:none;margin:0;color:#cec4ff}
    #mediaViewer p{font-size:13px;line-height:1.4;color:#c4c5d5;margin:0}
    @media(max-width:600px){#mediaViewer header{padding:12px}#mediaViewer footer{padding:10px 12px;flex-wrap:wrap}}
  `;
  document.head.append(style);
  document.body.append(dialog);
  let generation=0,controller,oldOverflow='',blobURLs=[];
  async function materialBytes(url, signal){
    if(window.studyLoadMaterial)return window.studyLoadMaterial(url,signal);
    const response=await fetch(url,{signal});if(!response.ok)throw new Error('Material indisponível');return response.arrayBuffer();
  }
  function materialBlob(data,type){const url=URL.createObjectURL(new Blob([data],{type}));blobURLs.push(url);return url;}
  const cleanup = () => {
    generation++;controller?.abort();blobURLs.forEach(URL.revokeObjectURL);blobURLs=[];document.body.style.overflow=oldOverflow;
    dialog.querySelectorAll('video').forEach(video => video.pause());
    dialog.querySelectorAll('iframe').forEach(frame => frame.remove());
    dialog.replaceChildren();
  };
  const closeViewer = () => {
    cleanup();
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('click', event => {
    if (!event.target.closest('[data-close-media]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeViewer();
  }, true);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  const validUrl = value => {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Endereço inválido');
    return url;
  };
  async function show(title, url, kind, path) {
    if(dialog.open)dialog.close();
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';controller=new AbortController();const version=++generation;
    dialog.replaceChildren();
    const head = document.createElement('header');
    const heading = document.createElement('h2'); heading.textContent = title;
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '✕ Fechar'; close.setAttribute('aria-label', 'Fechar visualizador'); close.dataset.closeMedia = '';
    head.append(heading, close); dialog.append(head);
    const body = document.createElement('div'); body.className = 'media-body'; dialog.append(body);
    dialog.showModal();
    let embed;
    if(kind==='pdf'){
      const loading=document.createElement('p');loading.textContent='Preparando seu PDF…';loading.style.color='#eee';body.append(loading);
      try{const data=await materialBytes(url.href,controller.signal);if(version!==generation)return;embed=document.createElement('iframe');embed.title=title;embed.src=new URL('vendor/pdfjs/web/viewer.html',document.baseURI).href+'?file='+encodeURIComponent(materialBlob(data,'application/pdf'));loading.remove();}
      catch(error){if(version!==generation)return;loading.textContent='Não consegui carregar a prévia. Você pode tentar novamente ou baixar o arquivo.';}
    }else if(kind==='office'){
      const original=new URL('Estudos/'+caminhoSeguro(path),'https://jonataspp1509-svg.github.io/meu-hub-estudos/').href;
      embed=document.createElement('iframe');embed.title=title;embed.allowFullscreen=true;embed.src='https://view.officeapps.live.com/op/embed.aspx?src='+encodeURIComponent(original);
    }else if (kind === 'image') {
      embed = document.createElement('img'); embed.src = url.href; embed.alt = title;
    } else if (kind === 'video') {
      embed = document.createElement('video'); embed.src = url.href; embed.controls = true; embed.preload = 'metadata';
    } else {
      const drive = url.hostname === 'drive.google.com' && url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/);
      const youtube = ['www.youtube.com','youtube.com'].includes(url.hostname) && url.searchParams.get('v');
      const short = url.hostname === 'youtu.be' && url.pathname.slice(1);
      if (drive || youtube || short) {
        embed = document.createElement('iframe'); embed.title = title; embed.allowFullscreen = true;
        embed.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
        embed.referrerPolicy = 'strict-origin-when-cross-origin';
        embed.src = drive ? 'https://drive.google.com/file/d/' + drive[1] + '/preview' : 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(youtube || short);
      }
    }
    if (embed) body.append(embed);
    const relative=path&&'Estudos/'+path;
    if(['image','video'].includes(kind)&&window.studyMaterialManifest?.[relative]){
      try{const data=await materialBytes(url.href,controller.signal);if(version!==generation)return;embed.src=materialBlob(data,kind==='video'?'video/mp4':'image/'+url.pathname.split('.').pop());}catch{if(version!==generation)return;body.textContent='Não consegui carregar este material. Tente novamente.';}
    }
    const note = document.createElement('p');
    note.textContent = kind === 'link' ? 'Se o player pedir acesso ou não carregar, abra o material na origem. As permissões são as mesmas do professor.' : 'Material da sua biblioteca de estudos.';
    const open = document.createElement('a'); open.href = url.href; open.target = '_blank'; open.rel = 'noopener noreferrer';
    open.textContent = 'Abrir na origem ↗';
    const footer = document.createElement('footer'); footer.append(note, open);
    if(kind!=='link'){
      open.remove();note.textContent='Leia aqui. Baixe apenas se quiser guardar uma cópia.';
      const download=document.createElement('button');download.type='button';download.textContent='↓ Baixar arquivo';
      download.onclick=async()=>{download.disabled=true;download.textContent='Preparando…';try{const data=await materialBytes(url.href,controller.signal);if(version!==generation)return;const objectURL=URL.createObjectURL(new Blob([data]));const a=document.createElement('a');a.href=objectURL;a.download=decodeURIComponent(url.pathname.split('/').pop());document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),60000);}catch(error){if(error.name!=='AbortError')note.textContent='Não consegui baixar agora. Tente novamente.';}finally{download.disabled=false;download.textContent='↓ Baixar arquivo';}};
      if(kind==='office'){
        const alternate=document.createElement('button');alternate.type='button';alternate.textContent='Tentar outra prévia';alternate.style.cssText='background:#3c355e;color:#f4efff';alternate.onclick=()=>{embed.src='https://docs.google.com/gview?embedded=1&url='+encodeURIComponent(new URL('Estudos/'+caminhoSeguro(path),'https://jonataspp1509-svg.github.io/meu-hub-estudos/').href);alternate.remove();};footer.append(alternate);
      }
      footer.append(download);
    }
    dialog.append(footer);
  }
  dialog.addEventListener('close', cleanup);
  window.abrirAtalhoUrl = async function(file) {
    try {
      if (!window.studyCanSee?.(file)) return;
      const response = await fetch(BASE + 'Estudos/' + caminhoSeguro(file));
      if (!response.ok) throw new Error();
      const line = (await response.text()).split(/\r?\n/).find(value => /^URL=/i.test(value));
      if (!line) throw new Error();
      show(materialTitle(file.split('/').pop(),file), validUrl(line.slice(4).trim()), 'link');
    } catch { alert('Não foi possível abrir este link. Tente novamente.'); }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a.item, .recent-materials a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    const url = new URL(link.href);
    const extension = url.pathname.split('.').pop().toLowerCase();
    const path=decodeURIComponent(url.pathname.split('/Estudos/')[1]||'');
    if(!path||!window.studyCanSee?.(path))return;
    if (extension === 'url') {
      const path = decodeURIComponent(url.pathname.split('/Estudos/')[1] || '');
      if (path) { event.preventDefault(); window.abrirAtalhoUrl(path); }
    } else if (['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','jpeg','png','gif','webp','mp4'].includes(extension)) {
      event.preventDefault();event.stopImmediatePropagation();show(materialTitle(decodeURIComponent(url.pathname.split('/').pop()),url.pathname), url, extension==='pdf'?'pdf':/^(docx?|pptx?|xlsx?)$/.test(extension)?'office':extension === 'mp4' ? 'video' : 'image',path);
    }
  },true);
})();
