# First Video — complete package

The first upload sets the channel's tone. This package is built around the
featured documentary from the channel page: **The Quiet Auction**.

---

## Title (pick one)

1. `The Quiet Auction: How a County Sold Its Water` ← recommended
2. `They Sold the Water in a Closed Session. We Have the Bids.`
3. `Who Owns Your Water? Following a $40M Paper Trail`

All three are under 70 characters, lead with the finding, and contain no
false urgency.

## Description (paste as-is)

```
Three years of sealed bids, one rural county, and the shell companies that
turned a public utility into a private windfall.

In this investigation we reconstruct the sale of a county water system from
the public record: 41 procurement filings, 3 closed-session minutes requests,
and 2 state audits. What we found is not a scandal of one bad actor. It is a
process that was legal at every step — and that is the problem.

TIMELINE
00:00  Intro
00:32  The notice nobody saw
03:10  What a sealed bid actually is
07:45  The three companies, one address
12:20  The closed session
18:05  What the state audit missed
24:40  The vote
29:15  What you can do about it tonight
33:02  Sources and method

SOURCES
Every document cited in this film is published, unredacted, at
https://data.justicesociety.org/quiet-auction

METHOD
We filed 3 public-records requests and 1 appeal. Response times, fees and
redactions are logged in the description pin. Where a document could not be
obtained, we say so on screen.

WHAT YOU CAN DO TONIGHT
1. Look up your own utility's ownership: https://data.justicesociety.org/lookup
2. Request your county's procurement log (template in the pinned comment)
3. Show up: the next rate hearing is on the calendar in the pinned comment

—
Justice Society of Activism is member-funded. No owners, no sponsors on this
film. Support the next investigation: https://justicesociety.org/give
New documentary every Thursday.
```

## Tags

```
water privatization, county water system, public utility, sealed bids, procurement, closed session, public records, FOIA, investigative journalism, local government, accountability, justice society of activism, follow the money, paper trail, municipal audit, rate hearing, public comment, documentary
```

## Category

News & Politics

## Thumbnail

Use `09-thumbnail-example.png` (EXPOSED) or generate a bespoke one:

```
Headline:  THEY SOLD
           THE WATER
Kicker:    JSA INVESTIGATION
Variant:   alert
Subject:   your presenter or the county building, right side
```

The template is in `brand/src/thumbnail.js`; change `headline`, `kicker`,
`variant` and pass `subject` as a data URI, then `node brand/build.js --png`.

## Assets to wire in your editor

| Asset | File | Placement |
|---|---|---|
| Intro | `04-intro-animation.mp4` | First 5 seconds of the timeline |
| Lower-third | `06-lower-third-episode.png` | Over each speaker introduction; kicker `EPISODE 01`, title `THE QUIET AUCTION` |
| Watermark | handled by YouTube | Studio → Branding (already set channel-wide) |
| End screen | `05-end-screen.png` | Last 20 seconds; add clickable elements in Studio |

## End screen elements (Studio → Content → End screen)

- Left: **Subscribe** element over the bottom-centre bar
- Right: playlist **Documentaries**
- Start 20s before end

## Pinned comment (post after publishing)

```
Two things you can use right now:

1. The procurement-log request template we used (copy, fill in your county,
send): https://justicesociety.org/guide/procurement

2. The full document set for this film, unredacted:
https://data.justicesociety.org/quiet-auction

If your county has done something similar, tell us what you find. We read
every tip and we verify before we air.
```

## Publish checklist

- [ ] Intro at 0:00
- [ ] Lower-third on first speaker intro
- [ ] Thumbnail uploaded (custom or `09`)
- [ ] Title, description, tags, category set
- [ ] Added to playlists: Documentaries, Start Here
- [ ] End screen set (20s before end)
- [ ] Cards: link to the dataset at 33:02
- [ ] Subtitles uploaded (auto-generated is not enough for a records film)
- [ ] Visibility: Public, scheduled Thursday 19:00 local
- [ ] Pinned comment posted within 1 hour of publish
