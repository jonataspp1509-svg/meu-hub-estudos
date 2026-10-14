export const PRODUCTS=[
 {id:'theme-mint',kind:'theme',name:'Jardim de menta',price:0,color:'#e0f1e9',description:'Um fundo verde leve para o seu espaço.'},
 {id:'theme-sky',kind:'theme',name:'Céu tranquilo',price:0,color:'#deedf9',description:'Um azul suave para estudar no seu ritmo.'},
 {id:'theme-peach',kind:'theme',name:'Pôr do sol',price:0,color:'#fae6dc',description:'Um fundo pêssego acolhedor.'},
 {id:'sound-rain',kind:'sound',name:'Chuva suave',price:0,description:'Uma paisagem sonora de chuva, gerada no navegador.'},
 {id:'sound-sea',kind:'sound',name:'Ondas do mar',price:0,description:'Um som contínuo com ondas suaves, gerado no navegador.'},
 {id:'sound-night',kind:'sound',name:'Noite tranquila',price:0,description:'Uma paisagem sonora suave, gerada no navegador.'}
];
export let owned=new Set(PRODUCTS.map(p=>p.id)),shopReady=true,shopError='';
export function subscribeShop(fn){fn();return()=>{};}
export async function purchase(id){if(!owned.has(id))throw Error('Escolha uma personalização disponível.');}
