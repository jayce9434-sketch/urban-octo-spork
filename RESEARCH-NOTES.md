# Design research notes

This release used a focused mechanics pass on My Singing Monsters as design research while keeping Melodic Isles original.

## Systems studied

- Big Blue Bubble describes My Singing Monsters around breeding, feeding, collecting, and island-specific songs, with each Monster contributing a unique sound and each island having a unique look/song/species roster.
- My Singing Monsters breeding uses two eligible parent Monsters, and many special classes are not determined by ordinary element union. Instead, special Monsters such as Mythicals, Seasonals, and Epics use specific combinations or special rules.
- Mythicals on the Natural/Fire islands use specific parent combinations and later participate in Mythical Island progression. That informed the decision to make Melodic Isles Mythicals breed-only, one-element special species rather than ordinary market singles.
- Epic Monsters use unique breeding combinations rather than simply sharing a Common/Rare breeding rule. That reinforced the idea that hard-to-get content should feel mechanically distinct instead of being a palette-only rarity.
- Wishing Torches are placeable breeding structures that can be lit for 24 hours and improve special-monster breeding chances. Melodic Isles uses an original ten-structure Resonance Torch Ring with user-defined odds: Mythical 1% to 10% and Legendary Breed 2% to 10%.
- My Singing Monsters tracks Common, Rare, and Epic collection states separately. Melodic Isles keeps one slot per species + rarity so an island cannot be flooded with duplicate copies of the exact same form.
- Big Blue Bubble has repeatedly used teleport/transfer requirements for special islands, including Level 15 transfer systems. Melodic Isles keeps its original Level 15 Attunement system for its two Islets.
- Wubbox-style progression consumes or boxes required Monsters before activation. The Grand Resonator keeps that structural idea with an original design and original requirements.

## Original implementation choices

The user requested a 3-element + 3-element Legendary Breed at about 2% and a 4-element + 3-element Mythical at about 1%. Those are custom Melodic Isles rules, not copied MSM formulas.

The user also requested that all 10 breeding-luck structures raise Mythicals to 10%. The implementation linearly increases Mythical chance from 1.0% to 10.0% and Legendary Breed chance from 2.0% to 10.0% based on the number of currently lit Resonance Torches.

## Art direction

The environment pass was built to solve the mismatch between detailed monster art and placeholder-looking stages. Each destination now has a separate vector environment with its own landmark, architecture, terrain silhouette, color system, water/lava/ice treatment, and foreground props. The island map uses those same world renders so the map and actual stages visually agree.

## Originality boundary

No Big Blue Bubble or Tower Battles art, audio, monster/island names, code, models, sprites, or extracted assets are included. Creature SVGs, rarity morphs, island scenery, UI, event names, progression tables, synthesized parts, and musical sequences are original to Melodic Isles.
