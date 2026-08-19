// Guiones conversacionales: demo de WhatsApp y agente de prospección.
export const CHAT={
 es:[
  {bot:'¡Hola! 👋 Soy el asistente de Twoscale.IA. ¿En qué te ayudo hoy?',quicks:['Quiero agendar una demo','¿Cuánto cuesta?','Ver soluciones']},
  {bot:'¡Perfecto! ¿Para qué tipo de negocio? Así te muestro el paquete ideal.',quicks:['Clínica','Rentas de lujo','Agencia de visado']},
  {bot:'Excelente. Puedo agendarte una llamada de 20 min esta semana. ¿Qué día te sirve?',quicks:['Martes','Jueves','Viernes']},
  {bot:'¡Listo! Reservé tu espacio y registré tus datos en el CRM. Recibirás la confirmación por WhatsApp. ✅',quicks:['Empezar de nuevo']}
 ],
 en:[
  {bot:'Hi! 👋 I am the Twoscale.IA assistant. How can I help today?',quicks:['Book a demo','How much does it cost?','See solutions']},
  {bot:'Great! What kind of business is it? I will show you the ideal package.',quicks:['Clinic','Luxury rentals','Visa agency']},
  {bot:'Awesome. I can book a 20-min call this week. Which day works?',quicks:['Tuesday','Thursday','Friday']},
  {bot:'Done! I reserved your slot and saved your details in the CRM. You will get the confirmation on WhatsApp. ✅',quicks:['Start over']}
 ]
};
export const CHATSCRIPT={
 es:[
  {u:1,t:'Hola, ¿tienen algo disponible este fin de semana?'},
  {u:0,t:'¡Hola! 👋 Soy el asistente de Reserva Luxe. Sí, tenemos dos propiedades libres de viernes a domingo.'},
  {u:0,t:'¿Para cuántas personas sería?'},
  {u:1,t:'Somos 6'},
  {u:0,t:'Perfecto. La Villa Aurora acomoda hasta 8 y está libre esas fechas. $420 por noche, 3 noches quedan en $1.260.'},
  {u:1,t:'¿Incluye limpieza?'},
  {u:0,t:'Sí, limpieza final y ropa de cama van incluidas. ¿Te aparto esas fechas?'},
  {u:1,t:'Sí, por favor'},
  {u:0,t:'Listo ✅ Bloqueé la Villa Aurora del 14 al 17 y te envié el enlace de pago. Ya quedó registrado en el CRM.'}
 ],
 en:[
  {u:1,t:'Hi, do you have anything available this weekend?'},
  {u:0,t:'Hi there! 👋 I am the Reserva Luxe assistant. Yes, we have two properties free from Friday to Sunday.'},
  {u:0,t:'How many guests would it be?'},
  {u:1,t:'There are 6 of us'},
  {u:0,t:'Perfect. Villa Aurora sleeps up to 8 and is free those dates. $420 per night, 3 nights comes to $1,260.'},
  {u:1,t:'Does that include cleaning?'},
  {u:0,t:'Yes, final cleaning and linens are included. Shall I hold those dates for you?'},
  {u:1,t:'Yes please'},
  {u:0,t:'Done ✅ I blocked Villa Aurora from the 14th to the 17th and sent you the payment link. It is already logged in the CRM.'}
 ]
};
export const AGENT_FLOW=[
 {id:'need',k:{es:'Necesidad',en:'Need'},
  q:{es:'¡Hola! 👋 Soy Ada, la asistente de Twoscale.IA. Te hago cuatro preguntas rápidas y te digo con qué podemos ayudarte. ¿Qué es lo que más te está costando hoy?',
     en:'Hi! 👋 I am Ada, the Twoscale.IA assistant. Four quick questions and I will tell you how we can help. What is costing you the most right now?'},
  opts:{es:['Pierdo clientes por responder tarde','Mi equipo hace tareas repetitivas','Necesito una web o una app','No tengo control de mis datos'],
        en:['I lose clients by replying late','My team does repetitive work','I need a website or an app','I have no control over my data']},
  ack:{es:['Muy común. Un agente en WhatsApp responde en segundos, 24/7.','Eso se resuelve con automatización de procesos: liberamos entre 8 y 15 horas por semana.','Perfecto, lo construimos a la medida y conectado a tu operación.','Ahí entra un panel de análisis: una sola fuente de verdad.'],
        en:['Very common. A WhatsApp agent replies in seconds, 24/7.','Process automation solves that: we free up 8 to 15 hours a week.','Great, we build it to measure and wired into your operation.','That calls for an analytics panel: a single source of truth.']}},
 {id:'sector',k:{es:'Sector',en:'Sector'},
  q:{es:'Entendido. ¿En qué sector estás?',en:'Understood. What sector are you in?'},
  opts:{es:['Salud o clínica','Turismo o rentas','Migración o visados','Comercio','Servicios profesionales','Otro'],
        en:['Health or clinic','Tourism or rentals','Migration or visas','Retail','Professional services','Other']},
  ack:{es:['Tenemos paquetes diseñados para ese sector.','Tenemos paquetes diseñados para ese sector.','Tenemos paquetes diseñados para ese sector.','Se integra con tu tienda y tu pasarela de pagos.','Trabajamos con varios despachos.','Sin problema, adaptamos la solución.'],
        en:['We have packages designed for that sector.','We have packages designed for that sector.','We have packages designed for that sector.','It integrates with your store and payment gateway.','We work with several practices.','No problem, we adapt the solution.']}},
 {id:'volume',k:{es:'Volumen',en:'Volume'},
  q:{es:'¿Cuántas conversaciones o solicitudes recibes al mes, más o menos?',en:'Roughly how many conversations or requests do you get per month?'},
  opts:{es:['Menos de 100','Entre 100 y 500','Entre 500 y 2.000','Más de 2.000'],
        en:['Fewer than 100','Between 100 and 500','Between 500 and 2,000','More than 2,000']},
  ack:{es:['Con ese volumen, un paquete de entrada te rinde bien.','Ese es el rango donde la automatización se paga sola.','A ese volumen el ahorro es considerable.','Ahí ya hablamos de infraestructura completa.'],
        en:['At that volume, an entry package works well.','That is the range where automation pays for itself.','At that volume the savings are considerable.','That calls for full infrastructure.']}},
 {id:'when',k:{es:'Tiempo',en:'Timeline'},
  q:{es:'Última: ¿para cuándo lo necesitas?',en:'Last one: when do you need it?'},
  opts:{es:['Lo antes posible','En este trimestre','Estoy explorando'],
        en:['As soon as possible','This quarter','Just exploring']},
  ack:{es:['Podemos arrancar esta semana.','Perfecto, entra bien en agenda.','Sin compromiso, te dejamos la información.'],
        en:['We can start this week.','Perfect, that fits our schedule.','No commitment, we will leave you the details.']}},
 {id:'name',k:{es:'Nombre',en:'Name'},input:true,
  q:{es:'Ya tengo lo que necesito. ¿Cómo te llamas?',en:'I have what I need. What is your name?'},
  ph:{es:'Tu nombre',en:'Your name'}},
 {id:'contact',k:{es:'Contacto',en:'Contact'},input:true,
  q:{es:'Gracias. ¿A qué WhatsApp o correo te escribimos?',en:'Thanks. What WhatsApp or email should we write to?'},
  ph:{es:'WhatsApp o correo',en:'WhatsApp or email'}}
];
export const AGENT_CLOSE={
 es:'Listo ✅ Registré tu solicitud y un especialista te escribe hoy mismo. Este es el resumen que le llega:',
 en:'Done ✅ I logged your request and a specialist will write to you today. This is the summary they receive:'
};