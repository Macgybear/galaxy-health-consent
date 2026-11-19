import {createClient} from '@supabase/supabase-js';
const client=createClient('https://qulxvyrycjeasvokuzlq.supabase.co','sb_publishable_RtmbcXmwEQUXXpHO0ryYgQ_1UWAMWF5',{
 auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:true}
});
const element=id=>document.getElementById(id);
const authorizationId=new URLSearchParams(location.search).get('authorization_id');
const say=text=>{element('status').textContent=text;};
let details=null;
function safeRedirect(destination){
 const target=new URL(destination);
 // Supabase validates exact registered redirect URIs. Recheck here to prevent unsafe schemes.
 if(target.protocol!=='https:')throw Error('unsafe_redirect');
 location.assign(target.href);
}
async function run(action){
 const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
 try{await action();}catch{say('No se pudo completar. Comprueba el código o vuelve a iniciar la conexión desde ChatGPT.');}
 finally{buttons.forEach(b=>b.disabled=false);}
}
async function loadConsent(){
 if(!authorizationId || !/^[A-Za-z0-9_-]{16,128}$/.test(authorizationId)){say('Abre esta página desde la conexión OAuth de Galaxy Health en ChatGPT.');return;}
 const {data:{user}}=await client.auth.getUser();
 if(!user){element('login').hidden=false;say('Inicia sesión con el correo personal autorizado.');return;}
 const {data,error}=await client.auth.oauth.getAuthorizationDetails(authorizationId);
 if(error || !data)throw Error('invalid_authorization');
 if(!('authorization_id' in data)){safeRedirect(data.redirect_url);return;}
 details=data;
 element('client').textContent=data.client.name;
 element('redirect').textContent=data.redirect_uri;
 element('scopes').textContent=data.scope||'No se han solicitado ámbitos adicionales.';
 element('login').hidden=true;element('consent').hidden=false;
 say('Revisa la solicitud antes de permitir la consulta.');
}
element('send').addEventListener('click',()=>run(async()=>{
 const email=element('email').value.trim();
 if(!element('email').checkValidity() || !email)throw Error('email');
 const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname+'?authorization_id='+encodeURIComponent(authorizationId)}});
 if(error)throw error;say('Abre el enlace de acceso recibido en tu correo personal. Volverás a esta página para revisar el consentimiento.');
}));
element('verify').addEventListener('click',()=>run(async()=>{
 const token=element('code').value.trim();element('code').value='';
 const {error}=await client.auth.verifyOtp({email:element('email').value.trim(),token,type:'email'});
 if(error)throw error;await loadConsent();
}));
element('approve').addEventListener('click',()=>run(async()=>{
 if(!details)throw Error('missing_consent');
 const {data,error}=await client.auth.oauth.approveAuthorization(authorizationId);
 if(error || !data)throw Error('approval_failed');safeRedirect(data.redirect_url);
}));
element('deny').addEventListener('click',()=>run(async()=>{
 const {data,error}=await client.auth.oauth.denyAuthorization(authorizationId);
 if(error || !data)throw Error('denial_failed');safeRedirect(data.redirect_url);
}));
run(loadConsent);
