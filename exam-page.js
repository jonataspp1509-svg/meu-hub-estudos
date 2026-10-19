import {subjectName} from './vestibulares-subjects.js';

let pageIndex;
export const examPage=async(exam,subject)=>{
 if(!subject)return null;
 try{pageIndex??=fetch('vestibulares-paginas.json').then(r=>{if(!r.ok)throw Error();return r.json();});const index=await pageIndex,doc=index.documents?.[exam.id],target=doc?.sha256===exam.sha256&&doc.pages?.[subject];if(target&&Number.isInteger(target.page)&&target.page>0&&target.page<=doc.totalPages)return target;}catch{pageIndex=null;}
 return {page:1,label:'Início de '+subjectName(subject)+' ainda não identificado neste PDF; prova completa'};
};
