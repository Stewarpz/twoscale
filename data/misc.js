// Listas auxiliares: web, apps, casos, valores, proceso, FAQ y tareas de IA.
export const WEBFEAT=[
 {mono:'UX',t:{es:'Diseño UX/UI',en:'UX/UI design'},d:{es:'Interfaces claras orientadas a conversión.',en:'Clear, conversion-focused interfaces.'}},
 {mono:'RS',t:{es:'Responsive',en:'Responsive'},d:{es:'Experiencia impecable en móvil, tablet y desktop.',en:'Flawless on mobile, tablet and desktop.'}},
 {mono:'SEO',t:{es:'SEO técnico',en:'Technical SEO'},d:{es:'Base técnica y SEO local para Colombia.',en:'Technical base and local SEO for Colombia.'}},
 {mono:'FR',t:{es:'Formularios',en:'Forms'},d:{es:'Captura conectada directo a tu CRM.',en:'Capture wired straight to your CRM.'}},
 {mono:'AN',t:{es:'Analytics',en:'Analytics'},d:{es:'Métricas para decidir con datos.',en:'Metrics to decide with data.'}},
 {mono:'CB',t:{es:'Chatbots',en:'Chatbots'},d:{es:'Atención automática integrada al sitio.',en:'Automatic support built into the site.'}},
 {mono:'AU',t:{es:'Automatizaciones',en:'Automations'},d:{es:'Flujos que se disparan desde la web.',en:'Flows triggered from the website.'}},
 {mono:'PG',t:{es:'Pagos',en:'Payments'},d:{es:'Stripe y Mercado Pago integrados.',en:'Stripe and Mercado Pago integrated.'}},
 {mono:'CR',t:{es:'CRM',en:'CRM'},d:{es:'Cada contacto ordenado y con seguimiento.',en:'Every contact organized and followed up.'}},
 {mono:'PF',t:{es:'Performance',en:'Performance'},d:{es:'Carga rápida y Core Web Vitals sanos.',en:'Fast loads and healthy Core Web Vitals.'}}
];
export const APPFEAT=[
 {es:'Gestión de clientes',en:'Client management'},{es:'Gestión de solicitudes',en:'Request management'},{es:'Inventarios',en:'Inventory'},{es:'Seguimiento comercial',en:'Sales tracking'},{es:'Dashboards',en:'Dashboards'},{es:'Reportes automáticos',en:'Automated reports'},{es:'Sistemas internos',en:'Internal systems'}
];
export const CASES=[
 {tag:{es:'Rentas de lujo',en:'Luxury rentals'},title:{es:'Reservas nocturnas recuperadas',en:'Recovered night bookings'},desc:{es:'Motor de reservas 24/7 con bot y CRM: menos solicitudes perdidas fuera de horario.',en:'24/7 booking engine with bot and CRM: fewer after-hours requests lost.'},m1:'24/7',m1l:{es:'Disponibilidad',en:'Availability'},m2:'-70%',m2l:{es:'Respuestas manuales',en:'Manual replies'}},
 {tag:{es:'Clínica',en:'Clinic'},title:{es:'Recepcionista digital',en:'Digital receptionist'},desc:{es:'Bot de reservas y recordatorios que reduce inasistencias y descarga la recepción.',en:'Booking & reminder bot that cuts no-shows and offloads the front desk.'},m1:'-35%',m1l:{es:'Inasistencias',en:'No-shows'},m2:'3x',m2l:{es:'Velocidad de agenda',en:'Booking speed'}},
 {tag:{es:'Agencia de visado',en:'Visa agency'},title:{es:'Leads calificados por IA',en:'AI-qualified leads'},desc:{es:'Filtro conversacional que solo pasa leads calientes al equipo comercial.',en:'Conversational filter that passes only hot leads to sales.'},m1:'+40%',m1l:{es:'Leads útiles',en:'Useful leads'},m2:'24/7',m2l:{es:'Calificación',en:'Qualification'}}
];
export const VALUES=[
 {mono:'01',t:{es:'Práctico, no humo',en:'Practical, not hype'},d:{es:'IA aplicada a problemas reales de negocio, medible.',en:'AI applied to real business problems, measurable.'}},
 {mono:'02',t:{es:'A tu medida',en:'Tailored'},d:{es:'Soluciones construidas para tu proceso, no plantillas.',en:'Solutions built for your process, not templates.'}},
 {mono:'03',t:{es:'Transparente',en:'Transparent'},d:{es:'Alcance, tiempos y precios claros desde el inicio.',en:'Scope, timelines and prices clear from day one.'}},
 {mono:'04',t:{es:'Escalable',en:'Scalable'},d:{es:'Arquitectura lista para crecer contigo.',en:'Architecture ready to grow with you.'}}
];
export const STEPS=[
 {n:'1',t:{es:'Analizamos',en:'We analyze'},d:{es:'Mapeamos tu proceso y detectamos qué automatizar.',en:'We map your process and spot what to automate.'}},
 {n:'2',t:{es:'Diseñamos',en:'We design'},d:{es:'Proponemos la solución, alcance y herramientas.',en:'We propose the solution, scope and tools.'}},
 {n:'3',t:{es:'Implementamos',en:'We build'},d:{es:'Construimos e integramos con tus plataformas.',en:'We build and integrate with your platforms.'}},
 {n:'4',t:{es:'Acompañamos',en:'We support'},d:{es:'Mantenimiento, mejoras y soporte continuo.',en:'Maintenance, improvements and ongoing support.'}}
];
export const FAQ=[
 {q:{es:'¿Necesito conocimientos técnicos?',en:'Do I need technical skills?'},a:{es:'No. Nosotros implementamos y te entregamos todo funcionando y documentado.',en:'No. We implement and hand everything over working and documented.'}},
 {q:{es:'¿Los precios son finales?',en:'Are prices final?'},a:{es:'Son valores de referencia; el precio final depende del alcance de tu proyecto.',en:'They are reference values; the final price depends on your project scope.'}},
 {q:{es:'¿En cuánto tiempo se implementa?',en:'How long does it take?'},a:{es:'Un paquete de entrada puede estar listo en días; proyectos Elite toman algunas semanas.',en:'An entry package can be ready in days; Elite projects take a few weeks.'}},
 {q:{es:'¿Trabajan con mi CRM actual?',en:'Do you work with my current CRM?'},a:{es:'Sí. Integramos de forma nativa con HubSpot y Zoho, y con cualquier CRM que exponga API —Salesforce, Pipedrive o Kommo incluidos— vía n8n o Make.',en:'Yes. We integrate natively with HubSpot and Zoho, and with any CRM that exposes an API —Salesforce, Pipedrive or Kommo included— through n8n or Make.'}},
 {q:{es:'¿El chatbot funciona en WhatsApp?',en:'Does the chatbot work on WhatsApp?'},a:{es:'Sí, es uno de nuestros canales principales, junto con web e Instagram.',en:'Yes, it is one of our main channels, along with web and Instagram.'}},
 {q:{es:'¿Qué incluye el servicio recurrente?',en:'What does the recurring service include?'},a:{es:'Dominio, mantenimiento de la página y del bot, y soporte continuo.',en:'Domain, website and bot maintenance, and ongoing support.'}}
];
export const AITASKS=[
 {k:{es:'Atención al cliente',en:'Customer support'},p:{es:'Preguntas repetidas saturan a tu equipo.',en:'Repeated questions overwhelm your team.'},ia:{es:'La IA entiende y responde en segundos.',en:'AI understands and replies in seconds.'},au:{es:'Escala a un humano solo si es necesario.',en:'Escalates to a human only if needed.'},r:{es:'Atención 24/7 sin ampliar el equipo.',en:'24/7 support without growing the team.'}},
 {k:{es:'Agendamiento',en:'Scheduling'},p:{es:'Coordinar citas por mensaje toma horas.',en:'Booking by message takes hours.'},ia:{es:'La IA lee la solicitud y verifica el calendario.',en:'AI reads the request and checks the calendar.'},au:{es:'Agenda y envía confirmación automática.',en:'Books and sends automatic confirmation.'},r:{es:'Agenda llena sin llamadas de ida y vuelta.',en:'A full calendar with no back-and-forth calls.'}},
 {k:{es:'Seguimiento de leads',en:'Lead follow-up'},p:{es:'Los leads se enfrían sin seguimiento.',en:'Leads go cold without follow-up.'},ia:{es:'La IA califica y prioriza cada lead.',en:'AI qualifies and prioritizes each lead.'},au:{es:'Dispara secuencias de seguimiento.',en:'Triggers follow-up sequences.'},r:{es:'Más oportunidades convertidas.',en:'More opportunities converted.'}},
 {k:{es:'Correos',en:'Emails'},p:{es:'La bandeja crece más rápido de lo que respondes.',en:'The inbox grows faster than you can reply.'},ia:{es:'La IA clasifica y prioriza cada correo.',en:'AI classifies and prioritizes each email.'},au:{es:'Redacta borradores y registra en base de datos.',en:'Drafts replies and logs to the database.'},r:{es:'Bandeja bajo control, sin perder nada.',en:'Inbox under control, nothing missed.'}},
 {k:{es:'Ventas',en:'Sales'},p:{es:'El pipeline se desordena y no hay foco.',en:'The pipeline gets messy and unfocused.'},ia:{es:'La IA ordena oportunidades por potencial.',en:'AI ranks opportunities by potential.'},au:{es:'Actualiza el CRM y avisa al comercial.',en:'Updates the CRM and alerts the rep.'},r:{es:'El equipo se enfoca en lo que cierra.',en:'The team focuses on what closes.'}},
 {k:{es:'Reportes',en:'Reports'},p:{es:'Armar reportes a mano consume el viernes.',en:'Building reports by hand eats your Friday.'},ia:{es:'La IA resume datos y detecta tendencias.',en:'AI summarizes data and spots trends.'},au:{es:'Genera y envía el reporte solo.',en:'Generates and sends the report on its own.'},r:{es:'Decisiones con datos, sin trabajo manual.',en:'Data-driven decisions, no manual work.'}}
];
/* Fundadores — sección Nosotros. */
export const FOUNDERS=[
 {initials:'EC',name:'Estiven Calle Gaviria',
  role:{es:'Director de Estrategia y Marketing',en:'Director of Strategy and Marketing'},
  bio:{es:'Administrador tecnológico y tecnólogo en gestión documental, especializado en marketing digital. Diseña cómo cada solución se convierte en crecimiento medible para el cliente.',en:'Technology administrator and document management technologist specialized in digital marketing. Designs how each solution turns into measurable growth for the client.'}},
 {initials:'SP',name:'Stewar Posada',
  role:{es:'Director de Operaciones y Alianzas',en:'Director of Operations and Partnerships'},
  bio:{es:'Negociador internacional. Estructura las alianzas y la operación que sostienen cada proyecto, del primer contacto a la entrega.',en:'International negotiator. Structures the partnerships and operations behind every project, from first contact to delivery.'}}
];

/* Palabra que rota en el título de Contacto. */
export const CONTACT_WORDS={
  es:['proceso','equipo','negocio','idea','clientes'],
  en:['process','team','business','idea','customers']
};

/* Señales de confianza que rotan sobre el formulario. */
export const TRUST=[
 {v:'< 2 h', l:{es:'es lo que tardamos en responderte en horario laboral.',en:'is how long we take to reply during business hours.'}},
 {v:'30 min',l:{es:'dura el diagnóstico. Sin costo, sin compromiso y sin permanencia.',en:'is the length of the diagnosis. Free, no commitment, no lock-in.'}},
 {v:'46',    l:{es:'plataformas que ya tenemos integradas, incluida la que usas hoy.',en:'platforms we already integrate, including the one you use today.'}}
];
