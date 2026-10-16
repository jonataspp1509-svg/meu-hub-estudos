export function irrigation(soil,water,threshold=40,minimum=20,operator='and') {
  const dry=soil<threshold, available=water>=minimum;
  return operator==='or'?dry||available:dry&&available;
}
export const CASES=[[39,20,true],[40,20,false],[39,19,false],[39,80,true],[80,80,false]];
export class TrainingTerminal {
  constructor(){this.cwd='/home/aluno';this.nodes=new Map([['/home/aluno',{dir:true}],['/home',{dir:true}],['/',{dir:true}]]);}
  path(value=''){const parts=(value.startsWith('/')?value:this.cwd+'/'+value.replace(/^~(?=\/|$)/,'/home/aluno')).split('/');if(value.startsWith('~'))return this.path(value.replace(/^~/,'/home/aluno'));const result=[];for(const p of parts){if(p==='..')result.pop();else if(p&&p!=='.')result.push(p);}const path='/'+result.join('/');if(!(path==='/home/aluno'||path.startsWith('/home/aluno/'))&&path!=='/home'&&path!=='/')throw Error('Use apenas a área de treino /home/aluno.');return path;}
  run(command){try{return this.execute(command.trim());}catch(e){return e.message;}}
  execute(command){if(!command)return '';const [cmd,...args]=command.split(/\s+/);if(cmd==='help')return 'Treino: pwd, ls, cd, mkdir -p, touch, echo > ou >>, cat, grep, chmod u+x, whoami, uname, clear. Os arquivos existem apenas nesta simulação.';if(cmd==='pwd')return this.cwd;if(cmd==='whoami')return 'aluno';if(cmd==='uname')return 'Linux (terminal de treino no navegador)';if(cmd==='clear')return '\u0000';if(cmd==='sudo'||cmd==='apt'||cmd==='g++')return 'Este terminal não instala nem compila. Execute esse comando na sua máquina virtual, seguindo a UC 02.';
    if(cmd==='cd'){const p=this.path(args[0]||'~');if(!this.nodes.get(p)?.dir)throw Error('Pasta não encontrada.');this.cwd=p;return '';}
    if(cmd==='ls'){const p=this.path(args.find(a=>!a.startsWith('-'))||'');if(!this.nodes.get(p)?.dir)throw Error('Pasta não encontrada.');return [...this.nodes].filter(([k])=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')).map(([k,n])=>k.slice(p.length+1)+(n.dir?'/':'')).join('  ');}
    if(cmd==='mkdir'){const recursive=args.includes('-p');for(const arg of args.filter(a=>a!=='-p')){const p=this.path(arg);if(recursive){const pieces=p.split('/').filter(Boolean);for(let i=1;i<=pieces.length;i++){const k='/'+pieces.slice(0,i).join('/');if(this.nodes.has(k)&&!this.nodes.get(k).dir)throw Error('Um arquivo ocupa esse caminho.');this.nodes.set(k,{dir:true});}}else {if(!this.nodes.get(p.slice(0,p.lastIndexOf('/')))?.dir)throw Error('Crie a pasta pai primeiro ou use mkdir -p.');if(this.nodes.has(p))throw Error('Esse caminho já existe.');this.nodes.set(p,{dir:true});}}return '';}
    if(cmd==='touch'){for(const arg of args){const p=this.path(arg);if(!this.nodes.get(p.slice(0,p.lastIndexOf('/')))?.dir)throw Error('Pasta pai não encontrada.');if(!this.nodes.has(p))this.nodes.set(p,{text:''});}return '';}
    if(cmd==='echo'){const match=command.match(/^echo\s+(.+?)\s*(>>|>)\s*(\S+)$/);if(!match)return command.slice(5).replace(/^['"]|['"]$/g,'');const p=this.path(match[3]);if(!this.nodes.get(p.slice(0,p.lastIndexOf('/')))?.dir)throw Error('Pasta pai não encontrada.');if(this.nodes.get(p)?.dir)throw Error('Esse caminho é uma pasta.');const content=match[1].trim().replace(/^(['"])(.*)\1$/,'$2')+'\n';this.nodes.set(p,{...this.nodes.get(p),text:(match[2]==='>>'?(this.nodes.get(p)?.text||''):'')+content});return '';}
    if(cmd==='cat'){return args.map(a=>{const node=this.nodes.get(this.path(a));if(!node||node.dir)throw Error('Arquivo não encontrado.');return node.text;}).join('');}
    if(cmd==='grep'){const node=this.nodes.get(this.path(args[1]));if(!node||node.dir)throw Error('Use grep palavra arquivo.');return node.text.split('\n').filter(l=>l.includes((args[0]||'').replace(/^['"]|['"]$/g,''))).join('\n');}
    if(cmd==='chmod'){if(args[0]!=='u+x')throw Error('Neste treino, use chmod u+x arquivo.');const n=this.nodes.get(this.path(args[1]));if(!n||n.dir)throw Error('Arquivo não encontrado.');n.executable=true;return '';}
    return 'Comando não disponível neste treino. Digite help para consultar.';
  }
  passed(){return ['leituras','relatorios','scripts'].every(p=>this.nodes.get('/home/aluno/aurora/'+p)?.dir)&&(/^canteiro,umidade\r?\n[^\n]+\n[^\n]+/).test(this.nodes.get('/home/aluno/aurora/leituras/dados.csv')?.text||'');}
}
