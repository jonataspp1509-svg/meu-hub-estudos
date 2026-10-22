/* Reference images live below the ink so the eraser never removes the question. */
const boardWrap=$('canvasWrap'),boardPane=$('drawPane');
const imageLayer=document.createElement('canvas');imageLayer.className='board-image-layer';imageLayer.setAttribute('aria-hidden','true');boardWrap.prepend(imageLayer);
const imageCtx=imageLayer.getContext('2d'),imageCache=new Map();
const imageControls=document.createElement('div');imageControls.className='board-image-selection';imageControls.hidden=true;
imageControls.tabIndex=0;imageControls.setAttribute('role','group');imageControls.setAttribute('aria-label','Imagem selecionada. Arraste para mover ou use as setas.');
imageControls.innerHTML=[['nw','superior esquerdo'],['ne','superior direito'],['sw','inferior esquerdo'],['se','inferior direito']].map(([corner,label])=>'<button type="button" class="board-image-resize '+corner+'" data-corner="'+corner+'" aria-label="Redimensionar imagem pelo canto '+label+'. Arraste ou use as setas."></button>').join('');
boardWrap.append(imageControls);
const imageTools=document.createElement('div');imageTools.className='board-image-tools';
imageTools.innerHTML='<button type="button" id="addBoardImage">＋ Imagem</button><button type="button" id="pasteBoardImage">Colar imagem</button><button type="button" id="editBoardImage" aria-pressed="false">Ajustar imagem</button><button type="button" id="removeBoardImage" hidden>Remover imagem</button><input id="boardImageFile" type="file" accept="image/png,image/jpeg,image/webp" hidden>';
document.querySelector('.draw-toolbar').insertBefore(imageTools,document.querySelector('.drawing-zoom'));
const boardTip=document.createElement('p');boardTip.className='board-image-tip';boardTip.textContent='Cole um recorte com Ctrl+V ou adicione uma imagem. Toque na imagem para selecionar. Arraste a imagem para mover e as bolinhas dos cantos para redimensionar. Com dois dedos sobre a imagem selecionada, amplie ou diminua. Escolha Caneta para resolver por cima.';
document.querySelector('.drawing-footer').before(boardTip);
let selectedBoardImage=null,imagePage=null,importingImage=false;
const boardImages=()=>current?.drawingImages||[];
function selectedImage(){return boardImages().find(i=>i.id===selectedBoardImage);}
function imageBitmap(src){if(!imageCache.has(src)){const img=new Image();imageCache.set(src,img);img.onload=()=>{if(current&&!boardPane.hidden)redraw();};img.src=src;}return imageCache.get(src);}
function syncImageControls(){
  const images=boardImages();if(!images.length&&tool==='image'){tool='pen';toolsBeforeImages();}const editing=tool==='image'&&!window.STUDIO_READONLY;
  if(imagePage!==current?.id){imagePage=current?.id;selectedBoardImage=null;imageCache.clear();}
  if(!selectedImage())selectedBoardImage=images.at(-1)?.id||null;
  const image=selectedImage();boardWrap.classList.toggle('board-editing-image',editing);
  $('editBoardImage').classList.toggle('active',editing);$('editBoardImage').setAttribute('aria-pressed',String(editing));
  $('removeBoardImage').hidden=!editing||!image;imageControls.hidden=!editing||!image;
  $('addBoardImage').disabled=$('pasteBoardImage').disabled=window.STUDIO_READONLY||importingImage;
  $('editBoardImage').disabled=window.STUDIO_READONLY||!images.length;
  if(editing&&image){imageControls.style.left=(camera.x+image.x*camera.zoom)+'px';imageControls.style.top=(camera.y+image.y*camera.zoom)+'px';imageControls.style.width=image.width*camera.zoom+'px';imageControls.style.height=image.height*camera.zoom+'px';}
}
const redrawBeforeImages=redraw;
redraw=function(){redrawBeforeImages();if(!current)return;syncImageControls();const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,3);
  if(imageLayer.width!==canvas.width||imageLayer.height!==canvas.height){imageLayer.width=canvas.width;imageLayer.height=canvas.height;}
  imageCtx.setTransform(dpr,0,0,dpr,0,0);imageCtx.clearRect(0,0,r.width,r.height);imageCtx.save();imageCtx.translate(camera.x,camera.y);imageCtx.scale(camera.zoom,camera.zoom);
  for(const image of boardImages()){const bitmap=imageBitmap(image.src);if(bitmap.complete&&bitmap.naturalWidth)imageCtx.drawImage(bitmap,image.x,image.y,image.width,image.height);}imageCtx.restore();
  if(boardImages().length)$('canvasHint').hidden=true;
};
const toolsBeforeImages=updateTools;updateTools=function(){toolsBeforeImages();syncImageControls();};
$('editBoardImage').onclick=()=>{tool=tool==='image'?'pen':'image';updateTools();redraw();};
$('removeBoardImage').onclick=()=>{if(window.STUDIO_READONLY||!current)return;current.drawingImages=boardImages().filter(i=>i.id!==selectedBoardImage);selectedBoardImage=null;redraw();flush();};
function placeImage(image,x,y,width=image.width){const ratio=image.height/image.width;image.width=Math.max(40,Math.min(8000,8000/ratio,width));image.height=image.width*ratio;image.x=Math.max(0,Math.min(16000-image.width,x));image.y=Math.max(0,Math.min(16000-image.height,y));const w=worldSize();const next={width:Math.max(w.width,Math.ceil(image.x+image.width)),height:Math.max(w.height,Math.ceil(image.y+image.height))};if(next.width!==w.width||next.height!==w.height){for(const stroke of [...current.strokes||[],...redoStack])for(const p of stroke.points){p.x*=w.width/next.width;p.y*=w.height/next.height;}current.drawingSize=next;}}
function hitBoardImage(e){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-camera.x)/camera.zoom,y=(e.clientY-r.top-camera.y)/camera.zoom;return [...boardImages()].reverse().find(i=>x>=i.x&&x<=i.x+i.width&&y>=i.y&&y<=i.y+i.height);}
let imageTap=null;
canvas.addEventListener('pointerdown',e=>{if(window.STUDIO_READONLY||tool!=='pen'||pointers.size){imageTap=null;return;}const image=hitBoardImage(e);imageTap=image?{pointer:e.pointerId,id:image.id,x:e.clientX,y:e.clientY,page:current}:null;},true);
canvas.addEventListener('pointermove',e=>{if(imageTap?.pointer===e.pointerId&&Math.hypot(e.clientX-imageTap.x,e.clientY-imageTap.y)>8)imageTap=null;},true);
canvas.addEventListener('pointerup',e=>{if(!imageTap||imageTap.pointer!==e.pointerId)return;const tap=imageTap;imageTap=null;if(current!==tap.page||window.STUDIO_READONLY)return;e.stopImmediatePropagation();drawing=null;pointers.delete(e.pointerId);selectedBoardImage=tap.id;tool='image';updateTools();redraw();},true);
canvas.addEventListener('pointercancel',()=>{imageTap=null;},true);
boardWrap.addEventListener('pointerdown',e=>{if(tool!=='image'||window.STUDIO_READONLY||imageControls.contains(e.target))return;const image=hitBoardImage(e);if(image){selectedBoardImage=image.id;redraw();}else{tool='pen';updateTools();redraw();}});
const imagePointers=new Map();let imageDrag=null,imagePinch=null;
function imagePair(){const pts=[...imagePointers.values()];if(pts.length<2)return null;return{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2,distance:Math.max(1,Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y))};}
imageControls.onpointerdown=e=>{const image=selectedImage();if(e.button!==0||!image||window.STUDIO_READONLY)return;e.preventDefault();e.stopPropagation();imageControls.setPointerCapture(e.pointerId);imagePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const pair=imagePair();if(pair){imagePinch={...pair,image:{...image},page:current};return;}imageDrag={pointer:e.pointerId,x:e.clientX,y:e.clientY,image:{...image},page:current,corner:e.target.closest('[data-corner]')?.dataset.corner};};
imageControls.onpointermove=e=>{if(!imagePointers.has(e.pointerId)||window.STUDIO_READONLY)return;e.preventDefault();imagePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const image=selectedImage();if(!image)return;const pair=imagePair();if(imagePinch){if(!pair||current!==imagePinch.page||image.id!==imagePinch.image.id)return;const start=imagePinch.image,width=start.width*pair.distance/imagePinch.distance,height=width*start.height/start.width;placeImage(image,start.x+(pair.x-imagePinch.x)/camera.zoom+(start.width-width)/2,start.y+(pair.y-imagePinch.y)/camera.zoom+(start.height-height)/2,width);}
 else if(imageDrag&&current===imageDrag.page&&image.id===imageDrag.image.id){const start=imageDrag.image,dx=(e.clientX-imageDrag.x)/camera.zoom,dy=(e.clientY-imageDrag.y)/camera.zoom;if(imageDrag.corner){const left=imageDrag.corner.includes('w'),top=imageDrag.corner.includes('n'),ratio=start.height/start.width,delta=Math.abs(dx)>Math.abs(dy/ratio)?dx*(left?-1:1):dy/ratio*(top?-1:1),width=Math.max(40,start.width+delta),height=width*ratio;placeImage(image,left?start.x+start.width-width:start.x,top?start.y+start.height-height:start.y,width);}else placeImage(image,start.x+dx,start.y+dy);}redraw();};
function finishImagePointer(e){imagePointers.delete(e.pointerId);if(imageControls.hasPointerCapture(e.pointerId))imageControls.releasePointerCapture(e.pointerId);if(!imagePointers.size){if(current===(imagePinch?.page||imageDrag?.page))flush();imageDrag=imagePinch=null;}}
imageControls.onpointerup=finishImagePointer;imageControls.onpointercancel=finishImagePointer;
imageControls.onkeydown=e=>{const image=selectedImage();if(!image||window.STUDIO_READONLY||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?40:10,dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;if(e.target.dataset.corner)placeImage(image,image.x,image.y,image.width+(dx||dy));else placeImage(image,image.x+dx,image.y+dy);redraw();schedule();};
async function insertBoardImage(file){
  if(importingImage||!current||window.STUDIO_READONLY)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('Escolha uma imagem PNG, JPG ou WebP.');return;}
  if(file.size>12*1024*1024){toast('Escolha uma imagem de até 12 MB.');return;}
  if(boardImages().length>=6){toast('Use até seis imagens por página. Continue em outra página para adicionar mais.');return;}
  const page=current;importingImage=true;syncImageControls();let bitmap;
  try{
    bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000||bitmap.height/bitmap.width>50)throw Error('A imagem é grande demais. Cole apenas o recorte da questão.');
    const used=boardImages().reduce((n,i)=>n+i.src.length,0),budget=Math.min(125000-used,160000-JSON.stringify(page).length);
    if(budget<5000)throw Error('Esta página está cheia. Adicione a imagem em uma nova página.');
    let src='',scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
    for(let attempt=0;attempt<7;attempt++){
      const out=document.createElement('canvas');out.width=Math.max(1,Math.round(bitmap.width*scale));out.height=Math.max(1,Math.round(bitmap.height*scale));out.getContext('2d').drawImage(bitmap,0,0,out.width,out.height);
      const png=out.toDataURL('image/png'),webp=out.toDataURL('image/webp',.88);src=png.length<webp.length?png:webp;if(src.length<=budget)break;scale*=.78;
    }
    if(src.length>budget)throw Error('Recorte uma área menor da imagem ou use outra página.');
    if(current!==page||window.STUDIO_READONLY)return;
    const r=canvas.getBoundingClientRect(),width=Math.min(bitmap.width,900,Math.max(240,r.width/camera.zoom*.8)),height=width*bitmap.height/bitmap.width;
    const image={id:crypto.randomUUID(),src,x:Math.max(0,-camera.x/camera.zoom+30),y:Math.max(0,-camera.y/camera.zoom+30),width,height};
    page.drawingImages??=[];page.drawingImages.push(image);placeImage(image,image.x,image.y);selectedBoardImage=image.id;imagePage=page.id;tool='image';updateTools();redraw();flush();toast('Imagem adicionada. Arraste as bolinhas dos cantos para ajustar e escolha Caneta para escrever.');
  }catch(error){toast(error.message||'Não consegui abrir a imagem. Tente outro arquivo.');}finally{bitmap?.close();importingImage=false;syncImageControls();}
}
$('addBoardImage').onclick=()=>$('boardImageFile').click();$('boardImageFile').onchange=e=>{const file=e.target.files?.[0];e.target.value='';if(file)insertBoardImage(file);};
$('pasteBoardImage').onclick=async()=>{if(!navigator.clipboard?.read){toast('Use Ctrl+V na lousa ou o botão ＋ Imagem.');return;}try{const items=await navigator.clipboard.read();for(const item of items){const type=item.types.find(t=>['image/png','image/jpeg','image/webp'].includes(t));if(type){await insertBoardImage(await item.getType(type));return;}}toast('Copie uma imagem ou um recorte antes de colar.');}catch{toast('Não consegui acessar a área de transferência. Use Ctrl+V ou ＋ Imagem.');}};
document.addEventListener('paste',event=>{if(boardPane.hidden||!current||window.STUDIO_READONLY||event.target.closest('input,textarea,[contenteditable="true"]'))return;const file=Array.from(event.clipboardData?.items||[]).find(i=>i.type.startsWith('image/'))?.getAsFile();if(file){event.preventDefault();insertBoardImage(file);}});
boardWrap.addEventListener('dragover',e=>{if(!window.STUDIO_READONLY)e.preventDefault();});boardWrap.addEventListener('drop',e=>{if(window.STUDIO_READONLY)return;const file=Array.from(e.dataTransfer?.files||[]).find(f=>f.type.startsWith('image/'));if(file){e.preventDefault();insertBoardImage(file);}});
const imageAccessBefore=window.notebookBridge.access;window.notebookBridge.access=function(allowed){imageAccessBefore(allowed);syncImageControls();};
// Export the question underneath the transparent ink layer (including erased strokes).
const exportInk=$('saveDrawing').onclick;
$('saveDrawing').onclick=async()=>{if(!boardImages().length){exportInk();return;}const page=current,w=worldSize(),scale=Math.min(1,4096/Math.max(w.width,w.height)),out=document.createElement('canvas');out.width=Math.ceil(w.width*scale);out.height=Math.ceil(w.height*scale);const target=out.getContext('2d');target.fillStyle='#f7f6ee';target.fillRect(0,0,out.width,out.height);target.scale(scale,scale);
  try{for(const image of boardImages()){const img=imageBitmap(image.src);await img.decode();target.drawImage(img,image.x,image.y,image.width,image.height);}if(current!==page)return;
    const layer=document.createElement('canvas');layer.width=out.width;layer.height=out.height;const inkCtx=layer.getContext('2d');inkCtx.scale(scale,scale);
    for(const stroke of page.strokes||[]){const pts=stroke.points;if(!pts.length)continue;inkCtx.strokeStyle=inkCtx.fillStyle=stroke.color;inkCtx.lineCap=inkCtx.lineJoin='round';inkCtx.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';if(pts.length===1){inkCtx.beginPath();inkCtx.arc(pts[0].x*w.width,pts[0].y*w.height,stroke.size*(.4+pts[0].p),0,Math.PI*2);inkCtx.fill();}for(let i=1;i<pts.length;i++){inkCtx.lineWidth=stroke.size*(.5+pts[i].p);inkCtx.beginPath();inkCtx.moveTo(pts[i-1].x*w.width,pts[i-1].y*w.height);inkCtx.lineTo(pts[i].x*w.width,pts[i].y*w.height);inkCtx.stroke();}}
    target.setTransform(1,0,0,1,0,0);target.drawImage(layer,0,0);out.toBlob(blob=>{if(blob)download(blob,(page.title||'desenho')+'.png');});
  }catch{toast('Não consegui exportar a imagem. Tente novamente.');}
};
const collapseBoardBefore=collapseDrawing;
collapseDrawing=function(){collapseBoardBefore();$('expandDrawing').textContent='⛶ Tela cheia';if(document.fullscreenElement===boardPane)document.exitFullscreen?.().catch(()=>{});};
const expandBoardBefore=$('expandDrawing').onclick;
$('expandDrawing').textContent='⛶ Tela cheia';
$('expandDrawing').onclick=()=>{const opening=!expanded;expandBoardBefore();$('expandDrawing').textContent=expanded?'⛶ Recolher':'⛶ Tela cheia';if(opening&&boardPane.requestFullscreen)boardPane.requestFullscreen().then(()=>requestAnimationFrame(resizeCanvas)).catch(()=>requestAnimationFrame(resizeCanvas));else if(!opening&&document.fullscreenElement===boardPane)document.exitFullscreen?.().catch(()=>{});requestAnimationFrame(resizeCanvas);};
$('closeDrawing').onclick=()=>{collapseDrawing();resizeCanvas();};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&expanded){collapseDrawing();resizeCanvas();}});
new ResizeObserver(()=>{if(current&&!boardPane.hidden)resizeCanvas();}).observe(boardWrap);
syncImageControls();
