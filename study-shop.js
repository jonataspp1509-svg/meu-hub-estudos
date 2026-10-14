import {MUSIC_PRODUCTS} from './music-catalog.js?v=sound-focus20261014';
import {session,subscribe,ownerTesting,db,doc,onSnapshot,runTransaction,serverTimestamp} from './study-session.js?v=sound-focus20261014';
import {collection} from './study-storage.js?v=free20261014';
export const PRODUCTS=[
 {id:'theme-mint',kind:'theme',name:'Jardim de menta',price:0,color:'#e0f1e9',description:'Um fundo verde leve para o seu espaço.'},
 {id:'theme-sky',kind:'theme',name:'Céu tranquilo',price:0,color:'#deedf9',description:'Um azul suave para estudar no seu ritmo.'},
 {id:'theme-peach',kind:'theme',name:'Pôr do sol',price:0,color:'#fae6dc',description:'Um fundo pêssego acolhedor.'},
 {id:'theme-rose-violet',kind:'theme',name:'Rosa e violeta',price:0,color:'linear-gradient(135deg,#f3bfd7 0%,#d7b8f0 46%,#b9b5ee 100%)',description:'Um encontro suave entre rosa e roxo.'},
 {id:'theme-red-black',kind:'theme',name:'Rubi noturno',price:0,tone:'dark',color:'radial-gradient(ellipse at 10% 15%,#9b253c,transparent 65%),linear-gradient(140deg,#351721,#11121c 85%)',description:'Vermelho profundo e preto, com leitura confortável.'},
 {id:'theme-ocean',kind:'theme',name:'Aurora azul',price:0,color:'linear-gradient(135deg,#bfdff0,#c6c8f0 48%,#e9c7df)',description:'Azul, lavanda e um toque de rosa.'},
 {id:'theme-sunset',kind:'theme',name:'Horizonte coral',price:0,color:'linear-gradient(140deg,#ffe0b8,#f2b9c1 50%,#c4bce9)',description:'Pêssego, coral e lavanda.'},
 {id:'theme-forest-night',kind:'theme',name:'Floresta noturna',price:0,tone:'dark',color:'radial-gradient(ellipse at 85% 20%,#236b61,transparent 65%),linear-gradient(135deg,#152f35,#141927)',description:'Verde profundo e azul de noite.'},
 {id:'sound-rain',kind:'sound',name:'Chuva suave',price:0,description:'Uma paisagem sonora de chuva, gerada no navegador.'},
 {id:'sound-sea',kind:'sound',name:'Ondas do mar',price:0,description:'Um som contínuo com ondas suaves, gerado no navegador.'},
 {id:'sound-night',kind:'sound',name:'Noite tranquila',price:0,description:'Uma paisagem sonora suave, gerada no navegador.'}
];
PRODUCTS.push(...MUSIC_PRODUCTS);
const free=()=>PRODUCTS.filter(p=>!p.price).map(p=>p.id);export let owned=new Set(free()),shopReady=true,shopError='';const listeners=new Set();let stop=null,uid=null,lastTesting=false;
const notify=()=>listeners.forEach(fn=>fn());
export function subscribeShop(fn){listeners.add(fn);fn();return()=>listeners.delete(fn);}
subscribe(s=>{const next=s.user?.uid||null;if(next===uid&&lastTesting===s.testing)return;stop?.();uid=next;lastTesting=s.testing;owned=new Set(s.testing?PRODUCTS.map(p=>p.id):free());shopReady=!uid||s.testing;shopError='';notify();if(uid){const owner=uid;stop=onSnapshot(collection(db,'userCosmetics',owner,'items'),snap=>{if(uid!==owner)return;owned=new Set([...(ownerTesting()?PRODUCTS.map(p=>p.id):free()),...snap.docs.map(d=>d.id)]);shopReady=true;shopError='';notify();},()=>{if(uid!==owner)return;if(ownerTesting()){owned=new Set(PRODUCTS.map(p=>p.id));shopReady=true;shopError='';notify();return;}shopReady=false;shopError='As trocas aguardam conexão. Nenhum diamante foi usado.';notify();});}});
export async function purchase(id){const product=PRODUCTS.find(p=>p.id===id),user=session.user;if(!product)throw Error('Escolha uma música disponível.');if(!product.price||ownerTesting())return;if(!user||!shopReady)throw Error('Conecte sua conta e aguarde seus diamantes.');await runTransaction(db,async tx=>{const wref=doc(db,'studyWallets',user.uid),iref=doc(db,'userCosmetics',user.uid,'items',id),[wallet,item]=await Promise.all([tx.get(wref),tx.get(iref)]);if(item.exists())return;if(!wallet.exists()||wallet.data().balance<product.price)throw Error('Complete sessões de foco para ganhar mais diamantes.');tx.update(wref,{balance:wallet.data().balance-product.price,lastPurchase:id,updatedAt:serverTimestamp()});tx.set(iref,{kind:'music',price:product.price,createdAt:serverTimestamp()});});if(session.user?.uid===user.uid){owned.add(id);notify();}}
