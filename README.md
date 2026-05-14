# Farmer Friend 🌿

**SYCET IGNITE Hackathon 2026 — Team ByDefault**

---

## What is this?

Farmer Friend is a web app that helps farmers figure out what disease their crop has, just by clicking a photo of the leaf.

You upload the photo, the app sends it to an AI, and within a few seconds it tells you what disease it is and how to treat it. It works in English, Hindi and Marathi. It can also read the results out loud so even farmers who can't read much can use it.

That's basically the whole idea.

---

## Why did we build this?

Honestly, more than 80% of farmers in India face crop losses because they don't get the right information at the right time. Seeing a doctor for your plant is not really a thing in villages. By the time they find someone who knows, half the crop is gone.

And the apps that already exist for this? Most of them are either too complicated, full of technical words, or they're just government portals that look like they were built in 2003.

We wanted to make something a normal farmer with a basic smartphone could actually open and use without getting confused.

---

## What it does

- Upload a leaf photo from your camera or gallery
- AI looks at the photo and tells you the disease name, how bad it is, and what to do about it
- You can choose your language  (English, Hindi or Marathi)
- The app reads the result out loud (text to speech)
- Even if there's no internet, the app still works using a built-in offline database we made
- It's a PWA so you can install it on your phone like a normal app

---

## How we built it

We kept it really simple — just HTML, CSS and plain JavaScript. No React, no frameworks, nothing fancy. We felt this way it's easier to understand and explain during the demo too.

For the AI part we used Google Gemini API. You send it the image and a prompt, it gives back a JSON with the disease details. We had to figure out the right way to ask the question (the prompt) so it gives back clean structured data every time.

---

## Challenges we actually faced (the real ones)

**The API kept failing.**
This was our biggest headache. We were getting 429 errors (too many requests) on almost every scan. We didn't understand why at first because we were only pressing the button once. Turns out our code had a bug where the API was being called multiple times in the background for a single scan — sometimes up to 4-8 times. So our free tier quota was getting used up really fast.

We fixed this by making sure the API call only happens exactly once, no retries, no fallbacks to other models. Just one clean call.

**The images were too big.**
We were sending the raw photo from the camera directly to the API. Camera photos can be 3-5 MB easily. That was eating up a lot of tokens (which costs money) and making the response slow. We used the Canvas API to compress the image down to 256 pixels before sending it. That cut the cost by around 80%.

**We got a huge bill once.**
Before we figured out the duplicate call bug, we had added a system that tried 4 different AI models one after the other if one failed. So one button press could trigger 8 API calls. That burned through credits really fast. Learned that the hard way. Now the app makes exactly one call per scan.

**Making it work offline.**
For the demo we were worried the API might be down or rate-limited right when we need it. So we built an offline fallback — a small database of 5 common diseases (Tomato Early Blight, Rice Bacterial Blight, Wheat Rust, Cotton Leaf Spot, Potato Late Blight) with full treatment info in all 3 languages. If the API fails for any reason, the app silently uses this instead and still shows a result.

---

## How to run it

You need to serve it over HTTP (not just open the HTML file directly, that breaks the camera).

**Option 1 — Python**
```
python -m http.server 8080
```

**Option 2 — PowerShell**

Press `Win + R` → type `powershell` → press Enter, then run:
```
cd "C:\Users\lenovo\Desktop\Antigravity Projects\Farmer Friend"; python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

**Option 3 — Node**
```
npx serve .
```

---

## Project files

```
index.html       — all 5 screens of the app
css/style.css    — all the styling
js/app.js        — all the logic (AI call, navigation, speech, offline stuff)
sw.js            — service worker for offline/PWA
manifest.json    — makes it installable on phone
assets/          — farmer illustration
icons/           — app icons
```

---

## Team ByDefault

**College:** Shreeyash College of Engineering and Technology

| Name | What they did |
|------|--------------|
| 01. Sagar | Ideation, UI design in Figma, user experience |
| 02. Akshay | Frontend CSS, responsive design, accessibility |
| 03. Asim | Backend logic, API integration, overall development |

We used Claude Code to help with API integration, debugging the 429 errors, and optimizing the image compression. We also had mentor guidance throughout which helped a lot especially with the technical decisions.

One of us also used skills from a QSpiders course to improve the layout and responsiveness of the UI.

---

## What we'd add if we had more time

- Real weather data from an actual API (right now the weather card is static)
- Let farmers describe symptoms by voice instead of typing
- Save scan history on the phone
- A WhatsApp button to share treatment steps with family or the village group
- Expand offline database to more crops and diseases

---

## One last thing

We didn't build this to impress anyone with complex tech. We built it because the people who grow our food deserve tools that actually work for them — simple, fast, in their language.

Thanks for reading 🙏
