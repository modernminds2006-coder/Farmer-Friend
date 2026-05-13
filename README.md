# Farmer Friend — AI Crop Disease Classifier

> **SYCET IGNITE Hackathon 2026** | Shreeyash College of Engineering and Technology

A mobile-first Progressive Web App (PWA) that helps Indian farmers identify crop diseases instantly by photographing a leaf. Powered by Google Gemini AI with full offline fallback support.

---

## Problem Statement

Indian farmers lose **20–40% of their annual crop yield** to plant diseases every year. Most farmers lack access to expert agronomists, especially in rural areas. By the time a disease is identified and treated, large portions of the crop are already damaged.

**Farmer Friend solves this** by putting an AI disease expert in every farmer's pocket — no agronomist, no internet required.

---

## Solution

1. Farmer takes a photo of a diseased leaf (camera or gallery)
2. Image is compressed and sent to Google Gemini AI
3. AI identifies the crop, disease, confidence level, and severity
4. App displays diagnosis + organic and chemical treatment steps
5. Results are read aloud in the farmer's language via Text-to-Speech
6. If no internet — app uses a built-in offline disease database as fallback

---

## Features

| Feature | Description |
|---------|-------------|
| AI Diagnosis | Google Gemini 1.5 Flash analyzes the leaf image |
| 3 Languages | English, Hindi (हिन्दी), Marathi (मराठी) — UI + AI results |
| Text-to-Speech | Results read aloud in selected language |
| Offline Fallback | Built-in database of 5 major crop diseases works without internet |
| PWA | Installable on Android/iOS, works offline after first load |
| Image Compression | Canvas API compresses image to 256px before sending — saves API credits |
| Severity Indicator | Color-coded: green (healthy), amber (moderate), red (severe) |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | App structure — 5 screens in a single page |
| CSS3 | All visual styling, animations, responsive layout |
| Vanilla JavaScript | All app logic — no frameworks |
| Google Gemini 1.5 Flash API | AI image analysis and disease diagnosis |
| Web Speech API | Text-to-speech in regional languages |
| Canvas API | Client-side image compression before API call |
| Service Worker | Offline caching — PWA functionality |
| Web App Manifest | Makes app installable on mobile |

**No frameworks. No build tools. No dependencies.** Just HTML + CSS + JS.

---

## Project Structure

```
Farmer Friend/
├── index.html              — All 5 app screens (single HTML file)
├── css/
│   └── style.css           — All visual styles
├── js/
│   └── app.js              — All app logic (AI, navigation, speech, offline)
├── assets/
│   └── farmer-character.webp  — Home screen illustration
├── icons/
│   ├── icon-192.png        — PWA icon (small)
│   └── icon-512.png        — PWA icon (large)
├── manifest.json           — PWA configuration
├── sw.js                   — Service Worker for offline support
└── README.md               — This file
```

**3 core code files:** `index.html`, `css/style.css`, `js/app.js`

---

## App Screens

1. **Home** — Language selector, farmer illustration, Scan button, weather card
2. **Analyzing** — Live progress bar with checklist while AI processes the image
3. **Result** — Disease name, confidence bar, severity chip, summary, speak button
4. **Treatment** — Organic / Chemical tabs with numbered step cards
5. **Error** — Shown only if both AI and offline fallback fail (very rare)

---

## How to Run

### Option 1 — Python (recommended)
```bash
cd "Farmer Friend"
python -m http.server 8080
```
Open `http://localhost:8080` in browser.

### Option 2 — Node.js
```bash
npx serve .
```
Open the printed URL in browser.

### Option 3 — VS Code
Install the **Live Server** extension → right-click `index.html` → Open with Live Server.

> **Note:** Must be served over HTTP (not opened as a local file) for the camera and Service Worker to work.

---

## How the AI Works

```
User picks photo
       ↓
Canvas API compresses to 256×256px JPEG (saves ~80% tokens)
       ↓
Base64 encoded and sent to Gemini 1.5 Flash via REST API
       ↓
Gemini returns JSON: { crop, disease_name, confidence, severity, summary, organic[], chemical[] }
       ↓
App displays results in selected language
       ↓
(If API fails) → Random disease from offline fallback database shown instead
```

---

## Offline Fallback Database

Five diseases are hardcoded with full multilingual data:

| Crop | Disease | Scientific Name |
|------|---------|-----------------|
| Tomato | Early Blight | Alternaria solani |
| Rice | Bacterial Leaf Blight | Xanthomonas oryzae |
| Wheat | Brown Rust | Puccinia triticina |
| Cotton | Cercospora Leaf Spot | Cercospora gossypina |
| Potato | Late Blight | Phytophthora infestans |

---

## Challenges Faced

- **API Rate Limits** — Free Gemini tier has per-minute quotas. Solved with Canvas image compression (reduces token usage ~80%) and an offline fallback so demos never fail.
- **Image Size** — Raw camera images are 3–8 MB. Sending these to the API was slow and expensive. Canvas compression to 256px JPEG fixed both problems.
- **Regional Language TTS** — Web Speech API voice availability varies by device. Added `en-IN`, `hi-IN`, `mr-IN` language codes for best regional voice matching.
- **PWA Offline Support** — Service Worker must be served over HTTPS/localhost. Documented this clearly in setup instructions.

---

## Future Scope

- [ ] Real-time GPS-based weather data (OpenWeatherMap API)
- [ ] History log of past scans stored in localStorage
- [ ] Expand offline database to 50+ diseases
- [ ] Marketplace link to buy recommended pesticides locally
- [ ] WhatsApp share button for treatment steps
- [ ] Voice input — farmer describes symptoms verbally

---

## API Key Notice

The Gemini API key is embedded in the frontend for demo purposes only. In production, API calls would be proxied through a backend server to keep the key secret.

---

## Team Details

**Team Name:** ModernMinds
**College:** Shreeyash College of Engineering and Technology (SYCET)
**Event:** SYCET IGNITE Hackathon 2026

| Name | Role |
|------|------|
| *(Add your name)* | Full Stack / AI Integration |
| *(Add team member)* | UI/UX Design |

---

## Screenshots

*(Add screenshots of the app here)*

| Home Screen | Analyzing | Result | Treatment |
|-------------|-----------|--------|-----------|
| *(screenshot)* | *(screenshot)* | *(screenshot)* | *(screenshot)* |
