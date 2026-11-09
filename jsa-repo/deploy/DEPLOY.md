# Hosting the JSA site on Amazon S3

The site in `site/` is fully static — no build step, no server code. S3
static website hosting is the cheapest way to run it (a few cents a month).

Two paths. Use **A** if you have the AWS CLI; use **B** if you only have the
AWS web console.

---

## Path A — AWS CLI (one command)

```bash
# macOS / Linux
BUCKET=justice-society-of-activism REGION=us-east-1 ./deploy.sh

# Windows PowerShell
$env:BUCKET='justice-society-of-activism'; $env:REGION='us-east-1'; .\deploy.ps1
```

The script creates the bucket, turns off the public-access block (required
for a public website), enables static hosting, sets CORS, uploads `site/`,
and applies the read-only bucket policy. It prints your URL:

```
http://justice-society-of-activism.s3-website.us-east-1.amazonaws.com/
```

Bucket names are global — if the name is taken, pick another (e.g. add your
initials). Keep it lowercase, no spaces.

---

## Path B — AWS Console only (no CLI)

1. **Create the bucket**
   S3 → *Create bucket* → name it (e.g. `justice-society-of-activism`) →
   region of your choice → **uncheck** *Block all public access* → confirm
   the warning → *Create bucket*.

2. **Enable static hosting**
   Bucket → *Properties* tab → scroll to *Static website hosting* → *Edit* →
   Enable → Index document `index.html` → Error document `index.html` → Save.

3. **Upload the site**
   Bucket → *Objects* tab → *Upload* → drag the **contents** of the `site/`
   folder (the folders `assets`, `brand`, `kit` and the two HTML files) →
   *Upload*.

4. **Make it public**
   Bucket → *Permissions* tab → *Bucket policy* → *Edit* → paste this with
   your bucket name substituted for `YOUR-BUCKET`:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadForWebsite",
       "Effect": "Allow",
       "Principal": { "AWS": "*" },
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::YOUR-BUCKET/*"
     }]
   }
   ```

5. **Open it**
   Bucket → *Properties* → *Static website hosting* → copy the *Bucket
   website endpoint* and open it.

---

## What each URL serves

| Path | Content |
|---|---|
| `/` | The Justice Society channel page |
| `/setup.html` | The YouTube Studio setup wizard |
| `/brand/out/intro-preview.html` | The 5-second logo animation, playable |
| `/kit/` | The numbered channel kit (downloadable) |

---

## Going further (optional)

- **HTTPS + custom domain.** S3 website endpoints are HTTP only. Put
  CloudFront in front (origin = the bucket website endpoint), add your domain
  via Route 53 or any DNS provider, and attach a free ACM certificate.
  CloudFront also caches the site at the edge, which is faster and cheaper.
- **Cache busting.** Re-run the deploy after any change; `deploy.sh` uses
  `--delete` so removed files disappear too.
- **Keep the kit private.** If you'd rather not publish `kit/`, delete that
  folder from `site/` before uploading — the channel page doesn't need it.

## Cost

S3 standard storage ~$0.023/GB-month, GET requests ~$0.40 per million. A site
this size with modest traffic is well under $1/month. CloudFront adds a few
cents. The free tier covers the first 12 months for a new account.
