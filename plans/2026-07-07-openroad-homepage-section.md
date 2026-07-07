# Open Road India — homepage section design (2026-07-07)

## Goal
Give Open Road India (openroadindia.com) real prominence on the Positiva Films
homepage — an origin-story section, not just a text link.

## Decisions (approved by Tally)
- **Scale:** dedicated numbered section (not an About sub-block or banner strip).
- **Visual:** photo collage from the recovered 2016 gallery (no video embed).
- **CTA:** single button → https://www.openroadindia.com (old site is stale; a
  rebuild exists in `E:\26-06-13 - OPENROADINDIA WEBSITE` but isn't deployed —
  the link is a conscious placeholder until it ships).

## What was built
- New `<section class="openroad" id="openroad">` inserted after the stats strip
  ("160K km by Road / 15+ Indian States") so the copy can pay those numbers off
  ("Those kilometres up there were driven, not flown").
- Header: tag **Documentary Roots**, number **( 04 )**; Instagram renumbered
  (04)→(05), Contact (05)→(06).
- Title **THE OPEN ROAD** + serif-italic gold subtitle *Where Positiva Films began*.
- Filmstrip of 5 photo "prints" (cream mat, caption, alternating tilt, hover
  straighten/lift with gold ring). Mobile: horizontal scroll-snap strip.
- Photos curated from `openroadindia-rebuild/assets/gallery`, resized to 900px
  JPEG q80 into `images/openroad/`:
  `street.jpg` (The Road In), `sadhu.jpg` (The People), `aerial.jpg` (From
  Above), `filming.jpg` (Behind the Lens), `hilltop.jpg` (The Climb).
- Copy: verbatim 2016 quote ("A journey to meet the people…") cited *Open Road
  India · The Reel Real India*, plus a paragraph naming real episodes (Kumbh
  foot soldiers/Nasik, Kite Boys, Puppets with a Purpose, Cowabunga/Puducherry
  surfers, cobbler/Amritsar). No invented claims — all facts from the rebuild's
  `content/CONTENT.md`.
- CTA reuses `.btn-consultation` style: "Visit Open Road India ↗".
- About section's **Documentary Roots** feature item now anchors to `#openroad`
  (the section is the exit point to the external site); footer "Open Road
  India" link stays external.

## Content facts source
`E:\26-06-13 - OPENROADINDIA WEBSITE\openroadindia-rebuild\content\CONTENT.md`
(recovered verbatim from 2016 Wayback snapshots; 13 verified episodes).
