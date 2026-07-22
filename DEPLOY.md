# CodeSheets — AWS Deployment Guide
# S3 + CloudFront + Route 53

## Stack
- **S3** — static file hosting (Next.js `next export` output)
- **CloudFront** — CDN + HTTPS + URL rewriting
- **Route 53** — DNS for codesheets.dev
- **ACM** — SSL certificate (us-east-1 required for CloudFront)

---

## 1. Build

```bash
npm install
npm run build           # next build + next export → ./out/
node scripts/generate-sitemap.js  # generates out/sitemap.xml + robots.txt
```

---

## 2. S3 Bucket

```bash
# Create bucket (must match domain for static hosting)
aws s3 mb s3://codesheets.dev --region us-east-1

# Disable public access block (CloudFront will handle access control)
aws s3api put-public-access-block \
  --bucket codesheets.dev \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Sync build output
aws s3 sync ./out s3://codesheets.dev \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# HTML files should NOT be cached aggressively
aws s3 cp ./out/index.html s3://codesheets.dev/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Use this deploy script instead:
# npm run deploy
```

---

## 3. CloudFront Distribution

Create via Console or with this AWS CLI config:

```json
{
  "Origins": [{
    "DomainName": "codesheets.dev.s3.us-east-1.amazonaws.com",
    "S3OriginConfig": { "OriginAccessIdentity": "" }
  }],
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": [
    {
      "ErrorCode": 403,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html",
      "ErrorCachingMinTTL": 0
    },
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html",
      "ErrorCachingMinTTL": 0
    }
  ],
  "ViewerCertificate": {
    "AcmCertificateArn": "arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID",
    "SslSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Aliases": ["codesheets.dev", "www.codesheets.dev"],
  "HttpVersion": "http2and3",
  "PriceClass": "PriceClass_100"
}
```

**Key setting:** The `CustomErrorResponses` 403/404 → `index.html` is what makes
`/python/core` work. CloudFront doesn't find that path in S3 (because `trailingSlash: true`
creates `/python/core/index.html`), so update the response path to `/python/core/index.html`
OR use Next.js `trailingSlash: true` which creates real index.html files per route.

With `output: 'export'` and `trailingSlash: true` in next.config.js:
- `/python/core` → S3 serves `/python/core/index.html` ✓
- No CloudFront rewrite needed — each route has its own HTML file

---

## 4. Route 53

```bash
# Point your domain to CloudFront
# Create A record (alias) → CloudFront distribution domain
# Create AAAA record (alias) → same CloudFront distribution (for IPv6)
# Create www CNAME → CloudFront distribution domain
```

---

## 5. Deploy Script

Add to package.json scripts:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/generate-sitemap.js",
    "deploy": "npm run build && aws s3 sync ./out s3://codesheets.dev --delete && aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"
  }
}
```

---

## 6. Cache Strategy

| File type        | Cache-Control                          |
|-----------------|----------------------------------------|
| `*.html`         | `public, max-age=0, must-revalidate`  |
| `/_next/static/` | `public, max-age=31536000, immutable` |
| `*.js`, `*.css`  | `public, max-age=31536000, immutable` |
| `sitemap.xml`    | `public, max-age=86400`               |

HTML is always revalidated → deploys take effect immediately.
JS/CSS is hashed by Next.js → safe to cache forever.

---

## 7. SEO Checklist

- [x] Each sheet has unique `<title>` and `<meta description>`
- [x] Canonical URLs set per page
- [x] Open Graph tags for social sharing
- [x] JSON-LD breadcrumb structured data
- [x] `sitemap.xml` at root
- [x] `robots.txt` at root
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Add Google Analytics / Plausible
