# Positiva Blog — Topic Queue

The cron picks the **first `[ ]` item from `## Queued`** (top-down). After publishing, it changes the line to `[x] YYYY-MM-DD | slug: <slug> | <rest>` and moves it to `## Published`.

**File order IS publishing order.** The cadence is encoded in the sequence below:

- **Months 1–3 (May 4 → Aug 1, 2026):** Pattern repeats `LUT · LUT · BROADER` per Mon/Wed/Fri week — 2 LUT posts and 1 broader post each week. This is the LUT-launch push to drive traffic to `luts.html` while the audience is small.
- **Months 4+ (Aug 4, 2026 →):** Pattern flips to `LUT · BROADER · BROADER` per week — 1 LUT and 2 broader posts. The blog matures into a general filmmaker resource with LUT pieces in steady rotation rather than dominant.

Categories map to `data-cat` on `.post-card`:
- `wedding`  — Indian Wedding (LUT *and* non-LUT — pheras, audio, business, etc.)
- `travel`   — Travel & Place
- `craft`    — Craft & Color (color theory, technical grading, editing fundamentals)
- `gear`     — Gear (camera/lens/audio gear, comparisons, settings)
- `aerial`   — Aerial & FPV (drone craft, regs, gear)
- `field`    — Field Notes (workflow, business, on-set, essays)

Internal-link targets the agent should weave into every post:
- `luts.html` (LUT pack hub) — `#wedding`, `#travel`, `#bundle` anchors
- `index.html` (home / about)
- `products.html` (ClipEngine + LUTs hub)
- Other published `posts/<slug>.html` for cross-referencing — see the `## Published` list below

---

## Queued — Months 1–3 (LUT-heavy: 2 LUT + 1 broader per week)

### Week of May 4, 2026

### Week of May 11, 2026

### Week of May 18, 2026

### Week of May 25, 2026
- [ ] category: wedding | type: LUT      | title: **Grading Haldi Yellow Without Turning Skin Into a Highlighter** | intent: "haldi color correction", "yellow saturation skin"
- [ ] category: gear    | type: BROADER  | title: **Sony FX3 vs FX6 for a Two-Person Wedding Team: The Honest Trade-Off** | intent: "fx3 vs fx6 wedding", "compact wedding crew camera"

### Week of June 1, 2026
- [ ] category: gear    | type: LUT      | title: **Canon R5 vs Sony A7S III: Why the Same LUT Looks Different and What to Do About It** | intent: "match canon sony color", "r5 a7s3 color science"
- [ ] category: travel  | type: LUT      | title: **Varanasi Ghats at Blue Hour: Grading Smoke, Fire, and Skin in One Frame** | intent: "varanasi color grade", "ghats blue hour"
- [ ] category: wedding | type: BROADER  | title: **Framing the Seven Pheras: A Two-Camera Blocking Diagram for Hindu Mandaps** | intent: "saat phere coverage", "hindu wedding mandap shot list"

### Week of June 8, 2026
- [ ] category: wedding | type: LUT      | title: **Skin Tone Recovery for Underexposed Indian Bride Closeups** | intent: "underexposed wedding footage", "denoise before grade"
- [ ] category: aerial  | type: LUT      | title: **Why Drone Footage Looks Hazy at 400 Feet — A Dehaze + Contrast Recipe** | intent: "drone footage hazy", "aerial dehaze color"
- [ ] category: travel  | type: BROADER  | title: **Why You Cannot Fly a Drone at the Taj Mahal — And What You Can Shoot from Mehtab Bagh Instead** | intent: "drone taj mahal", "agra aerial alternatives"

### Week of June 15, 2026
- [ ] category: travel  | type: LUT      | title: **Hill Station Fog (Munnar, Coorg, Ooty) Reads Grey — Adding Atmosphere Without Washing Out** | intent: "fog color grade", "hill station cinematic"
- [ ] category: wedding | type: LUT      | title: **Why Gold Jewellery Clips on Sony A7S III at Indian Weddings — A Highlight Rolloff Recipe** | intent: "gold clipping sony a7s3", "highlight rolloff jewellery"
- [ ] category: field   | type: BROADER  | title: **Pricing a Two-Day Delhi Wedding in 2026: A Real Quote Breakdown** | intent: "wedding film pricing india", "delhi wedding videography rate"

### Week of June 22, 2026
- [ ] category: craft   | type: LUT      | title: **Rec.709 vs Rec.2020: What Actually Changes When You Pick the Wrong One** | intent: "rec709 vs rec2020", "color space delivery"
- [ ] category: travel  | type: LUT      | title: **Why Holi Footage Clips Reds and Pinks on Every Camera** | intent: "holi color clipping", "saturation chroma fix"
- [ ] category: gear    | type: BROADER  | title: **A7S III Autofocus Settings That Don't Hunt During the Varmala** | intent: "a7s iii autofocus wedding", "sony af settings ceremony"

### Week of June 29, 2026
- [ ] category: wedding | type: LUT      | title: **Matching Drone B-roll to Ground Cam Footage in a Wedding Edit** | intent: "drone match wedding cam", "aerial color match"
- [ ] category: gear    | type: LUT      | title: **BMPCC 6K Pro Skin Tones Go Pink Under Tungsten — A Resolve-Native Fix** | intent: "bmpcc skin tone tungsten", "blackmagic color tungsten"
- [ ] category: aerial  | type: BROADER  | title: **ND Filter Math for 24fps Drone Cinema: A Cheat Sheet for the Mavic 3** | intent: "drone nd filter 24fps", "mavic 3 nd math"

### Week of July 6, 2026
- [ ] category: travel  | type: LUT      | title: **Grading Ladakh's Cold Blue Shadows Without Cyan-Shifting Skin** | intent: "ladakh color grade", "cold shadow warm skin"
- [ ] category: wedding | type: LUT      | title: **Reception Stage LED Wash Killing Skin Tones — A Curve-Based Fix** | intent: "led wash skin tone", "reception color grade"
- [ ] category: field   | type: BROADER  | title: **Cloud Backup for Wedding Footage: Backblaze vs Tresorit vs a 4-Bay NAS** | intent: "wedding footage backup", "cloud storage filmmaker"

### Week of July 13, 2026
- [ ] category: gear    | type: LUT      | title: **Canon C70 CLog3 to Rec.709: Why the Built-In LUT Crushes Your Shadows** | intent: "c70 clog3 rec709", "canon log shadow crush"
- [ ] category: travel  | type: LUT      | title: **Backwater Greens vs Tropical Greens: Two Different Approaches for Kerala** | intent: "kerala backwaters color", "tropical green grading"
- [ ] category: wedding | type: BROADER  | title: **The Christian Wedding Coverage Plan That Doesn't Work for Hindu Weddings (And Vice Versa)** | intent: "christian vs hindu wedding shot list", "ceremony coverage india"

### Week of July 20, 2026
- [ ] category: wedding | type: LUT      | title: **Vidaai at Sunset: Grading Departures Without Magenta Sky Spill** | intent: "vidaai sunset grade", "magenta sky cleanup"
- [ ] category: aerial  | type: LUT      | title: **Mavic 3 vs Air 3 Color Science — Why the Same Sky Reads Differently** | intent: "mavic 3 vs air 3 color", "dji color science compare"
- [ ] category: gear    | type: BROADER  | title: **Why a 24-70 Isn't Enough at an Indian Wedding (And the Three Lenses That Are)** | intent: "wedding lens kit", "indian wedding lens choice"

### Week of July 27, 2026
- [ ] category: travel  | type: LUT      | title: **Old Delhi Street Footage: Taming Mixed Sodium-Vapor Streetlight** | intent: "sodium vapor color grade", "street footage india"
- [ ] category: gear    | type: LUT      | title: **DJI Mavic 3 Pro D-Log to Rec.709: The Cleanest CST Setup in Resolve** | intent: "dji d-log rec709", "mavic 3 pro color grade"
- [ ] category: wedding | type: BROADER  | title: **The Three Contract Clauses Every Indian Wedding Filmmaker Gets Burned On** | intent: "wedding videography contract india", "freelance contract clauses"

---

## Queued — Months 4–6 (mixed: 1 LUT + 2 broader per week)

### Week of August 3, 2026
- [ ] category: craft   | type: LUT      | title: **Stacking Two LUTs Without Banding: When It's Allowed and When It Breaks** | intent: "stack luts", "lut on lut banding"
- [ ] category: travel  | type: BROADER  | title: **The Ladakh Cold That Killed My BMPCC Battery in 11 Minutes** | intent: "ladakh cold camera battery", "high altitude filmmaking"
- [ ] category: wedding | type: BROADER  | title: **A 14-Hour Indian Wedding Shot List That Fits on One A4 Page** | intent: "indian wedding shot list", "14 hour wedding coverage"

### Week of August 10, 2026
- [ ] category: wedding | type: LUT      | title: **Christian vs Hindu Wedding Color Palettes: When to Switch LUT Looks Mid-Edit** | intent: "wedding color palette", "venue color shift"
- [ ] category: aerial  | type: BROADER  | title: **Mavic 3 Pro at 28 km/h Headwind in Spiti: When to Land** | intent: "drone wind limit", "mavic high altitude"
- [ ] category: field   | type: BROADER  | title: **Multicam Sync Without Timecode: PluralEyes vs Resolve's Sync Bin in 2026** | intent: "multicam sync resolve", "wedding multicam workflow"

### Week of August 17, 2026
- [ ] category: travel  | type: LUT      | title: **Why Beach Footage Looks Washed Out and How to Recover Sand-to-Sky Contrast** | intent: "beach footage washed out", "sand sky contrast grade"
- [ ] category: gear    | type: BROADER  | title: **The DJI Mic 2 vs RØDE Wireless Pro at an Outdoor Goa Wedding** | intent: "dji mic 2 vs rode wireless", "outdoor wireless mic wedding"
- [ ] category: wedding | type: BROADER  | title: **Why the Pandit Always Stands Where Your A-Cam Is — And Three Angles That Beat Him to It** | intent: "pheras coverage angles", "wedding ceremony blocking"

### Week of August 24, 2026
- [ ] category: craft   | type: LUT      | title: **The Difference Between a Look LUT and a Conversion LUT (And Why You Probably Need Both)** | intent: "look lut vs conversion lut", "creative vs technical lut"
- [ ] category: travel  | type: BROADER  | title: **Goa Monsoon Humidity vs Sony Sensor Fungus: A 6-Month Storage Test** | intent: "camera humidity storage", "goa monsoon gear"
- [ ] category: field   | type: BROADER  | title: **Pricing Wedding Films in 2026: Why ₹1.2 Lakh Is the New ₹80k** | intent: "wedding film pricing 2026", "indian wedding videography rate"

### Week of August 31, 2026
- [ ] category: wedding | type: LUT      | title: **Grading Mehendi Closeups: Why Henna Reads Muddy and How to Pull the Reds** | intent: "mehendi color grade", "henna red saturation"
- [ ] category: gear    | type: BROADER  | title: **Powering a BMPCC 6K Pro Through a 12-Hour Reception: V-Mount vs NPF Math** | intent: "bmpcc battery wedding", "v mount vs npf"
- [ ] category: wedding | type: BROADER  | title: **Catching the Baraat Without Eating Dhol Sticks: Ronin RS3 Settings for Dancing Crowds** | intent: "baraat gimbal settings", "ronin rs3 wedding"

### Week of September 7, 2026
- [ ] category: travel  | type: LUT      | title: **Grading the Indian Night Sky — Why Astro LUTs Made for the Aurora Fail Here** | intent: "astro color grade india", "night sky lut"
- [ ] category: travel  | type: BROADER  | title: **Packing for 30 Days Across Spiti: One Pelican, One Backpack, No Excess Baggage** | intent: "long shoot packing india", "spiti documentary kit"
- [ ] category: aerial  | type: BROADER  | title: **Mavic 3 vs Air 3 vs Mini 4 Pro: A Decision Tree for Every Shoot Type** | intent: "dji drone comparison 2026", "which drone filmmaker"

### Week of September 14, 2026
- [ ] category: gear    | type: LUT      | title: **Why DJI Air 3's HLG Footage Doesn't Match Your Mavic D-Log Clips** | intent: "dji air 3 hlg match", "hlg vs d-log timeline"
- [ ] category: wedding | type: BROADER  | title: **What Indian Families Actually Mean When They Say "Cinematic"** | intent: "indian wedding cinematic", "client expectations wedding"
- [ ] category: field   | type: BROADER  | title: **Naming Conventions for a Two-Camera Wedding That Survive Three Years Later** | intent: "wedding file naming", "media management filmmaker"

### Week of September 21, 2026
- [ ] category: wedding | type: LUT      | title: **One LUT, Twelve Locations: Building a Wedding Base Grade That Survives Every Venue** | intent: "wedding base grade", "show lut wedding"
- [ ] category: travel  | type: BROADER  | title: **The Pre-Dawn Window at Varanasi Ghats: 27 Minutes of Usable Light** | intent: "varanasi sunrise shoot", "ghats golden hour"
- [ ] category: gear    | type: BROADER  | title: **Internal 10-bit vs Ninja V on the S5 IIX: Which Survives a Wedding Card-Wipe Scare** | intent: "ninja v vs internal recording", "external recorder wedding"

### Week of September 28, 2026
- [ ] category: craft   | type: LUT      | title: **Why Your LUT Bakes In Exposure — and How to Build One That Doesn't** | intent: "exposure baked lut", "build a lut"
- [ ] category: wedding | type: BROADER  | title: **The Vidaai Shot Everyone Asks For — And the One That Actually Makes the Mother Cry** | intent: "vidaai coverage", "wedding emotional shot"
- [ ] category: field   | type: BROADER  | title: **Recovering a Corrupt SanDisk SD Card from a Sangeet: What Actually Worked** | intent: "corrupt sd card recovery", "wedding card failure"

### Week of October 5, 2026
- [ ] category: travel  | type: LUT      | title: **Pondicherry Pastel Walls: Saturation Tricks for Painted Architecture** | intent: "pondicherry color grade", "pastel architecture saturation"
- [ ] category: aerial  | type: BROADER  | title: **The Drone Flight Log Indian Brand Clients Now Ask For** | intent: "drone flight log compliance", "commercial drone documentation"
- [ ] category: wedding | type: BROADER  | title: **Pinning a Sennheiser MKE Mini to a Sherwani Without the Bride's Mom Noticing** | intent: "groom mic placement", "sennheiser mke mini wedding"

### Week of October 12, 2026
- [ ] category: gear    | type: LUT      | title: **DJI Mini 4 Pro 10-bit D-Log M: Is It Worth Grading Like Real Log?** | intent: "d-log m vs d-log", "mini 4 pro grading"
- [ ] category: gear    | type: BROADER  | title: **Manual Focus vs Eye-AF on the FX30 During the Pheras** | intent: "fx30 autofocus pheras", "manual vs af wedding"
- [ ] category: wedding | type: BROADER  | title: **Why Your Wedding Highlight Should Be 3:47, Not 6 Minutes** | intent: "wedding highlight runtime", "wedding film length"

### Week of October 19, 2026
- [ ] category: wedding | type: LUT      | title: **Grading Pre-Wedding Couple Shoots in Rajasthan Forts: Sandstone vs Skin** | intent: "rajasthan pre wedding color", "sandstone skin tone separation"
- [ ] category: field   | type: BROADER  | title: **Music Licensing in India: Hoopr vs Epidemic vs Artlist for Commercial Wedding Use** | intent: "music license india wedding", "hoopr vs epidemic"
- [ ] category: travel  | type: BROADER  | title: **Why You Need a Local Fixer in Varanasi (And How to Find One Who Doesn't Inflate Quotes)** | intent: "local fixer india", "varanasi production help"

### Week of October 26, 2026
- [ ] category: travel  | type: LUT      | title: **Tea Garden Footage in Assam — Adding Depth to Repetitive Greens** | intent: "tea garden color grade", "green tonal contrast"
- [ ] category: wedding | type: BROADER  | title: **Shooting a Punjabi Wedding vs a South Indian Wedding: Two Different Shot Lists** | intent: "punjabi vs south indian wedding", "regional wedding coverage"
- [ ] category: gear    | type: BROADER  | title: **Sennheiser EW-DP vs RØDE Wireless Pro at the ₹80k Price Point** | intent: "ew-dp vs rode wireless pro", "pro wireless mic comparison"

---

## Queued — Months 7+ (deeper backlog, mixed)

### Travel & place (LUT + craft)
- [ ] category: travel  | type: LUT      | title: **Grading Kashmir Snow: Why "White" Isn't White on Your Vectorscope** | intent: "snow color grade", "vectorscope white reference"
- [ ] category: travel  | type: BROADER  | title: **The Forest Department Permit Checklist for Filming in Bandhavgarh** | intent: "bandhavgarh permit film", "wildlife filming india"
- [ ] category: travel  | type: BROADER  | title: **Shooting Pushkar Camel Fair Without Getting Trampled or Robbed** | intent: "pushkar camel fair shoot", "rajasthan crowd filming"
- [ ] category: travel  | type: BROADER  | title: **Travel Insurance for a 6 Lakh Camera Kit: Which Indian Insurers Actually Pay Out** | intent: "camera insurance india", "filmmaker gear insurance"
- [ ] category: travel  | type: BROADER  | title: **The Monsoon Window in Meghalaya Is 11 Days. Here's How to Plan a Shoot Around It** | intent: "meghalaya monsoon shoot", "northeast india weather"
- [ ] category: travel  | type: BROADER  | title: **Sand at Jaisalmer: How One Shoot Cost Me a Sigma 24-70 Mount** | intent: "desert dust camera damage", "rajasthan filmmaking gear"
- [ ] category: travel  | type: BROADER  | title: **Filming Inside Hampi Temples: What the ASI Lets You Do, What They Don't** | intent: "hampi filming permission", "asi india film"
- [ ] category: travel  | type: BROADER  | title: **Why I Stopped Carrying a Drone to Kashmir — And What I Carry Instead** | intent: "kashmir drone restriction", "conflict zone filmmaking"

### Wedding craft (broader)
- [ ] category: wedding | type: BROADER  | title: **Drone Permissions Inside a Five-Star Mumbai Banquet (Yes, You Need Them)** | intent: "indoor drone wedding", "banquet drone permission"
- [ ] category: wedding | type: BROADER  | title: **What to Do When the DJ's Lights Are Strobing on Your A7S III at the Sangeet** | intent: "led strobe sangeet", "dj lights camera artifact"
- [ ] category: wedding | type: BROADER  | title: **The Haldi Yellow That Destroys White Balance on Every Camera Brand** | intent: "haldi white balance", "yellow stage color"
- [ ] category: wedding | type: BROADER  | title: **The Tilak Moment: Why You Have 4 Seconds and Three Angles to Get It Right** | intent: "tilak ceremony coverage", "wedding ritual blocking"
- [ ] category: wedding | type: BROADER  | title: **Recording the Mantras at the Mandap: A Two-Mic Setup That Doesn't Insult the Pandit** | intent: "mandap audio recording", "mantra mic placement"

### Gear & camera (broader)
- [ ] category: gear    | type: BROADER  | title: **The 35mm Sigma DG DN That Replaced Three Primes in My Travel Kit** | intent: "sigma 35mm dg dn travel", "single lens travel"
- [ ] category: gear    | type: BROADER  | title: **Anamorphic on a ₹50,000 Budget: The SIRUI 1.33x I Actually Recommend** | intent: "sirui anamorphic budget", "affordable anamorphic india"
- [ ] category: gear    | type: BROADER  | title: **Why I Sold My GH6 After One Mehendi** | intent: "gh6 wedding review", "panasonic for wedding"
- [ ] category: gear    | type: BROADER  | title: **Shooting a Documentary on Two Cameras Without Matching Bodies** | intent: "mismatched cameras documentary", "two body doc workflow"
- [ ] category: gear    | type: LUT      | title: **GoPro Hero 12 GP-Log Mixed With Sony Footage on a Travel Edit** | intent: "gopro gp-log match sony", "action cam color match"
- [ ] category: gear    | type: LUT      | title: **iPhone 15 Pro Apple Log Next to FX3 S-Log3 — A Realistic Match Workflow** | intent: "iphone apple log match sony", "phone cinema match"
- [ ] category: gear    | type: LUT      | title: **Why S-Cinetone Footage Resists LUTs (And When to Just Not Use One)** | intent: "s-cinetone lut", "baked profile lut"
- [ ] category: gear    | type: LUT      | title: **Lumix S5 II V-Log to Sony Match: Why Panasonic Greens Drift Yellow** | intent: "v-log to s-log match", "panasonic green shift"

### Aerial / drone (broader + LUT)
- [ ] category: aerial  | type: BROADER  | title: **Precision Landing on a Mumbai Highrise Helipad with No GPS Lock** | intent: "drone gps denied landing", "highrise drone recovery"
- [ ] category: aerial  | type: BROADER  | title: **RC 2 Pro Built-In Screen vs DJI Fly on a Phone: Which Survives 42 °C Jaisalmer Heat** | intent: "rc 2 pro vs phone heat", "drone controller heat failure"
- [ ] category: aerial  | type: BROADER  | title: **FPV Cinematic vs Mavic for a Pre-Wedding in Udaipur: The Honest Pick** | intent: "fpv vs mavic wedding", "cinematic drone choice"
- [ ] category: aerial  | type: BROADER  | title: **Why Geofencing Locked Me Out of a Goa Beach Shoot — And How I Got Unlocked in 38 Hours** | intent: "dji geofencing unlock", "drone no fly authorization"
- [ ] category: aerial  | type: LUT      | title: **Drone Sunset Skies Banding on Export — A Grading + Codec Fix** | intent: "drone sky banding export", "aerial codec quality"
- [ ] category: aerial  | type: LUT      | title: **Why Aerial Greens Read Yellow on DJI Drones** | intent: "dji green bias", "aerial green color"
- [ ] category: aerial  | type: LUT      | title: **ND Filter Stops on a Drone: How Underexposure Wrecks Your LUT Later** | intent: "drone nd filter", "aerial exposure"
- [ ] category: aerial  | type: LUT      | title: **Top-Down vs Reveal Shots: Why They Need Different Color Treatments in the Same Edit** | intent: "drone shot color", "top down reveal grade"
- [ ] category: aerial  | type: LUT      | title: **Grading Coastal Drone Shots: Cyan Water Without Cartoon Saturation** | intent: "drone water color", "coastal aerial grade"

### Editing / post / workflow (field)
- [ ] category: field   | type: BROADER  | title: **FCP for Travel Creators on a MacBook Air M3: What Actually Holds Up** | intent: "fcp macbook air travel", "fcp lightweight workflow"
- [ ] category: field   | type: BROADER  | title: **Proxies That Lie: Why My Wedding Edit Looked Sharper in Timeline Than in Export** | intent: "proxy color accurate", "wedding proxy workflow"
- [ ] category: field   | type: BROADER  | title: **Organizing a 30-Day Spiti Shoot: The Folder Structure I Wish I'd Started With** | intent: "long shoot folder structure", "media organization filmmaker"
- [ ] category: field   | type: BROADER  | title: **Exporting One Wedding Film for Instagram, YouTube, and the WhatsApp Family Group** | intent: "wedding film export", "multi platform delivery"
- [ ] category: field   | type: BROADER  | title: **Cleaning Up Generator Hum in iZotope RX 11 for an Outdoor Reception** | intent: "izotope rx generator hum", "wedding audio cleanup"
- [ ] category: field   | type: BROADER  | title: **Sound Design for a 90-Second Spiti Reel: Where the Foley Comes From** | intent: "travel reel sound design", "foley foundation"
- [ ] category: field   | type: BROADER  | title: **ADR on a ₹0 Budget: Re-recording a Documentary Interview in a Wardrobe** | intent: "diy adr documentary", "voice replacement budget"
- [ ] category: field   | type: LUT      | title: **Installing .cube LUTs in Premiere Pro vs DaVinci Resolve vs FCP** | intent: "install .cube lut", "how to use .cube file"
- [ ] category: field   | type: LUT      | title: **Why Your LUT Looks Right in Resolve and Wrong on Instagram** | intent: "lut instagram color", "platform color shift"
- [ ] category: field   | type: LUT      | title: **YouTube vs Instagram vs Reels: Three Color Spaces, One Master File** | intent: "delivery color space", "platform color management"
- [ ] category: field   | type: LUT      | title: **Roundtripping a Wedding Edit From Premiere to Resolve for Color** | intent: "premiere to resolve", "wedding color roundtrip"

### Business / running a film practice (field)
- [ ] category: field   | type: BROADER  | title: **Payment Delays from Wedding Clients: The Milestone Schedule That Cut Mine to Zero** | intent: "wedding payment delays", "freelance milestone invoice"
- [ ] category: field   | type: BROADER  | title: **GST on Freelance Video Work in India: When You Must Register, When You Shouldn't** | intent: "gst freelance video india", "tax filmmaker india"
- [ ] category: field   | type: BROADER  | title: **When to Hire Your First Assistant Editor: A Revenue Trigger, Not a Vibe Check** | intent: "first hire filmmaker", "editor hiring trigger"
- [ ] category: field   | type: BROADER  | title: **Pitching a Brand Film to a D2C Founder vs Booking a Wedding: Two Different Decks** | intent: "brand vs wedding pitch", "d2c film pitch"
- [ ] category: field   | type: BROADER  | title: **Building a Portfolio That Books ₹2L+ Weddings: 8 Films Beats 80 Reels** | intent: "wedding portfolio", "high ticket wedding booking"
- [ ] category: field   | type: BROADER  | title: **Instagram Reels Strategy for Indian Wedding Filmmakers: Three Posts, Not Thirty** | intent: "wedding filmmaker instagram", "reels strategy filmmaker"
- [ ] category: field   | type: BROADER  | title: **YouTube as a Portfolio in 2026: Why Long Films Outperform Highlights for Bookings** | intent: "youtube portfolio filmmaker", "long film discoverability"

### On-set / production (field)
- [ ] category: field   | type: BROADER  | title: **Call Sheets for a Three-Person Documentary Crew in Hampi** | intent: "doc crew call sheet", "lean crew production"
- [ ] category: field   | type: BROADER  | title: **Working with an Indian Art Director on a Brand Film: The Brief That Saves Three Days** | intent: "art director brief brand", "indian commercial film production"
- [ ] category: field   | type: BROADER  | title: **The Unwritten Rules Between Wedding Photographers and Videographers (And Who Owns the Aisle)** | intent: "wedding photo video team", "videographer photographer rules"
- [ ] category: field   | type: BROADER  | title: **When the Videographer Should NOT Shoot: Reading the Room at a Hindu Funeral Sequence in a Doc** | intent: "ethical filmmaking", "when not to shoot doc"
- [ ] category: field   | type: BROADER  | title: **Location Scouting Checklist for a Rajasthan Pre-Wedding: 22 Items in 4 Hours** | intent: "pre wedding scout checklist", "rajasthan location recce"
- [ ] category: field   | type: BROADER  | title: **Dealing with Drunk Groomsmen at the Cocktail: A De-Escalation Script** | intent: "wedding cocktail drunk", "on set conflict"

### Field notes / craft essays
- [ ] category: field   | type: BROADER  | title: **What 15 Years of Shooting Indian Weddings Taught Me About the Vidaai** | intent: "vidaai filmmaking", "wedding career reflection"
- [ ] category: field   | type: BROADER  | title: **Why We Stopped Chasing 120fps Slow-Mo at Weddings** | intent: "wedding slow motion overuse", "filmmaking restraint"
- [ ] category: field   | type: BROADER  | title: **The Case for the Boring Wide Shot at the Mandap** | intent: "wide shot wedding", "wedding coverage discipline"
- [ ] category: field   | type: BROADER  | title: **Why Our Wedding Edits Got 90 Seconds Shorter in 2025** | intent: "wedding edit pacing", "shorter wedding films"
- [ ] category: field   | type: BROADER  | title: **How Documentary Discipline Shows Up in Our Brand Work** | intent: "documentary commercial work", "doc to brand crossover"
- [ ] category: field   | type: BROADER  | title: **The Year We Said No to 40 Weddings — And What Happened to Revenue** | intent: "filmmaker say no", "boutique wedding business"

### Craft / technical (LUT)
- [ ] category: craft   | type: LUT      | title: **33-Point vs 65-Point Cube Files: Does Resolution Actually Matter?** | intent: ".cube file size", "33 vs 65 point lut"
- [ ] category: craft   | type: LUT      | title: **Why Your LUT Posterizes Skies — The Dithering Fix Most Editors Skip** | intent: "lut sky banding", "posterize fix grade"
- [ ] category: craft   | type: LUT      | title: **HDR vs SDR Delivery: Why the Same LUT Won't Survive the Trip** | intent: "hdr sdr lut", "delivery space color"
- [ ] category: craft   | type: LUT      | title: **Building a Show LUT for a Multi-Day Wedding Shoot** | intent: "show lut wedding", "base grade workflow"
- [ ] category: craft   | type: LUT      | title: **Why "Neutral" LUTs Aren't Neutral — How to Test One in Under 60 Seconds** | intent: "test a lut", "neutral lut quality"
- [ ] category: craft   | type: LUT      | title: **The Skin Tone Line on the Vectorscope Lies for Indian Skin — Here's a Better Reference** | intent: "vectorscope skin tone line", "indian skin reference"
- [ ] category: craft   | type: LUT      | title: **Parade vs Waveform vs Vectorscope: Which One to Trust for Color Matching** | intent: "scopes color match", "parade waveform vectorscope"
- [ ] category: craft   | type: LUT      | title: **What Is a .cube File, Really? A Plain-English Guide** | intent: "what is .cube file", "lut file format"
- [ ] category: craft   | type: LUT      | title: **LUT vs Preset vs Filter: Why They're Not the Same Thing** | intent: "lut vs preset", "lut vs filter"
- [ ] category: craft   | type: LUT      | title: **What "Log Footage" Actually Means and Why It Looks Grey** | intent: "what is log footage", "why log looks flat"
- [ ] category: craft   | type: LUT      | title: **709 vs 2020 vs P3: A Filmmaker's Map of Color Spaces** | intent: "color space explained", "rec709 rec2020 p3"
- [ ] category: craft   | type: LUT      | title: **Free LUTs vs Paid LUTs: What You're Actually Buying** | intent: "free vs paid luts", "are paid luts worth it"
- [ ] category: craft   | type: LUT      | title: **How to Test if a LUT Is Worth Installing in Under 60 Seconds** | intent: "test lut quality", "lut quick check"
- [ ] category: craft   | type: LUT      | title: **Why Your Phone's Screen Lies About Your Color Grade** | intent: "monitor calibration grading", "phone color accurate"

---

## Published

- [x] 2026-05-25 | slug: grading-jaisalmer-desert-haze-without-killing-the-gold | category: travel | title: **Grading Jaisalmer Desert Haze Without Killing the Gold**
- [x] 2026-05-20 | slug: premiere-vs-resolve-indian-wedding-edit-m2-pro-speed-test | category: field | title: **Premiere vs Resolve for an Indian Wedding Edit: The Honest Speed Test on an M2 Pro**
- [x] 2026-05-18 | slug: color-space-transform-order-resolve-cst-then-lut | category: craft | title: **Color Space Transform Order in Resolve: Why CST-Then-LUT Beats LUT-Then-CST**
- [x] 2026-05-15 | slug: sangeet-tungsten-correction-banquet-hall | category: wedding | title: **Why Your Sangeet Footage Looks Yellow — Neutralizing Banquet Hall Tungsten**
- [x] 2026-05-13 | slug: dgca-drone-permissions-2026-digital-sky-workflow | category: aerial | title: **DGCA Drone Permissions in 2026: The Digital Sky Workflow That Actually Works**
- [x] 2026-05-11 | slug: monsoon-greens-kerala-sony-color-grade | category: travel | title: **Why Monsoon Greens in Kerala Look Radioactive on Sony Cameras**
- [x] 2026-05-08 | slug: fx30-skin-tones-cooler-than-fx3-single-node-fix | category: gear | title: **Why FX30's Skin Tones Read Cooler Than FX3 — and the Single Node That Fixes It**
- [x] 2026-05-06 | slug: lav-mic-silk-lehenga-tape-trick-sangeet | category: wedding | title: **Why Lavalier Mics Pop on Silk Lehengas (And the Tape Trick That Saves the Sangeet)**
- [x] 2026-05-04 | slug: color-grading-mandap-fire-lehenga-highlights | category: wedding | title: **Color-Grading Mandap Fire Without Blowing Out the Bride's Lehenga**
- [x] 2026-05-01 | slug: magenta-sunsets-goa-rec709-lut-gamut-wall | category: travel | title: **Magenta Sunsets in Goa: When Your Rec.709 LUT Hits the Gamut Wall**
- [x] 2026-04-22 | slug: why-s-log3-lut-looks-flat-cst-node | category: craft | title: **Why Applying a LUT Directly to S-Log3 Looks Flat — The CST Node You're Missing**
- [x] 2026-04-24 | slug: indian-skin-tones-orange-rec709-wedding-luts | category: wedding | title: **Why Indian Skin Tones Go Orange Under Rec.709 Wedding LUTs (And the One Node That Fixes It)**
- [x] 2026-04-27 | slug: lut-crushing-blacks-pre-lut-exposure-workflow | category: craft | title: **Why Your LUT Crushes Blacks — A Pre-LUT Exposure Workflow That Saves Every Grade**
- [x] 2026-04-29 | slug: mandap-fire-mixed-lighting-wedding-reception-node-tree | category: wedding | title: **Mixed Tungsten + LED + Mandap Fire: A Wedding Reception Node Tree That Actually Works**
- [x] 2026-05-01 | slug: color-matching-a7s3-fx3-wedding-multicam-resolve | category: gear | title: **Color-Matching A7S III to FX3 on a Wedding Multicam Edit (Resolve, 2026)**
