#!/usr/bin/env bash
# Deploy the JSA site to S3 static hosting.
#   BUCKET=my-jsa-site REGION=us-east-1 ./deploy.sh
set -euo pipefail

BUCKET="${BUCKET:?set BUCKET, e.g. BUCKET=justice-society-of-activism}"
REGION="${REGION:-us-east-1}"
SITE="$(cd "$(dirname "$0")/.." && pwd)/site"

command -v aws >/dev/null || { echo "AWS CLI not found. Install it or use the console path in DEPLOY.md"; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "No AWS credentials configured. Run: aws configure"; exit 1; }

echo "==> Bucket $BUCKET in $REGION"
aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null || \
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION" || true)

echo "==> Allow public access (required for a public website)"
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

echo "==> Static website hosting"
aws s3api put-bucket-website --bucket "$BUCKET" --website-configuration file://"$(dirname "$0")/website-config.json"

echo "==> CORS"
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration file://"$(dirname "$0")/cors.json"

echo "==> Upload site/"
aws s3 sync "$SITE" "s3://$BUCKET" --delete --region "$REGION" \
  --cache-control "public,max-age=3600"

echo "==> Bucket policy"
sed "s/__BUCKET__/$BUCKET/g" "$(dirname "$0")/bucket-policy.json" > /tmp/jsa-policy.json
aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/jsa-policy.json

echo
echo "Done. Your site:"
echo "  http://$BUCKET.s3-website.$REGION.amazonaws.com/"
echo "  (add a custom domain + CloudFront + HTTPS later; see DEPLOY.md)"
