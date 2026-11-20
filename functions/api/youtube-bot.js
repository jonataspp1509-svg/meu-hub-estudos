// Retired: do not create jobs, invoke AI, or modify existing stored summaries.
export function onRequest({request}) {
  return new Response(request.method==='HEAD'?null:JSON.stringify({error:'O resumidor de vídeos foi retirado do StudyFlow.',retired:true}),{status:410,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
