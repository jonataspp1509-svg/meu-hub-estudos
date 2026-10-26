/* Keep writing controls beside the page and insertion close to the reader. */
(() => {
  const pane=document.getElementById('textPane'),editor=document.getElementById('editor');
  const toolbar=pane?.querySelector('.format-toolbar'),palette=pane?.querySelector('.highlight-panel');
  if(!pane||!editor||!toolbar||!palette)return;
  const layout=document.createElement('div');layout.className='writing-layout';
  const rail=document.createElement('aside');rail.className='writing-tools';rail.setAttribute('aria-label','Ferramentas da anotação');
  const title=document.createElement('strong');title.className='writing-tools-title';title.textContent='Ferramentas';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='writing-highlight-toggle';toggle.textContent='◒ Grifar';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','writingPalette');
  palette.id='writingPalette';
  const close=document.createElement('button');close.type='button';close.className='writing-palette-close';close.textContent='Fechar cores';
  const setOpen=open=>{rail.classList.toggle('colors-open',open);toggle.setAttribute('aria-expanded',String(open));};
  toggle.onclick=()=>setOpen(!rail.classList.contains('colors-open'));
  close.onclick=()=>{setOpen(false);toggle.focus({preventScroll:true});};
  palette.append(close);
  document.getElementById('addPostit')?.remove();
  const addNote=document.createElement('button');addNote.type='button';addNote.className='writing-note-button';addNote.textContent='＋ Nota';addNote.setAttribute('aria-label','Adicionar observação no trecho atual');
  rail.append(title,toolbar,addNote,toggle,palette);
  const page=document.createElement('div');page.className='writing-page';
  pane.prepend(layout);layout.append(rail,page);page.append(editor);
  const bottom=pane.querySelector('.editor-bottom');if(bottom)page.append(bottom);
  // Mouse, touch, and pen controls must not steal the document selection.
  rail.addEventListener('pointerdown',event=>{if(event.target.closest('button'))event.preventDefault();});
  document.addEventListener('pointerdown',event=>{if(!rail.contains(event.target))setOpen(false);});
  rail.addEventListener('keydown',event=>{if(event.key==='Escape'){setOpen(false);toggle.focus({preventScroll:true});}});
  palette.addEventListener('click',event=>{if(event.target.closest('[data-highlight]'))setOpen(false);});
  function visibleRange(range){
    if(!range||!editor.contains(range.startContainer)||!editor.contains(range.endContainer))return false;
    const rect=range.getBoundingClientRect();
    return (rect.width>0||rect.height>0)&&rect.bottom>100&&rect.top<innerHeight-45;
  }
  function rangeAtVisibleText(){
    const rect=editor.getBoundingClientRect();
    const x=Math.max(rect.left+8,Math.min(rect.right-8,rect.left+rect.width/3));
    const y=Math.max(110,rect.top+18);
    if(y<Math.min(innerHeight-50,rect.bottom)){
      let range;
      if(document.caretPositionFromPoint){const pos=document.caretPositionFromPoint(x,y);if(pos){range=document.createRange();range.setStart(pos.offsetNode,pos.offset);range.collapse(true);}}
      else if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(x,y);
      if(range&&editor.contains(range.startContainer))return range;
    }
    for(const child of editor.children){const r=child.getBoundingClientRect();if(r.bottom>110&&r.top<innerHeight-50){const range=document.createRange();range.selectNodeContents(child);range.collapse(false);return range;}}
    return null;
  }
  function prepareInsertion(){
    if(window.STUDIO_READONLY||!current)return false;
    const range=visibleRange(selection)?selection.cloneRange():rangeAtVisibleText();
    editor.focus({preventScroll:true});
    if(range){range.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(range);remember();}
    return true;
  }
  for(const [id,html] of [['addCallout','<div class="callout">✦ Uma ideia para lembrar…</div><p><br></p>'],['addChecklist','<p><input type="checkbox" contenteditable="false"> Uma tarefa para concluir</p>']]){
    document.getElementById(id).onclick=()=>{if(!prepareInsertion())return;document.execCommand('insertHTML',false,html);remember();schedule();};
  }
  const panel=document.createElement('section');panel.className='writing-note-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Observação do trecho');
  panel.innerHTML='<div class="writing-note-heading"><strong>Observação</strong><button type="button" data-close aria-label="Fechar observação">×</button></div><label>O que você quer lembrar?<textarea maxlength="4000" rows="5" placeholder="Escreva sua observação…"></textarea></label><div class="writing-note-actions"><button type="button" data-remove>Excluir nota</button><button type="button" data-done>Concluir</button></div><small>Salva junto com esta página.</small>';
  document.body.append(panel);
  const field=panel.querySelector('textarea');let activeNote=null;
  function closeNote(){panel.hidden=true;activeNote=null;}
  function positionPanel(){
    if(!activeNote?.isConnected){closeNote();return;}
    const rect=activeNote.querySelector('[data-note-control]')?.getBoundingClientRect();
    if(!rect)return;
    const viewport=window.visualViewport,top=viewport?.offsetTop||0,height=viewport?.height||innerHeight;
    panel.style.maxHeight=Math.max(150,height-24)+'px';
    panel.style.top=Math.max(top+12,Math.min(top+height-panel.offsetHeight-12,rect.bottom+8))+'px';
    panel.style.left=Math.max(12,Math.min(innerWidth-panel.offsetWidth-12,rect.right-panel.offsetWidth))+'px';
  }
  function openNote(note){
    activeNote=note;field.value=note.querySelector('p')?.textContent||'';
    field.readOnly=!!window.STUDIO_READONLY;
    panel.querySelector('[data-remove]').hidden=!!window.STUDIO_READONLY;
    panel.hidden=false;positionPanel();field.focus({preventScroll:true});
  }
  function decorateNotes(){
    let migrated=false;
    for(const old of editor.querySelectorAll('.postit')){
      const copy=old.cloneNode(true);copy.querySelectorAll('[data-postit-remove],[data-postit-drag]').forEach(el=>el.remove());
      old.className='margin-note';old.removeAttribute('style');delete old.dataset.postitX;delete old.dataset.postitY;
      const p=document.createElement('p');p.textContent=[...copy.children].map(el=>el.textContent).join('\n').trim();old.replaceChildren(p);migrated=true;
    }
    for(const note of editor.querySelectorAll('.margin-note')){
      note.contentEditable='false';
      if(!note.querySelector('[data-note-control]')){
        const marker=document.createElement('button');marker.type='button';marker.dataset.noteControl='true';marker.className='margin-note-marker';marker.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4Zm4 4h8M8 12h5"/></svg>';
        marker.setAttribute('aria-label','Abrir observação deste trecho');marker.onmousedown=e=>e.preventDefault();marker.onclick=e=>{e.preventDefault();openNote(note);};note.prepend(marker);
      }
    }
    if(activeNote&&!activeNote.isConnected)closeNote();
    if(migrated&&current&&!window.STUDIO_READONLY)schedule();
  }
  field.addEventListener('input',()=>{if(!activeNote||window.STUDIO_READONLY)return;activeNote.querySelector('p').textContent=field.value;schedule();});
  panel.querySelector('[data-close]').onclick=closeNote;panel.querySelector('[data-done]').onclick=closeNote;
  panel.querySelector('[data-remove]').onclick=()=>{if(activeNote&&!window.STUDIO_READONLY){activeNote.remove();schedule();closeNote();}};
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeNote();}});
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!e.target.closest('[data-note-control]')&&e.target!==addNote)closeNote();});
  window.addEventListener('resize',()=>{if(!panel.hidden)positionPanel();});
  window.addEventListener('scroll',()=>{if(!panel.hidden)positionPanel();},{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{if(!panel.hidden)positionPanel();});
  new MutationObserver(decorateNotes).observe(editor,{childList:true,subtree:true});
  decorateNotes();
  const priorAccess=window.notebookBridge.access;
  window.notebookBridge.access=function(allowed){priorAccess(allowed);addNote.disabled=!allowed;if(!allowed)closeNote();};
  addNote.disabled=!!window.STUDIO_READONLY;
  addNote.onclick=()=>{
    if(window.STUDIO_READONLY||!current)return;
    // Prefer the writing cursor when visible; otherwise use the paragraph in view.
    const chosen=visibleRange(selection)?selection:rangeAtVisibleText();
    let anchor=chosen?.startContainer;
    if(anchor===editor)anchor=editor.children[Math.min(chosen.startOffset,editor.children.length-1)];
    while(anchor?.parentNode&&anchor.parentNode!==editor)anchor=anchor.parentNode;
    if(anchor?.classList?.contains('margin-note')){openNote(anchor);return;}
    if(anchor?.nextElementSibling?.classList.contains('margin-note')){openNote(anchor.nextElementSibling);return;}
    const note=document.createElement('div');note.className='margin-note';note.append(document.createElement('p'));
    if(anchor?.parentNode===editor)anchor.after(note);else editor.append(note);
    decorateNotes();schedule();openNote(note);
  };
})();
