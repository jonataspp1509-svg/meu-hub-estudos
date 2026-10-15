import './study-focus.js?v=together20261015';
import {auth,onAuthStateChanged} from './code-account.js?v=free20261014';
import {canSeeMaterial} from './access-policy.js?v=free20261014';
window.studyAccess={ready:true,uid:null,grade:null,paid:false,plan:'Gratuito'};
window.studyCanSee=path=>canSeeMaterial(path);
const main=document.getElementById('siteContent');
if(main){document.getElementById('menuEscolha').style.display='none';main.style.display='block';document.body.dataset.accessReady='true';}
onAuthStateChanged(auth,user=>{window.studyAccess={ready:true,uid:user?.uid||null,grade:null,paid:!!user,plan:'Gratuito'};document.body.dataset.accessReady='true';document.dispatchEvent(new CustomEvent('studyaccesschange',{detail:window.studyAccess}));if(typeof renderMateriais==='function')renderMateriais();});
