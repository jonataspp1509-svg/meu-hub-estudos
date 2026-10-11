(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'mediaViewer';
  dialog.setAttribute('aria-label', 'Visualizador de material');
  const style = document.createElement('style');
  style.textContent = '#mediaViewer{border:1px solid #ddd8f6;border-radius:24px;padding:24px;width:min(900px,90vw);max-height:90vh;color:#293147;background:#fff}#mediaViewer::backdrop{background:#15142e99}#mediaViewer header{display:flex;align-items:center;justify-content:space-between;gap:16px}#mediaViewer h2{font-size:22px;margin:0}#mediaViewer button{border:0;border-radius:12px;padding:12px 18px;background:#5543df;color:white;cursor:pointer}#mediaViewer img{display:block;max-width:100%;max-height:65vh;margin:20px auto}#mediaViewer iframe,#mediaViewer video{width:100%;height:min(58vw,480px);border:0;border-radius:16px;margin-top:16px}#mediaViewer a{display:inline-block;margin-top:16px;color:#5543df}#mediaViewer p{color:#68758b}';
  document.head.append(style);
  document.body.append(dialog);
  const validUrl = value => {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Endereço inválido');
    return url;
  };
  function show(title, url, kind) {
    dialog.replaceChildren();
    const head = document.createElement('header');
    const heading = document.createElement('h2'); heading.textContent = title;
    const close = document.createElement('button'); close.textContent = 'Fechar'; close.onclick = () => dialog.close();
    head.append(heading, close); dialog.append(head);
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
    if (embed) dialog.append(embed);
    const note = document.createElement('p');
    note.textContent = kind === 'link' ? 'Se o player pedir acesso ou não carregar, abra o material na origem. As permissões são as mesmas do professor.' : 'Material da sua biblioteca de estudos.';
    const open = document.createElement('a'); open.href = url.href; open.target = '_blank'; open.rel = 'noopener noreferrer';
    open.textContent = kind === 'link' ? 'Abrir na origem ↗' : 'Abrir arquivo ↗';
    dialog.append(note, open); dialog.showModal();
  }
  dialog.addEventListener('close', () => dialog.replaceChildren());
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