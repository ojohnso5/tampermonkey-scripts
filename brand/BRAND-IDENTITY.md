# JUSTICE SOCIETY OF ACTIVISM
## Brand Identity — Master Document

> **A superhero-themed civic engagement organisation operating as a modern
> digital media company.**
> Not children's content. Not comic-book parody. Not a cartoon channel.
> Not a gaming brand.

This is the authoritative reference for the brand. The asset specification and
usage rules live in [BRAND-GUIDELINES.md](BRAND-GUIDELINES.md); this document
covers who we are, how we look, and how we speak.

---

## 1. Positioning

**Justice Society of Activism** is an independent, member-funded reporting
studio and media network that follows the paper trail — court filings, budget
records, FOIA releases — and turns it into stories people can act on.

| | |
|---|---|
| **Category** | Investigative journalism · civic engagement · global activism |
| **Form** | Modern digital media network, YouTube-first |
| **Voice** | Evidence-led, calm under pressure, never breathless |
| **Audience** | People who want to know what actually happened, and what to do next |
| **Proposition** | The world powers the mission. The mission powers the hero. |

### Personality

**Truth · Justice · Accountability · Civic Engagement · Activism ·
Leadership · Transparency · Global Awareness**

These are not decoration. Each one has a behavioural consequence:

| Value | What it means in practice |
|---|---|
| **Truth** | Every claim is sourced. If we can't verify it, we don't air it. |
| **Justice** | We follow procedure as well as outrage. |
| **Accountability** | We name who holds the power. We never soften a finding. |
| **Civic Engagement** | Every video ends with something a person can actually do. |
| **Activism** | We are for something, not merely against something. |
| **Leadership** | We show the method, not just the conclusion. |
| **Transparency** | Corrections are pinned to the video and linked. |
| **Global Awareness** | The story is local; the consequences are not. |

---

## 2. Art direction

**Premium cinematic. Elegant. Powerful. Recognisable.**

Superhero symbolism is used as a *metaphor* for accountability, truth,
leadership and action — the hero is the evidence made visible, the crest is
the institution, and the globe is the world the mission operates in. Nothing
in the system is campy.

### Visual principles

1. **One idea per frame.** A crest, a headline, a number. Never three.
2. **Dark field, lit subject.** Midnight black carries the composition. Light
   does the work. Nothing floats on white.
3. **Gold is structure.** It draws the ring, the trim, the type. It never
   fills a large area.
4. **Blue is energy and truth.** It is the globe's core, the network, the
   monogram's energy — always moving, always luminous.
5. **Red is urgency.** Reserved for the aura, the cape, the play controls and
   the subscribe button. Never a large flat fill.
6. **The subject reads as metal, not paint.** See §4.

### The mark

| Layer | Treatment |
|---|---|
| Hero | Futuristic figure in a forward flight pose, head to the upper right, cape streaming lower left. Modern tactical armour — layered plates, bevelled edges, gold trim. ~7.5 heads tall: heroic, not comic-book. |
| Globe | Beneath the hero. Electric-blue luminous core, gold continents, gold framing, network arcs wrapping the sphere. The power source. |
| Chest emblem | The JSA monogram **engraved into the armour**, not applied on top. Gold structure, blue energy threaded through the negative space. |
| Ring | Brushed metallic gold, anisotropic reflection. |
| Halo | Electric blue, inside the ring. |
| Aura | Activism red, outside the ring. |

The hero is deliberately kept **dark** and separated from the field with a
backlit halo, so the silhouette survives at 64 px. Gold trim and rim light
carry the metallic read without losing it.

### Lighting model

Applied consistently across every asset.

| Light | Direction | Colour | What it does |
|---|---|---|---|
| **Key** | upper left | warm gold | Defines the metal, the hero's leading contour |
| **Fill** | lower right | electric blue | Bounce off the globe; separates the figure from the field |
| **Rim** | trailing edge | activism red | The cape and the far contour |

---

## 3. Colour

| Token | Hex | Meaning | Usage |
|---|---|---|---|
| **Midnight Black** | `#0B0B0F` | Authority, strength, professionalism | The field. 60–70% of any frame. |
| **Activism Red** | `#E11937` | Action, courage, urgency | The aura, the cape, play controls, subscribe. ≤ 10%. |
| **Justice Gold** | `#D4AF37` | Leadership, integrity, achievement | The ring, the trim, the type, the rules. ~15%. |
| **Truth Blue** | `#00AEEF` | Truth, transparency, intelligence, connectivity | The globe core, the network, the monogram's energy. ~10%. |

Supporting tones: gold-light `#F2DFA0`, gold-deep `#8A6D1F`, red-deep
`#8E0F24`, blue-light `#7FE0FF`.

**Ratio discipline.** Black carries the frame. Gold carries structure. Blue
carries energy. Red carries urgency and is never a large fill.

---

## 4. Materials

Pure vector cannot be physically rendered, but it can reproduce what makes
metal read as metal. `src/materials.js` provides the shared treatment so every
gold surface in the system behaves identically.

| Treatment | What it does |
|---|---|
| **Anisotropic reflection** | Sharp bright and deep shadow bands instead of a smooth ramp — a polished surface reflects a hard environment. |
| **Brushed micro-streaks** | Fine directional grain, masked to the shape it sits on. |
| **Specular highlight** | One hard, bright edge where the key light lands. |
| **Environment band** | The soft mid-tone the metal sits in. |

Measured on the crest ring: luminance range **54–238**, anisotropy
(sd/mean) **0.312** — hard bands, not a smooth ramp.

---

## 5. Typography

| Face | Use |
|---|---|
| **Bebas Neue** | All display type. Headlines, wordmark, lockups, labels. |
| **Montserrat** 700 / 800 | Kickers, body, UI, descriptions, handles. |

Both are embedded as base64 WOFF2 inside every SVG, so files render
identically anywhere with no font install.

- Display type is **all caps**, tracked out, never justified.
- Kicker: Montserrat 800, tracked `0.18em`, gold or red, with a colour block.
- Headline: Bebas Neue, max **4 words** on a thumbnail.
- Body: Montserrat 700, generous leading, never below 24 px on video.

---

## 6. Voice

The voice is the brand's sharpest tool. It must match the art: cinematic,
not sensational.

### Principles

1. **Lead with the finding, not the outrage.** "The council approved the sale
   in a closed session" — not "SHOCKING SECRET."
2. **Name who holds the power.** Specific institutions, specific people,
   specific dollar amounts.
3. **Show the method.** If we used a public-records request, we say so.
4. **One ask.** Every video ends with something a viewer can do this week.
5. **No false urgency.** No "YOU WON'T BELIEVE" unless the document genuinely
   is that surprising. The evidence should create the urgency.
6. **Correct in public.** A pinned correction with a timestamp is a badge,
   not a weakness.

### Do / Don't

| Write | Not |
|---|---|
| "The county approved it in 41 seconds." | "They sold your water in SECRET." |
| "Here is the 14-page filing." | "They don't want you to see this." |
| "What you can do about it tonight." | "Are you angry yet?" |
| "We got 4,100 comments. Here is what we got wrong." | "Comment section is fire." |
| "Follow the money." | "Follow me for more." |

### Channel voice

The channel speaks in the first person plural — *we* investigated, *we* filed,
*we* found. Never "I" for the studio, and never "they" for a person who has
not been named in the record.

---

## 7. Motion

Motion is cinematic and unhurried. Nothing bounces. Nothing spins for
decoration. Every move has a cause in the narrative.

| Beat | Motion |
|---|---|
| Energy | Rises. Always upward, from the globe into the emblem. |
| The emblem | Forms out of the energy, then settles onto the chest. |
| The hero | Flies through frame, decelerating into place. Motion trails, never motion blur as a gimmick. |
| The ring | Draws around the hero with a single rotation. |
| The aura | Ignites — a hot flash, then a steady burn. |
| Type | Enters on a short fade and track-in. Never a typewriter, never a bounce. |

Timing: the logo sequence is **5.0 seconds, nine scenes**. Cuts are on the
beat; nothing lands in the first 0.45 s because the audience needs a dark
frame to read against.

---

## 8. Recognisability

The mark has to survive the smallest place it will ever appear — a 32 px
avatar in a comment thread, a 16 px favicon, a notification badge.

Rules that make that work:

- **The gold ring** is the first read: a hard bright circle against a dark
  field, legible at any size.
- **The globe** is the second read: a distinct blue disc, unmistakably a
  sphere with continents.
- **The hero** is the third read: a dark silhouette with gold trim, clearly a
  figure in flight.
- **The monogram** is the fourth read, and the one that names us.

Verified: at 64 px the ring, the cape, the globe and the emblem all remain
distinguishable.

---

## 9. What we never do

- We never use cartoon language, mascot behaviour or comic-book humour.
- We never put a face on the hero.
- We never use stock "justice" imagery — no gavels, no Lady Liberty, no
  scales of justice.
- We never show a city skyline in the logo. The globe is the world.
- We never use more than four colours in one frame.
- We never let red become the background.
- We never add text to the crest.
- We never crop the gold ring.
- We never claim a finding we cannot source.

---

## 10. Asset inventory

| Asset | Size | File |
|---|---|---|
| Primary crest (transparent) | 1024² | `out/logo-crest.svg` |
| Crest on midnight | 1024² | `out/logo-crest-solid.svg` |
| Crest for light backgrounds | 1024² | `out/logo-crest-dark.svg` |
| Profile picture | 800→64 | `out/avatar-800.png` |
| Channel banner + 4 variants | 2560×1440 | `out/banner.svg` |
| Video watermark | 512² | `out/watermark.svg` |
| End screen | 1920×1080 | `out/end-screen.svg` |
| Animated logo | 1920×1080, 5 s | `out/intro.svg`, `out/intro-1920x1080.mp4` |
| Thumbnail system (6 + blank) | 1280×720 | `out/thumb-*.svg` |
| App icon | 192 / 512 | `out/icon-512.svg` |

Sources: [`src/`](src) — one palette, one globe projection, one hero, one
emblem, one material system, one layout. Every asset regenerates from them.

```bash
node brand/build.js --png     # rebuild everything
node brand/src/safearea.js    # verify the banner crop
node brand/src/fit.js         # re-fit banner type
```
