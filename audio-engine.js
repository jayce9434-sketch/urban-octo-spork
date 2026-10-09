'use strict';
(()=>{
  const FILES={tap:'ui-tap.wav',coin:'coin.wav',buy:'ui-tap.wav',hatch:'hatch.wav',quest:'quest.wav',level:'quest.wav',unlock:'quest.wav'};
  const cache={};
  function ensure(key){
    const src=FILES[key]; if(!src) return null;
    if(!cache[src]){const a=new Audio(src);a.preload='auto';cache[src]=a;}
    return cache[src];
  }
  function play(key,volume=1){
    const base=ensure(key); if(!base) return false;
    try{const a=base.cloneNode();a.volume=Math.max(0,Math.min(1,volume));a.play().catch(()=>{});return true;}catch(e){return false;}
  }
  Object.keys(FILES).forEach(ensure);
  window.MelodicSamples={play};
})();
