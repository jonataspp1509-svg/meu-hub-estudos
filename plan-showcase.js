const dialog=document.getElementById('resourcePreview'),picture=document.getElementById('resourcePreviewImage'),title=document.getElementById('resourcePreviewTitle'),caption=document.getElementById('resourcePreviewCaption');
let opener;
document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{opener=button;picture.src=button.dataset.preview;picture.alt=button.dataset.title;title.textContent=button.dataset.title;caption.textContent=button.dataset.caption||'Tela real do StudyFlow. Clique em Fechar para continuar.';dialog.showModal();}));
document.getElementById('closeResourcePreview').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{picture.removeAttribute('src');opener?.focus();});
