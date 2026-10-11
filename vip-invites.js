export function createInvite(){
 const random=crypto.getRandomValues(new Uint8Array(24));
 return 'STUDY-VIP-'+Array.from(random,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function normalizeInvite(value){
 const code=value.trim().toUpperCase();
 if(!/^STUDY-VIP-[A-F0-9]{48}$/.test(code))throw Error('invalid');
 return code;
}
export async function inviteHash(code){
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalizeInvite(code)))),b=>b.toString(16).padStart(2,'0')).join('');
}

