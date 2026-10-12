export function academyEntry(access) {
  const ready=Boolean(access?.ready&&access?.uid);
  const available=ready&&access.paid===true;
  return {available,href:available?'programacao.html':'plano.html',label:available?'Entrar na escola →':'Ver planos →',status:!ready?'Confirmando seu plano…':available?'Incluído no seu '+(access.plan==='VIP'?'VIP':'Premium'):'Disponível no Premium e VIP'};
}
