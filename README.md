# tampermonkey-scripts
Collection of Tampermonkey userscripts for automation
# Tampermonkey Scripts Collection

A collection of Tampermonkey userscripts for automation and web enhancement by ojohnso5.

## 🚀 Quick Install

Click any script link below to install directly in Tampermonkey:

### Available Scripts

| Script | Description | Install Link | Version |
|--------|-------------|--------------|---------|
| **Auto Fixer** | Automatically fixes common web issues with AWS & Power Automate integration | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/tampermonkey-auto-fixer.user.js) | 1.0.0 |
| **Excel AWS Integration** | Connects Excel with AWS services | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/excel-aws-integration.user.js) | 1.0.0 |
| **Power Automate Helper** | Enhances Power Automate workflows | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/powerautomate-helper.user.js) | 1.0.0 |
| **Justice Society of Activism — Channel Studio** | Composer for videos / Shorts / Reels / short films, revenue planner, branding kit, and optional brand styling on your own YouTube channel page | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js) | 1.0.0 |

### Static Pages

| Page | Description | Open |
|------|-------------|------|
| **Justice Society of Activism — Channel** | Full channel landing page: hero, featured documentary, tabs for Videos / Shorts / Live / Playlists / Community / About / Support, membership tiers, working composer and Studio & Monetization panel | [justice-society.html](justice-society.html) |
| **YouTube Page** | Generic YouTube-style UI (top bar, sidebar, chip filters, search, video grid, player modal). No dependencies, works offline. | [youtube-page.html](youtube-page.html) |

### Brand Assets — Justice Society of Activism

| Asset | Size | File |
|-------|------|------|
| Channel logo (seal) | 800×800 | [brand/logo.svg](brand/logo.svg) |
| Profile picture | 800×800 | [brand/avatar.svg](brand/avatar.svg) |
| Channel banner | 2560×1440 | [brand/banner.svg](brand/banner.svg) |

**Color tokens** — Justice Red `#ef233c`, Justice Gold `#ffb703`, Ink `#0a0a0c`, Panel `#16161c`

> **Note on the banner:** YouTube crops banner art differently on every device. The
> wordmark and seal in `brand/banner.svg` are positioned inside YouTube's safe area
> (x 507–2053, y 423–1017) so nothing is cut off on TVs, desktops, or phones.

### 💰 Monetization notes

YouTube has no public API that lets a script create a channel or upload on your
behalf — so nothing in this repo tries to fake one. The Justice Society toolkit is
built the legitimate way:

1. **Compose** your brief (title, description, tags, visibility, schedule, monetization switches).
2. **Hand off** to your real YouTube Studio with those fields pre-filled, then upload the file and publish on your own account.
3. **Model the return** in the revenue planner (views × CPM + sponsorship slots + membership lift).
4. **Dress the channel** with the brand kit, and optionally auto-apply the JSA banner/avatar on your channel page.

This keeps the account safe and every upload traceable to a real person.

## 📋 Installation Instructions

1. **Install Tampermonkey** extension in your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) | [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd))
2. **Click any install link** above
3. **Click "Install"** when Tampermonkey prompts you
4. **Scripts auto-update** when changes are pushed

## 📁 Repository Structure

