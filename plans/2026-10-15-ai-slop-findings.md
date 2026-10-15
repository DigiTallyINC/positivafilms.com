# AI-slop scan results (2026-10-15, read-only "detect" pass)

Line numbers are as of commit 09dd56a. Check that a line still says the same thing before you edit it.
Rules: `plans/ai-slop-rules/SKILL.md` + `eval.md` (petergyang/no-ai-slop). Plan: `2026-10-15-ai-slop-cleanup.md`.
Not counted: CSS, JS and HTML comments, JSON-LD (out of scope), and decorative arrows (they stay).

## index.html
- Titles: 6 `<title>`, 9 og:title, 15 twitter:title `Positiva Films &mdash; Inspiring. Cinematic. Experiences.`
- 432 hidden h1 `Positiva Films &mdash; Cinematic films, aerial...`
- 496 `15+ Indian states &mdash; the Open Road India story`
- 516 `DRIFT &mdash; FPV` · 524 `POSITIVA FILMS &mdash; SHOWREEL`
- 565 `coastlines of Odisha &mdash; we chase the light`; also `Every frame is intentional. Every shot is earned.` (repeats 483) and `so your story can live forever`
- 605 `Open Road India &mdash; a 13-episode documentary`, `That instinct &mdash; find the person, earn the shot &mdash; is what...`, `were driven, not flown.`
- 623 `across India &mdash; landscapes, monuments` · 638 `spanning India &mdash; available on BlackBox`
- 689 `contributor dashboard &mdash; better keywords, more sales, less work. Built by contributors, for contributors.`
- 708 `or availability &mdash; reach out`
- 901 button `Copy page as Markdown &mdash; paste into any AI`; JS 922 `Could not load index.md — view it directly at`, 931 `Copied — paste it into any AI`, 932 same as 901
- Slop: 435 `prioritizes aesthetics and narrative, producing visuals rich in meaning`; 473 `WHY ARE WE DIFFERENT?`; 483 `Every frame is intentional, every shot is earned.`; 487 `packed with a unique artistic touch`; 564 `WE BREATHE IDEAS INTO YOUR VISION`; 633 `Concept through final delivery.` fragment; 707 `Something remarkable`
- Keep: 441 `EVERY FRAME HAS A STORY.` (brand line)
- Flag only: 559 "15+ Years" vs 496 "over a decade"

## luts.html
- Titles 6/8/15 `LUT Packs &mdash; Positiva Films`; meta desc 7 `bundle pricing &mdash; for Premiere`
- 348 `.cube format &mdash; works in Premiere` · 369 `film looks &mdash; built for every wedding filmmaker`
- 397 `travel filmmakers &mdash; built to make your travel films more cinematic than ever`
- 470 `No Instagram filters &mdash; this is finishing-suite color.` (binary)
- 480 `you already use &mdash; from Premiere` · 499 `Yes &mdash; our LUTs` · 511 `email us &mdash; we'll help`
- Slop: 372 `Accelerates your color grading workflow`; 425 `The complete color toolkit...`; 475 `Drop in, dial in, deliver.` / `Adjustable, layerable, and fully customizable`; 503 `Absolutely.`
- 495 arrows in menu paths: KEEP (arrows stay)

## products.html
- Titles 6/8/15 `Products &mdash; Positiva Films`
- 316 `for color grading &mdash; with DaVinci Resolve PowerGrades`; 332 `contributor dashboard &mdash; better keywords, more sales, less work`; 345 `Indian Travel pack &mdash; or buy both`; 358 `grain and bloom &mdash; fifteen nodes`; 379 alt `ClipEngine AI extension mockup — BlackBox dashboard`; 391 `&mdash; better metadata, more sales, less work`; 394 `&mdash; no copy/paste, no extra tabs`; 396 `for contributors &mdash; tuned to what BlackBox buyers actually search for`; 422 `creative finishing &mdash; halation, grain, bloom, split-tone &mdash; built from`
- Slop: 315 `Built with love, for you.`; 345 `accelerate your color grading workflow`; 391 decorative `<strong>`; 393 `actually convert`; 396 `Built by contributors, for contributors`; 422 `built from first principles in real colour science`
- Flag only: meta 7/9/16 promises stock footage + FPV drone bundles the page doesn't sell

## supergrade.html
- 6 `SuperGrade &mdash; DaVinci Resolve Grade Plugin &mdash; Positiva Films`; 7 meta, 8/15 og/twitter title, 9/16 og/twitter desc
- 425 `creative finishing &mdash; halation, grain, bloom, split-tone &mdash; built from` + `first principles in real colour science`
- 441 `right space &mdash; no extra CST nodes`; 442 `and density &mdash; the print-film character` + `feel shot, not rendered`; 443 `tuned in real colour science`; 444 `film behaviour &mdash; warm glow`; 446 `final mood &mdash; teal-and-orange`
- 455 `Drag the handle &mdash; one node did this`; 456 aria-label `Before and after comparison — drag to reveal`; 457 alt `Graded frame — the SuperGrade look`
- 472 `Real footage &mdash; the same frame`; 481 `OUTPUT CST &mdash; the serial chain`; 496 `free &amp; Studio &mdash; Windows, macOS, Linux`
- JS captions 599–604: `Real footage —`, `Rain-soaked alley —`, `Café interior —`, `Desert highway at dusk —`, `Neon street —`, `Bookshop —`

## blog.html
- Titles 6/8/15 `Blog &mdash; Positiva Films`; meta 7 `from Positiva Films &mdash; aerial cinematography`
- Ranges: 462 `₹1–2 lakh`, 476 `10–18%`, 490 `₹2–4`, 518 `5–15%`
- Dash-swap damage: 455 `fills the numbers for you, here's exactly how`; 476 `don't just slow your commute, they quietly drain`; 532 `build the real number, fuel, service, tyres, depreciation,`; 559 `Taj Mahal: And What You Can Shoot`; 630 `doesn't just look bad: it breaks the math`; 644 `workflow: UIN registration, Green Zone checks, NPNT compliance: that gets`; 657 `Cooler Than FX3: and the Single Node`; 658 `Here's exactly why: and the one node`; 672 `node tree: qualifiers, HDR wheels, and saturation limiters: that holds`; 679 `isn't overexposure: it's a gamut violation`; 686 `Same sensor, same log profile: and the cameras`
- Worst excerpt slop: 273 lede kicker; 313 `"Kitna Deti Hai" Is the Wrong Question: Cost Per Kilometre Is the Answer`; 385/392/413/427/448/469/525/539/560/567/595/602/623/658/665 `actually`/`exactly` filler; 391–392, 419–420, 482–483, 531–532, 701 binary "isn't X / not X"; 490 `matters more than you think`; 693 `Three light sources, three colour temperatures, one subject.`; 717 `S-Log3 isn't Rec.709. The LUT doesn't know that.`
- Card titles must match post titles after the posts are fixed.

## apps.html (0 visible dashes)
- 632, 866 `Four catalogues, not one.` (3× on page with JSON-LD; keep one at most)
- 694 `actually done`; 712 `A beautifully simple weight...`; 739 `confidence, not grammar drills`; 777 `isn't what your vehicle actually does`
- Decorative mid-sentence `<strong style="color:var(--linen);font-weight:400">` at 777, 818, 864, 905, 928
- 818 `neatly auto-sorted`; 823 `Fully on-device. No account, no server, nothing leaves your phone`; 864 `Most apps of this kind hand you...`, `what it is actually getting at`; 869 `Nothing piles up. No streaks, no unread count...`; 927 `We're here to help`
- Keep: 589 `Copy. Paste. Karo.` (brand line)

## Footer tagline on all 6 pages
`We craft cinematic stories that move people... we bring your vision to life.` (index 734, luts 520, products 436, supergrade 512, blog 730, apps 955). Replace it with one plain line, the same on every page.

## posts/*.html (50)
- Em dashes: 0 in prose. 26 posts (2026-07-08 onward) have `{{TITLE}} &mdash; Positiva Films` in `<title>` (line 6); the other em dashes are CSS comments (leave them).
- En dashes: ~288, all numeric ranges (5–15%, ₹2–4, 1800&ndash;2000K, 140°–165°), plus 2 minus signs in sangeet-tungsten 261 `–2 to –4°`. 20 are in head meta of dashboard-mileage, monsoon-mileage, petrol-prices-reset, petrol-vs-diesel. Top: car-cost-per-kilometre 25, sangeet-tungsten 17, monsoon-mileage 16, varanasi-ghats 15, car-ac-fuel-cost 15.
- Dash-swap damage in the 24 older posts (Apr 22 to Jun 24): 16 titles with two colons (e.g. `Why FX30's Skin Tones Read Cooler Than FX3: and the Single Node That Fixes It: Positiva Films`); 34 colon pairs in prose (dgca-drone 11, color-space-transform 8 at 227/229/232/236/262/269/276/287, monsoon-greens 7, color-grading-mandap 6). Comma splices in newer posts (logging-fill-up-scan 264, 296).
- "Not X. It is Y." about 45 times in about 35 posts, e.g. drone-footage-hazy 235, logging-fill-up 250, hill-station-fog 234, skin-tone-recovery 236/257/317/325, why-s-log3 225/294, color-space-transform 224/226, kitna-deti-hai 250/283/316.
- "No X. No Y.": fx30 256, recalculating-cost-per-km 268.
- Words: premiere-vs-resolve 231 `seamless` ×2; color-grading-mandap 231/235 `Unlock`/`unlock`; fx3-vs-fx6 258 and lav-mic 280 `more robust`. Literal uses stay (unlocked APK, torque converter unlocked, elevated terraces).
- Fake-profound closers (examples): why-s-log3 294, logging-fill-up 316, kitna-deti-hai 316, iphone-clipboard 309–311.
- Arrows on CTA buttons and in menu paths: KEEP.

## content/post-template.html
- Line 6 `<title>{{TITLE}} &mdash; Positiva Films</title>`: change to `|`. Nothing else in the cron changes.
