// Metas y árbol de indicadores del panel de análisis.
export const DASH_GOALS=[
 {g:{es:'Meta: CAC por debajo de $30.000',en:'Target: CAC under $30,000'},met:true},
 {g:{es:'Meta: cerrar el trimestre sobre $700 M',en:'Target: close the quarter above $700M'},met:true},
 {g:{es:'Meta: ocupación por encima del 85 %',en:'Target: occupancy above 85%'},met:false},
 {g:{es:'Meta: menos de 15 fugas al mes',en:'Target: fewer than 15 leaks per month'},met:false}
];
export const KPI_TREE={
 root:{n:{es:'Ingresos del mes',en:'Monthly revenue'},v:'$248 M',d:'+12 %',up:true},
 branches:[
  {n:{es:'Citas atendidas',en:'Appointments served'},v:'412',d:'+8 %',up:true,
   kids:[{n:{es:'Citas agendadas',en:'Appointments booked'},v:'486',d:'+11 %',up:true},
         {n:{es:'Tasa de asistencia',en:'Attendance rate'},v:'84,8 %',d:'-2,1 pts',up:false}]},
  {n:{es:'Ticket promedio',en:'Average ticket'},v:'$602 K',d:'+3,7 %',up:true,
   kids:[{n:{es:'Procedimientos por cita',en:'Procedures per visit'},v:'1,4',d:'+0,1',up:true},
         {n:{es:'Precio medio',en:'Average price'},v:'$430 K',d:{es:'estable',en:'flat'},up:true}]}
 ]
};