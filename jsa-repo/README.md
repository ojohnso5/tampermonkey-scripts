# Justice Society of Activism — Channel Toolkit

Everything for the YouTube channel
[@JusticeSocietyofActivism](https://www.youtube.com/@JusticeSocietyofActivism):
the brand package, the channel page, the YouTube Studio userscript, and the
S3 hosting kit.

## Start here

| If you want to… | Open |
|---|---|
| Publish the channel | [`setup.html`](setup.html) (double-click, runs in any browser) |
| See the brand system | [`brand/BRAND-IDENTITY.md`](brand/BRAND-IDENTITY.md) |
| Use an asset | [`brand/out/`](brand/out) |
| Upload to YouTube | [`brand/channel-kit/`](brand/channel-kit) |
| Host the site | [`deploy/DEPLOY.md`](deploy/DEPLOY.md) |

## Layout

```
site/        the static website (S3-ready): channel page, wizard, kit
brand/       the generative brand system + built assets + channel kit
  src/       sources (palette, globe, hero, crest, banner, intro, materials)
  out/       built SVG / PNG / MP4
  channel-kit/  numbered upload-ready files + copy-paste metadata
assets/      styles + logic for the channel page
scripts/     justice-society-studio.user.js (Tampermonkey, runs on youtube.com)
deploy/      S3 static-hosting configs + scripts + instructions
```

## Rebuild

```bash
node brand/build.js --png      # regenerate every asset
node brand/src/safearea.js     # verify the banner crop
node brand/src/embed.js        # re-embed art into the userscript
```

## Hosting

```bash
BUCKET=your-bucket REGION=us-east-1 ./deploy/deploy.sh     # macOS / Linux
$env:BUCKET='your-bucket'; .\deploy\deploy.ps1             # Windows
```

Or use the console-only path in [`deploy/DEPLOY.md`](deploy/DEPLOY.md).
