# Deploy the JSA site to S3 static hosting (Windows / PowerShell).
#   $env:BUCKET="justice-society-of-activism"; $env:REGION="us-east-1"; .\deploy.ps1
$ErrorActionPreference = "Stop"
$Bucket = $env:BUCKET
$Region = if ($env:REGION) { $env:REGION } else { "us-east-1" }
if (-not $Bucket) { Write-Host "Set BUCKET first:  `$env:BUCKET='your-bucket-name'" -ForegroundColor Red; exit 1 }

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
  Write-Host "AWS CLI not installed. Use the console path in DEPLOY.md (drag-and-drop upload)." -ForegroundColor Yellow
  exit 1
}
aws sts get-caller-identity | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "No AWS credentials. Run: aws configure" -ForegroundColor Red; exit 1 }

$Site = Join-Path (Split-Path -Parent $PSScriptRoot) "site"
$Here = $PSScriptRoot

Write-Host "==> Bucket $Bucket in $Region"
$exists = aws s3api head-bucket --bucket $Bucket 2>$null
if ($LASTEXITCODE -ne 0) {
  if ($Region -eq "us-east-1") { aws s3api create-bucket --bucket $Bucket --region $Region | Out-Null }
  else { aws s3api create-bucket --bucket $Bucket --region $Region --create-bucket-configuration LocationConstraint=$Region | Out-Null }
}

Write-Host "==> Allow public access"
aws s3api put-public-access-block --bucket $Bucket --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" | Out-Null

Write-Host "==> Website hosting + CORS"
aws s3api put-bucket-website --bucket $Bucket --website-configuration "file://$Here\website-config.json" | Out-Null
aws s3api put-bucket-cors   --bucket $Bucket --cors-configuration "file://$Here\cors.json" | Out-Null

Write-Host "==> Upload site\"
aws s3 sync $Site "s3://$Bucket" --delete --region $Region --cache-control "public,max-age=3600"

Write-Host "==> Bucket policy"
$policy = (Get-Content "$Here\bucket-policy.json" -Raw) -replace '__BUCKET__', $Bucket
Set-Content -Path "$env:TEMP\jsa-policy.json" -Value $policy
aws s3api put-bucket-policy --bucket $Bucket --policy "file://$env:TEMP\jsa-policy.json" | Out-Null

Write-Host ""
Write-Host "Done. Your site:" -ForegroundColor Green
Write-Host "  http://$Bucket.s3-website.$Region.amazonaws.com/"
