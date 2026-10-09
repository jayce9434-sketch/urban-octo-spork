(() => {
'use strict';

const SAVE_KEY='melodicIslesSave_v5';
const OLD_SAVE_KEY='melodicIslesSave_v4';
const LEGACY_SAVE_KEY='melodicIslesSave_v3';
const ANCIENT_SAVE_KEY='melodicIslesSave_v2';
const VERSION=5;
const FOUR_HOURS=4*60*60*1000;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const now=()=>Date.now();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Math.floor(Number(n)||0).toLocaleString();
const uid=()=>`m_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36).slice(-4)}`;
const dayStamp=()=>new Date().toISOString().slice(0,10);
const currentRotation=()=>Math.floor(Date.now()/FOUR_HOURS);

const {VARIANTS,ISLANDS,MONSTERS}=window.MelodicCatalog;
const M=Object.fromEntries(MONSTERS.map(m=>[m.id,m]));
const RESONATOR_REQUIREMENTS=['spriggle','glisswing','sparko','lumibun','kelpkin','reedjaw','lanternmaw','helmbeat'];


const QUESTS=[
  ['q01','Q1','Start the Chorus','Place 3 monsters on one island.',3,'placed',{coins:900,xp:35}],
  ['q02','Q2','Growing Family','Own 5 monsters.',5,'owned',{gems:4,xp:50}],
  ['q03','Q3','Pocket the Beat','Collect 2,000 monster coins.',2000,'collectedCoins',{notes:80,xp:60}],
  ['q04','Q4','New Harmony','Complete 1 breeding.',1,'breedCount',{gems:6,coins:1800,xp:70}],
  ['q05','Q5','Island Hopper','Unlock 2 islands.',2,'islands',{stars:1,notes:120,xp:80}],
  ['q06','Q6','Stage Decorator','Buy 3 decorations.',3,'decorBought',{coins:2800,notes:90,xp:70}],
  ['q07','Q7','Full Performance','Play 3 island songs.',3,'songsPlayed',{notes:140,gems:3,xp:85}],
  ['q08','Q8','No Waiting Around','Instant-finish 1 breed with Gems.',1,'instantBreeds',{stars:1,notes:100,xp:80}],
  ['q09','Q9','Rare Find','Own 2 Rare monsters.',2,'rareOwned',{gems:6,stars:1,xp:100}],
  ['q10','Q10','Epic Moment','Own an Epic monster.',1,'epicOwned',{gems:8,stars:1,xp:110}],
  ['q11','Q11','Legendary!','Own a Legendary monster.',1,'legendaryOwned',{gems:12,stars:2,xp:140}],
  ['q12','Q12','Big Songbook','Discover 15 species.',15,'species',{notes:250,stars:2,xp:160}],
  ['q13','Q13','Variant Hunter','Discover 20 rarity slots.',20,'variantSlots',{gems:10,stars:2,xp:170}],
  ['q14','Q14','Frozen Ensemble','Place 6 monsters on Frostbell Atoll.',6,'frostPlaced',{notes:220,coins:6000,xp:150}],
  ['q15','Q15','Circuit Breaker','Place 7 monsters on Ember Circuit.',7,'emberPlaced',{gems:9,stars:2,xp:170}],
  ['q16','Q16','Dream Arrival','Unlock Moonlit Reverie.',1,'moonUnlocked',{gems:12,notes:300,stars:2,xp:220}],
  ['q17','Q17','Awaken a Titan','Own any Island Titan.',1,'titanOwned',{gems:15,stars:3,xp:260}],
  ['q18','Q18','Spend the Music','Spend 500 Music Notes.',500,'notesSpent',{stars:2,gems:8,xp:160}],
  ['q19','Q19','Island Mastery','Buy 2 permanent Star upgrades.',2,'masteryBought',{notes:300,gems:10,xp:200}],
  ['q20','Q20','Eight-Island Symphony','Unlock all 8 main islands.',8,'islands',{stars:5,gems:22,notes:650,xp:420}],
  ['q21','Q21','First Attunement','Attune a level-15 monster into an Islet performer.',1,'attuned',{stars:3,gems:12,notes:500,xp:260}],
  ['q22','Q22','Prism Hand Chorus','Place 6 monsters on Prism Hand Islet.',6,'prismPlaced',{stars:4,gems:16,notes:700,xp:340}],
  ['q23','Q23','Seasonal Discovery','Breed a limited-time Seasonal monster.',1,'seasonalsBred',{stars:3,gems:15,notes:600,xp:300}],
  ['q24','Q24','Power the Resonator','Fully awaken the Grand Resonator.',1,'resonatorPowered',{stars:6,gems:25,notes:1000,xp:500}],
  ['q25','Q25','Null Crown Overture','Unlock Null Crown Islet.',1,'nullUnlocked',{stars:8,gems:30,notes:1400,xp:650}]
].map(q=>({id:q[0],icon:q[1],name:q[2],desc:q[3],target:q[4],kind:q[5],reward:q[6]}));

function freshState(){
  const keys=Object.keys(ISLANDS), map=v=>Object.fromEntries(keys.map(k=>[k,typeof v==='function'?v(k):v]));
  return {
    version:VERSION,coins:2600,gems:18,notes:0,stars:0,starsEarned:0,xp:0,level:1,
    currentIsland:'groove',unlocked:['groove'],owned:[],
    placed:map(()=>[]),breedJobs:map(null),decorBoost:map(0),songBoostUntil:map(0),
    torches:map(()=>Array(10).fill(0)),mastery:map(()=>({amp:0,luck:0,stage:0})),castle:map(1),
    resonator:{purchased:false,powered:false,boxed:[]},
    discoveredSeasonals:[],questClaimed:{},rotationId:currentRotation(),rotationClaimed:{},rotationBaseline:null,
    stats:{collectedCoins:0,breedCount:0,decorBought:0,songsPlayed:0,instantBreeds:0,notesSpent:0,starsSpent:0,gemsSpent:0,monstersBought:0,masteryBought:0,hatched:0,attuned:0,seasonalsBred:0,resonatorBoxed:0},
    collectionMilestones:0,lastSeen:now(),dailyStamp:'',settings:{music:true,sfx:true,reduceEffects:false,musicVolume:100,sfxVolume:100}
  };
}

const DEMO=window.__MELODIC_DEMO__||null;
let demoMode=new URLSearchParams(location.search).get('demo')==='1'||!!DEMO;
let state=load();
let audio=null,masterGain=null,musicBus=null,sfxBus=null,compressor=null,reverbNode=null,reverbGain=null,songTimer=null,songStep=0,selectedBreed=[],collectionVariant='All';

function migrate(raw){
  const base=freshState();
  const s={...base,...raw};
  s.version=VERSION;
  s.stars=Number(raw.stars||0);s.starsEarned=Number(raw.starsEarned||raw.stars||0);
  s.placed={...base.placed,...(raw.placed||{})};
  s.breedJobs={...base.breedJobs,...(raw.breedJobs||{})};
  s.decorBoost={...base.decorBoost,...(raw.decorBoost||{})};
  s.songBoostUntil={...base.songBoostUntil,...(raw.songBoostUntil||{})};
  s.mastery={...base.mastery,...(raw.mastery||{})};s.castle={...base.castle,...(raw.castle||{})};s.resonator={...base.resonator,...(raw.resonator||{})};s.discoveredSeasonals=[...new Set(raw.discoveredSeasonals||[])];
  s.torches={...base.torches,...(raw.torches||{})};Object.keys(ISLANDS).forEach(k=>{const a=Array.isArray(s.torches[k])?s.torches[k]:[];s.torches[k]=Array.from({length:10},(_,i)=>Number(a[i]||0));});
  Object.keys(ISLANDS).forEach(k=>s.mastery[k]={amp:0,luck:0,stage:0,...(s.mastery[k]||{})});
  s.stats={...base.stats,...(raw.stats||{})};
  s.settings={...base.settings,...(raw.settings||{})};
  s.unlocked=[...new Set((raw.unlocked||['groove']).filter(k=>ISLANDS[k]))]; if(!s.unlocked.includes('groove'))s.unlocked.unshift('groove');
  s.currentIsland=ISLANDS[raw.currentIsland]?raw.currentIsland:'groove';
  s.owned=(raw.owned||[]).filter(o=>M[o.id]).map(o=>({uid:o.uid||uid(),id:o.id,variant:VARIANTS[o.variant]?o.variant:'Common',level:o.level||1,lastCollected:o.lastCollected||now()}));
  const seenForms=new Set();s.owned=s.owned.filter(o=>{const key=`${o.id}|${o.variant}`;if(seenForms.has(key))return false;seenForms.add(key);return true;});
  const valid=new Set(s.owned.map(o=>o.uid)); Object.keys(s.placed).forEach(k=>s.placed[k]=s.placed[k].filter(x=>valid.has(x)));
  ensureRotationState(s);
  return s;
}
function load(){
  if(demoMode)return demoState();
  try{
    const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(OLD_SAVE_KEY)||localStorage.getItem(LEGACY_SAVE_KEY)||localStorage.getItem(ANCIENT_SAVE_KEY);
    if(!raw)return freshState();
    const s=migrate(JSON.parse(raw));
    localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    return s;
  }catch(e){console.warn('Save load failed',e);return freshState();}
}
function save(){if(demoMode)return;state.lastSeen=now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function demoState(){
  const s=freshState();s.coins=1392450;s.gems=218;s.notes=12860;s.stars=96;s.starsEarned=108;s.level=38;s.resonator={purchased:true,powered:true,boxed:[...RESONATOR_REQUIREMENTS]};s.xp=620;s.unlocked=Object.keys(ISLANDS);
  const vars=['Common','Rare','Epic','Legendary'];
  Object.keys(ISLANDS).forEach((isl,ix)=>{
    MONSTERS.filter(m=>m.island===isl).forEach((m,i)=>{
      if(i<(ISLANDS[isl].islet?12:15) || m.special){const o={uid:uid(),id:m.id,variant:vars[(i+ix)%4],level:4+((i+ix)%8),lastCollected:now()-((i%5)+1)*580000};s.owned.push(o);s.placed[isl].push(o.uid);}
    });
    s.decorBoost[isl]=2+ix;s.castle[isl]=5;s.mastery[isl]={amp:Math.min(3,ix+1),luck:Math.min(3,ix),stage:ix>1?1:0};if(!ISLANDS[isl].islet)s.torches[isl]=Array.from({length:10},(_,ti)=>ti<Math.min(10,4+ix)?now()+((20+ti)*60*60*1000):0);
  });
  s.stats={...s.stats,collectedCoins:98000,breedCount:18,decorBought:9,songsPlayed:14,instantBreeds:3,notesSpent:740,starsSpent:11,gemsSpent:14,monstersBought:25,masteryBought:12,hatched:31,attuned:10,seasonalsBred:2,resonatorBoxed:8};
  s.breedJobs.groove={startedAt:now()-60000,endsAt:now()+4*60000,monsterId:'spriggle',variant:'Legendary'};
  s.rotationBaseline={...s.stats};s.rotationBaseline.collectedCoins-=1500;s.rotationBaseline.songsPlayed-=1;
  return s;
}
function ensureRotationState(s=state){
  const rid=currentRotation();
  if(s.rotationId!==rid||!s.rotationBaseline){s.rotationId=rid;s.rotationClaimed={};s.rotationBaseline={...s.stats};}
}

function levelNeed(l=state.level){return 100+(l-1)*110;}
function gainXP(n){state.xp+=n;while(state.xp>=levelNeed()){state.xp-=levelNeed();state.level++;state.coins+=500*state.level;if(state.level%3===0)state.gems+=2;toast(`Level ${state.level}! Bonus coins added.`);sfx('level');}}
function grantStars(n){state.stars+=n;state.starsEarned+=n;}
function addReward(r={}){if(r.coins)state.coins+=r.coins;if(r.gems)state.gems+=r.gems;if(r.notes)state.notes+=r.notes;if(r.stars)grantStars(r.stars);if(r.xp)gainXP(r.xp);}

function init(){
  ensureRotationState();buildParticles();bindStatic();grantDaily();checkFinishedJobs(false);awardCollectionMilestones(false);renderAll();
  setInterval(()=>{ensureRotationState();updateTimers();renderTop();if(!$('#modalLayer').classList.contains('hidden')&&$('#modalTitle').textContent==='Quests')renderQuests();},1000);
  window.addEventListener('beforeunload',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{ensureRotationState();checkFinishedJobs(true);renderAll();}});
  const p=new URLSearchParams(location.search),screen=(DEMO&&DEMO.screen)||p.get('screen'),island=(DEMO&&DEMO.island)||p.get('island');
  if(demoMode){if(island&&ISLANDS[island])state.currentIsland=island;renderAll();if(screen&&['market','breed','collection','quests','events','resonator','settings','map','mastery'].includes(screen))setTimeout(()=>openModal(screen),100);}
}
function bindStatic(){
  $('#closeModalBtn').addEventListener('click',closeModal);$('#modalLayer').addEventListener('click',e=>{if(e.target.id==='modalLayer')closeModal();});
  $('#settingsBtn').addEventListener('click',()=>openModal('settings'));$('#collectAllBtn').addEventListener('click',collectAll);$('#performanceBtn').addEventListener('click',toggleSong);
  $$('.bottom-nav button').forEach(b=>b.addEventListener('click',()=>b.dataset.nav==='island'?closeModal():openModal(b.dataset.nav)));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openModal(b.dataset.open);});
  $$('.resource-pill').forEach(b=>b.addEventListener('click',()=>openCurrencyHelp(b.dataset.currency)));
}

function renderAll(){renderTop();renderTabs();renderIsland();save();}
function renderTop(){
  $('#coinsValue').textContent=fmt(state.coins);$('#gemsValue').textContent=fmt(state.gems);$('#notesValue').textContent=fmt(state.notes);$('#starsValue').textContent=fmt(state.stars);
  $('#levelBadge').textContent=state.level;const need=levelNeed();$('#xpFill').style.width=`${clamp(state.xp/need*100,0,100)}%`;$('#xpText').textContent=`${fmt(state.xp)} / ${fmt(need)} XP`;
}
function renderTabs(){
  const root=$('#islandTabs');root.innerHTML='';Object.entries(ISLANDS).forEach(([k,is])=>{const unlocked=state.unlocked.includes(k),b=document.createElement('button');b.className=`island-tab${state.currentIsland===k?' active':''}${!unlocked?' locked':''}`;b.textContent=`${is.mark}  ${is.name}${is.islet?' [ISLET]':''}${unlocked?'':` - Lv ${is.unlockLevel}`}`;b.addEventListener('click',()=>unlocked?switchIsland(k):unlockPrompt(k));root.appendChild(b);});
}
function switchIsland(k){state.currentIsland=k;selectedBreed=[];stopSong();renderAll();}
function unlockPrompt(k){
  const is=ISLANDS[k];if(state.level<is.unlockLevel){toast(`${is.name} unlocks at level ${is.unlockLevel}.`);return;}if(state.starsEarned<is.lifeStars){toast(`Earn ${is.lifeStars} lifetime Stars first. You have ${state.starsEarned}.`);return;}if(is.hardest&&!state.resonator?.powered){toast('Power the Grand Resonator before entering Null Crown Islet.');return;}if(state.coins<is.unlockCost){toast(`You need ${fmt(is.unlockCost)} coins.`);return;}
  if(confirm(`Unlock ${is.name} for ${fmt(is.unlockCost)} coins?`)){state.coins-=is.unlockCost;state.unlocked.push(k);gainXP(is.islet?220:100);sfx('unlock');toast(`${is.name} unlocked!`);renderAll();}
}
function activeTorchCount(isl){return (state.torches?.[isl]||[]).filter(t=>Number(t)>now()).length;}
function torchLuck(isl){const n=activeTorchCount(isl);return {count:n,legendary:Math.min(10,2+n*.8),mythical:Math.min(10,1+n*.9)};}
function renderIsland(){
  const is=ISLANDS[state.currentIsland],stage=$('#stage');stage.dataset.theme=is.theme;stage.classList.toggle('islet-stage',!!is.islet);$('#islandName').textContent=is.name;$('#islandType').textContent=is.type;$('#islandDesc').textContent=is.desc;
  const backdrop=$('#islandBackdrop');if(backdrop&&window.MelodicWorldArt)backdrop.innerHTML=window.MelodicWorldArt.worldSVG(is.theme,is.islet?0:activeTorchCount(state.currentIsland));
  const amp=state.mastery[state.currentIsland].amp||0,luck=state.mastery[state.currentIsland].luck||0,stageLv=state.mastery[state.currentIsland].stage||0,boost=state.songBoostUntil[state.currentIsland]>now();
  const active=(window.MelodicEvents?.activeEvents?.()||[]).filter(e=>e.islands.includes(state.currentIsland)),torch=torchLuck(state.currentIsland);
  const eventChip=active.length?`<button class="stat-chip event-chip" data-open="events">${active[0].name} - ${window.MelodicEvents.untilText(active[0])}</button>`:'';
  const beds=bedUsage(state.currentIsland),cap=bedCapacity(state.currentIsland);$('#islandStats').innerHTML=`<span class="stat-chip">Mastery ${amp+luck+stageLv}/9</span><span class="stat-chip">Beds ${beds}/${cap}</span><span class="stat-chip">Roster ${MONSTERS.filter(m=>m.island===state.currentIsland).length}/${is.rosterTarget||0}</span><span class="stat-chip">${boost?'Harmony Boost ACTIVE':'Harmony Boost ready'}</span>${!is.islet?`<span class="stat-chip torch-chip">Torches ${torch.count}/10</span>`:'<span class="stat-chip">Attunement-only roster</span>'}${eventChip}<button class="stat-chip" data-open="mastery">Upgrade island</button>`;
  const field=$('#monsterField');field.innerHTML='';const ids=state.placed[state.currentIsland]||[];$('#emptyIsland').classList.toggle('hidden',ids.length>0);field.classList.toggle('hidden',ids.length===0);
  const positions=getPositions(ids.length,!!is.islet),scale=Math.max(is.islet?.54:.50,1-Math.max(0,ids.length-4)*(is.islet?.038:.036));field.style.setProperty('--crowd-scale',scale.toFixed(3));
  ids.forEach((id,i)=>{const o=state.owned.find(x=>x.uid===id);if(!o)return;const m=M[o.id],bank=monsterBank(o),u=document.createElement('div');u.className=`monster-unit${m.breedClass==='mythical'?' mythical-unit':''}${m.breedClass==='legendary'?' legendary-breed-unit':''}`;u.dataset.uid=o.uid;u.style.left=positions[i].x+'%';u.style.top=positions[i].y+'%';u.style.zIndex=String(20+Math.round(positions[i].y));u.innerHTML=`<button aria-label="${m.name}, ${o.variant}"><div class="monster-avatar action-${m.action||actionForInstrument(m.instrument)}" data-uid="${o.uid}">${monsterSVG(m,o.variant)}</div><span class="monster-name"><i class="variant-dot ${o.variant}"></i>${m.name}</span>${m.breedClass==='mythical'?'<span class="class-pip">MYTHICAL</span>':m.breedClass==='legendary'?'<span class="class-pip legend-pip">LEGENDARY BREED</span>':''}${bank>=1?`<span class="coin-bubble">Coins ${fmt(bank)}</span>`:''}</button>`;u.querySelector('button').addEventListener('click',e=>collectMonster(o,e));field.appendChild(u);});
  $('#decorStrip').innerHTML=is.decor.map((d,i)=>`<span class="decor-item decor-${i%6}" title="${d}" style="transform:translateY(${i%2?6:0}px)"><i></i></span>`).join('');updateTimers();
}
function getPositions(n,islet=false){
  const out=[];if(n<=0)return out;let rows;
  if(islet){if(n<=4)rows=[n];else if(n<=8)rows=[Math.ceil(n/2),Math.floor(n/2)];else rows=[4,4,n-8];}
  else{if(n<=5)rows=[n];else if(n<=10)rows=[Math.ceil(n/2),Math.floor(n/2)];else rows=[5,5,n-10];}
  const ys=rows.length===1?[58]:rows.length===2?[46,69]:[38,59,77];
  rows.forEach((count,r)=>{for(let j=0;j<count;j++){const spread=rows.length===3&&r===2?76:82;out.push({x:(50-spread/2)+(j+1)*(spread/(count+1)),y:ys[r]});}});return out;
}
function islandMultiplier(isl){const amp=state.mastery[isl]?.amp||0,decor=state.decorBoost[isl]||0,song=state.songBoostUntil[isl]>now()?1.5:1;return (1+decor*.05+amp*.15)*song;}
function monsterBank(o){const m=M[o.id];if(!m)return 0;const hours=clamp((now()-(o.lastCollected||now()))/3600000,0,12);const levelMult=1+(Math.max(1,o.level||1)-1)*.10;return Math.floor(m.rate*VARIANTS[o.variant].mult*hours*islandMultiplier(m.island)*levelMult);}
function collectMonster(o,e){const bank=monsterBank(o);if(bank<1){sfx('tap');openMonsterDetail(o);return;}state.coins+=bank;state.stats.collectedCoins+=bank;o.lastCollected=now();gainXP(Math.max(1,Math.floor(bank/140)));spark(e.clientX||innerWidth/2,e.clientY||innerHeight/2);sfx('coin');renderTop();renderIsland();save();}
function collectAll(){let total=0;state.placed[state.currentIsland].forEach(id=>{const o=state.owned.find(x=>x.uid===id);if(!o)return;const b=monsterBank(o);total+=b;if(b>0)o.lastCollected=now();});if(total<1){toast('No coins ready yet.');return;}state.coins+=total;state.stats.collectedCoins+=total;gainXP(Math.max(1,Math.floor(total/120)));toast(`Collected ${fmt(total)} coins!`);sfx('coin');renderAll();}

const BED_CAPS=[0,12,20,32,48,70];
const CASTLE_COSTS=[0,0,6500,18000,42000,85000];
function bedUsage(isl){return state.owned.filter(o=>M[o.id]?.island===isl).reduce((n,o)=>n+(M[o.id]?.special?4:1),0);}
function bedCapacity(isl){return BED_CAPS[Math.max(1,Math.min(5,state.castle?.[isl]||1))];}
function hasBedSpace(isl,beds=1){return bedUsage(isl)+beds<=bedCapacity(isl);}
function castleUpgradeCost(isl){const lv=state.castle?.[isl]||1;return CASTLE_COSTS[Math.min(5,lv+1)]||0;}
function buyCastleUpgrade(){const isl=state.currentIsland,lv=state.castle[isl]||1;if(lv>=5){toast('This Castle is already max level.');return;}const cost=castleUpgradeCost(isl);if(state.coins<cost){toast(`You need ${fmt(cost)} Coins for the next Castle level.`);return;}state.coins-=cost;state.castle[isl]=lv+1;gainXP(40+lv*20);sfx('unlock');toast(`Castle upgraded to level ${lv+1}. Capacity is now ${bedCapacity(isl)} beds.`);renderTop();renderMarket();renderIsland();save();}
function feedCost(o){return Math.round(90*Math.pow(1.32,Math.max(0,(o.level||1)-1)));}
function openMonsterDetail(o){const m=M[o.id];if(!m)return;stopSong();$('#modalLayer').classList.remove('hidden');$$('.bottom-nav button').forEach(b=>b.classList.remove('active'));$('#modalEyebrow').textContent='MONSTER';$('#modalTitle').textContent=m.name;renderMonsterDetail(o);}

function renderMonsterDetail(o){
  const m=M[o.id],root=$('#modalContent'),lv=Math.max(1,o.level||1),cost=feedCost(o),happy=Math.min(100,50+(state.decorBoost[m.island]||0)*5),rate=Math.round(m.rate*VARIANTS[o.variant].mult*(1+(lv-1)*.10)*islandMultiplier(m.island));
  root.innerHTML=`<div class="monster-detail"><div class="detail-art">${monsterSVG(m,o.variant)}</div><div class="detail-copy"><span class="special-ribbon">${o.variant}</span><h2>${m.name}</h2><p>${m.desc}</p><div class="detail-stats"><span>Level <b>${lv}/20</b></span><span>Happiness <b>${happy}%</b></span><span>Income <b>${fmt(rate)}/hour</b></span><span>Bed cost <b>${m.special?4:1}</b></span></div><p class="mini">Level 4 unlocks this monster for breeding. Decorations increase happiness and island income.</p><button class="primary-btn" id="feedMonsterBtn" ${lv>=20?'disabled':''}>${lv>=20?'Maximum level':`Feed - ${fmt(cost)} Coins`}</button></div></div>`;
  $('#feedMonsterBtn')?.addEventListener('click',()=>{if((o.level||1)>=20)return;if(state.coins<cost){toast(`You need ${fmt(cost)} Coins to feed ${m.name}.`);return;}state.coins-=cost;o.level=(o.level||1)+1;gainXP(10+o.level*2);sfx('buy');toast(`${m.name} reached level ${o.level}.`);renderTop();renderMonsterDetail(o);renderIsland();save();});
}
function openModal(type){
  stopSong();$('#modalLayer').classList.remove('hidden');$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===type));
  const titles={market:['MONSTER MARKET','Market'],breed:['HARMONY HATCH','Breeding'],collection:['MONSTER BOOK','Collection'],quests:['GOALS','Quests'],events:['LIVE CALENDAR','Events'],resonator:['WORLD CONSTRUCT','Grand Resonator'],settings:['OPTIONS','Settings'],map:['WORLD','Island Map'],mastery:['STAR WORKSHOP','Island Mastery']};const [eye,title]=titles[type]||['MELODIC ISLES','Menu'];$('#modalEyebrow').textContent=eye;$('#modalTitle').textContent=title;
  ({market:renderMarket,breed:renderBreed,collection:renderCollection,quests:renderQuests,events:renderEvents,resonator:renderResonator,settings:renderSettings,map:renderMap,mastery:renderMastery}[type]||renderMarket)();
}
function closeModal(){$('#modalLayer').classList.add('hidden');$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav==='island'));}
function openCurrencyHelp(kind){openModal('market');setTimeout(()=>{const el=document.querySelector(`[data-tool="${kind}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});},50);}

function renderMarket(){
  const isl=state.currentIsland,is=ISLANDS[isl],root=$('#modalContent');
  const regular=MONSTERS.filter(m=>m.island===isl&&!m.seasonal&&m.id!=='grandresonator');
  const torch=torchLuck(isl);
  root.innerHTML=`
  <div class="currency-help">
    <div data-tool="gems"><b>Gems</b>Light Resonance Torches for 24 hours, instant-finish breeding, and reroll egg rarity.</div>
    <div data-tool="notes"><b>Music Notes</b>Buy Harmony Boosts and awaken Titans or Primordials.</div>
    <div data-tool="stars"><b>Stars</b>Permanent island mastery, Titans, Primordials, and late-game progression.</div>
  </div>
  <div class="market-tools">
    <article class="tool-card"><h3>Harmony Boost</h3><p>+50% monster income on ${is.name} for 20 minutes. Timer continues offline.</p><button class="primary-btn" id="noteBoostBtn">Activate - 120 Notes</button></article>
    <article class="tool-card"><h3>Decoration</h3><p>Permanent +5% income on this destination. Stackable up to 10 times.</p><button class="secondary-btn" id="decorBuyBtn">Buy - 1,250 Coins</button></article>
    ${!is.islet?`<article class="tool-card torch-tool"><h3>Resonance Torches</h3><p>${torch.count}/10 lit. Each torch costs 2 Gems and burns for 24 hours. All 10 raise Mythical breeding from 1% to 10% and Legendary Breeds from 2% to 10%.</p><button class="secondary-btn" id="torchFocusBtn">View Torches</button></article>`:''}
    <article class="tool-card"><h3>Island Mastery</h3><p>Spend Stars on permanent income, breeding luck, and performance upgrades.</p><button class="secondary-btn" data-open="mastery">Open Mastery</button></article>
    <article class="tool-card"><h3>Castle Beds</h3><p id="castleText">Capacity controls how many performers can live here.</p><button class="secondary-btn" id="castleUpgradeBtn">Upgrade Castle</button></article>
    ${isl==='bastion'?`<article class="tool-card resonator-tool"><h3>Grand Resonator</h3><p>A dormant world construct. Box one required monster from every main island to power it.</p><button class="primary-btn" data-open="resonator">${state.resonator?.powered?'Powered':'Open Resonator'}</button></article>`:''}
    ${is.islet?`<article class="tool-card islet-tool"><h3>Attunement Conduit</h3><p>Islet performers cannot be bought. Raise the listed source monster to Level 15, then attune it here. The source leaves its old island and becomes the new Islet form.</p></article>`:''}
  </div>
  ${!is.islet?'<div id="torchPanel"></div>':''}
  <div class="collection-top"><div><b>${is.mark} - ${is.name}</b><div class="mini">Roster ${MONSTERS.filter(m=>m.island===isl).length} / ${is.rosterTarget}. Exact form cap: one Common, one Rare, one Epic and one Legendary form per species.</div></div></div><div class="card-grid" id="marketGrid"></div>`;
  $('#noteBoostBtn').addEventListener('click',buySongBoost);$('#decorBuyBtn').addEventListener('click',buyDecor);$('#castleUpgradeBtn').addEventListener('click',buyCastleUpgrade);
  $('#torchFocusBtn')?.addEventListener('click',()=>$('#torchPanel')?.scrollIntoView({behavior:'smooth',block:'center'}));
  const cl=state.castle[isl]||1,cc=castleUpgradeCost(isl);$('#castleText').textContent=`Level ${cl} Castle - ${bedUsage(isl)}/${bedCapacity(isl)} beds used.${cl<5?' Next upgrade: '+fmt(cc)+' Coins.':' Maximum level.'}`;if(cl>=5)$('#castleUpgradeBtn').disabled=true;
  if(!is.islet)renderTorchPanel();
  const grid=$('#marketGrid');regular.forEach(m=>{
    const card=document.createElement('article');card.className=`monster-card${m.special?' special-card':''}${m.attuneFrom?' attune-card':''}${m.breedClass==='mythical'?' mythical-card':''}${m.breedClass==='legendary'?' legendary-breed-card':''}`;
    const owned=state.owned.filter(o=>o.id===m.id),forms=Object.keys(VARIANTS).filter(v=>owned.some(o=>o.variant===v));
    const source=m.attuneFrom?M[m.attuneFrom]:null,eligible=source?state.owned.some(o=>o.id===source.id&&(o.level||1)>=15):false;
    const breedOnly=['mythical','legendary'].includes(m.breedClass);
    const buttonText=m.attuneFrom?(eligible?'Attune Level 15 Source':`Need Level 15 ${source?.name||'source'}`):(breedOnly?'Breed Only':m.special?(is.islet?'Awaken Primordial':'Awaken Titan'):(forms.includes('Common')?'Common Owned':'Buy Common'));
    const costText=m.attuneFrom?`Source: ${source?.name||'Unknown'}`:(breedOnly?(m.breedClass==='mythical'?'4-element + 3-element, base 1%':'3-element + 3-element, base 2%'):(m.special?`${fmt(m.price)} Coins + ${fmt(m.notes)} Notes + ${m.stars} Stars`:`${fmt(m.price)} Coins`));
    const elementText=(m.elements||[m.element]).join(' / '),rarityLine=forms.length?`Owned forms: ${forms.join(', ')}`:'No forms owned yet';
    card.innerHTML=`<div class="card-art">${monsterSVG(m,m.special?'Legendary':'Common')}</div><h3>${m.name}</h3>${m.special?`<span class="special-ribbon">${is.islet?'ISLET PRIMORDIAL':'ISLAND TITAN'}</span>`:''}${m.attuneFrom?'<span class="special-ribbon attune-ribbon">ATTUNED FORM</span>':''}${m.breedClass==='mythical'?'<span class="special-ribbon mythical-ribbon">MYTHICAL - ONE ELEMENT</span>':''}${m.breedClass==='legendary'?'<span class="special-ribbon legend-ribbon">LEGENDARY BREED</span>':''}<p>${m.desc}</p><div class="card-meta"><span class="tag">${m.elementCount||1} element${(m.elementCount||1)===1?'':'s'}: ${elementText}</span><span class="tag">Sound: ${m.instrument}</span><span class="tag">Time: ${m.wait}m</span></div><div class="mini">${fmt(m.rate)} coins/hour - ${rarityLine}</div><div class="price-row"><div class="price-stack"><b>${costText}</b></div><button class="primary-btn" ${(m.attuneFrom&&!eligible)||breedOnly||(!m.special&&!m.attuneFrom&&forms.includes('Common'))?'disabled':''}>${buttonText}</button></div>`;
    card.querySelector('button').addEventListener('click',()=>buyMonster(m));grid.appendChild(card);
  });
}
function renderTorchPanel(){
  const isl=state.currentIsland,root=$('#torchPanel');if(!root)return;const data=state.torches[isl]||Array(10).fill(0),luck=torchLuck(isl);
  root.innerHTML=`<section class="torch-panel"><div class="torch-head"><div><span class="special-ribbon">BREEDING STRUCTURE</span><h3>Resonance Torch Ring</h3><p>Ten torch structures surround the breeding grounds. Every lit torch burns for 24 real hours.</p></div><div class="torch-odds"><b>${luck.count}/10 lit</b><span>Legendary Breed ${luck.legendary.toFixed(1)}%</span><span>Mythical ${luck.mythical.toFixed(1)}%</span></div></div><div class="torch-grid">${data.map((until,i)=>{const active=until>now(),left=active?formatTime(until-now()):'';return `<article class="torch-slot ${active?'lit':''}"><div class="torch-flame"><i></i></div><b>Torch ${i+1}</b><span>${active?left:'Unlit'}</span><button class="${active?'secondary-btn':'primary-btn'}" data-torch="${i}" ${active?'disabled':''}>${active?'Burning':'Light - 2 Gems'}</button></article>`;}).join('')}</div><div class="mini torch-note">All 10 lit: Mythical 1% to 10%. Legendary Breed 2% to 10%. Torches only change special-breed odds when the correct parent element counts are selected.</div></section>`;
  $$('[data-torch]',root).forEach(b=>b.addEventListener('click',()=>lightTorch(Number(b.dataset.torch))));
}
function lightTorch(i){const isl=state.currentIsland;if(ISLANDS[isl].islet)return;if(state.gems<2){toast('You need 2 Gems to light a Resonance Torch for 24 hours.');sfx('bad');return;}if((state.torches[isl]?.[i]||0)>now())return;state.gems-=2;state.stats.gemsSpent+=2;state.torches[isl][i]=now()+24*60*60*1000;sfx('gem');toast(`Torch ${i+1} lit for 24 hours.`);renderTop();renderTorchPanel();renderIsland();save();}
function buySongBoost(){if(state.notes<120){toast('You need 120 Music Notes.');return;}state.notes-=120;state.stats.notesSpent+=120;state.songBoostUntil[state.currentIsland]=Math.max(now(),state.songBoostUntil[state.currentIsland]||0)+20*60000;sfx('quest');toast('Harmony Boost active for 20 minutes!');renderTop();renderMarket();renderIsland();save();}
function buyDecor(){if((state.decorBoost[state.currentIsland]||0)>=10){toast('This island already has the maximum 10 decoration boosts.');return;}if(state.coins<1250){toast('You need 1,250 coins.');return;}state.coins-=1250;state.decorBoost[state.currentIsland]++;state.stats.decorBought++;gainXP(12);sfx('buy');toast('Decoration placed! +5% island income.');renderTop();renderIsland();save();}
function removeOwned(uid){
  const o=state.owned.find(x=>x.uid===uid);if(!o)return null;
  Object.keys(state.placed).forEach(k=>state.placed[k]=state.placed[k].filter(x=>x!==uid));
  state.owned=state.owned.filter(x=>x.uid!==uid);return o;
}
function canOwnVariant(id,variant){return !state.owned.some(o=>o.id===id&&o.variant===variant);}
function availableVariants(id){return Object.keys(VARIANTS).filter(v=>canOwnVariant(id,v));}
function buyMonster(m){
  if(['mythical','legendary'].includes(m.breedClass)){toast(`${m.name} is breeding-only. Use the required element-count pairing in Harmony Hatch.`);sfx('bad');return;}
  const beds=m.special?4:1;if(!hasBedSpace(m.island,beds)){toast('Castle is full. Upgrade it before adding another monster.');sfx('bad');return;}
  if(m.attuneFrom){
    const source=state.owned.find(o=>o.id===m.attuneFrom&&(o.level||1)>=15);
    if(!source){toast(`Raise ${M[m.attuneFrom]?.name||'the source monster'} to Level 15 first.`);sfx('bad');return;}
    const inherited=source.variant;if(!canOwnVariant(m.id,inherited)){toast(`You already own the ${inherited} form of ${m.name}. Only one of each form is allowed.`);sfx('bad');return;}
    removeOwned(source.uid);addOwned(m.id,inherited);state.stats.attuned=(state.stats.attuned||0)+1;gainXP(120);sfx('unlock');toast(`${M[m.attuneFrom].name} attuned into ${m.name}.`);renderTop();renderMarket();renderIsland();save();return;
  }
  if(m.special){
    if(ISLANDS[m.island].islet){
      const needed=MONSTERS.filter(x=>x.island===m.island&&x.attuneFrom&&!x.special);
      const missing=needed.filter(x=>!state.owned.some(o=>o.id===x.id));
      if(missing.length){toast(`Attune the full Islet roster first. ${missing.length} performer${missing.length===1?'':'s'} still missing.`);return;}
    }
    const avail=availableVariants(m.id);if(!avail.length){toast(`All four forms of ${m.name} are already owned.`);return;}
    if(state.coins<m.price||state.notes<m.notes||state.stars<m.stars){toast(`Awakening requires ${fmt(m.price)} Coins + ${m.notes} Notes + ${m.stars} Stars.`);return;}
    state.coins-=m.price;state.notes-=m.notes;state.stars-=m.stars;state.stats.notesSpent+=m.notes;state.stats.starsSpent+=m.stars;let variant=rollVariant(true,m.island);if(!canOwnVariant(m.id,variant))variant=avail[Math.floor(Math.random()*avail.length)];addOwned(m.id,variant);toast(`${variant} ${m.name} awakened.`);sfx('titan');
  } else {
    if(m.seasonal){toast('Seasonal monsters are obtained from their limited event breeding combination.');return;}
    if(!canOwnVariant(m.id,'Common')){toast(`You already own Common ${m.name}. Each species is limited to one of each rarity form.`);return;}
    if(state.coins<m.price){toast('Not enough coins yet.');return;}state.coins-=m.price;state.stats.monstersBought++;addOwned(m.id,'Common');toast(`${m.name} joined ${ISLANDS[m.island].name}.`);sfx('hatch');
  }
  gainXP(20+Math.floor(m.price/2000));awardCollectionMilestones();renderTop();renderMarket();renderIsland();save();
}
function addOwned(id,variant){const m=M[id];if(!m||!canOwnVariant(id,variant))return null;const o={uid:uid(),id,variant,level:1,lastCollected:now()};state.owned.push(o);state.placed[m.island].push(o.uid);return o;}

function eligibleBreeders(){return state.owned.filter(o=>{const m=M[o.id];return m?.island===state.currentIsland&&!m.special&&!m.seasonal&&!m.attuneFrom&&!['mythical','legendary'].includes(m.breedClass)&&(o.level||1)>=4;});}
function selectedBreedInfo(){return selectedBreed.map(id=>state.owned.find(o=>o.uid===id)).filter(Boolean).map(o=>M[o.id]);}
function pairSpecialClass(a,b){const counts=[M[a.id]?.elementCount||1,M[b.id]?.elementCount||1].sort((x,y)=>x-y);if(counts[0]===3&&counts[1]===3)return'legendary';if(counts[0]===3&&counts[1]===4)return'mythical';return'';}
function specialBreedMonster(isl,kind){return MONSTERS.find(m=>m.island===isl&&m.breedClass===kind)||null;}
function specialBreedOdds(isl=state.currentIsland){const t=torchLuck(isl);return {legendary:t.legendary,mythical:t.mythical};}
function renderBreed(){
  const root=$('#modalContent');if(ISLANDS[state.currentIsland].islet){root.innerHTML=`<div class="event-hero"><div><span class="special-ribbon">ISLET ATTUNEMENT</span><h2>No ordinary Breeding Structure here</h2><p>This destination uses attunement instead of breeding. Raise the listed source monsters to Level 15 on their home islands, then transform them through the Attunement Conduit.</p><button class="primary-btn" id="openIsletMarket">Open Attunement Conduit</button></div></div>`;$('#openIsletMarket').addEventListener('click',()=>openModal('market'));return;}
  const job=state.breedJobs[state.currentIsland],candidates=eligibleBreeders();if(job){root.innerHTML=renderBreedJob(job);bindBreedJobButtons(job);return;}
  const luck=state.mastery[state.currentIsland].luck||0,t=specialBreedOdds(),info=selectedBreedInfo(),kind=info.length===2?pairSpecialClass(state.owned.find(o=>o.uid===selectedBreed[0]),state.owned.find(o=>o.uid===selectedBreed[1])):'';
  const specialLine=kind==='mythical'?`Valid Mythical pairing - ${t.mythical.toFixed(1)}% chance`:kind==='legendary'?`Valid Legendary Breed pairing - ${t.legendary.toFixed(1)}% chance`:'Legendary Breed requires 3 + 3 elements. Mythical requires 4 + 3 elements.';
  root.innerHTML=`<p class="mini">Pick two Level 4+ regular monsters. Breeding timers use real timestamps, continue offline, and never exceed <b>60 minutes</b>. Breed-only Legendary and Mythical species cannot be used as parents.</p>
  <div class="breed-research-grid"><article><b>Legendary Breed</b><span>3-element + 3-element</span><strong>${t.legendary.toFixed(1)}%</strong><small>Base 2%. Ten lit Torches = 10%.</small></article><article><b>Mythical</b><span>4-element + 3-element</span><strong>${t.mythical.toFixed(1)}%</strong><small>Base 1%. Ten lit Torches = 10%.</small></article><article><b>Resonance Torches</b><span>${activeTorchCount(state.currentIsland)}/10 lit</span><strong>24h</strong><small>2 Gems per Torch. Manage them in the Market.</small></article></div>
  <div class="mastery-banner"><div><strong>Form Rarity Luck ${luck}/3</strong><p>Mastery affects Common/Rare/Epic/Legendary visual forms after the species result is chosen.</p></div><button class="secondary-btn" data-open="mastery">Upgrade</button></div><div class="rarity-odds">${rarityOdds(luck).map(([v,p])=>`<span>${v}<br>${p}%</span>`).join('')}</div>
  <div class="breed-status ${kind?'valid-special':''}">${specialLine}</div>
  <div class="select-row"><div class="select-box" id="breedSlotA">Choose monster 1</div><div class="select-plus">+</div><div class="select-box" id="breedSlotB">Choose monster 2</div></div><h3>Available parents</h3><div class="card-grid" id="breedChoices"></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="primary-btn" id="startBreedBtn">Start breeding</button></div>`;
  updateBreedSlots();const grid=$('#breedChoices');candidates.forEach(o=>{const m=M[o.id],c=document.createElement('article');c.className='monster-card';c.innerHTML=`<div class="card-art">${monsterSVG(m,o.variant)}</div><h3>${m.name}</h3><div class="card-meta"><span class="tag ${o.variant.toLowerCase()}">${o.variant}</span><span class="tag element-count-tag">${m.elementCount||1} elements</span><span class="tag">${(m.elements||[m.element]).join(' / ')}</span></div><button class="secondary-btn" style="width:100%">Select</button>`;c.querySelector('button').addEventListener('click',()=>{selectBreeder(o.uid);renderBreed();});grid.appendChild(c);});$('#startBreedBtn').addEventListener('click',startBreed);
}
function selectBreeder(id){if(selectedBreed.includes(id))selectedBreed=selectedBreed.filter(x=>x!==id);else if(selectedBreed.length<2)selectedBreed.push(id);else selectedBreed=[selectedBreed[1],id];updateBreedSlots();sfx('tap');}
function updateBreedSlots(){['A','B'].forEach((s,i)=>{const box=$('#breedSlot'+s);if(!box)return;const o=state.owned.find(x=>x.uid===selectedBreed[i]);if(!o){box.innerHTML=`<span>Choose monster ${i+1}</span>`;return;}const m=M[o.id];box.innerHTML=`<div style="width:96px">${monsterSVG(m,o.variant)}</div><b>${m.name}</b><span class="tag ${o.variant.toLowerCase()}">${o.variant}</span><span class="tag element-count-tag">${m.elementCount||1} elements</span>`;});}
function rarityOdds(luck=0){const mult=window.MelodicEvents?.eventBoost?.(state.currentIsland)?.rarity||1;const rare=(20+luck*2)*mult,epic=(8+luck*1.2)*mult,leg=(2+luck*.8)*mult,common=Math.max(0,100-rare-epic-leg);return [['Common',common.toFixed(1)],['Rare',rare.toFixed(1)],['Epic',epic.toFixed(1)],['Legendary',leg.toFixed(1)]];}
function rollVariant(titan=false,isl=state.currentIsland){const luck=state.mastery[isl]?.luck||0,boost=window.MelodicEvents?.eventBoost?.(isl)?.rarity||1;let leg=(.02+luck*.008)*boost,epic=(.08+luck*.012)*boost,rare=(.20+luck*.02)*boost;if(titan){leg+=.01;epic+=.03;rare+=.05;}const r=Math.random();if(r<leg)return'Legendary';if(r<leg+epic)return'Epic';if(r<leg+epic+rare)return'Rare';return'Common';}
function pickAvailableVariant(id,isl=state.currentIsland){const avail=availableVariants(id);if(!avail.length)return null;for(let i=0;i<8;i++){const v=rollVariant(false,isl);if(avail.includes(v))return v;}return avail[Math.floor(Math.random()*avail.length)];}
function chooseElementResult(a,b){
  const isl=state.currentIsland,ma=M[a.id],mb=M[b.id],union=new Set([...(ma.elements||[ma.element]),...(mb.elements||[mb.element])]);
  const pool=MONSTERS.filter(m=>m.island===isl&&!m.special&&!m.seasonal&&!m.attuneFrom&&!['mythical','legendary'].includes(m.breedClass)&&availableVariants(m.id).length&&((m.elements||[]).every(e=>union.has(e))));
  if(!pool.length){const parents=[ma,mb].filter(m=>availableVariants(m.id).length);return parents[Math.floor(Math.random()*parents.length)]||MONSTERS.find(m=>m.island===isl&&!m.special&&!m.seasonal&&!m.attuneFrom&&availableVariants(m.id).length);}
  const max=Math.max(...pool.map(m=>m.elementCount||1)),weighted=pool.filter(m=>(m.elementCount||1)>=Math.max(1,max-1));return weighted[Math.floor(Math.random()*weighted.length)];
}
function startBreed(){
  if(selectedBreed.length<2){toast('Choose two monsters first.');return;}const a=state.owned.find(o=>o.uid===selectedBreed[0]),b=state.owned.find(o=>o.uid===selectedBreed[1]);if(!a||!b)return;
  let result=null,kind=pairSpecialClass(a,b),specialHit=false;const isl=state.currentIsland,odds=specialBreedOdds(isl);
  const seasonalId=window.MelodicEvents?.seasonalForPair?.(isl,a.id,b.id);const eventLuck=window.MelodicEvents?.eventBoost?.(isl)?.rarity||1;
  if(seasonalId&&availableVariants(seasonalId).length&&Math.random()<Math.min(.65,.30*eventLuck)){result=M[seasonalId];state.discoveredSeasonals=[...new Set([...(state.discoveredSeasonals||[]),seasonalId])];}
  if(!result&&kind){const candidate=specialBreedMonster(isl,kind),chance=(kind==='mythical'?odds.mythical:odds.legendary)/100;if(candidate&&availableVariants(candidate.id).length&&Math.random()<chance){result=candidate;specialHit=true;}}
  if(!result)result=chooseElementResult(a,b);
  if(!result){toast('Every possible result from this pairing is already fully collected. Try different parents.');sfx('bad');return;}
  let variant=pickAvailableVariant(result.id,isl);if(!variant){toast(`All four forms of ${result.name} are already owned. Try a different pairing.`);sfx('bad');return;}
  const wait=Math.min(60,Math.max(5,Math.round((M[a.id].wait+M[b.id].wait+result.wait)/3)));state.breedJobs[isl]={startedAt:now(),endsAt:now()+wait*60000,monsterId:result.id,variant,seasonal:!!result.seasonal,specialBreed:kind&&specialHit?kind:''};selectedBreed=[];sfx('breed');toast(result.seasonal?`A limited Seasonal egg is forming. ${wait} minute timer.`:specialHit?`${kind==='mythical'?'Mythical':'Legendary Breed'} resonance detected. ${wait} minute timer.`:`Egg started. ${wait} minute timer.`);save();renderBreed();renderIsland();
}
function renderBreedJob(job){const m=M[job.monsterId],left=Math.max(0,job.endsAt-now()),total=Math.max(1,job.endsAt-job.startedAt),pct=clamp((1-left/total)*100,0,100),gemCost=Math.max(1,Math.ceil(left/600000)),duplicate=!canOwnVariant(job.monsterId,job.variant),classRibbon=m.breedClass==='mythical'?'<span class="special-ribbon mythical-ribbon">MYTHICAL</span>':m.breedClass==='legendary'?'<span class="special-ribbon legend-ribbon">LEGENDARY BREED</span>':m.seasonal?'<span class="special-ribbon">SEASONAL</span>':'';return `<div class="breed-card" style="text-align:center"><div style="width:180px;margin:auto">${monsterSVG(m,job.variant)}</div>${classRibbon}<span class="job-variant ${job.variant.toLowerCase()}">${job.variant}${job.variant==='Legendary'?' - Crowned':''}</span><h2>${left<=0?'Egg ready!':'Harmony forming…'}</h2><p>${duplicate?'That exact rarity form is already owned. Reroll the rarity before hatching.':left<=0?`${m.name} is ready to hatch.`:'Come back whenever you want - this keeps counting down while offline.'}</p><div class="progress-track" style="margin:16px 0"><div class="progress-fill" style="width:${pct}%"></div></div><b style="font-size:24px">${left<=0?'READY':formatTime(left)}</b><div class="breed-actions"><button class="primary-btn" id="claimBreedBtn" ${left>0||duplicate?'disabled':''}>Hatch monster</button>${left>0?`<button class="instant-btn primary-btn" id="instantBreedBtn">Finish now - ${gemCost} Gems</button>`:''}<button class="reroll-btn primary-btn" id="rerollBreedBtn" ${availableVariants(job.monsterId).length<=1?'disabled':''}>Reroll rarity - 4 Gems</button></div></div>`;}
function bindBreedJobButtons(job){$('#claimBreedBtn')?.addEventListener('click',claimBreed);$('#instantBreedBtn')?.addEventListener('click',()=>instantBreed(job));$('#rerollBreedBtn')?.addEventListener('click',rerollBreed);}
function instantBreed(job){const left=Math.max(0,job.endsAt-now()),cost=Math.max(1,Math.ceil(left/600000));if(state.gems<cost){toast(`You need ${cost} Gems.`);return;}state.gems-=cost;state.stats.gemsSpent+=cost;state.stats.instantBreeds++;job.endsAt=now();sfx('gem');toast(`Breeding finished instantly for ${cost} Gems!`);renderTop();renderBreed();renderIsland();save();}
function rerollBreed(){const job=state.breedJobs[state.currentIsland];if(!job)return;const avail=availableVariants(job.monsterId).filter(v=>v!==job.variant);if(!avail.length){toast('No other rarity form is available for this species.');return;}if(state.gems<4){toast('You need 4 Gems.');return;}state.gems-=4;state.stats.gemsSpent+=4;const old=job.variant;for(let i=0;i<8;i++){const v=rollVariant(false,state.currentIsland);if(avail.includes(v)){job.variant=v;break;}}if(job.variant===old||!avail.includes(job.variant))job.variant=avail[Math.floor(Math.random()*avail.length)];sfx('gem');toast(`Rarity rerolled: ${old} to ${job.variant}`);renderTop();renderBreed();save();}
function claimBreed(){const job=state.breedJobs[state.currentIsland];if(!job||job.endsAt>now())return;if(!canOwnVariant(job.monsterId,job.variant)){toast(`You already own ${job.variant} ${M[job.monsterId].name}. Reroll the rarity first.`);sfx('bad');return;}if(!hasBedSpace(state.currentIsland,1)){toast('The Castle is full. Upgrade it before hatching this egg.');sfx('bad');return;}const added=addOwned(job.monsterId,job.variant);if(!added)return;state.breedJobs[state.currentIsland]=null;state.stats.breedCount++;state.stats.hatched++;if(M[job.monsterId]?.seasonal)state.stats.seasonalsBred=(state.stats.seasonalsBred||0)+1;gainXP(M[job.monsterId]?.seasonal?120:M[job.monsterId]?.breedClass==='mythical'?180:M[job.monsterId]?.breedClass==='legendary'?150:60);sfx('hatch');toast(`${M[job.monsterId].name} hatched as ${job.variant}!`);awardCollectionMilestones();save();renderBreed();renderAll();}
function updateTimers(){const job=state.breedJobs[state.currentIsland],bar=$('#timerBanner');if(!job){bar.classList.add('hidden');return;}bar.classList.remove('hidden');const left=job.endsAt-now();bar.innerHTML=left<=0?`<b>${M[job.monsterId].name}</b> is ready! <button class="primary-btn" id="bannerClaim" style="margin-left:8px;padding:7px 11px;min-height:34px">Hatch</button>`:`Breeding: <b>${formatTime(left)}</b> remaining`;$('#bannerClaim')?.addEventListener('click',()=>openModal('breed'));if(!$('#modalLayer').classList.contains('hidden')&&$('#modalTitle').textContent==='Breeding')renderBreed();}
function checkFinishedJobs(notify){Object.values(state.breedJobs).filter(Boolean).forEach(j=>{if(j.endsAt<=now()&&notify)toast(`${M[j.monsterId].name}'s egg is ready!`);});}
function formatTime(ms){const s=Math.ceil(Math.max(0,ms)/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${h}h ${m}m ${sec}s`:`${m}m ${sec}s`;}

function collectionStats(){const species=new Set(state.owned.map(o=>o.id)).size;const slots=new Set(state.owned.map(o=>`${o.id}|${o.variant}`)).size;const c={species,slots};Object.keys(VARIANTS).forEach(v=>c[v.toLowerCase()]=state.owned.filter(o=>o.variant===v).length);c.titans=state.owned.filter(o=>M[o.id]?.special).length;return c;}
function awardCollectionMilestones(notify=true){const slots=collectionStats().slots,target=Math.floor(slots/10);while(state.collectionMilestones<target){state.collectionMilestones++;grantStars(1);if(notify)toast(`Collection milestone: ${state.collectionMilestones*10} rarity slots discovered. +1 Star`);}}
function renderCollection(){
  const root=$('#modalContent'),stats=collectionStats();root.innerHTML=`<div class="collection-top"><div><b>${stats.species} / ${MONSTERS.length} species - ${stats.slots} / ${MONSTERS.length*4} rarity slots</b><div class="mini">Every monster has Common, Rare, Epic and Legendary forms.</div></div><div class="collection-tabs">${['All','Common','Rare','Epic','Legendary'].map(v=>`<button data-v="${v}" class="${collectionVariant===v?'active':''}">${v}</button>`).join('')}</div></div><div class="card-grid" id="collectionGrid"></div>`;$$('.collection-tabs button',root).forEach(b=>b.addEventListener('click',()=>{collectionVariant=b.dataset.v;renderCollection();}));const grid=$('#collectionGrid');
  MONSTERS.forEach(m=>{const owned=state.owned.filter(o=>o.id===m.id),speciesOwned=owned.length>0;if(collectionVariant!=='All'&&!owned.some(o=>o.variant===collectionVariant))return;const display=collectionVariant!=='All'?collectionVariant:(owned.find(o=>o.variant==='Legendary')?.variant||owned[0]?.variant||'Common'),c=document.createElement('article');c.className=`monster-card collection-card${!speciesOwned?' locked':''}${m.special?' special-card':''}`;c.innerHTML=`<div class="card-art">${monsterSVG(m,display)}</div><div class="collection-island">${ISLANDS[m.island].mark} - ${ISLANDS[m.island].name}</div><h3>${speciesOwned?m.name:'???'}</h3>${m.special?'<span class="special-ribbon">ISLAND TITAN</span>':''}<p>${speciesOwned?m.desc:'Discover this monster to reveal its entry.'}</p><div class="variant-row">${Object.keys(VARIANTS).map(v=>`<span class="variant-chip ${owned.some(o=>o.variant===v)?'owned':''}">${v}</span>`).join('')}</div>`;grid.appendChild(c);});
}

function questProgress(q){const c=collectionStats(),s=state.stats;switch(q.kind){case'placed':return Math.max(...Object.values(state.placed).map(a=>a.length));case'owned':return state.owned.length;case'collectedCoins':return s.collectedCoins;case'breedCount':return s.breedCount;case'islands':return state.unlocked.filter(k=>!ISLANDS[k]?.islet).length;case'decorBought':return s.decorBought;case'songsPlayed':return s.songsPlayed;case'instantBreeds':return s.instantBreeds;case'rareOwned':return c.rare;case'epicOwned':return c.epic;case'legendaryOwned':return c.legendary;case'species':return c.species;case'variantSlots':return c.slots;case'frostPlaced':return state.placed.frost.length;case'emberPlaced':return state.placed.ember.length;case'moonUnlocked':return state.unlocked.includes('moon')?1:0;case'titanOwned':return c.titans;case'notesSpent':return s.notesSpent;case'masteryBought':return s.masteryBought;case'attuned':return s.attuned||0;case'prismPlaced':return state.placed.prism?.length||0;case'seasonalsBred':return s.seasonalsBred||0;case'resonatorPowered':return state.resonator?.powered?1:0;case'nullUnlocked':return state.unlocked.includes('nullcrown')?1:0;default:return 0;}}
function rotatingQuests(){const rid=state.rotationId,seed=(rid*9301+49297)%233280,level=state.level;return [
  {id:`r${rid}a`,icon:'Q3',name:'Four-Hour Coin Run',desc:`Collect ${fmt(1200+level*180)} coins during this rotation.`,target:1200+level*180,kind:'deltaCoins',reward:{notes:60+level*2,gems:2,xp:55}},
  {id:`r${rid}b`,icon:'Q7',name:'Four-Hour Encore',desc:'Play 2 complete island performances.',target:2,kind:'deltaSongs',reward:{stars:1,notes:80,xp:65}},
  {id:`r${rid}c`,icon:'Q4',name:seed%2?'Hatch Rush':'Breeding Session',desc:'Complete 1 breeding during this rotation.',target:1,kind:'deltaBreed',reward:{gems:4,coins:1600+level*120,xp:70}}
];}
function rotatingProgress(q){const b=state.rotationBaseline||state.stats;if(q.kind==='deltaCoins')return state.stats.collectedCoins-(b.collectedCoins||0);if(q.kind==='deltaSongs')return state.stats.songsPlayed-(b.songsPlayed||0);if(q.kind==='deltaBreed')return state.stats.breedCount-(b.breedCount||0);return 0;}
function rotationEndsIn(){return ((state.rotationId+1)*FOUR_HOURS)-Date.now();}
function renderQuests(){
  ensureRotationState();const root=$('#modalContent');root.innerHTML=`<div class="quest-section-title"><div><h3>Rotating Quests <span class="quest-badge">3 ACTIVE</span></h3><div class="mini">Refresh automatically every 4 hours, even while the game is closed.</div></div><span class="refresh-clock">${formatTime(rotationEndsIn())}</span></div><div id="rotatingList"></div><div class="quest-section-title"><h3>Main Questbook <span class="quest-badge">25 QUESTS</span></h3><button class="secondary-btn" id="dailyBtn">Daily gift</button></div><div id="questList"></div>`;
  $('#dailyBtn').addEventListener('click',grantDailyManual);const rr=$('#rotatingList');rotatingQuests().forEach(q=>{const p=rotatingProgress(q),done=p>=q.target,claimed=!!state.rotationClaimed[q.id];rr.appendChild(questCard(q,p,done,claimed,true,()=>claimRotating(q)));});const list=$('#questList');QUESTS.forEach(q=>{const p=questProgress(q),done=p>=q.target,claimed=!!state.questClaimed[q.id];list.appendChild(questCard(q,p,done,claimed,false,()=>claimQuest(q)));});
}
function questCard(q,p,done,claimed,rot,fn){const c=document.createElement('article');c.className=`quest-card${done?' done':''}${rot?' refresh':''}`;c.innerHTML=`<div class="quest-icon">${q.icon}</div><div class="quest-copy"><h3>${q.name}${rot?'<span class="quest-badge">4H</span>':''}</h3><p>${q.desc}</p><div class="progress-track" style="margin-top:8px"><div class="progress-fill" style="width:${clamp(p/q.target*100,0,100)}%"></div></div><div class="mini">${fmt(Math.min(p,q.target))} / ${fmt(q.target)}</div><div class="reward-line">${rewardText(q.reward)}</div></div><button class="primary-btn" ${!done||claimed?'disabled':''}>${claimed?'Claimed':'Claim'}</button>`;c.querySelector('button').addEventListener('click',fn);return c;}
function rewardText(r){return ['coins','gems','notes','stars','xp'].filter(k=>r[k]).map(k=>`${k==='coins'?'Q3':k==='gems'?'Q8':k==='notes'?'':k==='stars'?'Q19':'XP'} ${fmt(r[k])}`).join(' · ');}
function claimQuest(q){if(state.questClaimed[q.id]||questProgress(q)<q.target)return;state.questClaimed[q.id]=true;addReward(q.reward);sfx('quest');toast(`Quest complete! ${rewardText(q.reward)}`);renderTop();renderQuests();save();}
function claimRotating(q){if(state.rotationClaimed[q.id]||rotatingProgress(q)<q.target)return;state.rotationClaimed[q.id]=true;state.stats.claimedRotating=(state.stats.claimedRotating||0)+1;addReward(q.reward);sfx('quest');toast(`Rotating quest complete! ${rewardText(q.reward)}`);renderTop();renderQuests();save();}
function grantDaily(){if(demoMode||state.dailyStamp===dayStamp())return;state.dailyStamp=dayStamp();state.coins+=700+state.level*100;state.gems+=2;state.notes+=35;if(new Date().getUTCDay()===0)grantStars(1);save();setTimeout(()=>toast('Daily gift claimed.'),350);}
function grantDailyManual(){if(state.dailyStamp===dayStamp()){toast('Today’s daily gift is already claimed.');return;}grantDaily();renderTop();renderQuests();}

function renderMastery(){
  const isl=state.currentIsland,m=state.mastery[isl],root=$('#modalContent');const upgrades=[
    ['amp','Amplifier','+15% permanent monster income per level.',[3,5,8]],
    ['luck','Lucky Nest','Improves Rare, Epic and Legendary breeding odds.',[4,7,10]],
    ['stage','Grand Stage','Song performance rewards +25 Notes per level.',[4,6,9]]
  ];root.innerHTML=`<div class="mastery-banner"><div><strong>${ISLANDS[isl].mark} - ${ISLANDS[isl].name}</strong><p>Spend Stars for permanent island upgrades. Stars come from quests and collection milestones.</p></div><span class="stat-chip">${state.stars} Stars available</span></div><div class="card-grid" id="masteryGrid"></div>`;const grid=$('#masteryGrid');upgrades.forEach(([key,name,desc,costs])=>{const lv=m[key]||0,cost=costs[lv]||null,c=document.createElement('article');c.className='monster-card star-amp';c.innerHTML=`<h3>${name}</h3><p>${desc}</p><div class="mini">Level ${lv} / 3</div><div class="progress-track" style="margin:10px 0"><div class="progress-fill" style="width:${lv/3*100}%"></div></div><button class="primary-btn" ${lv>=3?'disabled':''}>${lv>=3?'MAXED':`Upgrade - ${cost} Stars`}</button>`;c.querySelector('button').addEventListener('click',()=>buyMastery(key,cost));grid.appendChild(c);});
}
function buyMastery(key,cost){if(!cost)return;if(state.stars<cost){toast(`You need ${cost} Stars.`);return;}state.stars-=cost;state.stats.starsSpent+=cost;state.stats.masteryBought++;state.mastery[state.currentIsland][key]++;sfx('quest');toast('Permanent island mastery upgraded!');renderTop();renderMastery();renderIsland();save();}


function renderEvents(){
  const root=$('#modalContent'),E=window.MelodicEvents,active=E?.activeEvents?.()||[];
  const seasonalCards=active.flatMap(e=>e.seasonals||[]).map(id=>M[id]).filter(Boolean);
  root.innerHTML=`<div class="event-hero"><div><span class="special-ribbon">LIVE WORLD CALENDAR</span><h2>${active.length?active.map(e=>e.name).join(' + '):'No limited event is active today'}</h2><p>${active.length?active.map(e=>`${e.name}: ${E.untilText(e)}`).join(' - '):'The annual calendar below shows the next seasonal windows.'}</p></div></div>
  <div class="event-grid">${active.map(e=>`<article class="event-card active-event"><span class="event-type">${e.kind}</span><h3>${e.name}</h3><p>${e.desc}</p><b>${E.untilText(e)}</b>${e.id==='resonance-week'?'<div class="event-bonus">Late-game rarity boost: 1.45x - Performance Note reward: 2x</div>':''}</article>`).join('')||'<article class="event-card"><h3>Between events</h3><p>Breed, level and prepare performers for the next limited window.</p></article>'}</div>
  ${seasonalCards.length?`<div class="quest-section-title"><h3>Available Seasonal Monsters</h3></div><div class="card-grid">${seasonalCards.map(m=>{const combo=E.COMBOS[m.id]||[],names=combo.map(x=>M[x]?.name||x).join(' + ');return `<article class="monster-card seasonal-card"><div class="card-art">${monsterSVG(m,'Common')}</div><span class="special-ribbon">SEASONAL</span><h3>${m.name}</h3><p>${m.desc}</p><div class="mini">Limited breeding combination</div><div class="seasonal-combo">${names}</div><div class="mini">Rare and Epic forms use the same event window but much lower odds.</div></article>`;}).join('')}</div>`:''}
  <div class="quest-section-title"><h3>Annual Seasonal Calendar</h3></div><div class="event-calendar">${(E?.EVENTS||[]).filter(e=>e.kind==='Seasonal Event').map(e=>`<article><b>${e.name}</b><span>${String(e.start[0]).padStart(2,'0')}/${String(e.start[1]).padStart(2,'0')} - ${String(e.end[0]).padStart(2,'0')}/${String(e.end[1]).padStart(2,'0')}</span><small>${e.desc}</small></article>`).join('')}</div>`;
}
function renderResonator(){
  const root=$('#modalContent'),r=state.resonator||{purchased:false,powered:false,boxed:[]},m=M.grandresonator;
  if(r.powered){root.innerHTML=`<div class="resonator-hero"><div class="resonator-art">${monsterSVG(m,'Legendary')}</div><div><span class="special-ribbon">POWERED</span><h2>Grand Resonator</h2><p>The construct is fully awake on Starfall Bastion. Powering it also unlocks the final requirement for Null Crown Islet.</p><button class="primary-btn" id="goBastion">Go to Starfall Bastion</button></div></div>`;$('#goBastion').addEventListener('click',()=>{switchIsland('bastion');closeModal();});return;}
  if(!r.purchased){root.innerHTML=`<div class="resonator-hero"><div class="resonator-art dormant">${monsterSVG(m,'Common')}</div><div><span class="special-ribbon">DORMANT WORLD CONSTRUCT</span><h2>Grand Resonator</h2><p>Purchase its dormant shell, then box one required performer from each of the eight main islands. Boxed monsters are consumed permanently. When all eight chambers are full, the construct wakes and joins Starfall Bastion.</p><div class="detail-stats"><span>Cost <b>250,000 Coins</b></span><span>Star requirement <b>25 Stars</b></span><span>Inventory <b>8 monsters</b></span></div><button class="primary-btn" id="buyResonator">Purchase dormant shell</button></div></div>`;$('#buyResonator').addEventListener('click',()=>{if(state.coins<250000||state.stars<25){toast('You need 250,000 Coins and 25 Stars.');return;}state.coins-=250000;state.stars-=25;state.stats.starsSpent+=25;state.resonator.purchased=true;sfx('unlock');save();renderTop();renderResonator();});return;}
  const boxed=new Set(r.boxed||[]),ready=RESONATOR_REQUIREMENTS.every(id=>boxed.has(id));
  root.innerHTML=`<div class="mastery-banner"><div><strong>Grand Resonator Inventory</strong><p>Box one required monster from every main island. Any rarity works. This is permanent.</p></div><span class="stat-chip">${boxed.size}/8 boxed</span></div><div class="card-grid resonator-grid">${RESONATOR_REQUIREMENTS.map(id=>{const req=M[id],done=boxed.has(id),owned=state.owned.find(o=>o.id===id);return `<article class="monster-card ${done?'boxed-card':''}"><div class="card-art">${monsterSVG(req,owned?.variant||'Common')}</div><h3>${req.name}</h3><div class="mini">${ISLANDS[req.island].name}</div><button class="${done?'secondary-btn':'primary-btn'}" data-box="${id}" ${done||!owned?'disabled':''}>${done?'BOXED':owned?'Box monster':'Not owned'}</button></article>`;}).join('')}</div><div class="resonator-power"><button class="primary-btn" id="powerResonator" ${ready?'':'disabled'}>${ready?'POWER GRAND RESONATOR':'Fill all 8 chambers'}</button></div>`;
  $$('[data-box]',root).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.box,o=state.owned.find(x=>x.id===id);if(!o)return;if(!confirm(`Box ${M[id].name}? This removes that monster permanently.`))return;removeOwned(o.uid);state.resonator.boxed=[...new Set([...(state.resonator.boxed||[]),id])];state.stats.resonatorBoxed=(state.stats.resonatorBoxed||0)+1;sfx('breed');save();renderResonator();renderIsland();}));
  $('#powerResonator')?.addEventListener('click',()=>{if(!ready)return;if(!hasBedSpace('bastion',4)){toast('Starfall Bastion needs 4 free Castle beds first.');return;}state.resonator.powered=true;addOwned('grandresonator','Legendary');gainXP(600);sfx('titan');toast('Grand Resonator powered. Null Crown can now be unlocked.');save();renderTop();renderResonator();});
}

function renderSettings(){
  const root=$('#modalContent'),encoded=encodeSave(state);root.innerHTML=`<div class="settings-grid">
  <article class="setting-card"><h3>Audio</h3><p>Original procedural monster parts are mixed live. Volumes can be boosted up to 2000% for testing.</p>
    <label class="toggle-line">Music enabled <input id="musicToggle" type="checkbox" ${state.settings.music?'checked':''}></label>
    <label class="range-line">Music volume <b id="musicVolLabel">${state.settings.musicVolume||100}%</b><input id="musicVolume" type="range" min="0" max="2000" step="10" value="${state.settings.musicVolume||100}"></label>
    <label class="toggle-line">Sound effects enabled <input id="sfxToggle" type="checkbox" ${state.settings.sfx?'checked':''}></label>
    <label class="range-line">SFX volume <b id="sfxVolLabel">${state.settings.sfxVolume||100}%</b><input id="sfxVolume" type="range" min="0" max="2000" step="10" value="${state.settings.sfxVolume||100}"></label>
  </article>
  <article class="setting-card"><h3>Effects</h3><p>Reduce particles and floating notes if a phone or tablet needs lighter visuals.</p><label class="toggle-line">Reduce effects <input id="effectsToggle" type="checkbox" ${state.settings.reduceEffects?'checked':''}></label></article>
  <article class="setting-card dev-grant-card"><h3>Developer Grant Panel</h3><p>Enter the exact amount you want to add. Every game currency and player XP can be granted separately. Cooldown: 0.1 seconds per button.</p><div class="dev-grant-grid"><label>Coins <input id="grantCoins" type="number" min="1" step="1" value="10000"><button class="secondary-btn" data-grant="coins">Add Coins</button></label><label>Gems <input id="grantGems" type="number" min="1" step="1" value="100"><button class="secondary-btn" data-grant="gems">Add Gems</button></label><label>Music Notes <input id="grantNotes" type="number" min="1" step="1" value="1000"><button class="secondary-btn" data-grant="notes">Add Notes</button></label><label>Stars <input id="grantStars" type="number" min="1" step="1" value="10"><button class="secondary-btn" data-grant="stars">Add Stars</button></label><label>XP <input id="grantXp" type="number" min="1" step="1" value="500"><button class="primary-btn" data-grant="xp">Add XP</button></label></div></article>
  <article class="setting-card compat"><h3>Export Save</h3><p>Copy this save code before replacing a build.</p><textarea class="save-code" id="exportCode" readonly>${encoded}</textarea><button class="secondary-btn" id="selectSaveBtn">Select code</button></article>
  <article class="setting-card compat"><h3>Import Save</h3><p>Paste a Melodic Isles save code.</p><textarea class="save-code" id="importCode" placeholder="Paste save code here"></textarea><button class="primary-btn" id="importBtn">Import</button></article>
  <article class="setting-card"><h3>World</h3><p>View all eight main islands, two Islets, and unlock requirements.</p><button class="secondary-btn" id="mapBtn">Open Island Map</button></article>
  <article class="setting-card"><h3>Reset</h3><p>Deletes this browser's local save and starts over.</p><button class="danger-btn" id="resetBtn">Reset save</button></article></div>`;
  $('#musicToggle').addEventListener('change',e=>{state.settings.music=e.target.checked;if(!e.target.checked)stopSong();applyVolumes();save();});
  $('#sfxToggle').addEventListener('change',e=>{state.settings.sfx=e.target.checked;applyVolumes();save();});
  $('#musicVolume').addEventListener('input',e=>{state.settings.musicVolume=Number(e.target.value);$('#musicVolLabel').textContent=e.target.value+'%';applyVolumes();save();});
  $('#sfxVolume').addEventListener('input',e=>{state.settings.sfxVolume=Number(e.target.value);$('#sfxVolLabel').textContent=e.target.value+'%';applyVolumes();save();});
  $('#effectsToggle').addEventListener('change',e=>{state.settings.reduceEffects=e.target.checked;$('#skyParticles').classList.toggle('hidden',e.target.checked);save();});
  $('#selectSaveBtn').addEventListener('click',()=>$('#exportCode').select());$('#mapBtn').addEventListener('click',()=>openModal('map'));$('#importBtn').addEventListener('click',importSave);
  let qaReady=true;$$('[data-grant]',root).forEach(btn=>btn.addEventListener('click',()=>{if(!qaReady)return;const kind=btn.dataset.grant,id={coins:'grantCoins',gems:'grantGems',notes:'grantNotes',stars:'grantStars',xp:'grantXp'}[kind],amount=Math.max(1,Math.floor(Number($('#'+id)?.value||0)));if(!Number.isFinite(amount))return;qaReady=false;if(kind==='coins')state.coins+=amount;if(kind==='gems')state.gems+=amount;if(kind==='notes')state.notes+=amount;if(kind==='stars')grantStars(amount);if(kind==='xp')gainXP(amount);sfx(kind==='gems'?'gem':'quest');toast(`Developer grant: +${fmt(amount)} ${kind==='xp'?'XP':kind}.`);renderTop();save();setTimeout(()=>qaReady=true,100);}));
  $('#resetBtn').addEventListener('click',()=>{if(confirm('Really reset all Melodic Isles progress on this browser?')){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(OLD_SAVE_KEY);localStorage.removeItem(LEGACY_SAVE_KEY);location.reload();}});
}
const {encodeSave,decodeSave}=window.MelodicSaveTools;
function importSave(){try{const raw=decodeSave($('#importCode').value);state=migrate(raw);save();toast(raw.version===1?'Old v1 save upgraded to Resonance.':'Save imported.');closeModal();renderAll();}catch(e){toast('That save code could not be read.');sfx('bad');}}
function renderMap(){const root=$('#modalContent');root.innerHTML=`<div class="island-map">${Object.entries(ISLANDS).map(([k,is])=>{const u=state.unlocked.includes(k),extra=is.hardest?' + powered Grand Resonator':'';return `<button data-island="${k}" class="${u?'':'locked'} ${is.islet?'islet-map':''}"><div class="map-mark">${is.mark}</div><div class="map-world-preview">${window.MelodicWorldArt?.worldSVG(is.theme)||''}</div><div class="map-card-copy"><h3>${is.name}</h3><p>${u?`Unlocked - ${MONSTERS.filter(m=>m.island===k).length}/${is.rosterTarget} species roster`:`Requires Lv ${is.unlockLevel}${is.lifeStars?` + ${is.lifeStars} lifetime Stars`:''} + ${fmt(is.unlockCost)} Coins${extra}`}</p></div></button>`;}).join('')}</div>`;$$('[data-island]',root).forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.island;if(state.unlocked.includes(k)){switchIsland(k);closeModal();}else unlockPrompt(k);}));}

function ensureAudio(){
  if(audio)return audio;const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;audio=new A();
  masterGain=audio.createGain();compressor=audio.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=20;compressor.ratio.value=8;compressor.attack.value=.004;compressor.release.value=.22;masterGain.connect(compressor);compressor.connect(audio.destination);
  musicBus=audio.createGain();sfxBus=audio.createGain();musicBus.connect(masterGain);sfxBus.connect(masterGain);
  reverbNode=audio.createConvolver();const len=Math.floor(audio.sampleRate*1.7),ir=audio.createBuffer(2,len,audio.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.7);}reverbNode.buffer=ir;reverbGain=audio.createGain();reverbGain.gain.value=.18;musicBus.connect(reverbNode);reverbNode.connect(reverbGain);reverbGain.connect(masterGain);applyVolumes();return audio;
}
function applyVolumes(){if(!musicBus||!sfxBus||!masterGain)return;const mv=clamp(Number(state.settings.musicVolume??100),0,2000)/100,sv=clamp(Number(state.settings.sfxVolume??100),0,2000)/100;masterGain.gain.value=.55;musicBus.gain.value=state.settings.music?.48*mv:0;sfxBus.gain.value=state.settings.sfx?.68*sv:0;if(reverbGain)reverbGain.gain.value=.14*Math.min(2.3,Math.sqrt(Math.max(.1,mv)));}
function tone(freq,dur=.15,type='sine',gain=.03,delay=0,bus='music',detune=0){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),out=bus==='sfx'?sfxBus:musicBus;o.type=type;o.frequency.value=Math.max(20,freq);o.detune.value=detune;const t=a.currentTime+delay;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05);}
function noise(dur=.05,gain=.02,delay=0,cut=5200){const a=ensureAudio();if(!a)return;const len=Math.max(64,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=buf;f.type='lowpass';f.frequency.value=cut;g.gain.value=gain;src.connect(f);f.connect(g);g.connect(musicBus);src.start(a.currentTime+delay);}
function kickTone(freq=76,gain=.07,delay=0){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;o.type='sine';o.frequency.setValueAtTime(freq*2.5,t);o.frequency.exponentialRampToValueAtTime(freq,t+.11);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+.24);o.connect(g);g.connect(musicBus);o.start(t);o.stop(t+.26);}
function bellTone(freq,dur=.55,gain=.022,delay=0){[1,2.01,3.92].forEach((r,j)=>tone(freq*r,dur*(1-j*.12),'sine',gain/(1+j*.9),delay+j*.008,'music',j*3));}
function pluckTone(freq,dur=.22,gain=.025,delay=0){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+delay;o.type='triangle';o.frequency.value=freq;f.type='lowpass';f.frequency.setValueAtTime(Math.min(9000,freq*8),t);f.frequency.exponentialRampToValueAtTime(Math.max(420,freq*1.5),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(f);f.connect(g);g.connect(musicBus);o.start(t);o.stop(t+dur+.04);}
function brassTone(freq,dur=.42,gain=.022,delay=0){const a=ensureAudio();if(!a)return;const t=a.currentTime+delay;[0,-9,7].forEach((det,j)=>{const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type=j===1?'square':'sawtooth';o.frequency.value=freq;o.detune.value=det;f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(500,t);f.frequency.exponentialRampToValueAtTime(Math.min(4800,freq*7),t+.09);f.frequency.exponentialRampToValueAtTime(850,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain/(j+1.4),t+.035);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(f);f.connect(g);g.connect(musicBus);o.start(t);o.stop(t+dur+.05);});}
function organTone(freq,dur=.75,gain=.018,delay=0,dark=false){const ratios=dark?[.5,1,1.5,2,3]:[1,2,3,4];ratios.forEach((r,j)=>tone(freq*r,dur,j%2?'square':'sine',gain/(1+j*.65),delay+j*.004,'music',dark&&j===0?-6:0));}
function voiceTone(freq,dur=.62,gain=.018,delay=0,vowel='ah'){const a=ensureAudio();if(!a)return;const t=a.currentTime+delay,forms=vowel==='oo'?[340,900,2200]:vowel==='ee'?[500,1800,2600]:[700,1150,2450];const o=a.createOscillator(),srcGain=a.createGain();o.type='sawtooth';o.frequency.value=freq;srcGain.gain.setValueAtTime(.0001,t);srcGain.gain.linearRampToValueAtTime(gain,t+.05);srcGain.gain.setValueAtTime(gain,t+Math.max(.06,dur-.11));srcGain.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(srcGain);forms.forEach((hz,j)=>{const f=a.createBiquadFilter(),g=a.createGain();f.type='bandpass';f.frequency.value=hz;f.Q.value=7-j;g.gain.value=1/(1+j*.55);srcGain.connect(f);f.connect(g);g.connect(musicBus);});o.start(t);o.stop(t+dur+.04);}
function distortedTone(freq,dur=.28,gain=.018,delay=0){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),sh=a.createWaveShaper(),g=a.createGain(),t=a.currentTime+delay,N=256,curve=new Float32Array(N);for(let i=0;i<N;i++){const x=i*2/N-1;curve[i]=Math.tanh(x*4);}sh.curve=curve;sh.oversample='2x';o.type='sawtooth';o.frequency.value=freq;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(sh);sh.connect(g);g.connect(musicBus);o.start(t);o.stop(t+dur+.04);}
function sfx(k){if(!state.settings.sfx)return;const sampleVol=Math.min(1,(state.settings.sfxVolume||100)/220);window.MelodicSamples?.play(k,sampleVol);ensureAudio()?.resume?.();const map={tap:[380,.05,'sine'],coin:[860,.08,'triangle'],buy:[520,.12,'triangle'],breed:[330,.2,'sine'],hatch:[660,.3,'triangle'],quest:[900,.25,'sine'],level:[980,.3,'sine'],unlock:[740,.3,'triangle'],bad:[150,.14,'square'],gem:[1180,.18,'sine'],titan:[392,.65,'sine']};const v=map[k]||map.tap;tone(v[0],v[1],v[2],.055,0,'sfx');if(['hatch','quest','level','unlock','titan'].includes(k))tone(v[0]*1.5,v[1]*1.3,'sine',.032,.08,'sfx');if(k==='titan')tone(v[0]*2,.9,'sine',.025,.14,'sfx');}
function actionForInstrument(inst){if(['kick','snare','timpani','tom','taiko'].includes(inst))return'drum';if(['clack','claves','teeth','jawbass'].includes(inst))return'jaw';if(['horn','trumpet','tuba','brass','grandbrass'].includes(inst))return'horn';if(['choir','choirlead','vox','chant'].includes(inst))return'mouth';if(['harp','pluck','kalimba','marimba','strings','cello'].includes(inst))return'pluck';if(['bell','chime','celesta','glass','glassarp','bellstorm'].includes(inst))return'orbit';if(['organ','darkorgan','bossorgan'].includes(inst))return'bellows';if(['bassdrop'].includes(inst))return'stomp';if(['distortedlead','synthlead','zap'].includes(inst))return'jaw';return'body';}
function triggerMonsterAnimation(o,action){const el=document.querySelector(`.monster-avatar[data-uid="${o.uid}"]`);if(!el)return;el.classList.remove('performing');void el.offsetWidth;el.classList.add('performing',`pulse-${action||'body'}`);clearTimeout(el._performTimer);el._performTimer=setTimeout(()=>el.classList.remove('performing',`pulse-${action||'body'}`),230);}
function toggleSong(){songTimer?stopSong():startSong();}
function startSong(){
  if(!state.settings.music){toast('Music is turned off in Settings.');return;}const isl=state.currentIsland,is=ISLANDS[isl],played=state.placed[isl].map(id=>state.owned.find(o=>o.uid===id)).filter(Boolean);if(!played.length){toast('Place a monster first.');return;}ensureAudio()?.resume?.();$('#performanceBtn').textContent='Stop song';songStep=0;state.stats.songsPlayed++;
  const stageBonus=state.mastery[isl].stage||0,eventNotes=window.MelodicEvents?.eventBoost?.(isl)?.notes||1,award=25*stageBonus*eventNotes;if(award)state.notes+=award;renderTop();save();
  const tick=()=>{const step=songStep%16,phrase=Math.floor(songStep/16)%8;playIslandCore(isl,step,phrase);played.forEach((o,i)=>playMonster(o,step,i,phrase));if(!state.settings.reduceEffects&&step%2===0)spawnSongNote();songStep=(songStep+1)%128;};tick();const stepMs=Math.max(145,Math.round(60000/(is.bpm||112)/2));songTimer=setInterval(tick,stepMs);toast(award?`Performance started. Grand Stage earned ${award} Notes.`:'Performance started.');
}
function stopSong(){if(songTimer){clearInterval(songTimer);songTimer=null;}$('#performanceBtn').textContent='Play song';$$('.monster-avatar').forEach(a=>a.classList.remove('performing','pulse-jaw','pulse-mouth','pulse-drum','pulse-horn','pulse-pluck','pulse-orbit','pulse-bellows','pulse-stomp','pulse-wing','pulse-body'));}
function phraseSeed(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function phraseMappedStep(step,phrase,seed){const shift=seed%4;switch(phrase){case 0:return step;case 1:return(step+2+shift)%16;case 2:return(step*2+shift)%16;case 3:return(15-step+shift)%16;case 4:return(step*3+shift)%16;case 5:return(step+(step%4===1?2:0)+shift)%16;case 6:return(15-((step*3+shift)%16)+16)%16;default:return(step*5+shift)%16;}}
function phraseIsRest(step,phrase,seed){const r=(step+seed)%16;if(phrase===0)return false;if(phrase===1)return r===7||r===15;if(phrase===2)return step%2===1;if(phrase===3)return step<3;if(phrase===4)return step>=13;if(phrase===5)return [2,7,10,15].includes(r);if(phrase===6)return step%4===3;return step===4||step===12;}
function scaleForIsland(isl){const mode=ISLANDS[isl].mode||'major',semi={major:[0,2,4,7,9,12],majorPent:[0,2,4,7,9,12],minor:[0,2,3,5,7,10,12],dorian:[0,2,3,5,7,9,12],lydian:[0,2,4,6,7,9,12],harmonicMinor:[0,2,3,5,7,8,11,12],phrygian:[0,1,3,5,7,8,10,12]}[mode]||[0,2,4,7,9,12];return semi.map(n=>Math.pow(2,n/12));}
function playSeq(seq,pitch=1,intensity=1){if(!seq)return;const f=(seq.f||220)*pitch,g=(seq.g||.02)*intensity,d=seq.d||.2,delay=seq.delay||0;switch(seq.kind){case'kick':kickTone(f,g,delay);break;case'noise':noise(d,g,delay,seq.cut||5200);break;case'bell':bellTone(f,d,g,delay);break;case'pluck':pluckTone(f,d,g,delay);break;case'brass':brassTone(f,d,g,delay);break;case'organ':organTone(f,d,g,delay,!!seq.dark);break;case'voice':voiceTone(f,d,g,delay,seq.vowel||'ah');break;case'dist':distortedTone(f,d,g,delay);break;case'chord':playChord(f,d,g,seq.phrase||0,seq.dark);break;default:tone(f,d,seq.t||'sine',g,delay,'music',seq.detune||0);}}
function playMonster(o,step,i,phrase=0){const m=M[o.id],seed=phraseSeed(m.id);if(!m||phraseIsRest(step,phrase,seed))return;const mapped=phraseMappedStep(step,phrase,seed),seq=instrumentSequence(m.instrument,mapped,i+(seed%5),m.island,phrase);if(!seq)return;const semis=[0,2,-3,5,-5,7,-2,12][phrase]+((seed%3)-1),pitch=Math.pow(2,semis/12),intensity=[.92,.82,.78,1.06,.7,1.14,.94,1.2][phrase]*(m.island==='nullcrown'?1.12:1);triggerMonsterAnimation(o,m.action||seq.action||actionForInstrument(m.instrument));seq.phrase=phrase;playSeq(seq,pitch,intensity);const base=(seq.f||ISLANDS[m.island].root)*pitch;variantAudioFX(o.variant,base,step,i);if(m.breedClass==='mythical'&&step%4===0){bellTone(base*2,.38,.006,.06);voiceTone(base,.46,.006,.02,(seed+phrase)%2?'oo':'ah');}if(m.breedClass==='legendary'&&step%4===0){brassTone(base*.5,.36,.006,.03);kickTone(Math.max(45,base*.22),.014,.01);}}
function playChord(base,dur,gain,phrase,dark=false){const spreads=dark?[1,1.1892,1.4983,2]:[[1,1.25,1.5,2],[1,1.2,1.5,1.8],[1,1.333,1.667,2],[1,1.125,1.5,2.25],[1,1.25,1.75,2],[1,1.2,1.6,2.4],[1,1.333,1.5,2.667],[1,1.25,1.875,2.5]][phrase];spreads.forEach((r,j)=>tone(base*r,dur*(1+j*.07),j%2?'triangle':'sine',gain*(1-j*.17),j*.025,'music'));}
function variantAudioFX(v,base,step,i){if(v==='Common'||!Number.isFinite(base))return;if(v==='Rare'&&step%4===0)bellTone(base*2,.16,.006,.05);if(v==='Epic'&&step%4===0){bellTone(base*1.5,.24,.007,.04);tone(base*2,.18,'sine',.006,.09,'music');}if(v==='Legendary'&&step%2===0){tone(base*2,.09,'sine',.007,.02,'music');tone(base*2.5,.1,'sine',.005,.08,'music');}}
function instrumentSequence(inst,s,i,isl,phrase=0){const root=ISLANDS[isl].root,sc=scaleForIsland(isl),note=n=>root*sc[(n%sc.length+sc.length)%sc.length];
  if(inst==='kick'&&s%4===0)return{kind:'kick',f:72,d:.2,g:.065,action:'drum'};if(inst==='snare'&&s%4===2)return{kind:'noise',d:.09,g:.024,cut:3600,action:'drum'};if(inst==='hihat'&&s%2===1)return{kind:'noise',d:.035,g:.011,cut:9000,action:'drum'};if(inst==='tick'&&s%2===1)return{kind:'bell',f:1100,d:.08,g:.009,action:'tap'};
  if(inst==='bass'&&s%4===0)return{kind:'pluck',f:note((s/4+i)|0)/2,d:.32,g:.028,action:'mouth'};if(inst==='jawbass'&&s%4===0)return{kind:'dist',f:note((s/4+i)|0)/2,d:.22,g:.022,action:'jaw'};if(inst==='bassdrop'&&s%8===0)return{kind:'kick',f:root/3,d:.36,g:.09,action:'stomp'};
  if(inst==='zap'&&s%4===1)return{kind:'dist',f:note(i+s)*2,d:.08,g:.014,action:'jaw'};if(['chime','bell','glass','celesta','bellstorm'].includes(inst)&&s%4===0)return{kind:'bell',f:note((s/4+i)|0)*(inst==='bellstorm'?2.3:inst==='celesta'?2:1.5),d:inst==='bellstorm'?.72:.48,g:.019,action:'orbit'};if(inst==='glassarp'&&s%2===0)return{kind:'bell',f:note((s/2+i)|0)*2,d:.3,g:.015,action:'fingers'};
  if(['horn','trumpet','tuba','brass','grandbrass'].includes(inst)&&s%4===0)return{kind:'brass',f:note((s/4+i)|0)*(inst==='tuba'?.5:inst==='trumpet'?1.5:1),d:inst==='grandbrass'?.7:.42,g:inst==='grandbrass'?.03:.019,action:'horn'};
  if(['choir','choirlead','vox','chant'].includes(inst)&&s%4===0)return{kind:'voice',f:note((s/4+i+phrase)|0)*(inst==='choirlead'?1.5:1),d:inst==='chant'?.72:.58,g:inst==='choirlead'?.022:.017,vowel:(i+phrase)%3===0?'oo':(i+phrase)%3===1?'ah':'ee',action:'mouth'};
  if(inst==='pad'&&s%8===0)return{kind:'chord',f:note(i+phrase)/2,d:1.15,g:.014,action:'body'};
  if(['pluck','kalimba','marimba','harp'].includes(inst)&&s%2===0)return{kind:'pluck',f:note((s/2+i)|0)*(inst==='harp'?1.35:1),d:inst==='harp'?.3:.16,g:.019,action:'pluck'};
  if(inst==='chirp'&&s%4===3)return{kind:'voice',f:note(s+i)*2,d:.11,g:.012,vowel:'ee',action:'mouth'};if(inst==='mallet'&&s%4===0)return{kind:'pluck',f:note((s/4+i)|0)*1.4,d:.18,g:.022,action:'tap'};
  if(['clack','claves','teeth'].includes(inst)&&s%4===2)return{kind:'noise',d:.045,g:inst==='teeth'?.023:.017,cut:inst==='teeth'?5200:2600,action:'jaw'};
  if(['cello','strings'].includes(inst)&&s%4===0)return{kind:'tone',f:note((s/4+i)|0)*(inst==='cello'?.5:1),d:inst==='cello'?.85:.55,g:.015,t:'sawtooth',action:'pluck'};
  if(inst==='flute'&&s%4===1)return{kind:'tone',f:note(s+i)*2,d:.34,g:.014,t:'sine',action:'bellows'};if(inst==='arp'&&s%2===0)return{kind:'pluck',f:note((s/2+i)|0)*1.5,d:.14,g:.016,action:'pluck'};
  if(['timpani','tom','taiko'].includes(inst)&&s%4===0)return{kind:'kick',f:(inst==='taiko'?root*.42:root*.5)*(s%8===0?1:.83),d:.3,g:inst==='taiko'?.075:.052,action:'drum'};
  if(inst==='synthlead'&&s%2===0)return{kind:'dist',f:note((s/2+i)|0),d:.17,g:.013,action:'jaw'};if(inst==='distortedlead'&&s%2===0)return{kind:'dist',f:note((s/2+i+phrase)|0)*1.35,d:.22,g:.018,action:'jaw'};
  if(['organ','darkorgan','bossorgan'].includes(inst)&&s%8===0)return{kind:'organ',f:note(i+phrase)*(inst==='bossorgan'?.75:1),d:inst==='bossorgan'?1.05:.78,g:inst==='bossorgan'?.025:.017,dark:inst!=='organ',action:'bellows'};
  if(inst==='gong'&&s%8===4)return{kind:'bell',f:root*.75,d:1.15,g:.027,action:'tail'};if(inst==='pulse'&&s%2===0)return{kind:'tone',f:note((s/2+i)|0),d:.15,g:.013,t:'square',action:'wing'};
  if(inst==='cinematic'&&s%4===0)return{kind:s%8===0?'brass':'organ',f:note((s/4+i+phrase)|0)*(s%8===0?.75:1),d:.65,g:.025,dark:true,action:s%8===0?'horn':'roar'};
  if(inst==='boss'&&s%2===0)return{kind:s%8===0?'chord':'dist',f:note((s/2+i+phrase)|0)*(s%8===0?.6:1.2),d:s%8===0?1.0:.2,g:s%8===0?.028:.018,dark:true,action:s%8===0?'titan':'jaw'};
  if(inst==='titan'&&s%4===0)return{kind:'brass',f:note((s/4)|0)/2,d:.75,g:.024,action:'titan'};if(inst==='heaven'&&s%8===0)return{kind:'chord',f:note(i+phrase),d:.9,g:.019,action:'titan'};
  return null;
}
function playIslandCore(isl,step,phrase){const is=ISLANDS[isl],root=is.root;if(step===0)pluckTone(root/4,.32,.006);if(is.theme==='gloam'&&step%8===4)organTone(root/2,.75,.005,0,true);if(is.theme==='bastion'&&step%8===0)brassTone(root*.75,.38,.006);if(is.theme==='prism'&&step%4===2)bellTone(root*2,.25,.004);if(is.theme==='nullcrown'){if(step%4===0)kickTone(root*.32,.032);if(step%4===2)noise(.07,.009,0,3200);if(phrase>=4&&step%8===0)organTone(root*.5,.9,.008,0,true);if(phrase===7&&step%4===0)brassTone(root*Math.pow(2,[0,3,1,5][step/4]/12),.42,.009);}}
function spawnSongNote(){const el=document.createElement('span');el.className='song-note';el.textContent=['la','do','mm','ah'][Math.floor(Math.random()*4)];el.style.left=`${20+Math.random()*60}%`;el.style.top=`${40+Math.random()*35}%`;el.style.setProperty('--note-x',`${-30+Math.random()*60}px`);$('#stage').appendChild(el);setTimeout(()=>el.remove(),1000);}

function buildParticles(){const root=$('#skyParticles');root.innerHTML='';for(let i=0;i<34;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*70+'%';s.style.animationDelay=Math.random()*5+'s';root.appendChild(s);}root.classList.toggle('hidden',state.settings.reduceEffects);}
function spark(x,y){if(state.settings.reduceEffects)return;for(let i=0;i<5;i++){const s=document.createElement('span');s.className='spark';s.textContent='+';s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--dx',`${-45+Math.random()*90}px`);s.style.setProperty('--dy',`${-35-Math.random()*70}px`);document.body.appendChild(s);setTimeout(()=>s.remove(),800);}}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('#toastStack').appendChild(d);setTimeout(()=>d.remove(),3500);}

const {monsterSVG,tint}=window.MelodicArt;

init();
})();
