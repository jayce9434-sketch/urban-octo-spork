'use strict';
(()=>{
  const EVENTS=[
    {id:'nightfall',name:'Nightfall Masquerade',kind:'Seasonal Event',start:[10,1],end:[11,3],islands:['groove','gloam'],seasonals:['gourdhowl','candlejaw'],desc:'Lanterns, masks and harvest-night decorations arrive across Verdant Groove and Gloamforge Hollow.'},
    {id:'resonance-week',name:'Resonance Week',kind:'Limited Event',start:[10,8],end:[10,18],islands:['bastion','prism','nullcrown'],seasonals:[],desc:'Late-game breeding luck is boosted and endgame performances pay double Music Notes.'},
    {id:'frosttide',name:'Frosttide',kind:'Seasonal Event',start:[12,5],end:[1,7],islands:['frost','bastion'],seasonals:['festibot'],desc:'Cold lights, mechanical bells and winter performers take over the northern islands.'},
    {id:'heartwake',name:'Heartwake',kind:'Seasonal Event',start:[2,5],end:[2,20],islands:['moon'],seasonals:['heartchirp'],desc:'A short duet-focused celebration on Moonlit Reverie.'},
    {id:'bloomrise',name:'Bloomrise',kind:'Seasonal Event',start:[4,5],end:[4,28],islands:['groove','bramble'],seasonals:['bloomwhistle'],desc:'New growth turns the garden and brassworks into a spring concert.'},
    {id:'sunflare',name:'Sunflare',kind:'Seasonal Event',start:[7,1],end:[7,25],islands:['ember'],seasonals:['sunforge'],desc:'A bright midsummer brass-and-fire celebration on Ember Circuit.'}
  ];
  const COMBOS={
    gourdhowl:['spriggle','mossmara'],
    candlejaw:['lanternmaw','chattercrypt'],
    festibot:['banneret','meteora'],
    heartchirp:['lumibun','dreamhorn'],
    bloomwhistle:['bellowsprout','trumpettle'],
    sunforge:['sparko','magmarimba']
  };
  function md(d){return [d.getMonth()+1,d.getDate()];}
  function dayOfYear(m,d){return Math.floor((Date.UTC(2024,m-1,d)-Date.UTC(2024,0,1))/86400000)+1;}
  function isActive(e,date=new Date()){
    const [m,d]=md(date),cur=dayOfYear(m,d),s=dayOfYear(...e.start),en=dayOfYear(...e.end);
    return s<=en ? cur>=s&&cur<=en : cur>=s||cur<=en;
  }
  function activeEvents(date=new Date()){return EVENTS.filter(e=>isActive(e,date));}
  function isSeasonActive(season,date=new Date()){return EVENTS.some(e=>e.id===season&&isActive(e,date));}
  function seasonalForPair(island,a,b,date=new Date()){
    const set=new Set([a,b]);
    for(const [id,combo] of Object.entries(COMBOS)){
      const monster=window.MelodicCatalog?.MONSTERS?.find(m=>m.id===id);
      if(!monster||monster.island!==island||!isSeasonActive(monster.season,date))continue;
      if(combo.every(x=>set.has(x)))return id;
    }
    return null;
  }
  function eventBoost(island,date=new Date()){
    const active=activeEvents(date);
    return {
      rarity:active.some(e=>e.id==='resonance-week'&&e.islands.includes(island))?1.45:1,
      notes:active.some(e=>e.id==='resonance-week'&&e.islands.includes(island))?2:1
    };
  }
  function untilText(e,date=new Date()){
    const year=date.getFullYear(),[em,ed]=e.end;
    let end=new Date(year,em-1,ed,23,59,59);
    if(end<date)end=new Date(year+1,em-1,ed,23,59,59);
    const ms=Math.max(0,end-date),days=Math.floor(ms/86400000),hours=Math.floor(ms%86400000/3600000);
    return `${days}d ${hours}h remaining`;
  }
  window.MelodicEvents={EVENTS,COMBOS,isActive,activeEvents,isSeasonActive,seasonalForPair,eventBoost,untilText};
})();
