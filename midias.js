(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'mediaViewer';
  dialog.setAttribute('aria-label', 'Visualizador de material');
  const style = document.createElement('style');
  style.textContent = `
    #mediaViewer{position:fixed;inset:0;margin:0;width:100%;height:100vh;height:100dvh;max-width:none;max-height:none;padding:0;border:0;border-radius:0;box-sizing:border-box;overflow:hidden;color:#293147;background:#fff}
    #mediaViewer[open]{display:flex;flex-direction:column}
    #mediaViewer::backdrop{background:#15142e99}
    #mediaViewer header{position:relative;display:flex;flex:none;align-items:center;justify-content:space-between;gap:16px;margin:0;padding:14px 20px;border-radius:0;background:#fff;box-shadow:none;color:#293147}
    #mediaViewer header::before,#mediaViewer header::after{content:none;display:none;pointer-events:none}
    #mediaViewer h2{font-size:clamp(16px,2vw,22px);line-height:1.3;margin:0;overflow-wrap:anywhere;color:inherit}
    #mediaViewer button{position:relative;z-index:2;flex:none;border:0;border-radius:12px;padding:12px 18px;background:#5543df;color:white;cursor:pointer;white-space:nowrap;pointer-events:auto}
    #mediaViewer .media-body{display:flex;flex:1;min-height:0;align-items:center;justify-content:center;overflow:auto;background:#101827}
    #mediaViewer img{display:block;max-width:100%;max-height:100%;object-fit:contain;margin:0}
    #mediaViewer iframe,#mediaViewer video{display:block;width:100%;height:100%;border:0;border-radius:0;margin:0;object-fit:contain}
    #mediaViewer footer{display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;margin:0;padding:10px 20px;background:#fff}
    #mediaViewer a{display:inline-block;flex:none;margin:0;color:#5543df}
    #mediaViewer p{font-size:13px;line-height:1.4;color:#68758b;margin:0}
    @media(max-width:600px){#mediaViewer header{padding:12px}#mediaViewer footer{padding:10px 12px;flex-wrap:wrap}}
  `;
  document.head.append(style);
  document.body.append(dialog);
  const cleanup = () => {
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
  function show(title, url, kind) {
    dialog.replaceChildren();
    const head = document.createElement('header');
    const heading = document.createElement('h2'); heading.textContent = title;
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '✕ Fechar'; close.setAttribute('aria-label', 'Fechar visualizador'); close.dataset.closeMedia = '';
    head.append(heading, close); dialog.append(head);
    const body = document.createElement('div'); body.className = 'media-body'; dialog.append(body);
    let embed;
    if (kind === 'image') {
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
    const note = document.createElement('p');
    note.textContent = kind === 'link' ? 'Se o player pedir acesso ou não carregar, abra o material na origem. As permissões são as mesmas do professor.' : 'Material da sua biblioteca de estudos.';
    const open = document.createElement('a'); open.href = url.href; open.target = '_blank'; open.rel = 'noopener noreferrer';
    open.textContent = kind === 'link' ? 'Abrir na origem ↗' : 'Abrir arquivo ↗';
    const footer = document.createElement('footer'); footer.append(note, open);
    dialog.append(footer); dialog.showModal();
  }
  dialog.addEventListener('close', cleanup);
  window.abrirAtalhoUrl = async function(file) {
    try {
      if (!window.studyCanSee?.(file)) return;
      const response = await fetch(BASE + 'Estudos/' + caminhoSeguro(file));
      if (!response.ok) throw new Error();
      const line = (await response.text()).split(/\r?\n/).find(value => /^URL=/i.test(value));
      if (!line) throw new Error();
      show(materialTitle(file.split('/').pop()), validUrl(line.slice(4).trim()), 'link');
    } catch { alert('Não foi possível abrir este link. Tente novamente.'); }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a.item, .recent-materials a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    const url = new URL(link.href);
    const extension = url.pathname.split('.').pop().toLowerCase();
    if (extension === 'url') {
      const path = decodeURIComponent(url.pathname.split('/Estudos/')[1] || '');
      if (path) { event.preventDefault(); window.abrirAtalhoUrl(path); }
    } else if (['jpg','jpeg','png','gif','webp','mp4'].includes(extension)) {
      event.preventDefault(); show(materialTitle(decodeURIComponent(url.pathname.split('/').pop())), url, extension === 'mp4' ? 'video' : 'image');
    }
  });
})();