// Grafo de los tres workflows tipo n8n (nodos, puertos, ramas, etapas de cámara).
export const WF_W=176, WF_H=66;
export const SUBS=[{mono:'GPT',label:{es:'Modelo',en:'Model'}},{mono:'MEM',label:{es:'Memoria',en:'Memory'}},{mono:'RAG',label:{es:'Conocimiento',en:'Knowledge'}},{mono:'TL',label:{es:'Herramientas',en:'Tools'}}];
export const PORT_Y={ 'true':22, 'false':WF_H-22, a:18, b:WF_H/2, c:WF_H-18 };
export const BR_COLOR={ 'true':'#3EC46A', 'false':'var(--piedra)', a:'var(--ambar)', b:'var(--indigo-2)', c:'var(--piedra)' };
export const BR_LABEL={ 'true':{es:'sí',en:'yes'}, 'false':{es:'no',en:'no'}, a:{es:'caliente',en:'hot'}, b:{es:'tibio',en:'warm'}, c:{es:'frío',en:'cold'} };

export const WFS = [
 {
  name:{es:'Reserva por WhatsApp',en:'WhatsApp booking'},
  title:{es:'De mensaje a reserva pagada',en:'From message to paid booking'},
  desc:{es:'Un disparador, un agente que decide, dos caminos según disponibilidad y todo almacenado al final.',en:'One trigger, an agent that decides, two paths by availability and everything stored at the end.'},
  canvas:{w:1660,h:450}, fit:0.52,
  nodes:[
   {id:'wa',kind:'trigger',x:40,y:210,logo:'whatsapp',label:'WhatsApp Business',sub:{es:'Mensaje entrante',en:'Incoming message'},info:{es:'El único disparador del flujo. Cualquier mensaje nuevo lo arranca, a cualquier hora.',en:'The single trigger of the flow. Any new message starts it, at any hour.'}},
   {id:'ai',kind:'agent',x:270,y:210,logo:'',mono:'IA',label:{es:'Agente de reservas',en:'Booking agent'},sub:{es:'Interpreta y decide',en:'Interprets and decides'},info:{es:'Entiende fechas, número de huéspedes y presupuesto, consulta el conocimiento del negocio y decide el siguiente paso.',en:'Understands dates, guest count and budget, queries the business knowledge and decides the next step.'}},
   {id:'ifd',kind:'if',x:500,y:210,logo:'',mono:'IF',label:{es:'¿Hay disponibilidad?',en:'Availability?'},sub:{es:'Consulta el calendario',en:'Checks the calendar'},info:{es:'Bifurca el flujo comparando las fechas pedidas contra el calendario real de la propiedad.',en:'Branches the flow comparing requested dates against the real property calendar.'}},
   {id:'gcal',kind:'node',x:730,y:90,logo:'calendly',label:'Calendly',sub:{es:'Bloquear fechas',en:'Block dates'},info:{es:'Reserva las fechas de inmediato para que nadie más pueda tomarlas mientras se paga.',en:'Books the dates immediately so nobody else can take them while payment happens.'}},
   {id:'stripe',kind:'node',x:960,y:90,logo:'stripe',label:'Stripe',sub:{es:'Cobrar depósito',en:'Charge deposit'},info:{es:'Genera el enlace de pago del depósito y confirma la reserva solo cuando el cobro se aprueba.',en:'Generates the deposit payment link and confirms the booking only once payment clears.'}},
   {id:'conf',kind:'node',x:1190,y:90,logo:'whatsapp',label:{es:'Confirmar',en:'Confirm'},sub:{es:'Recibo y recordatorio',en:'Receipt and reminder'},info:{es:'Envía el recibo por WhatsApp y programa el recordatorio antes de la llegada.',en:'Sends the receipt on WhatsApp and schedules the reminder before arrival.'}},
   {id:'wl',kind:'node',x:730,y:330,logo:'hubspot',label:{es:'Lista de espera',en:'Waitlist'},sub:{es:'Registrar en CRM',en:'Log in CRM'},info:{es:'Guarda al interesado con sus fechas preferidas para avisarle si se libera un cupo.',en:'Saves the lead with their preferred dates to notify them if a slot frees up.'}},
   {id:'nurt',kind:'node',x:960,y:330,logo:'gmail',label:{es:'Ofrecer alternativas',en:'Offer alternatives'},sub:{es:'Fechas y propiedades',en:'Dates and properties'},info:{es:'Propone otras fechas o propiedades similares en lugar de perder al cliente.',en:'Proposes other dates or similar properties instead of losing the customer.'}},
   {id:'sb',kind:'store',x:1420,y:210,logo:'supabase',label:'Supabase',sub:{es:'Almacenamiento en la nube',en:'Cloud storage'},info:{es:'Cada conversación, decisión y pago queda registrado de forma estructurada para reportes.',en:'Every conversation, decision and payment is stored in structured form for reporting.'}}
  ],
  edges:[['wa','ai'],['ai','ifd'],['ifd','gcal','true'],['gcal','stripe'],['stripe','conf'],['ifd','wl','false'],['wl','nurt'],['conf','sb'],['nurt','sb']],
  stages:[
   {ids:['wa'],z:1.2,label:{es:'Un solo disparador',en:'A single trigger'}},
   {ids:['ai'],z:1.05,label:{es:'El agente interpreta',en:'The agent interprets'}},
   {ids:['ifd'],z:1.2,label:{es:'El flujo se ramifica',en:'The flow branches'}},
   {ids:['gcal','stripe','conf'],z:0.78,label:{es:'Rama con disponibilidad',en:'Availability path'}},
   {ids:['wl','nurt'],z:0.9,label:{es:'Rama sin disponibilidad',en:'No-availability path'}},
   {ids:['sb'],z:1.15,label:{es:'Todo queda almacenado',en:'Everything gets stored'}},
   {ids:'all',z:0,label:{es:'Flujo completo',en:'Complete flow'}}
  ]
 },
 {
  name:{es:'Lead de Meta Ads',en:'Meta Ads lead'},
  title:{es:'Un lead, tres destinos',en:'One lead, three destinations'},
  desc:{es:'El agente puntúa cada lead publicitario y lo reparte en tres rutas paralelas según su temperatura.',en:'The agent scores each ad lead and splits it into three parallel routes by temperature.'},
  canvas:{w:1660,h:490}, fit:0.5,
  nodes:[
   {id:'meta',kind:'trigger',x:40,y:220,logo:'meta',label:'Meta Lead Ads',sub:{es:'Formulario enviado',en:'Form submitted'},info:{es:'Único disparador: el lead entra en el segundo en que envía el formulario del anuncio.',en:'Single trigger: the lead arrives the second they submit the ad form.'}},
   {id:'enr',kind:'node',x:270,y:220,logo:'',mono:'EN',label:{es:'Enriquecer datos',en:'Enrich data'},sub:{es:'Empresa y cargo',en:'Company and role'},info:{es:'Completa el perfil del lead con datos públicos de su empresa antes de puntuarlo.',en:'Completes the lead profile with public company data before scoring it.'}},
   {id:'ai',kind:'agent',x:500,y:220,logo:'',mono:'IA',label:{es:'Agente de calificación',en:'Scoring agent'},sub:{es:'Asigna puntuación',en:'Assigns a score'},info:{es:'Evalúa presupuesto, urgencia y encaje con tu oferta, y le pone una puntuación de 0 a 100.',en:'Evaluates budget, urgency and fit with your offer, and gives it a 0 to 100 score.'}},
   {id:'sw',kind:'switch',x:730,y:220,logo:'',mono:'SW',label:{es:'Enrutar por puntuación',en:'Route by score'},sub:{es:'Tres salidas',en:'Three outputs'},info:{es:'Reparte el lead en tres rutas paralelas: caliente al comercial, tibio a nutrición, frío a base de datos.',en:'Splits the lead into three parallel routes: hot to sales, warm to nurturing, cold to the database.'}},
   {id:'slack',kind:'node',x:960,y:70,logo:'',mono:'SL',label:'Slack',sub:{es:'Avisar al comercial',en:'Alert the rep'},info:{es:'Notifica al ejecutivo con el resumen del lead y su contexto completo.',en:'Notifies the rep with the lead summary and full context.'}},
   {id:'hs',kind:'node',x:1190,y:70,logo:'hubspot',label:'HubSpot',sub:{es:'Crear oportunidad',en:'Create deal'},info:{es:'Abre la oportunidad en el pipeline con todos los campos ya diligenciados.',en:'Opens the deal in the pipeline with every field already filled in.'}},
   {id:'seq',kind:'node',x:960,y:220,logo:'gmail',label:{es:'Secuencia de nutrición',en:'Nurture sequence'},sub:{es:'Correo y WhatsApp',en:'Email and WhatsApp'},info:{es:'Mantiene tibio al lead con contenido útil hasta que muestre intención real de compra.',en:'Keeps the lead warm with useful content until they show real buying intent.'}},
   {id:'wapp',kind:'node',x:1190,y:220,logo:'whatsapp',label:{es:'Reactivación',en:'Re-engagement'},sub:{es:'Mensaje programado',en:'Scheduled message'},info:{es:'Retoma la conversación en el momento adecuado en lugar de dejar morir el lead.',en:'Picks the conversation back up at the right moment instead of letting the lead die.'}},
   {id:'air',kind:'node',x:960,y:370,logo:'airtable',label:'Airtable',sub:{es:'Archivar lead frío',en:'Archive cold lead'},info:{es:'Guarda el lead frío sin gastar tiempo comercial en él, listo para campañas futuras.',en:'Stores the cold lead without spending sales time on it, ready for future campaigns.'}},
   {id:'sb',kind:'store',x:1420,y:220,logo:'supabase',label:'Supabase',sub:{es:'Almacenamiento en la nube',en:'Cloud storage'},info:{es:'Centraliza origen, puntuación y desenlace de cada lead para medir el retorno real de cada campaña.',en:'Centralizes source, score and outcome of every lead to measure each campaign real return.'}}
  ],
  edges:[['meta','enr'],['enr','ai'],['ai','sw'],['sw','slack','a'],['slack','hs'],['sw','seq','b'],['seq','wapp'],['sw','air','c'],['hs','sb'],['wapp','sb'],['air','sb']],
  stages:[
   {ids:['meta'],z:1.2,label:{es:'Un solo disparador',en:'A single trigger'}},
   {ids:['enr','ai'],z:0.95,label:{es:'Enriquecer y puntuar',en:'Enrich and score'}},
   {ids:['sw'],z:1.2,label:{es:'Tres rutas paralelas',en:'Three parallel routes'}},
   {ids:['slack','hs'],z:0.9,label:{es:'Lead caliente al comercial',en:'Hot lead to sales'}},
   {ids:['seq','wapp'],z:0.9,label:{es:'Lead tibio a nutrición',en:'Warm lead to nurturing'}},
   {ids:['air'],z:1.1,label:{es:'Lead frío archivado',en:'Cold lead archived'}},
   {ids:['sb'],z:1.15,label:{es:'Todo queda almacenado',en:'Everything gets stored'}},
   {ids:'all',z:0,label:{es:'Flujo completo',en:'Complete flow'}}
  ]
 },
 {
  name:{es:'Triage de correo',en:'Email triage'},
  title:{es:'La bandeja se ordena sola',en:'The inbox sorts itself'},
  desc:{es:'Cada correo entra por un punto, se clasifica y sale convertido en respuesta lista o en tarea asignada.',en:'Every email enters at one point, gets classified and leaves as a ready reply or an assigned task.'},
  canvas:{w:1660,h:450}, fit:0.52,
  nodes:[
   {id:'gm',kind:'trigger',x:40,y:210,logo:'gmail',label:'Gmail',sub:{es:'Correo entrante',en:'Incoming email'},info:{es:'Único disparador: vigila la bandeja en tiempo real y arranca con cada correo nuevo.',en:'Single trigger: watches the inbox in real time and starts on every new email.'}},
   {id:'ai',kind:'agent',x:270,y:210,logo:'',mono:'IA',label:{es:'Agente de triage',en:'Triage agent'},sub:{es:'Clasifica y resume',en:'Classifies and summarizes'},info:{es:'Identifica el tema, resume el contenido, detecta el sentimiento y determina el área responsable.',en:'Identifies the topic, summarizes content, detects sentiment and determines the owning team.'}},
   {id:'ifu',kind:'if',x:500,y:210,logo:'',mono:'IF',label:{es:'¿Es urgente?',en:'Is it urgent?'},sub:{es:'Prioridad detectada',en:'Detected priority'},info:{es:'Separa lo que necesita atención inmediata de lo que puede seguir el flujo normal.',en:'Separates what needs immediate attention from what can follow the normal flow.'}},
   {id:'slack',kind:'node',x:730,y:90,logo:'',mono:'SL',label:'Slack',sub:{es:'Alertar al canal',en:'Alert the channel'},info:{es:'Avisa al canal correcto para que ningún caso crítico se quede sin ver.',en:'Pings the right channel so no critical case goes unseen.'}},
   {id:'draft',kind:'node',x:960,y:90,logo:'',mono:'IA',label:{es:'Redactar respuesta',en:'Draft the reply'},sub:{es:'Borrador con IA',en:'AI draft'},info:{es:'Prepara el borrador con el tono de la marca para que un humano solo revise y envíe.',en:'Prepares the draft in the brand voice so a human only reviews and sends.'}},
   {id:'send',kind:'node',x:1190,y:90,logo:'gmail',label:{es:'Enviar respuesta',en:'Send the reply'},sub:{es:'Tras aprobación',en:'After approval'},info:{es:'Sale solo cuando alguien aprueba: la IA acelera, no reemplaza el criterio.',en:'Only goes out once someone approves: AI speeds things up, it does not replace judgment.'}},
   {id:'not',kind:'node',x:730,y:330,logo:'notion',label:'Notion',sub:{es:'Crear ticket',en:'Create ticket'},info:{es:'Convierte el correo en una tarea rastreable con responsable, contexto y fecha.',en:'Turns the email into a trackable task with an owner, context and a date.'}},
   {id:'asa',kind:'node',x:960,y:330,logo:'asana',label:'Asana',sub:{es:'Asignar responsable',en:'Assign an owner'},info:{es:'Enruta la tarea a la persona correcta según el área que detectó el agente.',en:'Routes the task to the right person based on the area the agent detected.'}},
   {id:'drv',kind:'store',x:1420,y:210,logo:'googledrive',label:'Google Drive',sub:{es:'Almacenamiento en la nube',en:'Cloud storage'},info:{es:'Archiva adjuntos e hilos completos, indexados y buscables para consultas futuras.',en:'Archives attachments and full threads, indexed and searchable for later queries.'}}
  ],
  edges:[['gm','ai'],['ai','ifu'],['ifu','slack','true'],['slack','draft'],['draft','send'],['ifu','not','false'],['not','asa'],['send','drv'],['asa','drv']],
  stages:[
   {ids:['gm'],z:1.2,label:{es:'Un solo disparador',en:'A single trigger'}},
   {ids:['ai'],z:1.05,label:{es:'El agente clasifica',en:'The agent classifies'}},
   {ids:['ifu'],z:1.2,label:{es:'Urgente o normal',en:'Urgent or normal'}},
   {ids:['slack','draft','send'],z:0.78,label:{es:'Ruta urgente',en:'Urgent route'}},
   {ids:['not','asa'],z:0.9,label:{es:'Ruta normal',en:'Normal route'}},
   {ids:['drv'],z:1.15,label:{es:'Todo queda almacenado',en:'Everything gets stored'}},
   {ids:'all',z:0,label:{es:'Flujo completo',en:'Complete flow'}}
  ]
 }
];