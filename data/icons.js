// Resolución de logos de marca: primero el proyecto, luego el CDN.
// Logos guardados en el proyecto (no dependen de internet).
export const LOCAL_LOGOS=new Set(['anthropic','brevo','deepseek','discord','elevenlabs','github','gmail','googlegemini','hubspot','huggingface','instagram','intercom','livechat','mailchimp','make','mercadopago','messenger','mistralai','n8n','odoo','ollama','paypal','perplexity','shopify','square','stripe','telegram','whatsapp','woocommerce','zapier','zendesk','zoho']);
export const ICON=(slug)=>(window.__resources&&window.__resources['ic_'+slug])
  || (LOCAL_LOGOS.has(slug) ? 'logos/'+slug+'.svg'
  : 'https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/'+slug+'.svg');
export const INTEG = [
  {cat:{es:'Modelos de IA',en:'AI models'},items:[['anthropic','Claude'],['googlegemini','Gemini'],['mistralai','Mistral'],['perplexity','Perplexity'],['deepseek','DeepSeek'],['huggingface','Hugging Face'],['ollama','Ollama']]},
  {cat:{es:'Canales de conversación',en:'Conversation channels'},items:[['whatsapp','WhatsApp'],['instagram','Instagram'],['messenger','Messenger'],['telegram','Telegram'],['gmail','Gmail'],['discord','Discord'],['elevenlabs','ElevenLabs']]},
  {cat:{es:'CRM y soporte',en:'CRM and support'},items:[['hubspot','HubSpot'],['zoho','Zoho'],['odoo','Odoo'],['intercom','Intercom'],['zendesk','Zendesk'],['livechat','LiveChat'],['mailchimp','Mailchimp'],['brevo','Brevo']]},
  {cat:{es:'Pagos y comercio',en:'Payments and commerce'},items:[['stripe','Stripe'],['mercadopago','Mercado Pago'],['paypal','PayPal'],['shopify','Shopify'],['woocommerce','WooCommerce'],['square','Square']]},
  {cat:{es:'Automatización',en:'Automation'},items:[['n8n','n8n'],['make','Make'],['zapier','Zapier'],['github','GitHub']]},
  {cat:{es:'Datos y productividad',en:'Data and productivity'},items:[['supabase','Supabase'],['airtable','Airtable'],['notion','Notion'],['googledrive','Google Drive'],['googlesheets','Google Sheets'],['googlecalendar','Google Calendar'],['dropbox','Dropbox'],['calendly','Calendly'],['asana','Asana'],['clickup','ClickUp'],['linear','Linear'],['jira','Jira'],['trello','Trello'],['webflow','Webflow']]}
];
export const INTEG_GROUPS=[
 {cat:{es:'Inteligencia artificial',en:'Artificial intelligence'},
  note:{es:'El motor que interpreta, decide y redacta dentro de tus flujos.',en:'The engine that interprets, decides and writes inside your flows.'},
  items:[['googlegemini','Google Gemini'],['anthropic','Claude'],['deepseek','DeepSeek'],['mistralai','Mistral']]},
 {cat:{es:'Mensajería y canales',en:'Messaging and channels'},
  note:{es:'Donde tu cliente ya escribe. El agente responde ahí mismo.',en:'Where your customer already writes. The agent replies right there.'},
  items:[['whatsapp','WhatsApp Business'],['instagram','Instagram'],['messenger','Messenger'],['telegram','Telegram']]},
 {cat:{es:'Google Workspace',en:'Google Workspace'},
  note:{es:'Tu correo, tu agenda y tus datos, conectados al mismo flujo.',en:'Your email, calendar and data, wired into the same flow.'},
  items:[['gmail','Gmail'],['googlecalendar','Google Calendar'],['googledrive','Google Drive'],['googlesheets','Google Sheets']]}
];
export const MARQUEE=['hubspot','zoho','intercom','zendesk','stripe','mercadopago','paypal','shopify','woocommerce','n8n','make','zapier','supabase','airtable','notion','dropbox','calendly','asana','clickup','trello','webflow','livechat','mailchimp','brevo','odoo','perplexity','huggingface','ollama','square','discord'];