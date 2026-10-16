// Para conectar IA real, descomenta y reemplaza la URL del endpoint HTTPS desplegado:
// window.AFTERCARE_API_URL = "https://tu-servidor.example.com/api/chat";
const STORAGE_KEY = "aftercare-v1";
const PROFILE_KEY = "aftercare-profile-v1";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const iconMap = {water:"≈",meal:"♡",movement:"↗",sleep:"☾",mood:"☼",note:"✧"};
const labelMap = {water:"Agua",meal:"Comida",movement:"Actividad física",sleep:"Sueño / descanso",mood:"Estado de ánimo",note:"Nota personal"};
let records = loadRecords();
let profile = localStorage.getItem(PROFILE_KEY) || "Amigo/a";
let deferredInstallPrompt = null;
let toastTimer;

function loadRecords(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(x)?x:[]}catch{return []}}
function saveRecords(){localStorage.setItem(STORAGE_KEY,JSON.stringify(records));renderAll()}
function showToast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function prettyDate(iso){if(!iso)return "";const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("es-EC",{day:"numeric",month:"short"})}
function todayRecords(){return records.filter(r=>r.date===todayISO())}
function addRecord(data){records.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),createdAt:new Date().toISOString(),...data});saveRecords();showToast("Registro guardado. ¡Gracias por dedicarte un momento!")}
function renderAll(){renderDashboard();renderRecords()}
function renderDashboard(){
  const today=todayRecords();
  const sum=(type)=>today.filter(r=>r.type===type).reduce((n,r)=>n+(Number(r.amount)||0),0);
  const water=sum("water"),move=sum("movement"),sleep=sum("sleep"),meals=today.filter(r=>r.type==="meal").length;
  $("#water-total").textContent=water;$("#move-total").textContent=move;$("#sleep-total").textContent=sleep;$("#meal-total").textContent=meals;
  $("#water-progress").style.width=Math.min(100,water/8*100)+"%";$("#move-progress").style.width=Math.min(100,move/30*100)+"%";$("#sleep-progress").style.width=Math.min(100,sleep/8*100)+"%";$("#meal-progress").style.width=Math.min(100,meals/3*100)+"%";
  $("#water-foot").textContent=water?`${Math.max(0,8-water)} vasos para tu referencia`:"Registra tu primer vaso";
  $("#move-foot").textContent=move?"Movimiento registrado":"Cada movimiento cuenta";
  $("#sleep-foot").textContent=sleep?"Descanso anotado":"Anota cómo descansaste";
  $("#meal-foot").textContent=meals?`${meals} registro${meals===1?"":"s"} hoy`:"Registra lo que comiste";
  const now=new Date();$("#today-label").textContent=now.toLocaleDateString("es-EC",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();$("#date-pill").textContent=now.toLocaleDateString("es-EC",{day:"numeric",month:"short"});
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;days.push({iso,label:d.toLocaleDateString("es-EC",{weekday:"short"}).replace(".","").slice(0,3),count:records.filter(r=>r.date===iso).length})}
  const max=Math.max(1,...days.map(d=>d.count));
  $("#week-chart").innerHTML=days.map(d=>`<div class="chart-day" title="${escapeHTML(prettyDate(d.iso))}: ${d.count} registros"><div class="bar-wrap"><div class="bar" style="height:${d.count?Math.max(9,d.count/max*100):4}%"></div></div><span class="day-label">${escapeHTML(d.label)}</span></div>`).join("");
  const count=days.reduce((n,d)=>n+d.count,0);$("#week-summary").textContent=count?`${count} registro${count===1?"":"s"} esta semana`:"Empieza cuando quieras";
  $("#greeting").innerHTML=`Hola, ${escapeHTML(profile)} <span class="wave">✦</span>`;$("#profile-name").textContent=profile;
}
function renderRecords(){
  const list=$("#records-list"),empty=$("#empty-records");
  if(!records.length){list.innerHTML="";empty.hidden=false;return}
  empty.hidden=true;
  list.innerHTML=records.slice(0,30).map(r=>`<article class="record"><div class="record-icon ${escapeHTML(r.type)}">${iconMap[r.type]||"✧"}</div><div class="record-content"><strong>${escapeHTML(r.detail)}</strong><span>${escapeHTML(labelMap[r.type]||"Registro")} · ${escapeHTML(prettyDate(r.date))}</span></div>${r.amount!==""&&r.amount!=null?`<span class="record-amount">${escapeHTML(r.amount)} ${escapeHTML(r.unit||"")}</span>`:""}<button class="delete-record" data-delete="${escapeHTML(r.id)}" aria-label="Eliminar registro">×</button></article>`).join("");
}
function navigate(section){
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===section));
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`${section}-view`));
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.section)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
$("#habit-date").value=todayISO();
$("#habit-form").addEventListener("submit",e=>{
  e.preventDefault();
  const type=$("#habit-type").value,detail=$("#habit-detail").value.trim(),amount=$("#habit-amount").value,unit=$("#habit-unit").value,date=$("#habit-date").value;
  if(!detail||!date){showToast("Completa el detalle y la fecha.");return}
  addRecord({type,detail,amount:amount===""?"":Number(amount),unit,date});
  $("#habit-detail").value="";$("#habit-amount").value="";$("#habit-unit").value="";
});
$("#records-list").addEventListener("click",e=>{
  const b=e.target.closest("[data-delete]");if(!b)return;
  records=records.filter(r=>r.id!==b.dataset.delete);saveRecords();showToast("Registro eliminado.");
});
$$("[data-quick]").forEach(b=>b.addEventListener("click",()=>{
  const type=b.dataset.quick;navigate("habits");$("#habit-type").value=type;
  const prompts={water:["Un vaso de agua","1","vasos"],movement:["Movimiento o actividad","10","min"],sleep:["Horas de descanso","8","horas"],meal:["Comida registrada","",""]};
  const [detail,amount,unit]=prompts[type];$("#habit-detail").value=detail;$("#habit-amount").value=amount;$("#habit-unit").value=unit;
  $("#habit-detail").focus();
}));
$("#export-btn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({app:"AFTERCARE",exportedAt:new Date().toISOString(),records},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`aftercare-registros-${todayISO()}.json`;a.click();URL.revokeObjectURL(url);showToast("Copia de tus datos exportada.");
});
$("#clear-btn").addEventListener("click",()=>{
  if(!records.length){showToast("Todavía no hay registros que borrar.");return}
  if(confirm("¿Seguro que quieres borrar todos tus registros? Esta acción no se puede deshacer.")){records=[];saveRecords();showToast("Registros borrados.")}
});
$("#profile-button").addEventListener("click",()=>{$("#name-input").value=profile==="Amigo/a"?"":profile;$("#name-dialog").showModal()});
$("#name-form").addEventListener("submit",e=>{
  if(e.submitter?.value==="cancel")return;
  const name=$("#name-input").value.trim();profile=name||"Amigo/a";localStorage.setItem(PROFILE_KEY,profile);renderDashboard();
});
$("#privacy-btn").addEventListener("click",()=>$("#privacy-dialog").showModal());

function addMessage(text,who){
  const wrap=document.createElement("div");wrap.className=`message ${who}`;
  const avatar=document.createElement("div");avatar.className="message-avatar";avatar.textContent=who==="assistant"?"✦":"A";
  const bubble=document.createElement("div");bubble.className="bubble";
  const p=document.createElement("p");p.textContent=text;bubble.appendChild(p);
  const time=document.createElement("span");time.className="message-time";time.textContent=new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"});bubble.appendChild(time);
  if(who==="assistant"){const actions=document.createElement("div");actions.className="bubble-actions";const speak=document.createElement("button");speak.className="speak-message";speak.textContent="▶ Escuchar";speak.type="button";speak.addEventListener("click",()=>speakText(text));actions.appendChild(speak);bubble.appendChild(actions)}
  wrap.append(avatar,bubble);$("#chat-messages").appendChild(wrap);$("#chat-messages").scrollTop=$("#chat-messages").scrollHeight;
}
function localReply(message){
  const m=message.toLowerCase();
  if(/agua|hidrata|tomar agua/.test(m))return "Puedes vincular el agua a algo que ya haces: por ejemplo, tomar un poco al levantarte o durante una pausa. Si te ayuda, usa recordatorios suaves. Las necesidades varían según la persona y el día; escucha tu sed y sigue las indicaciones médicas si tienes alguna.";
  if(/estr[eé]s|ansied|relaj|nervios|agob/.test(m))return "Podrías probar una pausa breve: apoya los pies en el suelo, relaja los hombros y respira lentamente sin forzarte. También ayuda dividir lo que te preocupa en un paso pequeño. Si esto se vuelve intenso o frecuente, cuéntaselo a un adulto de confianza o a un profesional.";
  if(/sueño|dormir|descans/.test(m))return "Una rutina tranquila puede ayudar: intenta bajar el ritmo antes de acostarte, reducir las pantallas si te resulta posible y mantener horarios razonables. No todos los días salen igual; descansar también significa darte margen cuando lo necesitas.";
  if(/comer|comida|aliment|dieta/.test(m))return "Intenta pensar en la comida como una forma de cuidar y dar energía a tu cuerpo, no como algo que tengas que ganarte. Si puedes, busca variedad y horarios que se adapten a ti. Evita reglas extremas; si la comida te preocupa mucho, habla con un adulto de confianza o un profesional.";
  if(/ejercicio|actividad|mover|deporte|caminar/.test(m))return "El movimiento puede ser algo sencillo que disfrutes: caminar, bailar, estirarte suavemente o jugar un deporte. No necesitas hacerlo perfecto ni convertirlo en castigo. Elige algo que se sienta bien y descansa si lo necesitas.";
  if(/organiza|estudi|tarea|tiempo|día|dia/.test(m))return "Prueba elegir solo tres prioridades para hoy: una importante, una pequeña y una que te haga bien. Trabaja en bloques cortos con pausas y deja espacio para imprevistos. Si no terminas todo, puedes reorganizarlo mañana.";
  if(/triste|mal día|mal dia|solo|sola/.test(m))return "Siento que estés pasando por un momento difícil. No tienes que resolver todo ahora mismo. Puede ayudar hablar con alguien en quien confíes y hacer una cosa pequeña que te dé calma. Si quieres, cuéntame qué parte del día se te está haciendo más difícil.";
  if(/hola|buenas|hey|buenos días|buenas tardes/.test(m))return "¡Hola! ✦ ¿Qué te gustaría trabajar hoy: organización, descanso, movimiento, hábitos o simplemente poner en palabras cómo te sientes?";
  return "Gracias por contármelo. Puedo ayudarte a pensar en pasos pequeños relacionados con hábitos, descanso, organización o manejo del estrés. Para empezar, ¿qué sería algo sencillo y realista que te gustaría intentar hoy? Recuerda que soy una herramienta de apoyo y no sustituyo a un profesional.";
}
async function getAssistantReply(message){
  // If a backend URL is configured, request a real AI reply; otherwise use local demo mode.
  const endpoint=window.AFTERCARE_API_URL;
  if(endpoint){
    try{const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})});
      if(response.ok){const data=await response.json();if(data.reply)return data.reply}
    }catch(err){console.warn("No se pudo conectar con la IA; usando modo local.",err)}
  }
  return localReply(message);
}
$("#chat-form").addEventListener("submit",async e=>{
  e.preventDefault();const input=$("#chat-input"),message=input.value.trim();if(!message)return;
  addMessage(message,"user");input.value="";input.disabled=true;$("#ai-mode-note").textContent="Pensando…";
  const pending=document.createElement("div");pending.className="message assistant";pending.id="typing";pending.innerHTML='<div class="message-avatar">✦</div><div class="bubble"><p>Estoy pensando...</p></div>';$("#chat-messages").appendChild(pending);$("#chat-messages").scrollTop=$("#chat-messages").scrollHeight;
  const reply=await getAssistantReply(message);$("#typing")?.remove();addMessage(reply,"assistant");input.disabled=false;input.focus();$("#ai-mode-note").textContent=window.AFTERCARE_API_URL?"Conectado a un servidor de IA (si está disponible).":"Modo local: respuestas de demostración.";
});
$$(".suggestion").forEach(b=>b.addEventListener("click",()=>{$("#chat-input").value=b.textContent;$("#chat-form").requestSubmit()}));
function speakText(text){if(!("speechSynthesis" in window)){showToast("Este navegador no tiene lectura por voz.");return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="es-ES";u.rate=.96;window.speechSynthesis.speak(u)}
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
$("#voice-btn").addEventListener("click",()=>{
  if(!SpeechRecognition){showToast("La entrada por voz no está disponible en este navegador. Prueba Chrome.");return}
  const rec=new SpeechRecognition();rec.lang="es-ES";rec.interimResults=false;rec.maxAlternatives=1;
  $("#voice-btn").classList.add("listening");rec.onresult=e=>{$("#chat-input").value=e.results[0][0].transcript;$("#chat-input").focus()};rec.onerror=()=>showToast("No se pudo reconocer la voz. Revisa los permisos del micrófono.");rec.onend=()=>$("#voice-btn").classList.remove("listening");try{rec.start()}catch{$("#voice-btn").classList.remove("listening")}
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("#install-btn").hidden=false});
$("#install-btn").addEventListener("click",async()=>{if(!deferredInstallPrompt){showToast("Usa el menú del navegador: Instalar aplicación o Añadir a pantalla de inicio.");return}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#install-btn").hidden=true});
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost"))navigator.serviceWorker.register("./service-worker.js").catch(console.warn);
renderAll();
