/* Highlight text leaves, never a container spanning multiple paragraphs. */
(() => {
  const colors=new Set(['green','red','blue','rainbowRed','orange','yellow','rainbowGreen','rainbowBlue','indigo','violet','pastelRed','pastelOrange','pastelYellow','pastelGreen','pastelBlue','pastelIndigo','pastelViolet']);
  function removeInheritedMark(text,editor){
    let mark=text.parentElement.closest('mark');
    while(mark&&editor.contains(mark)){
      const before=document.createRange();before.selectNodeContents(mark);before.setEndBefore(text);
      const after=document.createRange();after.selectNodeContents(mark);after.setStartAfter(text);
      // Extract AFTER first, so splitting its ancestors does not move the start.
      const tail=after.extractContents(),head=before.extractContents();
      if(head.textContent||head.querySelector('br,input')){const copy=mark.cloneNode(false);copy.append(head);mark.before(copy);}
      if(tail.textContent||tail.querySelector('br,input')){const copy=mark.cloneNode(false);copy.append(tail);mark.after(copy);}
      mark.replaceWith(...mark.childNodes);
      mark=text.parentElement.closest('mark');
    }
  }
  window.studyTextHighlight=(editor,range,color)=>{
    if(!range||!editor.contains(range.startContainer)||!editor.contains(range.endContainer)||color!==null&&!colors.has(color))return null;
    if(range.collapsed){
      if(color!==null)return null;
      const mark=(range.startContainer.nodeType===3?range.startContainer.parentElement:range.startContainer).closest('mark');
      if(mark&&editor.contains(mark))mark.replaceWith(...mark.childNodes);
      return range;
    }
    const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT),parts=[];
    let text;
    while(text=walker.nextNode()){
      if(!text.length||text.parentElement.closest('.margin-note,.postit,[contenteditable="false"],button,script,style')||!range.intersectsNode(text))continue;
      const start=text===range.startContainer?range.startOffset:0,end=text===range.endContainer?range.endOffset:text.length;
      if(end>start)parts.push({text,start,end});
    }
    if(!parts.length)return null;
    // Work backwards so offsets in the earlier text nodes remain unchanged.
    for(let i=parts.length-1;i>=0;i--){
      const part=parts[i];let selected=part.text;
      if(part.end<selected.length)selected.splitText(part.end);
      if(part.start>0)selected=selected.splitText(part.start);
      removeInheritedMark(selected,editor);
      if(color!==null){const mark=document.createElement('mark');mark.dataset.highlight=color;selected.before(mark);mark.append(selected);}
      part.selected=selected;
    }
    const result=document.createRange();result.setStart(parts[0].selected,0);
    const last=parts.at(-1).selected;result.setEnd(last,last.length);
    return result;
  };
})();
