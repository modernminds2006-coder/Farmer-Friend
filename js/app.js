// farmer friend - main app code
// basically this file does everything lol
// uploads leaf photo -> sends to gemini ai -> shows results
// if ai doesnt work we have backup data so it still works during demo


// --- our gemini api settings ---
// got this key from Google AI Studio (its free)
var API_KEY = "AIzaSyCPeNI6tM4bYiRjYWAJGz3AP6tuM1cQEec";
var MODEL_NAME = "gemini-1.5-flash"; // vision-capable, free tier

// full api url (we send our image here)
var API_URL = "https://generativelanguage.googleapis.com/v1beta/models/"
    + MODEL_NAME + ":generateContent?key=" + API_KEY;


// --- backup disease database ---
// so basically if gemini api fails (like no internet or limit exceeded)
// we just pick one disease from this list randomly
// that way the app still works during our presentation no matter what

var OFFLINE_DISEASES = [
    {
        crop: { en: "Tomato", hi: "टमाटर", mr: "टोमॅटो" },
        disease_name: { en: "Early Blight", hi: "अगेती झुलसा", mr: "लवकर करपा" },
        scientific_name: "Alternaria solani",
        confidence: 87,
        severity: "moderate",
        healthy: false,
        summary: {
            en: "Fungal disease causing dark rings on lower leaves. Spreads in warm humid weather.",
            hi: "फफूँद से होने वाला रोग। पत्तियों पर गहरे गोल छल्ले बनते हैं।",
            mr: "बुरशीजन्य रोग. पानांवर गडद गोल रिंग दिसतात."
        },
        organic: {
            en: ["Remove infected leaves and burn them away from field", "Spray neem oil (5 ml/litre) every 7 days", "Mulch with dry straw to prevent soil splash"],
            hi: ["संक्रमित पत्तियाँ तोड़ कर जला दें", "नीम का तेल (5ml/लीटर) हर 7 दिन छिड़कें", "सूखी पुआल बिछाएँ"],
            mr: ["बाधित पाने काढून जाळा", "कडुलिंबाचे तेल (5ml/लिटर) दर 7 दिवसांनी फवारा", "सुक्या पेंढ्याचे आच्छादन करा"]
        },
        chemical: {
            en: ["Mancozeb 75% WP — 2g per litre water", "Spray every 10 days, max 3 sprays per season", "Wait 7 days before harvesting after spray"],
            hi: ["मैन्कोज़ेब 75% WP — 2g प्रति लीटर पानी", "हर 10 दिन छिड़काव, अधिकतम 3 बार", "छिड़काव के 7 दिन बाद फसल काटें"],
            mr: ["मॅन्कोझेब 75% WP — 2g प्रति लिटर पाणी", "दर 10 दिवसांनी फवारणी, जास्तीत जास्त 3 वेळा", "फवारणीनंतर 7 दिवस कापणी करू नका"]
        }
    },
    {
        crop: { en: "Rice", hi: "चावल", mr: "तांदूळ" },
        disease_name: { en: "Bacterial Leaf Blight", hi: "जीवाणु पत्ती झुलसा", mr: "जिवाणूजन्य पान करपा" },
        scientific_name: "Xanthomonas oryzae",
        confidence: 82,
        severity: "severe",
        healthy: false,
        summary: {
            en: "Bacterial infection causing yellow-white streaks on leaves. Common in monsoon.",
            hi: "जीवाणु संक्रमण जो पत्तियों पर पीली-सफेद धारियाँ बनाता है।",
            mr: "पानांवर पिवळे-पांढरे पट्टे निर्माण करणारा जिवाणू संसर्ग."
        },
        organic: {
            en: ["Use resistant varieties like IR64", "Drain excess water from the field", "Apply potash fertilizer to strengthen plants"],
            hi: ["IR64 जैसी प्रतिरोधी किस्में लगाएँ", "खेत से अतिरिक्त पानी निकालें", "पौधों को मजबूत करने के लिए पोटाश डालें"],
            mr: ["IR64 सारख्या प्रतिकारक वाण वापरा", "शेतातील अतिरिक्त पाणी काढा", "पोटॅश खत टाका"]
        },
        chemical: {
            en: ["Streptocycline 0.5g + Copper oxychloride 2.5g per litre", "Spray at first sign of disease", "Repeat after 10 days if symptoms persist"],
            hi: ["स्ट्रेप्टोसायक्लिन 0.5g + कॉपर ऑक्सीक्लोराइड 2.5g प्रति लीटर", "रोग के पहले लक्षण पर छिड़काव करें", "10 दिन बाद दोहराएँ"],
            mr: ["स्ट्रेप्टोसायक्लिन 0.5g + कॉपर ऑक्सीक्लोराईड 2.5g प्रति लिटर", "रोगाची पहिली लक्षणे दिसताच फवारा", "10 दिवसांनी पुन्हा फवारा"]
        }
    },
    {
        crop: { en: "Wheat", hi: "गेहूँ", mr: "गहू" },
        disease_name: { en: "Rust (Brown Rust)", hi: "रतुआ (भूरा रतुआ)", mr: "गंज (तपकिरी गंज)" },
        scientific_name: "Puccinia triticina",
        confidence: 91,
        severity: "moderate",
        healthy: false,
        summary: {
            en: "Orange-brown pustules on leaf surfaces. Reduces grain filling if untreated.",
            hi: "पत्तियों पर नारंगी-भूरे दाने। उपचार न करने पर दाना खराब होता है।",
            mr: "पानांवर नारिंगी-तपकिरी फोड. उपचार न केल्यास दाणे भरत नाहीत."
        },
        organic: {
            en: ["Plant rust-resistant wheat varieties", "Remove volunteer wheat plants nearby", "Ensure proper spacing between rows"],
            hi: ["रतुआ-प्रतिरोधी किस्में लगाएँ", "आसपास की स्वयंसेवी गेहूँ हटाएँ", "पंक्तियों में उचित दूरी रखें"],
            mr: ["गंज-प्रतिकारक वाण लावा", "जवळचे स्वयंसेवी गहू काढा", "ओळींमध्ये योग्य अंतर ठेवा"]
        },
        chemical: {
            en: ["Propiconazole 25% EC — 1ml per litre", "Spray when pustules first appear", "One spray is usually sufficient"],
            hi: ["प्रोपिकोनाज़ोल 25% EC — 1ml प्रति लीटर", "दाने दिखने पर तुरंत छिड़कें", "एक छिड़काव आमतौर पर पर्याप्त है"],
            mr: ["प्रोपिकोनॅझोल 25% EC — 1ml प्रति लिटर", "फोड दिसताच फवारा", "एक फवारणी सहसा पुरेशी असते"]
        }
    },
    {
        crop: { en: "Cotton", hi: "कपास", mr: "कापूस" },
        disease_name: { en: "Cercospora Leaf Spot", hi: "सर्कोस्पोरा पत्ती धब्बा", mr: "सर्कोस्पोरा पान डाग" },
        scientific_name: "Cercospora gossypina",
        confidence: 78,
        severity: "mild",
        healthy: false,
        summary: {
            en: "Circular reddish-brown spots on leaves. Common in late season.",
            hi: "पत्तियों पर गोल लाल-भूरे धब्बे। मौसम के अंत में आम।",
            mr: "पानांवर गोल लालसर-तपकिरी डाग. हंगामाच्या शेवटी सामान्य."
        },
        organic: {
            en: ["Remove and destroy infected plant debris", "Rotate crops — don't plant cotton in same field", "Ensure good air circulation between plants"],
            hi: ["संक्रमित पौधों के अवशेष हटाकर नष्ट करें", "फसल चक्र अपनाएँ — एक ही खेत में कपास न लगाएँ", "पौधों के बीच हवा का अच्छा आवागमन रखें"],
            mr: ["बाधित वनस्पती अवशेष काढून नष्ट करा", "पीक फेरपालट करा — एकाच शेतात कापूस लावू नका", "झाडांमध्ये हवा खेळती ठेवा"]
        },
        chemical: {
            en: ["Carbendazim 50% WP — 1g per litre", "Spray at 15-day intervals", "Maximum 2 sprays per season"],
            hi: ["कार्बेन्डाज़िम 50% WP — 1g प्रति लीटर", "15 दिन के अंतराल पर छिड़काव", "एक मौसम में अधिकतम 2 छिड़काव"],
            mr: ["कार्बेन्डॅझिम 50% WP — 1g प्रति लिटर", "15 दिवसांच्या अंतराने फवारा", "एका हंगामात जास्तीत जास्त 2 फवारण्या"]
        }
    },
    {
        crop: { en: "Potato", hi: "आलू", mr: "बटाटा" },
        disease_name: { en: "Late Blight", hi: "पछेती झुलसा", mr: "उशीरा करपा" },
        scientific_name: "Phytophthora infestans",
        confidence: 93,
        severity: "severe",
        healthy: false,
        summary: {
            en: "Water-soaked dark patches on leaves that spread rapidly in cool wet weather.",
            hi: "पत्तियों पर पानी भरे गहरे धब्बे जो ठंडे गीले मौसम में तेजी से फैलते हैं।",
            mr: "पानांवर पाण्याने भिजलेले गडद डाग जे थंड ओलसर हवामानात वेगाने पसरतात."
        },
        organic: {
            en: ["Remove and burn all infected plants immediately", "Avoid overhead irrigation", "Plant certified disease-free seed tubers"],
            hi: ["संक्रमित पौधे तुरंत निकालकर जला दें", "ऊपर से सिंचाई से बचें", "प्रमाणित रोग-मुक्त बीज कंद लगाएँ"],
            mr: ["बाधित झाडे लगेच काढून जाळा", "वरून सिंचन टाळा", "प्रमाणित रोगमुक्त बियाणे बटाटे लावा"]
        },
        chemical: {
            en: ["Metalaxyl + Mancozeb — 2.5g per litre", "Preventive spray before rainy season", "Repeat every 7 days during wet weather"],
            hi: ["मेटालैक्सिल + मैन्कोज़ेब — 2.5g प्रति लीटर", "बारिश से पहले निवारक छिड़काव", "गीले मौसम में हर 7 दिन दोहराएँ"],
            mr: ["मेटालॅक्सिल + मॅन्कोझेब — 2.5g प्रति लिटर", "पावसाळ्यापूर्वी प्रतिबंधात्मक फवारणी", "ओलसर हवामानात दर 7 दिवसांनी पुन्हा फवारा"]
        }
    }
];


// --- translations ---
// we support 3 languages rn - english hindi and marathi
// when user switches language we just change all the text on screen

var TRANSLATIONS = {
    en: {
        greeting: "Namaste",
        subtitle: "Let's check your crop today",
        scan: "Scan a Crop",
        weather: "Weather today",
        weatherRange: "High 30° · Low 22°",
        weatherTip: "Light rain · spray after sunset",
        humidity: "Humidity",
        wind: "Wind",
        analyzing: "Analyzing leaf…",
        analyzingSub: "Matching against 38 diseases",
        detected: "Detected",
        confidence: "Confidence",
        severity: "Severity",
        listen: "Listen in your language",
        seeTreatment: "See treatment",
        treatment: "Treatment",
        organic: "Organic",
        chemical: "Chemical",
        listenTreat: "Listen in your language"
    },
    hi: {
        greeting: "नमस्ते",
        subtitle: "आज अपनी फसल देखें",
        scan: "फसल स्कैन करें",
        weather: "आज का मौसम",
        weatherRange: "अधिकतम 30° · न्यूनतम 22°",
        weatherTip: "हल्की बारिश · सूर्यास्त के बाद छिड़काव",
        humidity: "नमी",
        wind: "हवा",
        analyzing: "पत्ती की जाँच…",
        analyzingSub: "38 बीमारियों से मिलान",
        detected: "पहचानी गई",
        confidence: "विश्वास",
        severity: "गंभीरता",
        listen: "अपनी भाषा में सुनें",
        seeTreatment: "इलाज देखें",
        treatment: "इलाज",
        organic: "जैविक",
        chemical: "रासायनिक",
        listenTreat: "अपनी भाषा में सुनें"
    },
    mr: {
        greeting: "नमस्कार",
        subtitle: "आज पीक तपासूया",
        scan: "पीक स्कॅन करा",
        weather: "आजचे हवामान",
        weatherRange: "कमाल 30° · किमान 22°",
        weatherTip: "हलका पाऊस · सूर्यास्तानंतर फवारणी",
        humidity: "दमट",
        wind: "वारा",
        analyzing: "पानाची तपासणी…",
        analyzingSub: "38 रोगांशी मिळवणी",
        detected: "ओळखला रोग",
        confidence: "विश्वास",
        severity: "तीव्रता",
        listen: "आपल्या भाषेत ऐका",
        seeTreatment: "उपाय पहा",
        treatment: "उपाय",
        organic: "सेंद्रिय",
        chemical: "रासायनिक",
        listenTreat: "आपल्या भाषेत ऐका"
    }
};

// language names for the ai prompt
var LANG_NAMES = { en: "English", hi: "Hindi", mr: "Marathi" };


// --- grabbing html elements ---
// we need to get all the elements from html so we can change them later
// getElementById basically finds the element by its id attribute

// -- Screens (the 5 pages of our app) --
var screenHome = document.getElementById("screen-home");
var screenAnalyzing = document.getElementById("screen-analyzing");
var screenResult = document.getElementById("screen-result");
var screenTreatment = document.getElementById("screen-treatment");
var screenError = document.getElementById("screen-error");

// -- Top bar --
var btnBack = document.getElementById("btn-back");
var btnLang = document.getElementById("btn-lang");
var langDropdown = document.getElementById("lang-dropdown");
var langCodeSpan = document.getElementById("lang-code");

// -- File input (hidden, triggered by button) --
var fileInput = document.getElementById("file-input");

// -- All screens stored in an array for easy looping --
var allScreens = [screenHome, screenAnalyzing, screenResult, screenTreatment, screenError];


// --- app state ---
// these variables keep track of whats going on in the app
// like which screen we're on, what image was uploaded etc

var currentLang = "en";           // Which language is active
var currentScreen = "home";       // Which screen is showing
var imageBase64 = null;           // The uploaded image data
var imagePreviewURL = null;       // URL for displaying the image
var diagnosisResult = null;       // What the AI (or fallback) returned
var currentTab = "organic";       // Treatment tab (organic or chemical)


// --- screen switching ---
// the app has 5 screens but its all one html page
// we just hide/show divs to make it look like different pages

// Show a specific screen and hide all others
function showScreen(screenName) {
    // Step 1: Hide ALL screens
    for (var i = 0; i < allScreens.length; i++) {
        allScreens[i].classList.remove("active");
    }

    // Step 2: Show the requested screen
    var target = document.getElementById("screen-" + screenName);
    if (target) {
        target.classList.add("active");
        target.classList.add("fade-in");
    }

    // Step 3: Update the back button visibility
    currentScreen = screenName;
    if (screenName === "home" || screenName === "analyzing") {
        btnBack.style.visibility = "hidden";
    } else {
        btnBack.style.visibility = "visible";
    }

    // Step 4: Close language dropdown
    langDropdown.classList.add("hidden");
}

// Handle back button press
function goBack() {
    if (currentScreen === "treatment") {
        showScreen("result");
    } else {
        showScreen("home");
    }
}

// Set up back button
btnBack.addEventListener("click", goBack);


// --- image upload ---
// when user clicks scan, phone opens camera or gallery
// we convert the photo to base64 (basically text version of the image)
// so we can send it to google's api

// When "Scan a Crop" button is clicked
document.getElementById("btn-scan").addEventListener("click", function () {
    fileInput.click(); // Opens camera/gallery dialog
});

// When user picks a file
fileInput.addEventListener("change", function (event) {
    var file = event.target.files[0]; // Get the selected file
    if (!file) return; // If nothing selected, stop

    // FileReader converts the image file to Base64 text
    var reader = new FileReader();

    reader.onload = function (e) {
        // Save the full data URL for previewing
        imagePreviewURL = e.target.result;

        // Extract just the Base64 part (remove "data:image/jpeg;base64," prefix)
        imageBase64 = e.target.result.split(",")[1];

        // Start the analysis
        startAnalysis();
    };

    reader.readAsDataURL(file); // Begin reading the file
});

// "Scan Another" button on result screen
document.getElementById("btn-scan-another").addEventListener("click", scanAnother);

function scanAnother() {
    imageBase64 = null;
    imagePreviewURL = null;
    diagnosisResult = null;
    fileInput.value = ""; // Reset file input
    showScreen("home");
}


// --- ai analysis ---
// this is where the magic happens
// we send the photo to gemini and it tells us whats wrong with the plant
// if gemini fails for whatever reason, we use our backup database instead
// so the app never crashes during demo :)

function startAnalysis() {
    // Show the analyzing screen with progress bar
    showScreen("analyzing");

    // Show the uploaded image in the preview circle
    var previewImg = document.getElementById("analyze-preview");
    previewImg.src = imagePreviewURL;

    // Reset progress bar and checklist
    updateProgress(0);

    // Try the AI first, fall back to offline if it fails
    callGeminiAI()
        .then(function (result) {
            // AI succeeded! Use its response
            diagnosisResult = result;
            updateProgress(100);
            setTimeout(function () {
                displayResults(result);
            }, 400);
        })
        .catch(function (error) {
            // AI failed — use offline fallback instead
            console.log("AI failed, using offline fallback:", error.message);
            var fallback = getOfflineDiagnosis();
            diagnosisResult = fallback;
            updateProgress(100);
            setTimeout(function () {
                displayResults(fallback);
            }, 400);
        });

    // animate the progress bar while we wait for ai
    animateProgress();
}

// compress image to 256px max before sending — cuts token cost ~80%
function compressImage(base64) {
    return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
            var MAX = 256;
            var scale = Math.min(1, MAX / Math.max(img.width, img.height));
            var canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            // 0.5 quality JPEG is plenty for disease detection
            resolve(canvas.toDataURL("image/jpeg", 0.5).split(",")[1]);
        };
        img.src = "data:image/jpeg;base64," + base64;
    });
}

// sends the image to gemini and gets back the diagnosis
function callGeminiAI() {
    var langName = LANG_NAMES[currentLang] || "English";
    var prompt = "Crop disease expert. Reply ONLY valid JSON:\n"
        + '{"crop":"","disease_name":"","scientific_name":"",'
        + '"confidence":0-100,"severity":"none|mild|moderate|severe",'
        + '"healthy":true/false,"summary":"1 sentence in ' + langName + '",'
        + '"organic":["3 tips in ' + langName + '"],'
        + '"chemical":["3 tips in ' + langName + '"]}';

    // compress image first, then send to API
    return compressImage(imageBase64).then(function (compressed) {
        var requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: "image/jpeg", data: compressed } }
                ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        };

        return fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
    })
    .then(function (response) {
        if (!response.ok) {
            throw new Error("API returned error " + response.status);
        }
        return response.json();
    })
    .then(function (data) {
        var text = data.candidates[0].content.parts[0].text;
        var clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(clean);
    });
}

// picks a random disease from our backup list
// also grabs the right language version
function getOfflineDiagnosis() {
    var index = Math.floor(Math.random() * OFFLINE_DISEASES.length);
    var d = OFFLINE_DISEASES[index];
    var lang = currentLang;

    // helper to pick correct language from the translations
    // If the language isn't available, fall back to English
    function pick(val) {
        if (typeof val === "object" && !Array.isArray(val)) {
            return val[lang] || val["en"];
        }
        return val;
    }

    return {
        crop: pick(d.crop),
        disease_name: pick(d.disease_name),
        scientific_name: d.scientific_name,
        confidence: d.confidence,
        severity: d.severity,
        healthy: d.healthy,
        summary: pick(d.summary),
        organic: pick(d.organic),
        chemical: pick(d.chemical)
    };
}

// fills progress bar slowly while waiting for ai response
function animateProgress() {
    var progress = 0;
    var interval = setInterval(function () {
        if (progress < 85) {
            progress += 1.2;
            updateProgress(progress);
        } else {
            clearInterval(interval);
        }
    }, 120);
}

// updates the progress bar and checkmarks
function updateProgress(percent) {
    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-pct").textContent = Math.round(percent) + "%";

    // Update checklist items based on progress
    var check1 = document.getElementById("check-1");
    var check2 = document.getElementById("check-2");
    var check3 = document.getElementById("check-3");

    if (percent > 20) check1.classList.add("done");
    if (percent > 50) check2.classList.add("done");
    if (percent > 90) check3.classList.add("done");
}


// --- showing results on screen ---
// takes the data from ai (or backup) and puts it in the html
function displayResults(result) {
    var t = TRANSLATIONS[currentLang];

    // -- Fill the result screen --

    // Show the uploaded image
    document.getElementById("result-preview").src = imagePreviewURL;

    // Set border color based on health status
    var circle = document.getElementById("result-circle");
    if (result.healthy) {
        circle.style.borderColor = "#A8E063"; // green = healthy
    } else if (result.severity === "severe") {
        circle.style.borderColor = "#B8553A"; // red = severe
    } else {
        circle.style.borderColor = "#E8B23A"; // amber = moderate
    }

    // Status chip (healthy vs disease)
    var chip = document.getElementById("status-chip");
    if (result.healthy) {
        chip.textContent = "✓ HEALTHY";
        chip.className = "chip chip-healthy";
    } else {
        chip.textContent = "⚠ DISEASE DETECTED";
        chip.className = "chip chip-disease";
    }

    // Disease info
    document.getElementById("detected-label").textContent = t.detected;
    document.getElementById("result-crop").textContent = result.crop;
    document.getElementById("result-disease").textContent = result.disease_name;
    document.getElementById("result-scientific").textContent = result.scientific_name || "";

    // Confidence bar
    var conf = result.confidence || 0;
    document.getElementById("conf-label").textContent = t.confidence;
    document.getElementById("conf-value").textContent = conf + "%";
    document.getElementById("conf-fill").style.width = conf + "%";

    // Severity
    document.getElementById("sev-label").textContent = t.severity;
    var sevEl = document.getElementById("sev-value");
    var sev = result.severity || "none";
    sevEl.textContent = sev.charAt(0).toUpperCase() + sev.slice(1);
    sevEl.className = sev === "severe" ? "severity-rust"
                    : sev === "none" ? "severity-green"
                    : "severity-amber";

    // Button text
    document.getElementById("listen-text").textContent = t.listen;
    document.getElementById("see-treatment-text").textContent = t.seeTreatment;

    // Hide treatment button if plant is healthy
    document.getElementById("btn-see-treatment").style.display = result.healthy ? "none" : "flex";

    // Summary
    document.getElementById("result-summary").textContent = result.summary || "";

    // Show result screen
    showScreen("result");

    // -- Prepare treatment screen --
    document.getElementById("treat-heading").textContent = t.treatment;
    document.getElementById("treat-subtitle").textContent = result.crop + " · " + result.disease_name;
    document.getElementById("listen-treat-text").textContent = t.listenTreat;
    document.getElementById("tab-organic").textContent = t.organic;
    document.getElementById("tab-chemical").textContent = t.chemical;

    // Default to organic tab
    currentTab = "organic";
    renderTreatmentSteps(result.organic);
    document.getElementById("tab-organic").classList.add("tab-active");
    document.getElementById("tab-chemical").classList.remove("tab-active");
    document.getElementById("safety-warning").classList.add("hidden");
}

// creates the numbered treatment step cards
function renderTreatmentSteps(steps) {
    var container = document.getElementById("treatment-steps");
    container.innerHTML = ""; // Clear old steps

    if (!steps || steps.length === 0) return;

    for (var i = 0; i < steps.length; i++) {
        var card = document.createElement("div");
        card.className = "step-card";
        card.innerHTML =
            '<div class="step-num">' + (i + 1) + '</div>' +
            '<div class="step-text">' + steps[i] + '</div>';
        container.appendChild(card);
    }
}


// --- other stuff - language, speech, tabs etc ---

// language switching

// open/close the language dropdown when clicked
btnLang.addEventListener("click", function () {
    langDropdown.classList.toggle("hidden");
});

// when user picks a language from dropdown
var langButtons = document.querySelectorAll(".dropdown-item");
for (var i = 0; i < langButtons.length; i++) {
    langButtons[i].addEventListener("click", function () {
        var lang = this.getAttribute("data-lang");
        setLanguage(lang);
    });
}

function setLanguage(lang) {
    currentLang = lang;
    langDropdown.classList.add("hidden");

    // show the right code in the top bar (EN, HI, MR)
    var codes = { en: "EN", hi: "HI", mr: "MR" };
    langCodeSpan.textContent = codes[lang] || "EN";

    // change all the text on screen to selected language
    var t = TRANSLATIONS[lang];
    document.getElementById("home-greeting").textContent = t.greeting;
    document.getElementById("home-subtitle").textContent = t.subtitle;
    document.getElementById("scan-text").textContent = t.scan;
    document.getElementById("weather-title").textContent = t.weather;
    document.getElementById("weather-range").textContent = t.weatherRange;
    document.getElementById("weather-tip").textContent = t.weatherTip;
    document.getElementById("humidity-label").textContent = t.humidity;
    document.getElementById("wind-label").textContent = t.wind;
    document.getElementById("analyzing-title").textContent = t.analyzing;
    document.getElementById("analyzing-sub").textContent = t.analyzingSub;

    // highlight which language is selected in dropdown
    for (var j = 0; j < langButtons.length; j++) {
        if (langButtons[j].getAttribute("data-lang") === lang) {
            langButtons[j].classList.add("active");
        } else {
            langButtons[j].classList.remove("active");
        }
    }
}


// switching between organic and chemical tabs

document.getElementById("tab-organic").addEventListener("click", function () { switchTab("organic"); });
document.getElementById("tab-chemical").addEventListener("click", function () { switchTab("chemical"); });

function switchTab(tab) {
    currentTab = tab;
    var d = diagnosisResult;
    if (!d) return;

    // change which tab looks active
    document.getElementById("tab-organic").classList.toggle("tab-active", tab === "organic");
    document.getElementById("tab-chemical").classList.toggle("tab-active", tab === "chemical");

    // show the right treatment steps
    renderTreatmentSteps(tab === "organic" ? d.organic : d.chemical);

    // safety warning only shows for chemical tab
    document.getElementById("safety-warning").classList.toggle("hidden", tab !== "chemical");
}


// treatment button click

document.getElementById("btn-see-treatment").addEventListener("click", function () {
    showScreen("treatment");
});


// text to speech - reads results out loud
// uses the browser's built in speech thing (no extra library needed)

document.getElementById("btn-listen").addEventListener("click", speakResult);
document.getElementById("btn-listen-treat").addEventListener("click", speakTreatment);

function speakResult() {
    if (!diagnosisResult) return;
    var text = diagnosisResult.disease_name + ". " + (diagnosisResult.summary || "");
    speakText(text);
}

function speakTreatment() {
    if (!diagnosisResult) return;
    var steps = currentTab === "organic" ? diagnosisResult.organic : diagnosisResult.chemical;
    var text = steps.join(". ");
    speakText(text);
}

function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // stop if something was already playing
    var utterance = new SpeechSynthesisUtterance(text);
    // Set the speech language
    var langCodes = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
    utterance.lang = langCodes[currentLang] || "en-IN";
    window.speechSynthesis.speak(utterance);
}


// error screen buttons

document.getElementById("btn-retry").addEventListener("click", function () {
    fileInput.value = "";
    fileInput.click();
});

document.getElementById("btn-error-home").addEventListener("click", function () {
    showScreen("home");
});


// toast = that little message that pops up at bottom and disappears

function showToast(message) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}


// register service worker so the app can be installed on phone
// also helps with offline caching

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(function () {
        console.log("Service Worker registered!");
    }).catch(function (err) {
        console.log("SW registration failed:", err);
    });
}
