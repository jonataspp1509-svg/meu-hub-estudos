import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {getFirestore,doc,setDoc,updateDoc,runTransaction,serverTimestamp,collection,query,orderBy,limit,onSnapshot} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import {createInvite,inviteHash} from './vip-invites.js?v=1';
const app=getApps().some(a=>a.name==='[DEFAULT]')?getApp():initializeApp({apiKey:'AIzaSyAUcyfIrmue8JDpcNNjkT8QViLB5bnuawY',authDomain:'studyflow-788a2.firebaseapp.com',projectId:'studyflow-788a2'});
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let current=null,admin=false,busy=false,activeMember=false,stopCodes=null,stopMember=null,epoch=0;
const owner=user=>user?.email==='jonataspp1509@gmail.com'&&user.emailVerified&&user.providerData.some(p=>p.providerId==='google.com');
function status(message){$('vipStatus').textContent=message;}
function controls(){ $('generateInvite').disabled=busy||!admin; $('activateVip').disabled=busy||!current||activeMember; }
onAuthStateChanged(auth,user=>{
 ++epoch;stopCodes?.();stopMember?.();stopCodes=null;stopMember=null;current=user;admin=Boolean(owner(user));activeMember=false;
 $('inviteAdmin').hidden=!admin;$('receiverVip').hidden=admin;$('createdInvite').hidden=true;$('generatedCode').value='';$('inviteList').replaceChildren();controls();
 if(!user)return;const version=epoch;
 stopMember=onSnapshot(doc(db,'vipMembers',user.uid),snapshot=>{if(version!==epoch)return;activeMember=snapshot.exists();controls();},()=>{if(version===epoch)status('Não consegui confirmar o VIP da conta.');});
 if(admin)stopCodes=onSnapshot(query(collection(db,'vipCodes'),orderBy('createdAt','desc'),limit(50)),snapshot=>{
  if(version!==epoch)return;$('adminStatus').textContent='';$('inviteList').replaceChildren();
  for(const item of snapshot.docs){const data=item.data();if(data.singleUse!==true)continue;
   const row=document.createElement('li'),label=document.createElement('span');label.textContent='Convite '+item.id.slice(0,10)+' · '+(data.usedBy?'Usado':data.active?'Disponível':'Desativado');row.append(label);
   if(data.active&&!data.usedBy){const button=document.createElement('button');button.type='button';button.textContent='Desativar';button.onclick=async()=>{if(!confirm('Desativar este convite ainda não utilizado?'))return;button.disabled=true;try{await updateDoc(item.ref,{active:false});}catch(e){$('adminStatus').textContent='Não consegui desativar o convite.';button.disabled=false;}};row.append(' ',button);}
   $('inviteList').append(row);
  }
  if(!$('inviteList').childElementCount){const row=document.createElement('li');row.textContent='Nenhum convite individual criado ainda.';$('inviteList').append(row);}
 },()=>{if(version===epoch)$('adminStatus').textContent='A geração aguarda a atualização das regras de convites no Firebase.';});
});
$('generateInvite').onclick=async()=>{
 if(busy||!admin||!current)return;busy=true;controls();const user=current,version=epoch;$('adminStatus').textContent='Gerando convite…';
 try{const code=createInvite(),hash=await inviteHash(code);await setDoc(doc(db,'vipCodes',hash),{active:true,singleUse:true,createdAt:serverTimestamp(),createdBy:user.uid,usedBy:null,usedAt:null});
  if(version!==epoch)return;$('generatedCode').value=code;$('createdInvite').hidden=false;$('adminStatus').textContent='Convite criado. Copie e envie para uma pessoa. Ele só é mostrado agora.';
 }catch(e){if(version===epoch)$('adminStatus').textContent='Não consegui gerar. Confirme que as novas regras de convites foram publicadas no Firebase.';}
 finally{busy=false;controls();}
};
$('copyInvite').onclick=async()=>{try{await navigator.clipboard.writeText($('generatedCode').value);$('adminStatus').textContent='Convite copiado.';}catch(e){$('generatedCode').focus();$('generatedCode').select();$('adminStatus').textContent='Selecione e copie o código.';}};
$('vipForm').onsubmit=async event=>{
 event.preventDefault();if(busy||!current||activeMember||admin)return;busy=true;controls();status('Conferindo seu convite…');const uid=current.uid,version=epoch;
 try{const hash=await inviteHash($('vipCode').value),codeRef=doc(db,'vipCodes',hash),memberRef=doc(db,'vipMembers',uid);
  await runTransaction(db,async tx=>{
   const code=await tx.get(codeRef),member=await tx.get(memberRef);
   if(member.exists())throw Error('member');
   const data=code.data();if(!code.exists()||data.singleUse!==true||data.active!==true||data.usedBy!==null||data.usedAt!==null)throw Error('invalid');
   tx.update(codeRef,{active:false,usedBy:uid,usedAt:serverTimestamp()});
   tx.set(memberRef,{kind:'vip',inviteHash:hash,createdAt:serverTimestamp()});
  });
  if(version===epoch){$('vipCode').value='';status('VIP ativado nesta conta! Este convite já foi usado e não pode ativar outra conta.');}
 }catch(e){if(version===epoch)status(e.message==='invalid'?'Convite inválido, já usado ou desativado.':e.message==='member'?'Sua conta já tem VIP.':'Não consegui ativar. Confira a conexão e a atualização das regras no Firebase.');}
 finally{busy=false;controls();}
};
window.addEventListener('pagehide',()=>{stopCodes?.();stopMember?.();});

