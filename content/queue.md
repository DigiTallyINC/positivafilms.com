# Positiva Blog — Topic Queue

The cron picks the **first `[ ]` item with the highest priority** (lower number = higher priority), writes the post, then changes the line to `[x] YYYY-MM-DD | slug: <slug> | <rest unchanged>`.

Priority guide:
- **1** = top-5 pain points, write these first (highest commercial intent + repeat search volume)
- **2** = strong commercial intent (LUT product matches a search)
- **3** = supporting craft / explainer (authority-builders, less direct commercial pull)

Categories map to `data-cat` on `.post-card` in `blog.html`:
- `wedding`  — Wedding LUTs / Indian wedding color
- `travel`   — Travel / India location grading
- `craft`    — Craft & Color (technical)
- `gear`     — Camera-specific
- `aerial`   — Drone / aerial color
- `field`    — Field Notes (general workflow)

Internal-link targets the agent should weave into every post:
- `luts.html` (LUT pack hub)
- `luts.html#wedding` for wedding posts
- `luts.html#travel` for travel posts
- `luts.html#bundle` if mentioning the full collection
- `index.html` (home / about)
- `products.html` (ClipEngine + LUTs hub) — for craft/workflow posts that mention metadata or stock workflows

---

## Queued

### Top-5 pain points (priority 1 — write first)
- [ ] priority: 1 | category: craft  | title: **Why Applying a LUT Directly to S-Log3 Looks Flat — The CST Node You're Missing** | intent: "lut not working s-log3", "lut washed out resolve", "color space transform vs lut"
- [ ] priority: 1 | category: wedding | title: **Why Indian Skin Tones Go Orange Under Rec.709 Wedding LUTs (And the One Node That Fixes It)** | intent: "indian skin tone lut", "brown skin orange after lut", "wedding lut skin tone"
- [ ] priority: 1 | category: craft  | title: **Why Your LUT Crushes Blacks — A Pre-LUT Exposure Workflow That Saves Every Grade** | intent: "lut crushing blacks", "lut too contrasty", "match exposure before lut"
- [ ] priority: 1 | category: wedding | title: **Mixed Tungsten + LED + Mandap Fire: A Wedding Reception Node Tree That Actually Works** | intent: "wedding reception color grade", "mixed lighting color", "fire glow skin tone"
- [ ] priority: 1 | category: gear   | title: **Color-Matching A7S III to FX3 on a Wedding Multicam Edit (Resolve, 2026)** | intent: "match a7s3 fx3 color", "sony multicam color match", "wedding multicam grade"

### Wedding LUTs / Indian wedding color (priority 2)
- [ ] priority: 2 | category: wedding | title: **Color-Grading Mandap Fire Without Blowing Out the Bride's Lehenga** | intent: "mandap fire highlights", "lehenga color saturation"
- [ ] priority: 2 | category: wedding | title: **Why Your Sangeet Footage Looks Yellow — Neutralizing Banquet Hall Tungsten** | intent: "yellow tungsten correction wedding", "banquet hall white balance"
- [ ] priority: 2 | category: wedding | title: **Grading Haldi Yellow Without Turning Skin Into a Highlighter** | intent: "haldi color correction", "yellow saturation skin"
- [ ] priority: 2 | category: wedding | title: **Skin Tone Recovery for Underexposed Indian Bride Closeups** | intent: "underexposed wedding footage", "denoise before grade"
- [ ] priority: 2 | category: wedding | title: **Why Gold Jewellery Clips on Sony A7S III at Indian Weddings — A Highlight Rolloff Recipe** | intent: "gold clipping sony a7s3", "highlight rolloff jewellery"
- [ ] priority: 2 | category: wedding | title: **Matching Drone B-roll to Ground Cam Footage in a Wedding Edit** | intent: "drone match wedding cam", "aerial color match"
- [ ] priority: 2 | category: wedding | title: **Christian vs Hindu Wedding Color Palettes: When to Switch LUT Looks Mid-Edit** | intent: "wedding color palette", "venue color shift"
- [ ] priority: 2 | category: wedding | title: **Grading Mehendi Closeups: Why Henna Reads Muddy and How to Pull the Reds** | intent: "mehendi color grade", "henna red saturation"
- [ ] priority: 2 | category: wedding | title: **Vidaai at Sunset: Grading Departures Without Magenta Sky Spill** | intent: "vidaai sunset grade", "magenta sky cleanup"
- [ ] priority: 2 | category: wedding | title: **Reception Stage LED Wash Killing Skin Tones — A Curve-Based Fix** | intent: "led wash skin tone", "reception color grade"
- [ ] priority: 2 | category: wedding | title: **One LUT, Twelve Locations: Building a Wedding Base Grade That Survives Every Venue** | intent: "wedding base grade", "show lut wedding"
- [ ] priority: 2 | category: wedding | title: **Why Your Wedding Highlight Reel Looks Flat After Instagram Compression** | intent: "wedding reel flat instagram", "pre-export saturation"
- [ ] priority: 2 | category: wedding | title: **Grading Pre-Wedding Couple Shoots in Rajasthan Forts: Sandstone vs Skin** | intent: "rajasthan pre wedding color", "sandstone skin tone separation"

### Travel / India-specific LUTs (priority 2)
- [ ] priority: 2 | category: travel | title: **Magenta Sunsets in Goa: When Your Rec.709 LUT Hits the Gamut Wall** | intent: "magenta sunset rec709", "out of gamut sunset fix"
- [ ] priority: 2 | category: travel | title: **Why Monsoon Greens in Kerala Look Radioactive on Sony Cameras** | intent: "kerala green color grade", "sony green saturation"
- [ ] priority: 2 | category: travel | title: **Grading Jaisalmer Desert Haze Without Killing the Gold** | intent: "jaisalmer color grade", "desert haze cinematic"
- [ ] priority: 2 | category: travel | title: **Varanasi Ghats at Blue Hour: Grading Smoke, Fire, and Skin in One Frame** | intent: "varanasi color grade", "ghats blue hour"
- [ ] priority: 2 | category: travel | title: **Hill Station Fog (Munnar, Coorg, Ooty) Reads Grey — Adding Atmosphere Without Washing Out** | intent: "fog color grade", "hill station cinematic"
- [ ] priority: 2 | category: travel | title: **Why Holi Footage Clips Reds and Pinks on Every Camera** | intent: "holi color clipping", "saturation chroma fix"
- [ ] priority: 2 | category: travel | title: **Backwater Greens vs Tropical Greens: Two Different Approaches for Kerala** | intent: "kerala backwaters color", "tropical green grading"
- [ ] priority: 2 | category: travel | title: **Grading Ladakh's Cold Blue Shadows Without Cyan-Shifting Skin** | intent: "ladakh color grade", "cold shadow warm skin"
- [ ] priority: 2 | category: travel | title: **Old Delhi Street Footage: Taming Mixed Sodium-Vapor Streetlight** | intent: "sodium vapor color grade", "street footage india"
- [ ] priority: 2 | category: travel | title: **Why Beach Footage Looks Washed Out and How to Recover Sand-to-Sky Contrast** | intent: "beach footage washed out", "sand sky contrast grade"
- [ ] priority: 2 | category: travel | title: **Grading the Indian Night Sky — Why Astro LUTs Made for the Aurora Fail Here** | intent: "astro color grade india", "night sky lut"
- [ ] priority: 2 | category: travel | title: **Pondicherry Pastel Walls: Saturation Tricks for Painted Architecture** | intent: "pondicherry color grade", "pastel architecture saturation"
- [ ] priority: 2 | category: travel | title: **Tea Garden Footage in Assam — Adding Depth to Repetitive Greens** | intent: "tea garden color grade", "green tonal contrast"
- [ ] priority: 2 | category: travel | title: **Grading Kashmir Snow: Why "White" Isn't White on Your Vectorscope** | intent: "snow color grade", "vectorscope white reference"

### Camera-specific (priority 2)
- [ ] priority: 2 | category: gear | title: **Why FX30's Skin Tones Read Cooler Than FX3 — and the Single Node That Fixes It** | intent: "fx30 vs fx3 color", "match fx30 fx3"
- [ ] priority: 2 | category: gear | title: **Canon R5 vs Sony A7S III: Why the Same LUT Looks Different and What to Do About It** | intent: "match canon sony color", "r5 a7s3 color science"
- [ ] priority: 2 | category: gear | title: **BMPCC 6K Pro Skin Tones Go Pink Under Tungsten — A Resolve-Native Fix** | intent: "bmpcc skin tone tungsten", "blackmagic color tungsten"
- [ ] priority: 2 | category: gear | title: **Canon C70 CLog3 to Rec.709: Why the Built-In LUT Crushes Your Shadows** | intent: "c70 clog3 rec709", "canon log shadow crush"
- [ ] priority: 2 | category: gear | title: **DJI Mavic 3 Pro D-Log to Rec.709: The Cleanest CST Setup in Resolve** | intent: "dji d-log rec709", "mavic 3 pro color grade"
- [ ] priority: 2 | category: gear | title: **Why DJI Air 3's HLG Footage Doesn't Match Your Mavic D-Log Clips** | intent: "dji air 3 hlg match", "hlg vs d-log timeline"
- [ ] priority: 3 | category: gear | title: **DJI Mini 4 Pro 10-bit D-Log M: Is It Worth Grading Like Real Log?** | intent: "d-log m vs d-log", "mini 4 pro grading"
- [ ] priority: 3 | category: gear | title: **GoPro Hero 12 GP-Log Mixed With Sony Footage on a Travel Edit** | intent: "gopro gp-log match sony", "action cam color match"
- [ ] priority: 3 | category: gear | title: **iPhone 15 Pro Apple Log Next to FX3 S-Log3 — A Realistic Match Workflow** | intent: "iphone apple log match sony", "phone cinema match"
- [ ] priority: 3 | category: gear | title: **Why S-Cinetone Footage Resists LUTs (And When to Just Not Use One)** | intent: "s-cinetone lut", "baked profile lut"
- [ ] priority: 3 | category: gear | title: **Lumix S5 II V-Log to Sony Match: Why Panasonic Greens Drift Yellow** | intent: "v-log to s-log match", "panasonic green shift"

### Technical craft (priority 2-3)
- [ ] priority: 2 | category: craft | title: **Rec.709 vs Rec.2020: What Actually Changes When You Pick the Wrong One** | intent: "rec709 vs rec2020", "color space delivery"
- [ ] priority: 2 | category: craft | title: **Color Space Transform Order in Resolve: Why CST-Then-LUT Beats LUT-Then-CST** | intent: "cst node order resolve", "lut placement node tree"
- [ ] priority: 2 | category: craft | title: **Stacking Two LUTs Without Banding: When It's Allowed and When It Breaks** | intent: "stack luts", "lut on lut banding"
- [ ] priority: 2 | category: craft | title: **The Difference Between a Look LUT and a Conversion LUT (And Why You Probably Need Both)** | intent: "look lut vs conversion lut", "creative vs technical lut"
- [ ] priority: 3 | category: craft | title: **Why Your LUT Bakes In Exposure — and How to Build One That Doesn't** | intent: "exposure baked lut", "build a lut"
- [ ] priority: 3 | category: craft | title: **33-Point vs 65-Point Cube Files: Does Resolution Actually Matter?** | intent: ".cube file size", "33 vs 65 point lut"
- [ ] priority: 3 | category: craft | title: **Why Your LUT Posterizes Skies — The Dithering Fix Most Editors Skip** | intent: "lut sky banding", "posterize fix grade"
- [ ] priority: 3 | category: craft | title: **HDR vs SDR Delivery: Why the Same LUT Won't Survive the Trip** | intent: "hdr sdr lut", "delivery space color"
- [ ] priority: 3 | category: craft | title: **Building a Show LUT for a Multi-Day Wedding Shoot** | intent: "show lut wedding", "base grade workflow"
- [ ] priority: 3 | category: craft | title: **Why "Neutral" LUTs Aren't Neutral — How to Test One in Under 60 Seconds** | intent: "test a lut", "neutral lut quality"
- [ ] priority: 3 | category: craft | title: **The Skin Tone Line on the Vectorscope Lies for Indian Skin — Here's a Better Reference** | intent: "vectorscope skin tone line", "indian skin reference"
- [ ] priority: 3 | category: craft | title: **Parade vs Waveform vs Vectorscope: Which One to Trust for Color Matching** | intent: "scopes color match", "parade waveform vectorscope"

### Drone / aerial color (priority 2)
- [ ] priority: 2 | category: aerial | title: **Why Drone Footage Looks Hazy at 400 Feet — A Dehaze + Contrast Recipe** | intent: "drone footage hazy", "aerial dehaze color"
- [ ] priority: 2 | category: aerial | title: **Grading Coastal Drone Shots: Cyan Water Without Cartoon Saturation** | intent: "drone water color", "coastal aerial grade"
- [ ] priority: 2 | category: aerial | title: **Mavic 3 vs Air 3 Color Science — Why the Same Sky Reads Differently** | intent: "mavic 3 vs air 3 color", "dji color science compare"
- [ ] priority: 3 | category: aerial | title: **Drone Sunset Skies Banding on Export — A Grading + Codec Fix** | intent: "drone sky banding export", "aerial codec quality"
- [ ] priority: 3 | category: aerial | title: **Why Aerial Greens Read Yellow on DJI Drones** | intent: "dji green bias", "aerial green color"
- [ ] priority: 3 | category: aerial | title: **ND Filter Stops on a Drone: How Underexposure Wrecks Your LUT Later** | intent: "drone nd filter", "aerial exposure"
- [ ] priority: 3 | category: aerial | title: **Top-Down vs Reveal Shots: Why They Need Different Color Treatments in the Same Edit** | intent: "drone shot color", "top down reveal grade"

### Workflow / software (priority 3)
- [ ] priority: 3 | category: field | title: **Installing .cube LUTs in Premiere Pro vs DaVinci Resolve vs FCP** | intent: "install .cube lut", "how to use .cube file"
- [ ] priority: 3 | category: field | title: **Why FCP's Built-In LUT Application Looks Different From Resolve (And How to Match It)** | intent: "fcp lut vs resolve", "fcp color match"
- [ ] priority: 3 | category: field | title: **CapCut LUT Support for Travel Creators: What Works and What Doesn't** | intent: "capcut lut", "mobile lut workflow"
- [ ] priority: 3 | category: field | title: **Roundtripping a Wedding Edit From Premiere to Resolve for Color** | intent: "premiere to resolve", "wedding color roundtrip"
- [ ] priority: 3 | category: field | title: **Why Your LUT Looks Right in Resolve and Wrong on Instagram** | intent: "lut instagram color", "platform color shift"
- [ ] priority: 3 | category: field | title: **YouTube vs Instagram vs Reels: Three Color Spaces, One Master File** | intent: "delivery color space", "platform color management"
- [ ] priority: 3 | category: field | title: **Proxy Workflows That Don't Lie About Color** | intent: "proxy color accurate", "edit proxy color"

### Beginner explainers (priority 3)
- [ ] priority: 3 | category: craft | title: **What Is a .cube File, Really? A Plain-English Guide** | intent: "what is .cube file", "lut file format"
- [ ] priority: 3 | category: craft | title: **LUT vs Preset vs Filter: Why They're Not the Same Thing** | intent: "lut vs preset", "lut vs filter"
- [ ] priority: 3 | category: craft | title: **What "Log Footage" Actually Means and Why It Looks Grey** | intent: "what is log footage", "why log looks flat"
- [ ] priority: 3 | category: craft | title: **709 vs 2020 vs P3: A Filmmaker's Map of Color Spaces** | intent: "color space explained", "rec709 rec2020 p3"
- [ ] priority: 3 | category: craft | title: **Free LUTs vs Paid LUTs: What You're Actually Buying** | intent: "free vs paid luts", "are paid luts worth it"
- [ ] priority: 3 | category: craft | title: **How to Test if a LUT Is Worth Installing in Under 60 Seconds** | intent: "test lut quality", "lut quick check"
- [ ] priority: 3 | category: craft | title: **Why Your Phone's Screen Lies About Your Color Grade** | intent: "monitor calibration grading", "phone color accurate"

---

## Published

<!-- The cron moves entries here once posted, format:
- [x] 2026-05-04 | slug: why-indian-skin-tones-go-orange | category: wedding | original-title
-->
