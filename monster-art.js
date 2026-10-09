'use strict';
(()=>{
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
function tint(hex,v){if(v==='Common')return hex;const h=hex.replace('#','');let r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);if(v==='Rare')[r,g,b]=[Math.round(b*.66+62),Math.round(g*.72+78),Math.min(255,r*.72+112)];if(v==='Epic')[r,g,b]=[Math.min(255,b*.55+110),Math.min(255,r*.52+74),Math.min(255,g*.80+92)];if(v==='Legendary'){r=Math.min(255,r+58);g=Math.min(255,g+48);b=Math.round(b*.55+40);}return'#'+[r,g,b].map(x=>Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('');}
function face(seed,c3,variant){
  const style=seed%6,eye=variant==='Epic'?'#ffeaff':'#f8fbff',pupil=variant==='Rare'?'#163c67':'#182138',mouth=variant==='Epic'?'#311934':'#27314a';
  if(style===0)return `<g class="face"><ellipse cx="49" cy="57" rx="7" ry="10" fill="${eye}"/><ellipse cx="79" cy="57" rx="7" ry="10" fill="${eye}"/><circle cx="50" cy="59" r="3.5" fill="${pupil}"/><circle cx="78" cy="59" r="3.5" fill="${pupil}"/><path class="rig-mouth" d="M48 78 Q64 90 80 77 Q65 99 48 78" fill="${mouth}"/><path d="M56 82 Q64 87 72 82" stroke="${c3}" stroke-width="3" stroke-linecap="round"/></g>`;
  if(style===1)return `<g class="face"><ellipse cx="64" cy="56" rx="14" ry="12" fill="${eye}"/><circle cx="65" cy="58" r="6" fill="${pupil}"/><path class="rig-mouth" d="M45 78 Q64 93 83 78 Q77 99 64 100 Q51 99 45 78" fill="${mouth}"/><path d="M51 82 L57 89 L63 83 L70 90 L77 82" fill="none" stroke="${c3}" stroke-width="2.5"/></g>`;
  if(style===2)return `<g class="face"><circle cx="47" cy="57" r="8" fill="${eye}"/><circle cx="64" cy="50" r="7" fill="${eye}"/><circle cx="81" cy="57" r="8" fill="${eye}"/><circle cx="48" cy="59" r="3" fill="${pupil}"/><circle cx="64" cy="52" r="2.8" fill="${pupil}"/><circle cx="80" cy="59" r="3" fill="${pupil}"/><ellipse class="rig-mouth" cx="64" cy="82" rx="15" ry="9" fill="${mouth}"/></g>`;
  if(style===3)return `<g class="face"><path d="M39 54 Q64 40 89 54 L84 65 Q64 57 44 65 Z" fill="${eye}"/><path d="M47 57 L58 54 M70 54 L81 57" stroke="${pupil}" stroke-width="5" stroke-linecap="round"/><path class="rig-mouth" d="M48 78 Q64 84 80 78" fill="none" stroke="${mouth}" stroke-width="5" stroke-linecap="round"/></g>`;
  if(style===4)return `<g class="face"><path d="M47 50 Q43 33 36 29 M81 50 Q85 33 92 29" stroke="${c3}" stroke-width="5" stroke-linecap="round"/><circle cx="36" cy="29" r="9" fill="${eye}"/><circle cx="92" cy="29" r="9" fill="${eye}"/><circle cx="36" cy="30" r="3.5" fill="${pupil}"/><circle cx="92" cy="30" r="3.5" fill="${pupil}"/><path class="rig-mouth" d="M50 76 Q64 91 78 76 L74 93 Q64 100 54 93 Z" fill="${mouth}"/></g>`;
  return `<g class="face"><ellipse cx="50" cy="56" rx="10" ry="7" fill="${eye}" transform="rotate(-12 50 56)"/><ellipse cx="79" cy="57" rx="6" ry="9" fill="${eye}"/><circle cx="51" cy="57" r="3.5" fill="${pupil}"/><circle cx="79" cy="59" r="3" fill="${pupil}"/><path class="rig-mouth" d="M47 79 C55 72 73 72 81 79 C73 87 55 87 47 79Z" fill="${mouth}"/></g>`;
}
function baseBody(shape,c1,c2,c3,seed){
  const f=face(seed,c3,'Common');
  const basic=`<ellipse class="body-core" cx="64" cy="72" rx="37" ry="35" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/>${f}`;
  switch(shape){
    case'leaf':return `<path d="M38 38 Q15 9 44 13 Q58 17 63 34 Q69 8 94 14 Q104 31 81 40" fill="${c2}"/><path d="M26 74 Q12 61 18 50 Q32 51 43 62 M102 74 Q116 61 110 50 Q96 51 85 62" fill="${c3}" opacity=".75"/>${basic}`;
    case'root':return `<ellipse class="body-core" cx="64" cy="70" rx="39" ry="31" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><path d="M43 45 Q31 17 48 22 L57 45 M72 45 L82 20 Q98 18 86 47" fill="none" stroke="${c2}" stroke-width="10" stroke-linecap="round"/><path d="M36 92 L27 116 M52 98 L48 119 M76 98 L81 119 M92 91 L103 115" stroke="${c1}" stroke-width="9" stroke-linecap="round"/>${f}`;
    case'puff':return `<g class="body-core" fill="url(#bodyG)" stroke="${c2}" stroke-width="2"><circle cx="40" cy="55" r="24"/><circle cx="69" cy="42" r="28"/><circle cx="91" cy="66" r="25"/><circle cx="56" cy="79" r="31"/></g><path d="M90 81 Q117 71 121 87 Q111 100 91 91" fill="${c3}" stroke="${c2}" stroke-width="4"/>${f}`;
    case'shell':case'nautilus':return `<path class="body-core" d="M24 76 Q22 37 58 27 Q103 16 111 56 Q117 94 78 106 Q41 116 24 76" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><path d="M51 79 Q40 55 63 45 Q88 35 98 58 Q104 78 84 90 Q66 100 53 87 Q43 76 53 63 Q62 51 74 59 Q86 67 75 78" fill="none" stroke="${c3}" stroke-width="7" stroke-linecap="round"/>${f}`;
    case'bird':case'bladebird':case'heartbird':return `<ellipse class="body-core" cx="64" cy="70" rx="33" ry="37" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><path class="rig-wings" d="M36 69 Q8 53 15 31 Q34 33 49 53 M92 69 Q120 53 113 31 Q94 33 79 53" fill="${c2}" stroke="${c3}" stroke-width="2"/><path d="M55 65 L73 65 L64 76 Z" fill="${c3}"/>${f}`;
    case'flower':case'flowerhorn':case'bloomwhistle':return `<g fill="${c2}" stroke="${c3}" stroke-width="2"><circle cx="64" cy="25" r="20"/><circle cx="93" cy="42" r="19"/><circle cx="95" cy="72" r="18"/><circle cx="35" cy="42" r="19"/><circle cx="33" cy="72" r="18"/></g>${basic}<circle cx="64" cy="34" r="12" fill="${c3}"/>`;
    case'vine':case'kelp':case'prismkelp':return `<path class="body-core" d="M43 110 Q25 82 39 52 Q47 34 59 51 Q62 22 75 31 Q90 45 83 67 Q106 61 104 83 Q100 111 65 113Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/>${f}`;
    case'slime':case'jelly':return `<path class="body-core" d="M27 96 Q24 50 45 34 Q52 20 61 38 Q66 18 73 39 Q86 24 91 45 Q105 58 101 95 L91 105 L81 96 L70 109 L59 96 L48 108 L38 97Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/>${f}`;
    case'stag':case'horned':case'brassgiant':return `${basic}<path d="M43 44 Q29 21 18 15 M43 42 Q23 35 13 28 M85 44 Q99 21 111 15 M85 42 Q106 35 116 28" fill="none" stroke="${c2}" stroke-width="7" stroke-linecap="round"/><path d="M44 100 L41 118 M84 100 L87 118" stroke="${c2}" stroke-width="10" stroke-linecap="round"/>`;
    case'moth':case'wing':case'splitmoth':case'cicada':return `<ellipse class="body-core" cx="64" cy="69" rx="23" ry="35" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><path class="rig-wings" d="M43 65 Q11 48 16 19 Q45 21 58 49 M85 65 Q117 48 112 19 Q83 21 70 49" fill="${c2}" stroke="${c3}" stroke-width="4"/>${f}`;
    case'toad':case'cauldron':return `<ellipse class="body-core" cx="64" cy="78" rx="44" ry="29" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><circle cx="43" cy="48" r="18" fill="${c2}"/><circle cx="85" cy="48" r="18" fill="${c2}"/>${f}`;
    case'bongo':case'knightdrum':return `${basic}<ellipse class="rig-drum" cx="37" cy="96" rx="18" ry="12" fill="${c2}" stroke="${c3}" stroke-width="4"/><ellipse class="rig-drum" cx="91" cy="96" rx="18" ry="12" fill="${c2}" stroke="${c3}" stroke-width="4"/>`;
    case'cub':return `${basic}<path d="M44 43 Q32 17 42 12 Q54 15 57 40 M72 40 Q76 15 88 12 Q99 18 84 44" fill="none" stroke="${c2}" stroke-width="8" stroke-linecap="round"/>`;
    case'owl':return `${basic}<path d="M31 53 L42 25 L57 44 M71 44 L87 24 L98 54" fill="${c2}"/><circle cx="49" cy="58" r="14" fill="${c3}" opacity=".5"/><circle cx="79" cy="58" r="14" fill="${c3}" opacity=".5"/>`;
    case'orb':case'planet':case'facetorb':case'meteor':return `<circle class="body-core" cx="64" cy="68" r="37" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><ellipse class="rig-orbit" cx="64" cy="68" rx="53" ry="17" fill="none" stroke="${c3}" stroke-width="7" transform="rotate(-17 64 68)"/>${f}`;
    case'spark':case'sunforge':return `<path class="body-core" d="M66 14 L81 43 L106 34 L93 62 L115 78 L85 83 L81 113 L61 91 L40 113 L38 84 L12 76 L35 61 L23 34 L50 43Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/>${f}`;
    case'magma':return `<ellipse class="body-core" cx="64" cy="76" rx="40" ry="32" fill="${c2}"/><path d="M29 61 Q36 25 49 45 Q55 16 65 43 Q79 15 83 47 Q101 29 98 64" fill="url(#bodyG)"/>${f}`;
    case'cat':return `${basic}<path d="M34 48 L38 21 L54 43 M74 43 L92 21 L96 50" fill="${c2}"/><path class="rig-tail" d="M93 84 Q121 78 113 54" fill="none" stroke="${c2}" stroke-width="9" stroke-linecap="round"/>`;
    case'bug':case'bughorn':case'mantis':case'skullbug':return `<ellipse class="body-core" cx="64" cy="75" rx="31" ry="35" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><path d="M48 43 Q31 21 24 33 M80 43 Q97 21 104 33" fill="none" stroke="${c2}" stroke-width="5" stroke-linecap="round"/>${f}`;
    case'crab':case'shrimp':return `${basic}<path class="rig-arms" d="M31 68 Q9 55 14 39 Q32 38 44 54 M97 68 Q119 55 114 39 Q96 38 84 54" fill="${c2}" stroke="${c3}" stroke-width="2"/><path d="M37 97 L25 114 M52 101 L47 119 M76 101 L82 119 M91 97 L103 114" stroke="${c2}" stroke-width="7"/>`;
    case'ghost':case'ghostchain':case'chorasmaw':return `<path class="body-core" d="M29 103 V62 Q29 28 64 24 Q99 28 99 62 V104 L87 93 L76 107 L64 94 L51 107 L40 93Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/>${f}`;
    case'bat':case'seraph':case'crownseraph':return `${basic}<path class="rig-wings" d="M35 64 Q6 43 14 23 Q35 26 49 51 M93 64 Q122 43 114 23 Q93 26 79 51" fill="${c2}" stroke="${c3}" stroke-width="3"/>`;
    case'halo':case'lensbeast':case'prismhorn':return `${basic}<ellipse class="rig-orbit" cx="64" cy="27" rx="30" ry="9" fill="none" stroke="${c3}" stroke-width="6"/>`;
    case'machine':case'festibot':return `<rect class="body-core" x="25" y="34" width="78" height="74" rx="19" fill="url(#bodyG)" stroke="${c3}" stroke-width="5"/><rect x="38" y="44" width="52" height="34" rx="9" fill="#152138"/><circle cx="50" cy="60" r="5" fill="${c1}"/><circle cx="78" cy="60" r="5" fill="${c1}"/><path class="rig-mouth" d="M49 71 Q64 80 79 71" fill="none" stroke="${c1}" stroke-width="4"/><circle cx="64" cy="92" r="12" fill="${c2}" stroke="${c3}" stroke-width="4"/>`;
    case'tower':case'mouthtower':case'voidorgan':case'starorgan':return `<path class="body-core" d="M32 108 L36 48 L48 36 L48 20 L58 20 L58 43 L70 43 L70 10 L81 10 L81 40 L93 51 L97 108Z" fill="url(#bodyG)" stroke="${c3}" stroke-width="5"/><circle cx="64" cy="72" r="21" fill="${c1}" stroke="${c2}" stroke-width="3"/>${f}`;
    case'coral':return `<ellipse class="body-core" cx="64" cy="80" rx="34" ry="28" fill="url(#bodyG)" stroke="${c2}" stroke-width="3"/><path d="M43 56 V31 M43 38 L30 24 M43 44 L56 27 M78 55 V24 M78 36 L92 19 M78 42 L66 28 M94 66 V42 M94 49 L108 38" fill="none" stroke="${c2}" stroke-width="9" stroke-linecap="round"/>${f}`;
    case'ray':case'prismray':return `<path class="body-core" d="M12 65 Q37 29 64 47 Q92 28 116 64 Q91 73 77 91 Q65 107 51 91 Q36 73 12 65" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/>${f}<path class="rig-tail" d="M65 92 Q76 111 93 117" fill="none" stroke="${c2}" stroke-width="5" stroke-linecap="round"/>`;
    case'urchin':return `<g stroke="${c2}" stroke-width="7" stroke-linecap="round"><path d="M64 16V39 M64 96V119 M17 69H40 M88 69H113 M28 31L45 48 M83 90L100 106 M100 31L83 48 M45 90L28 106"/></g><circle class="body-core" cx="64" cy="69" r="31" fill="url(#bodyG)"/>${f}`;
    case'seahorse':return `<path class="body-core" d="M68 22 Q95 31 87 53 Q80 69 62 68 Q49 75 55 90 Q62 108 79 98 Q91 89 80 80" fill="none" stroke="${c1}" stroke-width="24" stroke-linecap="round"/><path d="M74 26 L89 13 L92 35" fill="${c2}"/>${f}`;
    case'eel':case'riftsaw':return `<path class="body-core" d="M17 78 Q35 38 63 59 Q88 77 109 45" fill="none" stroke="${c1}" stroke-width="28" stroke-linecap="round"/><path d="M17 78 Q35 38 63 59 Q88 77 109 45" fill="none" stroke="${c2}" stroke-width="5" stroke-linecap="round"/>${f}`;
    case'clam':return `<path class="body-core" d="M21 79 Q29 36 64 31 Q100 35 108 79 Q89 103 64 106 Q39 103 21 79" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/><path d="M25 77 Q64 58 104 77" fill="none" stroke="${c3}" stroke-width="7"/><circle cx="64" cy="79" r="11" fill="${c3}"/>${f}`;
    case'fish':return `<ellipse class="body-core" cx="59" cy="70" rx="38" ry="27" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><path class="rig-tail" d="M93 69 L119 43 L119 96Z" fill="${c2}"/><path d="M57 43 L72 23 L80 47 M58 95 L72 114 L80 92" fill="${c3}"/>${f}`;
    case'leviathan':case'forgegiant':case'marshalgiant':return `<path class="body-core" d="M18 90 Q18 39 56 32 Q91 24 108 55 Q123 81 95 105 Q67 123 37 107Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="6"/><path d="M33 49 Q24 20 48 16 M79 38 Q88 12 109 21 M101 72 Q124 62 125 83" fill="none" stroke="${c3}" stroke-width="10" stroke-linecap="round"/>${f}`;
    case'pipebeast':case'pipeimp':return `<ellipse class="body-core" cx="61" cy="73" rx="34" ry="33" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><path class="rig-pipes" d="M36 51 V21 H47 V47 M55 43 V10 H67 V42 M77 47 V18 H89 V54" fill="none" stroke="${c3}" stroke-width="9" stroke-linejoin="round"/><path class="rig-jaw" d="M42 77 Q64 65 86 77 L81 99 Q64 108 47 98Z" fill="${c2}" stroke="${c3}" stroke-width="3"/>${f}`;
    case'bellows':return `<ellipse class="body-core" cx="64" cy="73" rx="31" ry="32" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><ellipse class="rig-bellows" cx="27" cy="72" rx="18" ry="24" fill="${c2}" stroke="${c3}" stroke-width="3"/><ellipse class="rig-bellows" cx="101" cy="72" rx="18" ry="24" fill="${c2}" stroke="${c3}" stroke-width="3"/><path d="M64 45 V18" stroke="${c2}" stroke-width="8" stroke-linecap="round"/>${f}`;
    case'thornmask':case'mask':return `<path class="body-core" d="M27 54 Q64 19 101 54 L94 102 Q64 117 34 102Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/><path d="M34 48 L19 29 M94 48 L110 29" stroke="${c3}" stroke-width="8" stroke-linecap="round"/>${f}`;
    case'gargoyle':return `${basic}<path class="rig-wings" d="M34 65 L10 48 L19 30 L46 53 M94 65 L118 48 L109 30 L82 53" fill="${c2}"/><path d="M43 102 L37 119 M85 102 L91 119" stroke="${c2}" stroke-width="11" stroke-linecap="round"/><path class="rig-tail" d="M95 83 Q120 84 111 108" fill="none" stroke="${c3}" stroke-width="7"/>`;
    case'lantern':case'gourd':return `<path class="body-core" d="M32 47 Q64 27 96 47 L102 91 Q86 111 64 112 Q42 111 26 91Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/><path d="M55 35 Q59 14 72 18" stroke="${c2}" stroke-width="7" stroke-linecap="round"/><path d="M40 54 L54 49 L50 63Z M88 54 L74 49 L78 63Z" fill="#fff3bd" opacity=".8"/>${f}`;
    case'candlejaw':return `<path class="body-core" d="M37 31 Q64 16 91 31 L96 91 Q83 108 64 110 Q45 108 32 91Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/><path d="M64 29 Q52 17 62 6 Q76 14 69 30" fill="${c3}"/><path class="rig-jaw" d="M39 77 Q64 64 89 77 L85 101 Q64 111 43 101Z" fill="${c2}" stroke="${c3}" stroke-width="4"/>${f}`;
    case'castlebeast':case'crownknight':case'lordbeast':return `<path class="body-core" d="M29 99 V47 L42 35 L52 43 L64 29 L76 43 L88 35 L100 47 V99 Q84 111 64 111 Q44 111 29 99Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/><path d="M34 48 L30 22 L49 34 L64 15 L79 34 L98 22 L94 49" fill="${c3}" opacity=".85"/>${f}`;
    case'bannerbeast':return `${basic}<path class="rig-banner" d="M96 26 Q116 38 102 60 Q115 76 99 95 L84 85 L87 28Z" fill="${c2}" stroke="${c3}" stroke-width="3"/><path d="M36 98 L33 118 M85 99 L88 118" stroke="${c2}" stroke-width="10"/>`;
    case'helmvocal':return `<path class="body-core" d="M28 59 Q64 19 100 59 L94 104 Q64 116 34 104Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="5"/><path class="rig-visor" d="M33 55 Q64 32 95 55 L89 70 Q64 59 39 70Z" fill="${c2}"/><path class="rig-mouth" d="M43 78 Q64 70 85 78 Q81 101 64 103 Q47 101 43 78Z" fill="#252238"/>${f}`;
    case'crystalhand':return `<path class="body-core" d="M35 104 Q26 80 42 59 L43 24 L54 24 L56 53 L61 14 L72 14 L72 53 L79 22 L90 24 L85 58 Q105 72 94 101 Q70 116 35 104Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="4"/>${f}`;
    case'primordial':case'nullregent':return `<path class="body-core" d="M20 95 Q17 51 46 31 L55 10 L67 31 L80 8 L86 33 Q114 49 108 94 Q91 118 64 119 Q36 118 20 95Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="6"/><path class="rig-orbit" d="M16 67 Q64 38 112 67 Q64 96 16 67Z" fill="none" stroke="${c3}" stroke-width="5" opacity=".75"/>${f}`;
    case'resonator':return `<g class="resonator-construct"><path d="M28 39 L39 21 H51 L57 7 H71 L77 21 H90 L101 39" fill="${c2}" stroke="${c3}" stroke-width="4" stroke-linejoin="round"/><path class="rig-pipes" d="M29 48 V18 H39 V42 M49 36 V8 H59 V33 M69 33 V5 H79 V36 M89 43 V15 H99 V50" fill="none" stroke="${c3}" stroke-width="7" stroke-linejoin="round"/><path class="body-core" d="M28 42 Q64 27 100 42 L106 92 L90 108 H38 L22 92Z" fill="url(#bodyG)" stroke="${c2}" stroke-width="6"/><path d="M34 51 H94 L88 72 H40Z" fill="#151c31" stroke="${c3}" stroke-width="3"/><path d="M43 58 H55 M61 58 H67 M73 58 H85" stroke="${c3}" stroke-width="5" stroke-linecap="round"/><circle class="rig-orbit" cx="64" cy="86" r="16" fill="#20243a" stroke="${c3}" stroke-width="6"/><circle cx="64" cy="86" r="7" fill="${c3}"/><path class="rig-arms" d="M25 57 L10 68 L17 90 L31 82 M103 57 L118 68 L111 90 L97 82" fill="none" stroke="${c2}" stroke-width="10" stroke-linecap="square"/><path d="M45 106 L42 122 H57 L60 106 M68 106 L71 122 H86 L83 106" fill="${c2}" stroke="${c3}" stroke-width="3"/><path class="rig-bellows" d="M34 79 H45 M83 79 H94" stroke="${c3}" stroke-width="6" stroke-linecap="round"/></g>`;
    default:return basic;
  }
}
function variantMorph(m,variant,c1,c2,c3,seed){
  if(variant==='Common')return'';
  const pick=seed%5;
  if(variant==='Rare'){
    const motifs=[
      `<path class="variant-extra" d="M24 57 L8 44 L26 39 M104 57 L120 44 L102 39" fill="none" stroke="#8fe9ff" stroke-width="7" stroke-linecap="round"/>`,
      `<g class="variant-extra" fill="#8fe9ff"><circle cx="26" cy="31" r="7"/><circle cx="102" cy="31" r="7"/><circle cx="18" cy="76" r="5"/><circle cx="110" cy="76" r="5"/></g>`,
      `<path class="variant-extra" d="M42 29 Q64 4 86 29 L78 39 Q64 24 50 39Z" fill="#8fe9ff" stroke="${c2}" stroke-width="3"/>`,
      `<path class="variant-extra" d="M30 92 Q64 112 98 92" fill="none" stroke="#8fe9ff" stroke-width="7" stroke-dasharray="5 6"/>`,
      `<g class="variant-extra" stroke="#8fe9ff" stroke-width="5"><path d="M26 67 L7 67 M102 67 L121 67 M64 25 V6"/></g>`
    ];
    return motifs[pick]+`<path d="M37 45 Q64 31 91 45" fill="none" stroke="${c3}" stroke-width="3" stroke-dasharray="7 4" opacity=".75"/>`;
  }
  if(variant==='Epic'){
    const motifs=[
      `<g class="variant-extra" fill="${c3}" stroke="#ffe9ff" stroke-width="2"><path d="M18 58 L4 42 L25 44Z"/><path d="M110 58 L124 42 L103 44Z"/><path d="M64 23 L54 3 L74 3Z"/></g>`,
      `<g class="variant-extra"><circle cx="20" cy="50" r="8" fill="${c3}"/><circle cx="108" cy="50" r="8" fill="${c3}"/><path d="M20 50 Q64 4 108 50" fill="none" stroke="#e6a8ff" stroke-width="4"/></g>`,
      `<path class="variant-extra" d="M31 39 Q16 19 29 10 Q46 15 48 35 M97 39 Q112 19 99 10 Q82 15 80 35" fill="none" stroke="${c3}" stroke-width="10" stroke-linecap="round"/>`,
      `<g class="variant-extra" fill="#f5b4ff"><path d="M20 77 L4 67 L18 57 L29 67Z"/><path d="M108 77 L124 67 L110 57 L99 67Z"/><path d="M64 114 L54 101 L64 91 L74 101Z"/></g>`,
      `<path class="variant-extra" d="M19 95 Q14 68 31 49 M109 95 Q114 68 97 49" fill="none" stroke="${c3}" stroke-width="8" stroke-linecap="round"/><circle cx="19" cy="96" r="7" fill="#efb8ff"/><circle cx="109" cy="96" r="7" fill="#efb8ff"/>`
    ];
    return `<g transform="rotate(${(seed%7)-3} 64 68)">${motifs[pick]}</g><circle cx="64" cy="67" r="56" fill="none" stroke="#dfa1ff" stroke-width="2" opacity=".35"/>`;
  }
  return `<circle cx="64" cy="66" r="56" fill="none" stroke="#ffd766" stroke-width="3" opacity=".5"/><path d="M103 20 L108 8 L113 20 L125 25 L113 30 L108 42 L103 30 L91 25Z" fill="#ffe88b"/>`;
}
function instrumentRig(m,c1,c2,c3){
  const action=m.action||'';
  if(['jaw','mouth'].includes(action))return `<g class="sound-rig rig-jaw"><path d="M41 79 Q64 67 87 79 L82 99 Q64 110 46 99Z" fill="${c2}" stroke="${c3}" stroke-width="3"/><path d="M49 82 L55 90 L61 83 L68 91 L75 83 L80 90" fill="none" stroke="#f8ebd1" stroke-width="3"/></g>`;
  if(['drum','stomp'].includes(action))return `<g class="sound-rig rig-drum"><ellipse cx="64" cy="95" rx="23" ry="11" fill="${c2}" stroke="${c3}" stroke-width="4"/><path class="rig-arms" d="M39 67 L51 86 M89 67 L77 86" stroke="${c3}" stroke-width="6" stroke-linecap="round"/></g>`;
  if(['bellows'].includes(action))return `<g class="sound-rig rig-bellows"><path d="M30 61 Q12 71 31 88 M98 61 Q116 71 97 88" fill="none" stroke="${c3}" stroke-width="8" stroke-linecap="round"/></g>`;
  if(['horn','roar'].includes(action))return `<g class="sound-rig rig-horn"><path d="M85 72 Q112 64 121 76 Q112 91 85 84Z" fill="${c3}" stroke="${c2}" stroke-width="3"/><circle cx="119" cy="78" r="6" fill="#221f31"/></g>`;
  if(['pluck','clap','arms','tap','fingers'].includes(action))return `<g class="sound-rig rig-arms"><path d="M37 67 Q18 76 26 95 M91 67 Q110 76 102 95" fill="none" stroke="${c2}" stroke-width="8" stroke-linecap="round"/><path d="M45 91 H83 M47 97 H81" stroke="${c3}" stroke-width="2"/></g>`;
  if(['orbit'].includes(action))return `<g class="sound-rig rig-orbit"><circle cx="15" cy="70" r="6" fill="${c3}"/><circle cx="113" cy="65" r="5" fill="${c3}"/><circle cx="78" cy="17" r="5" fill="${c3}"/></g>`;
  if(['wing'].includes(action))return `<path class="sound-rig rig-wings" d="M34 68 Q8 56 17 39 M94 68 Q120 56 111 39" fill="none" stroke="${c3}" stroke-width="5" stroke-linecap="round"/>`;
  if(['tail'].includes(action))return `<path class="sound-rig rig-tail" d="M95 82 Q121 88 108 111" fill="none" stroke="${c3}" stroke-width="7" stroke-linecap="round"/>`;
  return '';
}

function speciesClassMorph(m,c1,c2,c3,seed){
  if(m.breedClass==='mythical')return `<g class="species-morph mythical-morph"><path d="M18 70 C16 35 38 15 64 18 C90 15 112 35 110 70" fill="none" stroke="${c3}" stroke-width="4" stroke-dasharray="5 7" opacity=".8"/><circle cx="25" cy="38" r="5" fill="#fff3b8"/><circle cx="104" cy="36" r="4" fill="#d8c7ff"/><path d="M54 16 L64 2 L74 16 L64 28Z" fill="${c3}" opacity=".9"/></g>`;
  if(m.breedClass==='legendary')return `<g class="species-morph legendary-breed-morph"><path d="M28 32 L39 12 L52 29 L64 8 L76 29 L89 12 L100 32" fill="none" stroke="${c3}" stroke-width="6" stroke-linejoin="round"/><path d="M19 88 Q64 121 109 88" fill="none" stroke="${c2}" stroke-width="5" stroke-dasharray="9 5" opacity=".9"/></g>`;
  return '';
}
function monsterSVG(m,variant='Common'){
  const seed=hash(m.id),c1=tint(m.colors[0],variant),c2=tint(m.colors[1],variant),c3=tint(m.colors[2],variant);
  const variantFace=face(seed,c3,variant);
  let body=baseBody(m.shape,c1,c2,c3,seed);
  body=body.replace(/<g class="face">[\s\S]*?<\/g>/,variantFace);
  const morph=variantMorph(m,variant,c1,c2,c3,seed),classMorph=speciesClassMorph(m,c1,c2,c3,seed),rig=instrumentRig(m,c1,c2,c3);
  const rareScale=variant==='Rare'?'translate(-3 -3) scale(1.07 .99)':variant==='Epic'?'translate(4 -6) rotate(2 64 64) scale(.94 1.10)':variant==='Legendary'?'translate(-1 -2) scale(1.02)':'translate(0 0)';
  const cls=`monster-svg variant-${variant.toLowerCase()}${m.breedClass==='mythical'?' species-mythical':''}${m.breedClass==='legendary'?' species-legendary-breed':''}`;
  return `<svg class="${cls}" viewBox="0 0 128 128" role="img" aria-label="${m.name}"><defs><linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="softGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="creature-body" transform="${rareScale}">${body}${rig}</g>${classMorph}${morph}</svg>`;
}
window.MelodicArt={monsterSVG,tint};
})();
