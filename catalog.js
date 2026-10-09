'use strict';
(()=>{
const VARIANTS={
  Common:{mult:1,chance:.70,color:'#dce4ef',fx:'soft'},
  Rare:{mult:1.55,chance:.20,color:'#64d3ff',fx:'glass'},
  Epic:{mult:2.25,chance:.08,color:'#d578ff',fx:'harmonic'},
  Legendary:{mult:3.5,chance:.02,color:'#ffd15f',fx:'sparkle'}
};

const ISLANDS={
  groove:{name:'Verdant Groove',type:'ISLAND I - GARDEN GROOVE',desc:'Leaves, drums, horns and chirps lock into a bright opening song.',theme:'groove',mark:'VG',unlockLevel:1,unlockCost:0,lifeStars:0,decor:['fern','bloom','stone','reed','mushroom','vine'],root:220},
  frost:{name:'Frostbell Atoll',type:'ISLAND II - CRYSTAL CHOIR',desc:'Glassy bells, snowy percussion and wide choir notes shimmer over the ice.',theme:'frost',mark:'FA',unlockLevel:4,unlockCost:8000,lifeStars:0,decor:['spire','crystal','pine','ice','facet','snow'],root:261.63},
  ember:{name:'Ember Circuit',type:'ISLAND III - VOLTAGE STAGE',desc:'Molten marimba, sub bass, sparks and machines turn the island into a festival.',theme:'ember',mark:'EC',unlockLevel:8,unlockCost:25000,lifeStars:0,decor:['vent','gear','basalt','coil','plate','flare'],root:185},
  moon:{name:'Moonlit Reverie',type:'ISLAND IV - CELESTIAL DREAM',desc:'Harp, celesta, distant choir and starlight percussion build a floating night song.',theme:'moon',mark:'MR',unlockLevel:12,unlockCost:45000,lifeStars:10,decor:['crescent','prism','orb','pillar','cloud','ring'],root:293.66},
  reef:{name:'Tideglass Reef',type:'ISLAND V - DEEPWATER ENSEMBLE',desc:'Pressure snaps, glass fins, shell bass and slow current chords move like an underwater orchestra.',theme:'reef',mark:'TR',unlockLevel:16,unlockCost:72000,lifeStars:18,decor:['coral','kelp','shell','pearl','arch','bubble'],root:196}
};

const MONSTERS=[
  // Verdant Groove — 10 regular + 1 island titan
  ['spriggle','Spriggle','groove','Leaf','pluck',350,22,5,'leaf',['#75df6b','#2eaa62','#d6ff93'],'A leafy little plucker that snaps its stem like a tiny string instrument.'],
  ['drumroot','Drumroot','groove','Earth','kick',700,38,8,'root',['#b77a46','#6cb64e','#f4c879'],'Its hollow roots thump the ground in a warm, bouncy beat.'],
  ['pufflehorn','Pufflehorn','groove','Air','horn',1200,62,12,'puff',['#e7a6da','#9a6ad6','#ffd6ef'],'A fluffy horn singer with a surprisingly enormous brass voice.'],
  ['shellody','Shellody','groove','Water','bell',1900,86,18,'shell',['#69d5e9','#3678c4','#c3f8ff'],'Taps the ridges of its shell to ring clean watery notes.'],
  ['chirplet','Chirplet','groove','Song','chirp',2800,118,24,'bird',['#ffd25a','#f47767','#fff0a8'],'A tiny three-note vocalist that never misses its entrance.','Songster'],
  ['bloombass','Bloombass','groove','Bloom','bass',3600,145,28,'flower',['#ff8fc8','#4cbd6b','#fff0a5'],'A flower-backed bass singer whose petals bounce on every downbeat.'],
  ['vinebell','Vinebell','groove','Vine','chime',4300,170,32,'vine',['#76d15b','#387d4b','#ffe783'],'Its curling vines hold tiny bells that sway in perfect time.'],
  ['dewdropper','Dewdropper','groove','Dew','kalimba',5200,205,36,'slime',['#72e6d2','#45a5c3','#dffff7'],'Plucks little droplets like a thumb piano.'],
  ['twiggle','Twiggle','groove','Wood','clack',6100,242,40,'stag',['#bd8c53','#5eaf62','#ecce8b'],'Knocks its wooden antlers together for a crisp clack groove.'],
  ['mossmara','Mossmara','groove','Moss','choir',7600,295,46,'moth',['#8cd879','#596db8','#d9ffd0'],'A mossy moth whose wingbeats make a soft humming choir.'],
  ['heartwood','Heartwood Harmonizer','groove','Heartwood','heaven',18000,620,60,'tower',['#86e26e','#38643e','#ffe285'],'The island titan. Its living wooden pipes turn the whole garden into a cathedral.', 'Island Titan',true,260,5],

  // Frostbell Atoll
  ['glisswing','Glisswing','frost','Ice','choir',4200,160,30,'wing',['#c8f2ff','#6db4ef','#f6fdff'],'Crystal feathers whistle a smooth sliding harmony.'],
  ['crystoad','Crystoad','frost','Crystal','mallet',5200,190,34,'toad',['#7ee8ee','#5f79df','#d8ffff'],'A squat crystal drummer that plays its own sparkling back.'],
  ['snowbongo','Snowbongo','frost','Snow','snare',6800,228,38,'bongo',['#dfefff','#7a9fd2','#ffffff'],'Two frost drums and one goofy grin. Somehow, it works.'],
  ['chimecub','Chimecub','frost','Bell','chime',8500,280,44,'cub',['#b8ddff','#6c77d1','#edf7ff'],'A cuddly bell-beast whose antlers ring when it hops.'],
  ['echoowl','Echoowl','frost','Echo','pad',11000,350,50,'owl',['#8e79d7','#403d83','#d5cfff'],'Sings one note, then throws its echo across the whole atoll.','Mythic'],
  ['icicello','Icicello','frost','Cello','cello',12600,402,54,'jelly',['#9cecff','#4268ba','#f4ffff'],'Its icicle arms bow a deep frozen cello tone.'],
  ['flurrit','Flurrit','frost','Flurry','flute',13900,455,58,'bird',['#f3fbff','#7db3ec','#a9eeff'],'A tiny snow flutist with breathy, dancing runs.'],
  ['glacitone','Glacitone','frost','Glacier','glass',15200,510,62,'orb',['#7ef0ff','#5566c9','#e8ffff'],'A floating glass orb that sings when its rings collide.'],
  ['sleetbeat','Sleetbeat','frost','Sleet','hihat',16800,575,66,'bug',['#c6edff','#6378a9','#ffffff'],'Taps sleet-crystals into a bright, fast hi-hat pattern.'],
  ['prismoth','Prismoth','frost','Prism','arp',19000,650,70,'moth',['#c8a8ff','#59c9ea','#fff6ff'],'Splits one tone into a rainbow arpeggio with every wingbeat.'],
  ['cryocantor','Cryocantor-X','frost','Aurora Core','heaven',30000,980,78,'tower',['#b7f2ff','#6656b3','#ffffff'],'The frost titan. Aurora pipes and crystal choirs bloom into enormous suspended chords.','Island Titan',true,420,7],

  // Ember Circuit
  ['sparko','Sparko','ember','Volt','zap',14500,430,52,'spark',['#ffe45d','#f28c35','#fff8bb'],'A hyper little voltage singer that crackles right on beat.'],
  ['magmarimba','Magmarimba','ember','Magma','marimba',18000,520,56,'magma',['#ff7b48','#9f3039','#ffc164'],'Plays lava-rock bars across its back like a volcanic marimba.'],
  ['coilcat','Coilcat','ember','Coil','bass',23000,640,60,'cat',['#65e2ff','#3b4f94','#baf7ff'],'Purrs sub-bass through a glowing coil wrapped around its tail.'],
  ['beatbug','Beatbug','ember','Circuit','tick',30000,780,64,'bug',['#80f0a8','#263b4c','#d4ffe2'],'A clockwork bug whose feet create an impossibly tight rhythm.'],
  ['furnacefin','Furnacefin','ember','Furnace','timpani',33500,850,68,'crab',['#ff9b42','#7d2934','#ffd277'],'A molten little beast that booms like a floor tom.'],
  ['voltelope','Voltelope','ember','Static','synthlead',37000,920,72,'stag',['#6ef2ff','#4358d1','#fff068'],'Its antlers arc melodic electricity from note to note.'],
  ['cinderclick','Cinderclick','ember','Cinder','clack',40500,1000,76,'bug',['#ff784a','#4a2e42','#ffd380'],'Clicks heated plates together for a sharp industrial rhythm.'],
  ['gearling','Gearling','ember','Gear','hihat',45000,1100,80,'machine',['#8ad8d7','#48506e','#f2d783'],'A tiny machine whose spinning teeth make metallic percussion.'],
  ['ashvox','Ashvox','ember','Ash','choir',49000,1210,84,'ghost',['#c9c2c7','#5d475d','#ffb78a'],'A smoky vocalist that drifts through the mix like a ghost choir.'],
  ['neonix','Neonix','ember','Neon','arp',54000,1340,88,'orb',['#ff69db','#3a63e9','#8effff'],'A neon oscillator that spits out a relentless arpeggio.'],
  ['resonator','Resonator-X','ember','Core','titan',65000,1800,90,'machine',['#77dcff','#5042a3','#ffe36d'],'The circuit titan. It drops a massive power-grid chord that makes the entire island feel twice as large.','Island Titan',true,600,9],

  // Moonlit Reverie
  ['lumibun','Lumibun','moon','Lumen','harp',22000,610,48,'puff',['#fff0c4','#7b67c8','#fff9ed'],'Plucks luminous whiskers like a miniature harp.'],
  ['nocturnote','Nocturnote','moon','Night','flute',25000,680,52,'bat',['#8175cf','#29305f','#c2e8ff'],'A moon-bat that breathes soft flute lines between the stars.'],
  ['starwhisp','Starwhisp','moon','Star','celesta',28500,760,56,'ghost',['#e8f5ff','#8f79db','#fff5b2'],'A little wisp that taps sparkling celesta notes into the air.'],
  ['moondrum','Moondrum','moon','Moon','timpani',32000,850,60,'bongo',['#ddd7ff','#7565a8','#f5f3ff'],'A gentle lunar drummer with huge, warm low-end pulses.'],
  ['cometail','Cometail','moon','Comet','bell',36000,945,64,'cat',['#8ae9ff','#6552a5','#fff59a'],'Its comet tail rings like a distant bell as it circles the stage.'],
  ['dreamhorn','Dreamhorn','moon','Dream','choir',41000,1050,68,'stag',['#f1d7ff','#8064b2','#fff6ff'],'Sings a breathy choir tone through antlers shaped like crescents.'],
  ['orbitaloop','Orbitaloop','moon','Orbit','pad',47000,1170,72,'planet',['#84d7ff','#5e4ea4','#ffdc9b'],'Three tiny moons orbit it, building slow ambient pads.'],
  ['halope','Halope','moon','Halo','glass',53000,1320,76,'halo',['#fff6bd','#85a7e9','#ffffff'],'A floating halo creature with pristine glass harmonics.'],
  ['nebulark','Nebulark','moon','Nebula','bass',60000,1490,82,'jelly',['#b997ff','#344b8d','#f9d8ff'],'A cosmic bass singer whose body ripples like a nebula.'],
  ['tidemoon','Tidemoon','moon','Tide','kalimba',68000,1680,88,'shell',['#75d9e8','#7463bd','#e9faff'],'Plucks moonlit tide-drops into a calm, hypnotic rhythm.'],
  ['astralorganon','Astral Organon','moon','Astral Core','heaven',85000,2400,90,'tower',['#efe4ff','#7862cb','#fff5aa'],'The celestial titan. A radiant organ-choir chord with harp overtones turns the island genuinely heavenly.','Island Titan',true,900,12],

  // Tideglass Reef
  ['kelpkin','Kelpkin','reef','Kelp','pluck',26000,720,50,'kelp',['#58c49a','#237b70','#d8ffca'],'A ribbon-bodied reef plucker that snaps its fronds like soft strings.'],
  ['coraloom','Coraloom','reef','Coral','mallet',30000,810,54,'coral',['#ff9e9b','#b04776','#ffe9a8'],'A branching coral creature whose hollow tips ring like tuned woodblocks.'],
  ['raymora','Raymora','reef','Current','pad',34500,905,58,'ray',['#63d5da','#315f9e','#d7ffff'],'A wide gliding singer that folds the reef into slow, warm chords.'],
  ['urchime','Urchime','reef','Urchin','chime',39000,1005,62,'urchin',['#a678df','#573b9b','#ffe58c'],'Its flexible spines strike one another to make bright glassy chimes.'],
  ['nautibass','Nautibass','reef','Shell','bass',44000,1120,66,'nautilus',['#efb56f','#a64c52','#fff0c9'],'A spiral-shelled bass voice that resonates through its chambered body.'],
  ['seafiddle','Seafiddle','reef','Tide','cello',49500,1245,70,'seahorse',['#79d7bf','#32698e','#ffe9b5'],'A curled-tail bow player with a soft, woody underwater tone.'],
  ['shrimshot','Shrimshot','reef','Snap','snare',55000,1380,74,'shrimp',['#ff987f','#a6425d','#fff1ca'],'Two oversized claws create a tight backbeat with crisp pressure snaps.'],
  ['eellume','Eellume','reef','Lumen','synthlead',61000,1520,78,'eel',['#5ee8d2','#2957a6','#e7ff8e'],'A luminous ribbon-eel that bends notes as its body twists.'],
  ['clamoray','Clamoray','reef','Pearl','celesta',68500,1685,82,'clam',['#e8d4ff','#63519b','#fff7db'],'A pearl-core singer whose shell opens for tiny bell-like phrases.'],
  ['glassfin','Glassfin','reef','Glass','arp',76000,1875,86,'fish',['#79e4ee','#5576c7','#f8ffff'],'Transparent fins flick in sequence, building a quick suspended arpeggio.'],
  ['abyssalchoir','Abyssal Choirspire','reef','Abyss Core','heaven',98000,2750,90,'leviathan',['#58d8c4','#243765','#ffe99b'],'The reef titan. A many-chambered deep-sea giant turns pressure, bubbles, and resonant plates into a huge choir chord.','Island Titan',true,1050,14]
].map(r=>({id:r[0],name:r[1],island:r[2],element:r[3],instrument:r[4],price:r[5],rate:r[6],wait:Math.min(60,r[7]),shape:r[8],colors:r[9],desc:r[10],featured:r[11]||'',special:!!r[12],notes:r[13]||0,stars:r[14]||0}));


// Nightfall expansion: three full islands, two late-game Islets, seasonals and a dormant world construct.
Object.assign(ISLANDS,{
  bramble:{name:'Bramble Brassworks',type:'ISLAND VI - LIVING BRASS',desc:'Rooted horns, stomping bellows and vine-strung brass turn an overgrown foundry into a swinging ensemble.',theme:'bramble',mark:'BB',unlockLevel:20,unlockCost:115000,lifeStars:24,decor:['hornvine','bellows','copperroot','mossgear','brassbloom','reedpipe'],root:164.81,bpm:118,mode:'dorian'},
  gloam:{name:'Gloamforge Hollow',type:'ISLAND VII - HAUNTED FOUNDRY',desc:'Stone choirs, jaw percussion and furnace organs make the Hollow sound enormous without borrowing a single outside track.',theme:'gloam',mark:'GH',unlockLevel:24,unlockCost:185000,lifeStars:32,decor:['lantern','gargoyle','blackiron','candle','chain','moonstone'],root:146.83,bpm:126,mode:'minor'},
  bastion:{name:'Starfall Bastion',type:'ISLAND VIII - CITADEL FINALE',desc:'War drums, brass, pipe-organ chords and sky-high voices build the bridge between the main islands and the endgame Islets.',theme:'bastion',mark:'SB',unlockLevel:28,unlockCost:285000,lifeStars:42,decor:['banner','obelisk','starforge','helm','organpipe','meteor'],root:174.61,bpm:136,mode:'harmonicMinor'},
  prism:{name:'Prism Hand Islet',type:'ISLET I - REFRACTED HAND',desc:'A compact late-game Islet where level-15 monsters are attuned into stranger new forms with fractured rhythms and crystalline counterpoint.',theme:'prism',mark:'PH',unlockLevel:30,unlockCost:380000,lifeStars:50,decor:['facet','handcrystal','lens','prismvine','splitstone','shardring'],root:207.65,bpm:132,mode:'lydian',islet:true},
  nullcrown:{name:'Null Crown Islet',type:'ISLET II - ENDGAME CROWN',desc:'The hardest destination. Relentless drums, dark choir, organ, distorted leads and huge cadences make its complete song play like a final-boss theme.',theme:'nullcrown',mark:'NC',unlockLevel:35,unlockCost:600000,lifeStars:70,decor:['voidcrown','blackstar','rune','chainspire','redglass','abyssgate'],root:138.59,bpm:150,mode:'phrygian',islet:true,hardest:true}
});
Object.assign(ISLANDS.groove,{bpm:108,mode:'major'});
Object.assign(ISLANDS.frost,{bpm:104,mode:'majorPent'});
Object.assign(ISLANDS.ember,{bpm:124,mode:'minor'});
Object.assign(ISLANDS.moon,{bpm:96,mode:'lydian'});
Object.assign(ISLANDS.reef,{bpm:110,mode:'dorian'});

const EXTRA_MONSTERS=[
  // Bramble Brassworks
  ['reedjaw','Reedjaw','bramble','Reed','jawbass',88000,2020,32,'pipebeast',['#7fae58','#8b5d37','#e1c66e'],'Clamps a hollow reed-lined jaw for bass notes, then snaps its jaw shut for the backbeat.','',false,0,0,'jaw'],
  ['bellowsprout','Bellowsprout','bramble','Bloom','brass',94000,2170,36,'bellows',['#75bc61','#b46d42','#f1d27c'],'Inflates two leaf-bellows and blasts a warm brass chord through its flower horn.','',false,0,0,'bellows'],
  ['copperhoof','Copperhoof','bramble','Metal','stomper',101000,2320,40,'horned',['#c47a46','#5b7b55','#f4d49a'],'Raises heavy copper hooves and stomps separate kick and floor-tom notes.','',false,0,0,'stomp'],
  ['trumpettle','Trumpettle','bramble','Brass','trumpet',109000,2490,44,'bughorn',['#d6a44a','#496f53','#f7e3a0'],'Its curled proboscis is a real horn; cheek sacs inflate before every bright call.','',false,0,0,'horn'],
  ['mossclave','Mossclave','bramble','Wood','claves',118000,2680,48,'mantis',['#6ca35b','#59482f','#d8be73'],'A long-armed moss creature that strikes its forearms together like tuned claves.','',false,0,0,'clap'],
  ['tubloom','Tubloom','bramble','Tuba','tuba',128000,2890,52,'flowerhorn',['#7abf62','#8f604d','#e6cc83'],'Opens a giant bell-shaped bloom and sings a slow tuba line from deep in its stem.','',false,0,0,'bellows'],
  ['cicadence','Cicadence','bramble','Buzz','strings',139000,3120,56,'cicada',['#84b25b','#735037','#f1dd91'],'Pulls its ribbed wings like bows across resonant body strings for a restless ostinato.','',false,0,0,'wing'],
  ['brambitone','Brambitone','bramble','Thorn','choirlead',152000,3370,60,'thornmask',['#5f8f4e','#653a4d','#efd081'],'Its thorn-mask opens into four mouths that trade the island lead melody.','',false,0,0,'mouth'],
  ['verdigrand','Verdigrand','bramble','Foundry Heart','grandbrass',225000,4750,60,'brassgiant',['#65a477','#b56f46','#ffd67f'],'The Brassworks Titan. Rooted organ pipes, shoulder horns and stomping plates turn the island into a living marching band.','Island Titan',true,1500,16,'titan'],

  // Gloamforge Hollow
  ['lanternmaw','Lanternmaw','gloam','Lantern','vox',142000,3260,34,'lantern',['#f2b24b','#3d4055','#ffd991'],'Its chest lantern brightens as it opens a huge mouth for a smoky vowel choir.','',false,0,0,'mouth'],
  ['gargong','Gargong','gloam','Stone','gong',151000,3450,38,'gargoyle',['#697185','#343a49','#d7b86b'],'Swings its stone tail into the bronze disk growing from its back.','',false,0,0,'tail'],
  ['chattercrypt','Chattercrypt','gloam','Bone','teeth',161000,3650,42,'skullbug',['#c8c1a6','#424154','#a86463'],'Rows of oversized teeth chatter in pitched patterns while its tiny feet keep time.','',false,0,0,'jaw'],
  ['organimp','Organimp','gloam','Pipe','organ',173000,3880,46,'pipeimp',['#7a6588','#4d3f54','#d3a96d'],'A squat imp pumps its own ribcage bellows into a row of crooked organ pipes.','',false,0,0,'bellows'],
  ['chainchant','Chainchant','gloam','Chain','chant',186000,4130,50,'ghostchain',['#8193a8','#353246','#c3a169'],'Pulls chains taut across its body, then chants as they vibrate like dark strings.','',false,0,0,'arms'],
  ['cauldroll','Cauldroll','gloam','Brew','tom',200000,4400,54,'cauldron',['#586b62','#342e43','#d98b4e'],'Rolls a pair of mallets around its cauldron body for descending tom fills.','',false,0,0,'drum'],
  ['maskrake','Maskrake','gloam','Mask','strings',216000,4690,58,'mask',['#b0a07c','#504459','#d86768'],'Rakes long bone fingers across strings stretched behind a floating theatre mask.','',false,0,0,'pluck'],
  ['noctivox','Noctivox','gloam','Night','choirlead',233000,5000,60,'mouthtower',['#755e8f','#2c2d42','#e0bb71'],'Three stacked mouths sing a call-and-response line while its lower jaw pulses like a bass drum.','',false,0,0,'mouth'],
  ['forgefather','Forgefather','gloam','Hollow Core','darkorgan',340000,6800,60,'forgegiant',['#5b6071','#2d2f3c','#d59452'],'The Hollow Titan. Furnace lungs feed a pipe-organ spine while chained anvils strike the downbeats.','Island Titan',true,2100,21,'titan'],

  // Starfall Bastion
  ['helmbeat','Helmbeat','bastion','Armor','taiko',205000,4720,34,'knightdrum',['#7185a9','#33435f','#f2c86e'],'Raises armored fists and pounds the resonant shield fixed to its chest like a taiko drum.','',false,0,0,'drum'],
  ['banneret','Banneret','bastion','Banner','brass',221000,5050,38,'bannerbeast',['#9b6a91','#46547c','#f0ce76'],'Its living banner unfurls into a brass resonator before each heroic chord.','',false,0,0,'horn'],
  ['meteora','Meteora','bastion','Meteor','bellstorm',239000,5400,42,'meteor',['#6b82b9','#3a315f','#ffd36a'],'Small meteor plates orbit its core and collide into a shower of tuned bells.','',false,0,0,'orbit'],
  ['swordfinch','Swordfinch','bastion','Blade','pluck',258000,5780,46,'bladebird',['#91a7c4','#4d5275','#f0b962'],'Flicks feather-blades across a harp-like chest frame for fast, bright runs.','',false,0,0,'pluck'],
  ['bastivox','Bastivox','bastion','Choir','vox',279000,6180,50,'helmvocal',['#7f8caf','#413957','#e6c98a'],'Lifts its visor to reveal a glowing mouth that delivers the island main vocal line.','',false,0,0,'mouth'],
  ['starorgan','Starorgan','bastion','Star','organ',302000,6620,54,'starorgan',['#667bc0','#39426f','#ffe48d'],'Rotating star points pump air through organ pipes embedded in its back.','',false,0,0,'orbit'],
  ['citadelon','Citadelon','bastion','Wall','bassdrop',329000,7100,58,'castlebeast',['#778395','#38445d','#d7b56d'],'Drops its entire stone body onto four piston legs for a huge bass impact.','',false,0,0,'stomp'],
  ['skyseraph','Skyseraph','bastion','Sky','choirlead',358000,7620,60,'seraph',['#ced5ef','#6a6eb6','#ffe59e'],'Fans six ribbon-wings outward and sings soaring counter-melodies over the brass.','',false,0,0,'wing'],
  ['astralmarshal','Astral Marshal','bastion','Citadel Core','cinematic',490000,9800,60,'marshalgiant',['#7a86b8','#353452','#ffe27b'],'The Bastion Titan. Shield drums, war horns and a cathedral throat make the late-game main-island finale explode.','Island Titan',true,3000,28,'titan'],

  // Prism Hand Islet: obtained by attuning level-15 source monsters.
  ['refrax','Refrax','prism','Prism','glassarp',0,7300,20,'crystalhand',['#9ef1ff','#7a66d4','#fff08b'],'Attuned from Glacitone. Finger-like crystal prongs tap one another in shifting arpeggios.','Attuned Islet',false,0,0,'fingers','glacitone'],
  ['rayfract','Rayfract','prism','Current','pulse',0,7600,22,'prismray',['#6ae6d9','#6a78d5','#f1d3ff'],'Attuned from Raymora. Its wings fold through its own body, chopping a warm pad into rhythmic pulses.','Attuned Islet',false,0,0,'wing','raymora'],
  ['halolens','Halolens','prism','Halo','bellstorm',0,7950,24,'lensbeast',['#ffe7a6','#79c5e7','#c8a7ff'],'Attuned from Halope. Rotates two lens-halos until they strike and ring in alternating stereo patterns.','Attuned Islet',false,0,0,'orbit','halope'],
  ['splitwing','Splitwing','prism','Prism Wing','strings',0,8300,26,'splitmoth',['#b9c0ff','#60d1d0','#ffe9a0'],'Attuned from Prismoth. Four mismatched wings bow across taut crystal fibers.','Attuned Islet',false,0,0,'wing','prismoth'],
  ['kelprism','Kelprism','prism','Kelp Prism','pluck',0,8680,28,'prismkelp',['#66d9bd','#6b65c6','#fff19b'],'Attuned from Kelpkin. Its translucent fronds curl into strings and snap back for syncopated plucks.','Attuned Islet',false,0,0,'pluck','kelpkin'],
  ['moonfacet','Moonfacet','prism','Moon Prism','celesta',0,9080,30,'facetorb',['#d7dbff','#7663cc','#ffef9c'],'Attuned from Starwhisp. Opens a faceted shell and taps the glowing core with two glass limbs.','Attuned Islet',false,0,0,'tap','starwhisp'],
  ['brasspect','Brasspect','prism','Refracted Brass','trumpet',0,9500,32,'prismhorn',['#8dd8b3','#9a70bf','#f4cc67'],'Attuned from Trumpettle. A split horn sends the same melody in two harmonized directions.','Attuned Islet',false,0,0,'horn','trumpettle'],
  ['primordia','Primordia Lens','prism','Primordial Prism','heaven',0,12500,40,'primordial',['#d9f8ff','#6f5ccd','#ffdf78'],'The Islet Primordial. It only awakens after every other Prism Hand performer has been attuned, then adds enormous glass choir chords.','Islet Primordial',true,3800,34,'titan'],

  // Null Crown Islet: the hardest roster and song.
  ['ironrequiem','Iron Requiem','nullcrown','Iron','taiko',0,10400,22,'crownknight',['#6f7488','#262738','#c94f59'],'Attuned from Helmbeat. Drives the boss rhythm with shield-sized drums and a double-kick stomp.','Attuned Islet',false,0,0,'drum','helmbeat'],
  ['chorasm','Chorasm','nullcrown','Choir','chant',0,10900,24,'chorasmaw',['#8e789c','#25263c','#d15a63'],'Attuned from Noctivox. Six mouths open in sequence to build a low ritual choir.','Attuned Islet',false,0,0,'mouth','noctivox'],
  ['voidpipe','Voidpipe','nullcrown','Pipe','darkorgan',0,11400,26,'voidorgan',['#594f72','#1f2638','#d8aa58'],'Attuned from Starorgan. Collapses into itself like a bellows, then blasts a distorted cathedral chord.','Attuned Islet',false,0,0,'bellows','starorgan'],
  ['maulstar','Maulstar','nullcrown','Impact','bassdrop',0,12000,28,'maulbeast',['#747886','#292939','#d65b54'],'Attuned from Citadelon. Leaps, tucks in its limbs, and slams down for the heaviest bass hit in the game.','Attuned Islet',false,0,0,'stomp','citadelon'],
  ['riftsaw','Riftsaw','nullcrown','Rift','distortedlead',0,12600,30,'riftsaw',['#7752a0','#25243b','#ef656c'],'Attuned from Eellume. Its split jaw becomes a vibrating sawtooth resonator for a screaming lead line.','Attuned Islet',false,0,0,'jaw','eellume'],
  ['crownseraph','Crownseraph','nullcrown','Crown','choirlead',0,13300,32,'crownseraph',['#c8c7dc','#4d456d','#e95b64'],'Attuned from Skyseraph. Snaps its six wings open like banners and answers the lead with a huge high choir.','Attuned Islet',false,0,0,'wing','skyseraph'],
  ['lordcadence','Lord Cadence','nullcrown','Cadence','cinematic',0,14100,34,'lordbeast',['#676477','#202333','#e2a852'],'Attuned from Astral Marshal. Alternates war-horn punches, organ stabs and a two-stage roar rather than idly bouncing.','Attuned Islet',false,0,0,'roar','astralmarshal'],
  ['nullregent','Null Regent','nullcrown','Primordial Null','boss',0,20000,45,'nullregent',['#4d465f','#161a28','#e6535d'],'The final Primordial. Sword-arms conduct the entire ensemble while its crown opens into organ pipes for the last cadence.','Islet Primordial',true,5200,45,'titan'],

  // The dormant construct is handled by the World Resonator system in game.js.
  ['grandresonator','Grand Resonator','bastion','Resonance','bossorgan',0,15000,60,'resonator',['#6e83b5','#37354f','#f2c45f'],'A dormant world construct awakened by boxing one chosen monster from each of the eight main islands.','World Resonator',true,0,0,'titan'],

  // Seasonal roster. These are hidden from the normal market and bred during their event windows.
  ['gourdhowl','Gourdhowl','groove','Nightfall Seasonal','vox',0,1550,34,'gourd',['#d87932','#493d35','#f1cc63'],'A harvest lantern singer whose carved mouth reshapes for every vowel.','Seasonal',false,0,0,'mouth',null,true,'nightfall'],
  ['candlejaw','Candlejaw','gloam','Nightfall Seasonal','teeth',0,4200,42,'candlejaw',['#d7b36e','#483b4e','#ef7658'],'Melts and reforms its wax jaw between pitched clacks during the Nightfall event.','Seasonal',false,0,0,'jaw',null,true,'nightfall'],
  ['festibot','Festibot','bastion','Frosttide Seasonal','bellstorm',0,6200,46,'festibot',['#cfe9f4','#65749f','#e7b855'],'Rings mechanical sleigh-bells with piston arms during Frosttide.','Seasonal',false,0,0,'arms',null,true,'frosttide'],
  ['heartchirp','Heartchirp','moon','Heartwake Seasonal','choirlead',0,3900,38,'heartbird',['#e794b7','#775987','#ffe0ce'],'Two throat sacs trade a warm duet during Heartwake.','Seasonal',false,0,0,'mouth',null,true,'heartwake'],
  ['bloomwhistle','Bloomwhistle','bramble','Bloomrise Seasonal','flute',0,3400,36,'bloomwhistle',['#93cf68','#aa6d83','#ffe4a4'],'Opens flower valves down its back to whistle a spring melody.','Seasonal',false,0,0,'bellows',null,true,'bloomrise'],
  ['sunforge','Sunforge','ember','Sunflare Seasonal','grandbrass',0,4500,40,'sunforge',['#f1a748','#9d4b3e','#ffe697'],'Raises a glowing disk above its head and blasts a festival brass fanfare during Sunflare.','Seasonal',false,0,0,'horn',null,true,'sunflare']
].map(r=>({id:r[0],name:r[1],island:r[2],element:r[3],instrument:r[4],price:r[5],rate:r[6],wait:Math.min(60,r[7]),shape:r[8],colors:r[9],desc:r[10],featured:r[11]||'',special:!!r[12],notes:r[13]||0,stars:r[14]||0,action:r[15]||'',attuneFrom:r[16]||null,seasonal:!!r[17],season:r[18]||null}));
MONSTERS.push(...EXTRA_MONSTERS);

// Resonance Forge expansion: each main island now has exactly 15 species and each Islet has 12.
// Legendary Breeds and Mythicals are species classes, separate from Common/Rare/Epic/Legendary visual forms.
const ROSTER_EXPANSION=[
  // Verdant Groove
  ['barklody','Barklody','groove','Heartwood','marimba',9800,370,24,'root',['#9a6f43','#4f874f','#f3d47b'],'Strikes tuned bark plates along its back with springy twig mallets.','',false,0,0,'drum',null,false,null,'regular'],
  ['thornissimo','Thornissimo','groove','Legend','brass',0,860,52,'thornmask',['#668a4f','#5f493d','#f0c66c'],'A Legendary Breed whose thorn crown opens into a deep brass resonator. It can only appear from two three-element parents.','Legendary Breed',false,0,0,'horn',null,false,null,'legendary'],
  ['somnibloom','Somnibloom','groove','Mythic','choirlead',0,980,58,'flowerhorn',['#9f8adf','#426c64','#ffe8a0'],'A one-element Mythical born from a four-element and three-element pairing. Its dream-petals sing layered vowels.','Mythical',false,0,0,'mouth',null,false,null,'mythical'],

  // Frostbell Atoll
  ['cragchime','Cragchime','frost','Crystal','bell',21800,715,44,'gargoyle',['#bfdaf1','#5f7f9f','#f8edc2'],'A cliff-backed bell creature that rocks forward to strike hanging ice chimes.','',false,0,0,'tail',null,false,null,'regular'],
  ['glacialoom','Glacialoom','frost','Aurora','pad',24600,775,46,'jelly',['#a4ecff','#5b72b2','#f8d8ff'],'Its translucent body stretches into curtains that hum like a frozen synth pad.','',false,0,0,'body',null,false,null,'regular'],
  ['rimehowl','Rimehowl','frost','Legend','cinematic',0,1430,56,'crownknight',['#b8d9ef','#52637f','#f6d886'],'A Legendary Breed that vents a huge horn-like howl through crystal tusks.','Legendary Breed',false,0,0,'roar',null,false,null,'legendary'],
  ['somniflake','Somniflake','frost','Mythic','glassarp',0,1580,60,'facetorb',['#d9d2ff','#6499bb','#fff5c1'],'A one-element Mythical. Its six dream-facets tap one another to create bright glass runs.','Mythical',false,0,0,'orbit',null,false,null,'mythical'],

  // Ember Circuit
  ['pulseforge','Pulseforge','ember','Circuit','pulse',56500,1410,48,'machine',['#6bdce6','#454c71','#ffc95e'],'Opens and closes magnetic plates in a strict pulse pattern while its core flashes on every note.','',false,0,0,'body',null,false,null,'regular'],
  ['arcwyrm','Arcwyrm','ember','Legend','distortedlead',0,2420,58,'eel',['#61d8ff','#413e7d','#ffbd4e'],'A Legendary Breed whose segmented spine crackles into a snarling electric lead.','Legendary Breed',false,0,0,'jaw',null,false,null,'legendary'],
  ['mythrill','Mythrill','ember','Mythic','synthlead',0,2650,60,'meteor',['#c27cff','#3b528d','#ffe67f'],'A one-element Mythical that spins a dream-metal halo until it becomes a piercing synth tone.','Mythical',false,0,0,'orbit',null,false,null,'mythical'],

  // Moonlit Reverie
  ['stellapod','Stellapod','moon','Star','kalimba',73500,1790,46,'urchin',['#cabdff','#566aa8','#fff1a6'],'Taps glowing star-nodes around its body like a floating thumb piano.','',false,0,0,'tap',null,false,null,'regular'],
  ['eclipseon','Eclipseon','moon','Legend','darkorgan',0,2860,58,'halo',['#9d93c9','#322f5c','#f2c66f'],'A Legendary Breed whose eclipse ring dilates like an organ bellows before every chord.','Legendary Breed',false,0,0,'bellows',null,false,null,'legendary'],
  ['dreamora','Dreamora','moon','Mythic','choirlead',0,3120,60,'seraph',['#e1c8ff','#6e5fa5','#fff0a3'],'A one-element Mythical with ribbon-wings that open in sequence while it sings a soft lead.','Mythical',false,0,0,'wing',null,false,null,'mythical'],

  // Tideglass Reef
  ['currentusk','Currentusk','reef','Current','tuba',82000,1960,48,'horned',['#6fc7c4','#3f617c','#f7dfa0'],'Channels bubbles through two curved tusks to produce rounded low brass notes.','',false,0,0,'horn',null,false,null,'regular'],
  ['pearlpulse','Pearlpulse','reef','Pearl','pulse',89500,2130,50,'clam',['#b5d8df','#586b99','#fff2ca'],'Snaps its shell around a bright pearl core to chop the reef harmony into rhythmic pulses.','',false,0,0,'jaw',null,false,null,'regular'],
  ['leviatone','Leviatone','reef','Legend','bassdrop',0,3260,58,'leviathan',['#5c9a98','#263f62','#e4bd6c'],'A Legendary Breed that curls its entire body before releasing a pressure-wave bass impact.','Legendary Breed',false,0,0,'stomp',null,false,null,'legendary'],
  ['somnashark','Somnashark','reef','Mythic','choir',0,3520,60,'fish',['#7f75c5','#315e84','#f7e4a9'],'A one-element Mythical whose dream-gills open like little choir chambers.','Mythical',false,0,0,'mouth',null,false,null,'mythical'],

  // Bramble Brassworks
  ['rootrattle','Rootrattle','bramble','Root','claves',165000,3590,48,'root',['#765d3f','#4d7652','#efcc78'],'Snaps paired root-knuckles together in woody cross-rhythms.','',false,0,0,'clap',null,false,null,'regular'],
  ['sporehorn','Sporehorn','bramble','Spore','horn',178000,3860,50,'flowerhorn',['#8ba262','#78574d','#f0d889'],'Inflates mushroom-like cheek sacs before pushing a mellow horn phrase through its crown.','',false,0,0,'horn',null,false,null,'regular'],
  ['thorncello','Thorncello','bramble','Thorn','cello',194000,4150,54,'stag',['#688454','#654a42','#e7c876'],'Bows thorny antlers across a resonant vine stretched through its chest.','',false,0,0,'pluck',null,false,null,'regular'],
  ['brasshart','Brasshart','bramble','Legend','grandbrass',0,5100,58,'horned',['#8b754e','#3f6a55','#f4cc6b'],'A Legendary Breed with four nested horns that unfold into a massive brass chord.','Legendary Breed',false,0,0,'horn',null,false,null,'legendary'],
  ['dreamreed','Dreamreed','bramble','Mythic','flute',0,5480,60,'pipebeast',['#9d8cce','#4c765f','#ffe59b'],'A one-element Mythical whose body is a bundle of dream-reeds. Individual valves open for each note.','Mythical',false,0,0,'bellows',null,false,null,'mythical'],

  // Gloamforge Hollow
  ['cryptimp','Cryptimp','gloam','Shade','tick',246000,5290,48,'pipeimp',['#73728a','#3f354d','#d9b06b'],'Taps little iron keys around its ribcage with hooked fingers.','',false,0,0,'tap',null,false,null,'regular'],
  ['waxwail','Waxwail','gloam','Wax','vox',262000,5580,50,'candlejaw',['#d2b17c','#493a53','#ef785e'],'Its candle-face liquefies into different mouth shapes to bend a mournful vocal line.','',false,0,0,'mouth',null,false,null,'regular'],
  ['bonestrum','Bonestrum','gloam','Bone','strings',279000,5900,54,'skullbug',['#c9bea6','#4a4052','#d69067'],'Rakes long finger-bones across a rib-harp fixed beneath its jaw.','',false,0,0,'pluck',null,false,null,'regular'],
  ['gravechoir','Gravechoir','gloam','Legend','choirlead',0,7020,58,'mouthtower',['#877e94','#292b3d','#d8ae69'],'A Legendary Breed made of stacked stone mouths that answer one another in a dark canon.','Legendary Breed',false,0,0,'mouth',null,false,null,'legendary'],
  ['somnishade','Somnishade','gloam','Mythic','darkorgan',0,7480,60,'ghostchain',['#7b6aaa','#222a43','#e6bd72'],'A one-element Mythical that inhales its own shadow and exhales an impossible organ chord.','Mythical',false,0,0,'bellows',null,false,null,'mythical'],

  // Starfall Bastion
  ['arcbanner','Arcbanner','bastion','Sky','brass',382000,8030,50,'bannerbeast',['#728cb5','#4b4c7a','#f1cf79'],'Throws a charged banner overhead and uses the cloth as a vibrating brass membrane.','',false,0,0,'horn',null,false,null,'regular'],
  ['siegevox','Siegevox','bastion','Armor','choir',410000,8580,54,'helmvocal',['#8b92ad','#40384f','#e6c88a'],'Drops its visor, braces its feet and sings through a resonant armored throat.','',false,0,0,'mouth',null,false,null,'regular'],
  ['crownhowl','Crownhowl','bastion','Legend','cinematic',0,10850,58,'lordbeast',['#73788f','#2f3046','#e0b15e'],'A Legendary Breed whose crown unfolds into six war-horns around a central roaring mouth.','Legendary Breed',false,0,0,'roar',null,false,null,'legendary'],
  ['mythguard','Mythguard','bastion','Mythic','bossorgan',0,11600,60,'marshalgiant',['#8a72c6','#323857','#f6d775'],'A one-element Mythical sentinel. Its shield opens into dream-pipes for huge suspended chords.','Mythical',false,0,0,'titan',null,false,null,'mythical'],

  // Prism Hand Islet
  ['refrachoir','Refrachoir','prism','Prism','choirlead',0,9900,34,'prismray',['#a4f3f0','#725fc9','#ffe9a1'],'Attuned from Dreamhorn. Its transparent ribs open and close like vocal formants.','Attuned Islet',false,0,0,'mouth','dreamhorn',false,null,'islet'],
  ['prismettle','Prismettle','prism','Metal','clack',0,10300,34,'prismhorn',['#8edfd1','#7d6fc5','#f2cf75'],'Attuned from Gearling. Faceted metal plates collide in alternating left-right clacks.','Attuned Islet',false,0,0,'jaw','gearling',false,null,'islet'],
  ['glasswarden','Glasswarden','prism','Glass','brass',0,10900,36,'crownknight',['#c7ebff','#6675b9','#ffefad'],'Attuned from Voltelope. A crystal helmet telescopes outward into a bright brass cone.','Attuned Islet',false,0,0,'horn','voltelope',false,null,'islet'],
  ['handoracle','Handoracle','prism','Oracle','organ',0,11800,40,'crystalhand',['#d8d0ff','#6a5cad','#f8db85'],'Attuned from Orbitaloop. Each finger-pipe bends independently to voice a strange organ chord.','Attuned Islet',false,0,0,'bellows','orbitaloop',false,null,'islet'],

  // Null Crown Islet
  ['abyssknell','Abyssknell','nullcrown','Abyss','gong',0,14900,36,'gargoyle',['#5e6378','#202432','#d2555c'],'Attuned from Abyssal Choirspire. A chained crown swings into its backplate for a crushing gong.','Attuned Islet',false,0,0,'tail','abyssalchoir',false,null,'islet'],
  ['crownmaw','Crownmaw','nullcrown','Crown','teeth',0,15700,38,'chorasmaw',['#76627f','#242334','#e75d66'],'Attuned from Crownhowl. Four jaw-rings snap shut in a rolling industrial rhythm.','Attuned Islet',false,0,0,'jaw','crownhowl',false,null,'islet'],
  ['riftsentinel','Riftsentinel','nullcrown','Rift','grandbrass',0,16500,40,'crownknight',['#5b5873','#1b2231','#e3a756'],'Attuned from Mythguard. Raises twin blade-horns before each apocalyptic brass strike.','Attuned Islet',false,0,0,'horn','mythguard',false,null,'islet'],
  ['endwarden','Endwarden','nullcrown','End','boss',0,17800,42,'nullregent',['#4c475d','#131824','#ee5b63'],'Attuned from Forgefather. Its spine separates into organ towers while both arms conduct the final cadence.','Attuned Islet',false,0,0,'titan','forgefather',false,null,'islet']
].map(r=>({id:r[0],name:r[1],island:r[2],element:r[3],instrument:r[4],price:r[5],rate:r[6],wait:Math.min(60,r[7]),shape:r[8],colors:r[9],desc:r[10],featured:r[11]||'',special:!!r[12],notes:r[13]||0,stars:r[14]||0,action:r[15]||'',attuneFrom:r[16]||null,seasonal:!!r[17],season:r[18]||null,breedClass:r[19]||'regular'}));
MONSTERS.push(...ROSTER_EXPANSION);

const CORE_ELEMENTS={
  groove:['Root','Breeze','Dew','Bloom'],frost:['Frost','Chime','Gale','Prism'],ember:['Ember','Volt','Metal','Ash'],moon:['Moon','Dream','Lumen','Orbit'],reef:['Tide','Coral','Pearl','Current'],bramble:['Reed','Brass','Moss','Thorn'],gloam:['Shade','Bone','Lantern','Iron'],bastion:['Star','Armor','Sky','Meteor']
};
function comboFor(core,count,index){const out=[];for(let j=0;j<count;j++)out.push(core[(index+j+(count===3?1:0))%core.length]);return [...new Set(out)];}
Object.keys(ISLANDS).forEach(isl=>{
  const core=CORE_ELEMENTS[isl]||['Prism','Echo','Pulse','Void'];
  const regular=MONSTERS.filter(m=>m.island===isl&&!m.special&&!m.seasonal&&!m.attuneFrom&&m.id!=='grandresonator'&&!['legendary','mythical'].includes(m.breedClass));
  regular.forEach((m,i)=>{
    const count=i<3?1:i<6?2:i<9?3:4;
    m.elementCount=Math.min(4,count);m.elements=comboFor(core,m.elementCount,i);
    m.breedClass=m.breedClass||'regular';
  });
  MONSTERS.filter(m=>m.island===isl&&m.breedClass==='legendary').forEach(m=>{m.elementCount=1;m.elements=['Legend'];});
  MONSTERS.filter(m=>m.island===isl&&m.breedClass==='mythical').forEach(m=>{m.elementCount=1;m.elements=['Mythic'];m.mythical=true;});
  MONSTERS.filter(m=>m.island===isl&&m.attuneFrom).forEach((m,i)=>{m.elementCount=1;m.elements=[m.element||'Attuned'];m.breedClass='islet';});
  MONSTERS.filter(m=>m.island===isl&&(m.special||m.seasonal)).forEach(m=>{m.elementCount=m.elementCount||1;m.elements=m.elements||[m.element];m.breedClass=m.breedClass||'special';});
});

// Intended roster contract: exactly 15 species per main island and 12 per Islet.
Object.entries(ISLANDS).forEach(([isl,is])=>{is.rosterTarget=is.islet?12:15;});

window.MelodicCatalog={VARIANTS,ISLANDS,MONSTERS,CORE_ELEMENTS};
})();
