# Melodic Isles: Nightfall Resonance

Melodic Isles is an original browser creature-music collection game inspired by ensemble-building games. This release expands the previous Nightfall build with stricter population control, full island rosters, special breeding classes, 24-hour breeding-luck structures, a developer grant panel, and a much larger world-art pass. All creature names, island names, vector art, UI, code, progression values, sound synthesis, and musical arrangements in this repository are original. No My Singing Monsters or Tower Battles art, audio, models, source code, or extracted assets are included.

## GitHub Pages

Upload every file from the ZIP directly into the root of one GitHub repository. There are intentionally no folders. In GitHub, enable Pages from the main branch and repository root.

## World and roster rules

- 8 full islands: Verdant Groove, Frostbell Atoll, Ember Circuit, Moonlit Reverie, Tideglass Reef, Bramble Brassworks, Gloamforge Hollow, and Starfall Bastion.
- 2 late-game Islets: Prism Hand Islet and Null Crown Islet.
- Every main island has exactly 15 species in its roster.
- Every Islet has exactly 12 species in its roster.
- Each species may exist once per rarity form: one Common, one Rare, one Epic, and one Legendary. Duplicate copies of the exact same species + rarity are blocked.
- Old saves are automatically cleaned so duplicate species/rarity copies are removed during migration.
- Monster display size shrinks as the island becomes more crowded. A nearly empty island shows large performers; a full 15-monster island uses a much smaller crowd scale so the stage stays readable.
- Rare and Epic forms are structural redraws, not only palette swaps. Their silhouettes, appendages, face geometry, crowns, fins, horns, wings, plates, and decorative anatomy change depending on rarity.

## Special breeding classes

Melodic Isles now has two breed-only species classes in addition to visual rarity forms.

### Legendary Breeds

- One Legendary Breed species exists on each main island.
- It cannot be purchased directly and cannot be selected as a parent.
- The required parent structure is exactly one 3-element monster + another 3-element monster.
- Base success chance: 2%.
- With all 10 Resonance Torches lit: 10%.

### Mythicals

- One one-element Mythical species exists on each main island.
- Mythicals are breed-only and cannot be selected as parents.
- The required parent structure is exactly one 4-element monster + one 3-element monster.
- Base success chance: 1%.
- With all 10 Resonance Torches lit: 10%.
- Mythicals use their own visual treatment and musical layer so they read as a special class even when the resulting rarity form is Common, Rare, Epic, or Legendary.

## Resonance Torches

Each breeding-enabled main island now has a ring of 10 original Resonance Torch structures.

- Cost to light one Torch: 2 Gems.
- Burn time: 24 real hours.
- Timers continue while the game is closed.
- Each active Torch raises the special-breed chance.
- Legendary Breed odds interpolate from 2.0% with no Torches to 10.0% with all 10.
- Mythical odds interpolate from 1.0% with no Torches to 10.0% with all 10.
- Torches affect only the correct special pairings; they do not create Mythical or Legendary results from invalid parents.
- Active Torches are also visible around the island environment.

## Rebuilt island art

The previous flat island backdrop was replaced with a dedicated `world-art.js` renderer. Each destination now has its own illustrated environment and landmark language instead of sharing one green platform.

Examples include the giant living tree and root bridges of Verdant Groove, ice cathedrals on Frostbell Atoll, industrial furnace towers on Ember Circuit, a crescent observatory on Moonlit Reverie, reef arches and coral towers on Tideglass Reef, brass foundry halls in Bramble Brassworks, gothic forge architecture in Gloamforge Hollow, a fortified citadel on Starfall Bastion, giant prism spires on Prism Hand Islet, and the crown-shaped ritual arena of Null Crown Islet.

The Island Map uses miniature renders of those actual world scenes rather than generic colored cards.

## Developer grant panel

Settings now contains a full developer grant panel. Enter any positive whole-number amount and add it directly with a 0.1-second button cooldown.

- Coins
- Gems
- Music Notes
- Stars
- Player XP

XP uses the real leveling function, so large grants can trigger multiple level-ups and their normal level rewards.

## Nightfall systems kept from the previous release

- 6 limited Seasonals with event-specific breeding combinations.
- Nightfall Masquerade active October 1 through November 3.
- Resonance Week active October 8 through October 18.
- Grand Resonator world construct, powered by boxing one required performer from each main island.
- Islet attunement: raise the listed source monster to Level 15, then transform it into its Islet performer.
- Islet Primordials that require the rest of that Islet's attuned roster before awakening.
- Real timestamp incubation with a 60-minute maximum.
- Feeding to level 20.
- Castle bed capacity and upgrades.
- Up to 12 hours of offline coin production.
- Permanent island Star mastery.
- 25 main quests plus rotating 4-hour quests.
- Local autosave plus export/import save codes.
- PWA/offline caching.
- iPad/iPhone and desktop layouts.
- No CDNs or external runtime dependencies.
- No in-game emojis.

## Music and performance animation

Every island has its own tempo, tonal mode, arrangement behavior, and performer roster. The browser synthesizes percussion, plucks, bells, brass, organs, vocal-like formants, noise percussion, bass impacts, and distorted leads through Web Audio.

Monster performance animation is tied to how the sound is physically produced. Jaws clamp, mouths form vowels, arms strike drum surfaces, bodies stomp, bellows compress, horn structures flare, strings are plucked, orbiting plates collide, wings open, and mechanical parts pulse only when that monster's part actually fires.

Null Crown Islet remains the hardest destination and the most aggressive arrangement: 150 BPM, Phrygian material, heavy impact percussion, dark organ layers, choir, brass, distorted lead, phrase escalation, and a Primordial finale. The composition is original.

## Research direction

The special-breeding pass was informed by My Singing Monsters' use of specific-parent special classes, unique Epic combinations, Mythicals bred on source islands, Wishing Torches as breeding-luck structures, Common/Rare/Epic collection tracking, teleport-style late-game islands, and Wubbox-style roster-consuming progression. The implementation here intentionally uses original names, art, rules, odds, music, and species.

## Testing

Five PNG screenshots in the repository are fresh captures of this exact build running in Chromium:

- `test-1-full-island-art.png`
- `test-2-torches-and-market.png`
- `test-3-island-map-redesign.png`
- `test-4-developer-grants.png`
- `test-5-null-crown-islet.png`

The final QA also validates JavaScript syntax, the flat repository layout, exact 15/12 roster targets, crowd shrinking, duplicate-form blocking, all-10-Torch 10% special odds, 3+3 Legendary requirements, 4+3 Mythical requirements, exact developer grants, and all 10 destination renders.
