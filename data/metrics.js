// Métricas del inicio e industrias del cierre de Servicios.
// Solo propiedades del servicio, que se pueden afirmar sin fuente externa.
// Se retiraron '80 % tareas repetitivas reducidas' y '3x respuesta más rápida
// a leads': eran promesas de resultado sin respaldo y exigibles por contrato.
export const METRICS = [
  {value:24,suffix:'/7',label:{es:'Operación sin pausa',en:'Always-on operation'}},
  {value:14,suffix:' días',suffixEn:' days',label:{es:'De la auditoría al sistema funcionando',en:'From audit to a working system'}},
  {value:46,suffix:'',label:{es:'Integraciones disponibles',en:'Available integrations'}},
  {value:2,prefix:'< ',suffix:' h',label:{es:'Nuestro tiempo de respuesta en horario laboral',en:'Our reply time in business hours'}}
];
export const INDUSTRIES = [
  {name:{es:'Rentas de lujo',en:'Luxury rentals'},problem:{es:'Reservas perdidas por responder tarde y agendas manuales que fallan de noche.',en:'Lost bookings from slow replies and manual calendars that fail at night.'},solution:{es:'Un motor de reservas 24/7 con chatbot y CRM que confirma y agenda solo.',en:'A 24/7 booking engine with chatbot and CRM that confirms and books on its own.'},pkgLevel:'CORE',pkgName:{es:'Motor de Reservas 24/7',en:'24/7 Booking Engine'},features:{es:['Página con Calendly para reservas','Chatbot + CRM hasta 10 flujos','Manual de marca completo'],en:['Website with Calendly booking','Chatbot + CRM up to 10 flows','Full brand manual']}},
  {name:{es:'Clínicas de medicina',en:'Medical clinics'},problem:{es:'La recepción se satura y los pacientes no completan su agendamiento.',en:'The front desk gets overwhelmed and patients drop off before booking.'},solution:{es:'Una recepcionista digital que agenda, recuerda y reduce inasistencias.',en:'A digital receptionist that books, reminds and cuts no-shows.'},pkgLevel:'CORE',pkgName:{es:'Recepcionista Digital 24/7',en:'24/7 Digital Receptionist'},features:{es:['Página personalizada + bot de reservas','Recordatorios automáticos','Manual de marca completo'],en:['Custom website + booking bot','Automatic reminders','Full brand manual']}},
  {name:{es:'Agencias de visado',en:'Visa agencies'},problem:{es:'Muchos leads sin calificar y seguimiento documental que se pierde.',en:'Many unqualified leads and document follow-up that slips through.'},solution:{es:'Un filtro conversacional que califica y da seguimiento automático.',en:'A conversational filter that qualifies and follows up automatically.'},pkgLevel:'CORE',pkgName:{es:'Filtro Conversacional Migratorio',en:'Migration Conversational Filter'},features:{es:['Chatbot con hasta 10 flujos + CRM','Automatizaciones de seguimiento','Branding de autoridad migratoria'],en:['Chatbot up to 10 flows + CRM','Follow-up automations','Migration authority branding']}}
];