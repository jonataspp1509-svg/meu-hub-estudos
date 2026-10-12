import {session,subscribe,ownerTesting,db,doc,onSnapshot,runTransaction,serverTimestamp} from './study-session.js?v=notebook-20261012';
import {collection} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
export const PRODUCTS=[
 {id:'theme-mint',kind:'theme',name:'Jardim de menta',price:20,color:'#e0f1e9',description:'Um fundo verde leve para o seu espaço.'},
 {id:'theme-sky',kind:'theme',name:'Céu tranquilo',price:20,color:'#deedf9',description:'Um azul suave para estudar no seu ritmo.'},
 {id:'theme-peach',kind:'theme',name:'Pôr do sol',price:20,color:'#fae6dc',description:'Um fundo pêssego acolhedor.'},
 {id:'sound-rain',kind:'sound',name:'Chuva suave',price:30,description:'Uma paisagem sonora de chuva, gerada no navegador.'},
 {id:'sound-sea',kind:'sound',name:'Ondas do mar',price:30,description:'Um som contínuo com ondas suaves, gerado no navegador.'},
 {id:'sound-night',kind:'sound',name:'Noite tranquila',price:30,description:'Uma paisagem sonora suave, gerada no navegador.'}
];
let stop=null,lastUser=null;export let owned=new Set(),shopReady=false,shopError='';const listeners=new Set();
const notify=()=>listeners.forEach(fn=>fn());
export function subscribeShop(fn){listeners.add(fn);fn();return()=>listeners.delete(fn);}
subscribe(s=>{const uid=s.user?.uid||null;if(uid===lastUser)return;lastUser=uid;stop?.();owned=new Set(ownerTesting()?PRODUCTS.map(p=>p.id):[]);shopReady=!uid||ownerTesting();shopError='';notify();if(uid)stop=onSnapshot(collection(db,'userCosmetics',uid,'items'),snap=>{owned=new Set([...snap.docs.map(d=>d.id),...(ownerTesting()?PRODUCTS.map(p=>p.id):[])]);shopReady=true;shopError='';notify();},()=>{shopReady=ownerTesting();if(ownerTesting()){owned=new Set(PRODUCTS.map(p=>p.id));shopError='';notify();return;}shopError='A loja aguarda conexão com o banco. Nenhuma compra será feita.';notify();});});
export async function purchase(id){if(ownerTesting()&&PRODUCTS.some(p=>p.id===id)){owned.add(id);notify();return;}const product=PRODUCTS.find(p=>p.id===id),user=session.user;if(!product||!user||!session.ready||!shopReady)throw Error('Entre com Google e aguarde a loja carregar.');await runTransaction(db,async tx=>{const wref=doc(db,'studyWallets',user.uid),iref=doc(db,'userCosmetics',user.uid,'items',id);const [w,i]=await Promise.all([tx.get(wref),tx.get(iref)]);if(i.exists())throw Error('Você já tem este item. Equipe pelo seu perfil.');if(!w.exists()||w.data().balance<product.price)throw Error('Diamantes insuficientes. Complete sessões no Modo Foco.');tx.update(wref,{balance:w.data().balance-product.price,lastPurchase:id,updatedAt:serverTimestamp()});tx.set(iref,{price:product.price,createdAt:serverTimestamp()});});}
