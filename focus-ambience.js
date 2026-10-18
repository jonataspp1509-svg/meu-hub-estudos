// Original procedural ambience: each scene has its own sound layers and rhythm.
export const ambienceTypes=['cafe','rain','forest','sea','fire'];
export function createAmbientBuffer(context,type){
if(!ambienceTypes.includes(type))throw Error('Ambiente desconhecido');
const rate=context.sampleRate,duration=24,buffer=context.createBuffer(2,rate*duration,rate);
for(let channel=0;channel<2;channel++){
const data=buffer.getChannelData(channel);let low=0,brown=0;
for(let i=0;i<data.length;i++){const t=i/rate,white=Math.random()*2-1;low+=.018*(white-low);brown=(brown+.018*white)/1.018;
if(type==='rain')data[i]=white*.17+low*.12;
if(type==='sea'){const wave=Math.pow(.5-.5*Math.cos(2*Math.PI*t/8),2);data[i]=(white*.07+low*.9)*(.12+.88*wave);}
if(type==='forest')data[i]=low*.25*(.55+.45*Math.sin(2*Math.PI*t/12)**2);
if(type==='fire')data[i]=brown*.65+low*.12;
if(type==='cafe'){let voices=0;for(let v=0;v<4;v++){const f=95+v*37+channel*2,syllable=Math.max(0,Math.sin(2*Math.PI*(1.7+v*.31)*t+v))*Math.max(0,Math.sin(2*Math.PI*(.18+v*.07)*t+v));voices+=syllable*(Math.sin(2*Math.PI*f*t+.5*Math.sin(t*9+v))+.35*Math.sin(2*Math.PI*f*2*t))*.014;}data[i]=voices+low*.2;}
}
function event(at,length,volume,fn){const start=Math.floor(at*rate),count=Math.floor(length*rate);for(let j=0;j<count&&start+j<data.length;j++){const u=j/rate;data[start+j]+=volume*fn(u,j/count);}}
if(type==='forest')for(let at=.7+channel*.25;at<duration;at+=1.7+Math.random()*2.1){const f=1800+Math.random()*1400;for(let n=0;n<3;n++)event(at+n*.18,.13,.075,(t,p)=>Math.sin(2*Math.PI*(f*t+1200*t*t))*Math.sin(Math.PI*p)**2);}
if(type==='fire')for(let at=.1;at<duration;at+=.12+Math.random()*.6)event(at,.018+Math.random()*.07,.15+Math.random()*.12,(t,p)=>(Math.random()*2-1)*Math.exp(-p*7));
if(type==='rain')for(let at=.1;at<duration;at+=.07+Math.random()*.18)event(at,.014,.035,(t,p)=>Math.sin(2*Math.PI*2400*t)*Math.exp(-p*8));
if(type==='cafe')for(let at=1.2+channel*.8;at<duration;at+=3+Math.random()*3)event(at,.38,.065,(t,p)=>(Math.sin(2*Math.PI*2100*t)+.45*Math.sin(2*Math.PI*3420*t))*Math.exp(-p*11));
// Short fades keep the repeating scene free of abrupt loop clicks.
const fade=rate*.035;for(let i=0;i<data.length;i++){const envelope=Math.min(1,i/fade,(data.length-1-i)/fade);data[i]=Math.max(-.8,Math.min(.8,data[i]))*envelope;}
}
return buffer;
}
