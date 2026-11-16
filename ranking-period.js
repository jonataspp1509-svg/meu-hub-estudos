// Two-month cycles anchored to the launch period, October–November 2026.
// Monthly focus records remain unchanged and are summed when reading ranking.
export const RANKING_START_MONTH='2026-10';
const anchor=2026*12+9;
const key=index=>`${Math.floor(index/12)}-${String(index%12+1).padStart(2,'0')}`;
export function formatRankingPeriod(start,last){
 const date=value=>new Date(value+'-15T12:00:00Z');
 const first=date(start),end=date(last),month=d=>d.toLocaleDateString('pt-BR',{month:'long',timeZone:'America/Sao_Paulo'});
 return first.getUTCFullYear()===end.getUTCFullYear()?`${month(first)} e ${month(end)} de ${end.getUTCFullYear()}`:`${month(first)} de ${first.getUTCFullYear()} e ${month(end)} de ${end.getUTCFullYear()}`;
}
export function rankingPeriodAt(now=Date.now()){
 const local=new Date(now-3*3600000),index=local.getUTCFullYear()*12+local.getUTCMonth();
 const first=anchor+Math.floor((index-anchor)/2)*2;
 const start=key(first),last=key(first+1),end=key(first+2);
 return {start,last,end,months:2,label:formatRankingPeriod(start,last),resetAt:end+'-01T03:00:00.000Z'};
}
