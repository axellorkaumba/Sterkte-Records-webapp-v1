import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

// ─── CONFIG ───
const EMAIL_CONFIG = {
  // INSTRUCTIONS : Va sur https://web3forms.com → entre contact.sterkterecords@gmail.com → copie la clé ici
  ACCESS_KEY: "fbc77d7c-6908-4bea-a57d-e267b09a8e76",
  ENDPOINT: "https://api.web3forms.com/submit",
};

// ─── COLORS ───
const C = {
  bg: "#0A0A0F", bgCard: "#12121A", bgHover: "#1A1A25", bgInput: "#16161F",
  border: "#2A2A35", white: "#FFFFFF", gold: "#F5C518", red: "#E63946",
  blue: "#4FC3F7", muted: "#8A8A9A", success: "#4CAF50",
};

// ─── SEO DATA PER ROUTE ───
const SEO = {
  "/": {
    title: "Sterkte Records – Label musical indépendant & distribution digitale",
    desc: "Label musical indépendant basé à Lubumbashi, RDC. Production, distribution digitale sur 150+ plateformes, studio, booking et management d'artistes africains.",
  },
  "/a-propos": {
    title: "À propos de Sterkte Records – Label passionné et innovant",
    desc: "Découvrez l'histoire, la vision et l'équipe de Sterkte Records, label indépendant fondé en 2020 à Lubumbashi pour accompagner les artistes africains.",
  },
  "/artistes": {
    title: "Nos artistes – Roster Sterkte Records",
    desc: "Découvrez les talents signés chez Sterkte Records : afrobeat, rap, R&B, rumba, gospel, amapiano. Artistes émergents d'Afrique et du monde.",
  },
  "/distribution-musique": {
    title: "Distribution musicale digitale – Sterkte Records",
    desc: "Distribuez votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes. Upload simple, suivi en temps réel, royalties transparentes.",
  },
  "/studio-enregistrement": {
    title: "Studio d'enregistrement professionnel – Sterkte Records Lubumbashi",
    desc: "Enregistrement, mixage et mastering professionnel à Lubumbashi. Studio équipé + option mobile. À partir de 50$/heure.",
  },
  "/booking-artistes": {
    title: "Booking artistes & événements – Sterkte Records",
    desc: "Réservez nos artistes pour concerts, festivals, événements privés et corporate. Gestion logistique complète en RDC et international.",
  },
  "/featurings": {
    title: "Demande de featuring – Collaboration musicale Sterkte Records",
    desc: "Collaborez avec les artistes Sterkte Records. Processus simple et transparent, réponse sous 7 jours ouvrés.",
  },
  "/services": {
    title: "Consulting & Management artistique – Sterkte Records",
    desc: "Stratégie de lancement, gestion de carrière, coaching artistique et optimisation des revenus. Accompagnement complet pour artistes.",
  },
  "/contact": {
    title: "Contact – Sterkte Records, Lubumbashi RDC",
    desc: "Contactez Sterkte Records pour distribution, studio, booking ou consulting. Email : contact.sterkterecords@gmail.com | +243 850 510 209",
  },
};

// ─── MOCK DATA ───
const ARTIST_GENRES = ["Tout", "Afrobeat", "Rap", "R&B", "Rumba", "Gospel", "Amapiano", "DJ"];
const ARTISTS = [
  { id: 1, name: "13 A LA PROD", tags: ["Afrobeat", "Gospel"], img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=face", streams: "245K", tracks: 12 },
  { id: 2, name: "GIFT RAPKHA", tags: ["R&B"], img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop&crop=face", streams: "189K", tracks: 8 },
  { id: 3, name: "MAFIA", tags: ["Amapiano", "DJ"], img: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=600&fit=crop&crop=face", streams: "520K", tracks: 24 },
  { id: 4, name: "MESA", tags: ["Rap"], img: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=600&fit=crop&crop=face", streams: "312K", tracks: 16 },
  { id: 5, name: "DREAZY YOUZOU", tags: ["Rumba"], img: "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=600&h=600&fit=crop&crop=face", streams: "156K", tracks: 6 },
  { id: 6, name: "MR FREEZ", tags: ["Rap"], img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&crop=face", streams: "410K", tracks: 19 },
  { id: 7, name: "FEYME", tags: ["R&B", "Afrobeat"], img: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=600&h=600&fit=crop&crop=face", streams: "178K", tracks: 9 },
  { id: 8, name: "KBG GAD", tags: ["Rap"], img: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=600&h=600&fit=crop&crop=face", streams: "267K", tracks: 14 },
  { id: 9, name: "SAM KAYA", tags: ["Gospel"], img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&h=600&fit=crop&crop=face", streams: "132K", tracks: 7 },
  { id: 10, name: "CHMARLEY", tags: ["Amapiano", "DJ"], img: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&h=600&fit=crop&crop=face", streams: "345K", tracks: 21 },
  { id: 11, name: "KING DAVE", tags: ["Afrobeat", "R&B"], img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop&crop=face", streams: "289K", tracks: 11 },
  { id: 12, name: "LOA30", tags: ["Rumba"], img: "https://images.unsplash.com/photo-1501386761578-0a55b6ea6e42?w=600&h=600&fit=crop&crop=face", streams: "198K", tracks: 10 },
];

const TESTIMONIALS = [
  { name: "DAVTOR", role: "Artiste Afrobeat", text: "Sterkte Records a changé ma carrière. En 3 mois, mes streams ont été multipliés par 5 et ma musique est maintenant disponible partout dans le monde." },
  { name: "13 A LA PROD", role: "DJ / Producteur", text: "Le studio est incroyable et l'équipe comprend vraiment la vision de l'artiste. Le suivi est transparent, les royalties arrivent chaque mois." },
  { name: "SHIKE REBEL", role: "Artiste Rumba", text: "Plus qu'un label, c'est une famille. Ils m'ont accompagnée du premier single jusqu'à mon premier concert sold-out à Lubumbashi." },
];

const SERVICES = [
  { icon: "🎵", title: "Distribution Digitale", desc: "Votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes en quelques jours. Suivi des streams et royalties en temps réel.", link: "/distribution-musique" },
  { icon: "🎙️", title: "Studio d'Enregistrement", desc: "Studio professionnel à Lubumbashi + option mobile. Enregistrement, mixage et mastering par des ingénieurs expérimentés.", link: "/studio-enregistrement" },
  { icon: "🎤", title: "Booking & Événements", desc: "Réservez nos artistes pour concerts, festivals et événements privés. Gestion logistique et contractuelle complète.", link: "/booking-artistes" },
  { icon: "🤝", title: "Featurings", desc: "Collaborez avec les artistes du roster Sterkte Records. Processus simple, réponse garantie sous 7 jours.", link: "/featurings" },
  { icon: "📊", title: "Consulting & Management", desc: "Stratégie de lancement, gestion de carrière, négociation de contrats et coaching artistique personnalisé.", link: "/services" },
  { icon: "👤", title: "Espace Artiste", desc: "Dashboard personnel : suivez vos streams, revenus et gérez vos sorties depuis votre espace dédié.", link: "/dashboard" },
];

// ─── HELPERS ───
function useSEO(path) {
  const seo = SEO[path] || SEO["/"];
  useEffect(() => {
    document.title = seo.title;
    let d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", seo.desc);
    let og = document.querySelector('meta[property="og:title"]');
    if (!og) { og = document.createElement("meta"); og.setAttribute("property", "og:title"); document.head.appendChild(og); }
    og.setAttribute("content", seo.title);
    let ogd = document.querySelector('meta[property="og:description"]');
    if (!ogd) { ogd = document.createElement("meta"); ogd.setAttribute("property", "og:description"); document.head.appendChild(ogd); }
    ogd.setAttribute("content", seo.desc);
  }, [path, seo]);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

async function sendEmail(data) {
  try {
    const formData = new FormData();
    formData.append("access_key", EMAIL_CONFIG.ACCESS_KEY);
    formData.append("subject", data.subject || "Nouveau message - Sterkte Records");
    formData.append("from_name", data.name || "Site Web");
    formData.append("to", "contact.sterkterecords@gmail.com");
    Object.entries(data).forEach(([k, v]) => {
      if (k !== "subject" && v && typeof v === "string") formData.append(k, v);
    });
    if (data.files) {
      data.files.forEach((f, i) => {
        formData.append(`fichier_${i + 1}_nom`, f.name);
        formData.append(`fichier_${i + 1}_taille`, `${(f.size / 1024 / 1024).toFixed(2)} MB`);
        formData.append(`fichier_${i + 1}_type`, f.type);
      });
    }
    const res = await fetch(EMAIL_CONFIG.ENDPOINT, { method: "POST", body: formData });
    const json = await res.json();
    return json.success;
  } catch (e) {
    console.error("Email error:", e);
    return false;
  }
}

// ─── STYLES ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${C.bg};--card:${C.bgCard};--hover:${C.bgHover};--input:${C.bgInput};--border:${C.border};--white:${C.white};--gold:${C.gold};--red:${C.red};--blue:${C.blue};--muted:${C.muted};--ok:${C.success}}
body{background:var(--bg);color:var(--white)}
.app{font-family:'Raleway',sans-serif;background:var(--bg);color:var(--white);min-height:100vh;overflow-x:hidden}
h1,h2,h3,h4,h5,h6{font-family:'Montserrat',sans-serif}
a{text-decoration:none;color:inherit}

/* NAV */
nav.n{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(42,42,53,0.5);transition:all .3s}
nav.n.s{background:rgba(10,10,15,0.95)}
.n-logo{display:flex;align-items:center;gap:10px}
.n-logo-t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.5px}
.n-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
.n-links{display:flex;align-items:center;gap:24px;list-style:none}
.n-links a{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);transition:color .3s;position:relative}
.n-links a:hover,.n-links a.ac{color:var(--white)}
.n-links a.ac::after{content:'';position:absolute;bottom:-4px;left:0;right:0;height:2px;background:var(--gold);border-radius:1px}
.n-acts{display:flex;gap:12px;align-items:center}
.n-ham{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}
.n-ham span{display:block;width:24px;height:2px;background:var(--white);transition:all .3s}

/* BTNS */
.btn{font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;letter-spacing:.5px;padding:10px 24px;border-radius:6px;cursor:pointer;transition:all .3s;border:none;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px}
.btn-r{background:var(--red);color:var(--white)}.btn-r:hover{background:#d32f3f;transform:translateY(-1px);box-shadow:0 8px 25px rgba(230,57,70,.3)}
.btn-o{background:transparent;color:var(--white);border:1px solid var(--border)}.btn-o:hover{border-color:var(--gold);color:var(--gold)}
.btn-g{background:var(--gold);color:#000}.btn-g:hover{background:#ddb115;transform:translateY(-1px);box-shadow:0 8px 25px rgba(245,197,24,.3)}
.btn-b{background:var(--blue);color:#000}.btn-b:hover{background:#3ab0e8}
.btn-lg{padding:14px 36px;font-size:14px;border-radius:8px}.btn-sm{padding:8px 16px;font-size:11px}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:100px 60px 60px}
.hero-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse at 20% 50%,rgba(230,57,70,.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(245,197,24,.06) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(79,195,247,.04) 0%,transparent 50%),var(--bg)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(42,42,53,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(42,42,53,.15) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 70%)}
.hero-c{position:relative;z-index:1;max-width:720px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.2);padding:6px 16px;border-radius:20px;margin-bottom:28px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero h1{font-size:clamp(40px,6vw,72px);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:24px}
.gold{color:var(--gold)}.red{color:var(--red)}
.hero-sub{font-size:17px;line-height:1.7;color:var(--muted);max-width:560px;margin-bottom:36px}
.hero-acts{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:60px}
.hero-stats{display:flex;gap:48px;padding-top:40px;border-top:1px solid var(--border)}
.stat-v{font-family:'Montserrat',sans-serif;font-size:32px;font-weight:800}
.stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-family:'Montserrat',sans-serif;font-weight:500}

/* SECTIONS */
.sec{padding:100px 60px;position:relative}
.sec-h{text-align:center;margin-bottom:64px}
.sec-tag{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.sec-title{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1px;margin-bottom:16px}
.sec-desc{font-size:16px;color:var(--muted);max-width:600px;margin:0 auto;line-height:1.7;text-align:justify}

/* SERVICES GRID */
.srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.srv{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;cursor:pointer;transition:all .4s;position:relative;overflow:hidden}
.srv:hover{border-color:var(--gold);background:var(--hover);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.srv-ico{font-size:32px;margin-bottom:20px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:rgba(245,197,24,.08);border-radius:12px}
.srv h3{font-size:18px;font-weight:700;margin-bottom:10px}
.srv p{font-size:14px;color:var(--muted);line-height:1.6;text-align:justify}
.srv-arr{position:absolute;top:28px;right:28px;color:var(--gold);opacity:0;transition:all .3s;font-size:18px}
.srv:hover .srv-arr{opacity:1;transform:translateX(4px)}

/* ARTISTS (TOTEM) */
.art-hero{padding:120px 60px 40px;text-align:center;position:relative;overflow:hidden}
.art-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(230,57,70,.08) 0%,transparent 60%);pointer-events:none}
.art-big{font-family:'Montserrat',sans-serif;font-size:clamp(56px,10vw,120px);font-weight:900;letter-spacing:-3px;color:var(--white);line-height:1;margin-bottom:40px;position:relative}
.art-filters{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:24px}
.art-tag{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;padding:10px 22px;border-radius:50px;cursor:pointer;transition:all .3s;border:1px solid var(--border);background:transparent;color:var(--muted)}
.art-tag:hover{border-color:var(--gold);color:var(--white)}
.art-tag.ac{background:var(--gold);color:#000;border-color:var(--gold)}
.art-search{max-width:360px;margin:0 auto 48px;position:relative}
.art-search input{width:100%;padding:14px 20px 14px 44px;background:var(--input);border:1px solid var(--border);border-radius:50px;color:var(--white);font-family:'Raleway',sans-serif;font-size:14px;outline:none;transition:border-color .3s}
.art-search input:focus{border-color:var(--gold)}
.art-search input::placeholder{color:var(--muted)}
.art-search-ico{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;pointer-events:none}
.art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;max-width:1200px;margin:0 auto;padding:0 60px 80px}
.art-card{position:relative;aspect-ratio:1/1;border-radius:10px;overflow:hidden;cursor:pointer;background:var(--card)}
.art-card img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.25,.46,.45,.94),filter .5s;filter:brightness(.75) saturate(.9)}
.art-card:hover img{transform:scale(1.08);filter:brightness(.55) saturate(1)}
.art-ov{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.1) 40%,transparent 60%);display:flex;flex-direction:column;justify-content:flex-end;padding:24px;transition:all .4s}
.art-card:hover .art-ov{background:linear-gradient(0deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,rgba(0,0,0,.1) 100%)}
.art-name{font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px;line-height:1.2}
.art-genre{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold);margin-top:6px;opacity:0;transform:translateY(8px);transition:all .4s}
.art-card:hover .art-genre{opacity:1;transform:translateY(0)}
.art-cta{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--blue);margin-top:10px;opacity:0;transform:translateY(8px);transition:all .4s .05s}
.art-card:hover .art-cta{opacity:1;transform:translateY(0)}

/* PAGE LAYOUTS */
.pg{padding-top:72px;min-height:100vh}
.pg-hero{padding:80px 60px 60px;background:linear-gradient(180deg,rgba(230,57,70,.06) 0%,transparent 60%);border-bottom:1px solid var(--border)}
.pg-hero-in{max-width:800px}
.pg-hero h1{font-size:clamp(32px,5vw,52px);font-weight:800;letter-spacing:-1.5px;margin-bottom:16px}
.pg-hero p{font-size:17px;color:var(--muted);line-height:1.7;max-width:600px;text-align:justify}
.pg-c{padding:60px;max-width:1200px;margin:0 auto}

/* FORMS */
.fm{max-width:640px}
.fm-row{display:flex;gap:16px;margin-bottom:16px}.fm-row>*{flex:1}
.fm-g{margin-bottom:16px}
.fm-l{display:block;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
.fm-i,.fm-s,.fm-t{width:100%;padding:12px 16px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'Raleway',sans-serif;font-size:14px;transition:border-color .3s;outline:none}
.fm-i:focus,.fm-s:focus,.fm-t:focus{border-color:var(--gold)}
.fm-t{min-height:120px;resize:vertical}
.fm-s{appearance:none;cursor:pointer}

/* FEATURES */
.feats{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin:40px 0}
.feat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:24px;transition:all .3s}
.feat:hover{border-color:rgba(245,197,24,.3)}
.feat-ico{font-size:24px;margin-bottom:14px;color:var(--gold)}
.feat h4{font-size:15px;font-weight:700;margin-bottom:8px}
.feat p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}

/* STEPS */
.steps{display:flex;flex-direction:column;gap:0;margin:40px 0;max-width:640px}
.step{display:flex;gap:20px;position:relative;padding-bottom:32px}
.step:last-child{padding-bottom:0}
.step-n{width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(245,197,24,.1);border:2px solid var(--gold);border-radius:50%;font-family:'Montserrat',sans-serif;font-weight:800;font-size:14px;color:var(--gold);position:relative;z-index:1}
.step::before{content:'';position:absolute;left:19px;top:44px;bottom:0;width:2px;background:var(--border)}
.step:last-child::before{display:none}
.step-c h4{font-size:16px;font-weight:700;margin-bottom:6px}
.step-c p{font-size:14px;color:var(--muted);line-height:1.6;text-align:justify}

/* TESTIMONIALS */
.testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.testi{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;position:relative}
.testi::before{content:'"';position:absolute;top:16px;right:24px;font-size:64px;color:rgba(245,197,24,.15);font-family:Georgia,serif;line-height:1}
.testi p{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:20px;font-style:italic;text-align:justify}
.testi-author{font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700}
.testi-role{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-top:2px}

/* WHY US */
.why-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.why{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;text-align:center;transition:all .3s}
.why:hover{border-color:var(--gold);transform:translateY(-2px)}
.why-ico{font-size:36px;margin-bottom:16px}
.why h4{font-size:16px;font-weight:700;margin-bottom:8px}
.why p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}

/* DASHBOARD */
.dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:32px}
.dash-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px}
.dash-stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:8px}
.dash-stat-v{font-family:'Montserrat',sans-serif;font-size:28px;font-weight:800}
.dash-tracks{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.dash-tracks-h{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)}
.dash-tracks-h h3{font-size:16px;font-weight:700}
.tr-row{display:grid;grid-template-columns:40px 2fr 1fr 1fr 1fr;align-items:center;padding:14px 24px;gap:16px;border-bottom:1px solid rgba(42,42,53,.4);transition:background .2s}
.tr-row:hover{background:var(--hover)}
.tr-num{font-size:13px;color:var(--muted);font-family:'Montserrat',sans-serif;font-weight:600}
.tr-title{font-size:14px;font-weight:600}
.tr-info{font-size:13px;color:var(--muted)}
.tr-status{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;font-family:'Montserrat',sans-serif}
.tr-status.live{color:var(--ok)}.tr-status.pending{color:var(--gold)}
.tr-dot{width:6px;height:6px;border-radius:50%;display:inline-block}

/* UPLOAD ZONE */
.upload{border:2px dashed var(--border);border-radius:12px;padding:48px;text-align:center;cursor:pointer;transition:all .3s;margin:24px 0}
.upload:hover{border-color:var(--gold);background:rgba(245,197,24,.03)}
.upload.has-file{border-color:var(--ok);background:rgba(76,175,80,.05)}
.upload-ico{font-size:40px;margin-bottom:16px}
.upload h4{font-size:16px;font-weight:600;margin-bottom:8px}
.upload p{font-size:13px;color:var(--muted)}

/* PRICING */
.pricing{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin:40px 0}
.price-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;transition:all .3s}
.price-card.ft{border-color:var(--gold)}
.price-card:hover{transform:translateY(-4px)}
.price-card h4{font-size:18px;font-weight:700;margin-bottom:8px}
.price-val{font-family:'Montserrat',sans-serif;font-size:36px;font-weight:800;color:var(--gold);margin:16px 0}
.price-val span{font-size:14px;color:var(--muted);font-weight:400}
.price-card ul{list-style:none;text-align:left;margin:20px 0}
.price-card ul li{padding:8px 0;font-size:13px;color:var(--muted);border-bottom:1px solid rgba(42,42,53,.4);display:flex;align-items:center;gap:8px}
.price-card ul li::before{content:'✓';color:var(--gold);font-weight:700}

/* LOGIN */
.login-pg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px;background:radial-gradient(ellipse at center,rgba(230,57,70,.06) 0%,var(--bg) 70%)}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:48px;max-width:420px;width:100%}
.login-card h2{font-size:24px;font-weight:800;margin-bottom:8px;text-align:center}
.login-card .sub{font-size:14px;color:var(--muted);text-align:center;margin-bottom:32px}

/* TABS */
.tabs{display:flex;gap:4px;margin-bottom:32px;border-bottom:1px solid var(--border)}
.tab{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;padding:12px 20px;cursor:pointer;color:var(--muted);transition:all .3s;border-bottom:2px solid transparent;text-transform:uppercase;letter-spacing:.5px;background:none;border-top:none;border-left:none;border-right:none}
.tab:hover{color:var(--white)}.tab.ac{color:var(--gold);border-bottom-color:var(--gold)}

/* MARQUEE */
.marquee{overflow:hidden;padding:20px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(245,197,24,.02)}
.marquee-in{display:flex;gap:60px;animation:mq 20s linear infinite;white-space:nowrap}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mq-item{font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:3px;display:flex;align-items:center;gap:20px}
.mq-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}

/* TEAM */
.team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:40px}
.team{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;text-align:center}
.team-av{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--gold));margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;font-size:24px;color:#000}
.team h4{font-size:16px;font-weight:700;margin-bottom:4px}
.team .role{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600}
.team p{font-size:13px;color:var(--muted);margin-top:12px;line-height:1.6;text-align:justify}

/* FOOTER */
footer.ft{padding:60px;border-top:1px solid var(--border);background:rgba(10,10,15,.6)}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1100px;margin:0 auto 40px}
.ft-brand p{font-size:14px;color:var(--muted);line-height:1.7;margin-top:12px;max-width:320px;text-align:justify}
footer h5{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px}
footer ul{list-style:none}
footer ul li{padding:4px 0;font-size:13px;color:var(--muted);transition:color .3s}
footer ul li:hover{color:var(--blue)}
.ft-bottom{text-align:center;padding-top:32px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);max-width:1100px;margin:0 auto}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;z-index:300;padding:14px 24px;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;animation:slideUp .3s ease;max-width:400px}
.toast.ok{background:var(--ok);color:#000}
.toast.err{background:var(--red);color:#fff}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

/* MOBILE MENU */
.mob{position:fixed;inset:0;z-index:200;background:rgba(10,10,15,.98);backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
.mob-close{position:absolute;top:20px;right:20px;background:none;border:none;color:var(--white);font-size:28px;cursor:pointer}
.mob a{font-family:'Montserrat',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);transition:color .3s}
.mob a:hover,.mob a.ac{color:var(--white)}

/* LOADING */
.loading{display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--muted);font-size:14px}

/* RESPONSIVE */
@media(max-width:900px){
  .n-links{display:none}.n-ham{display:flex}
  .hero{padding:100px 24px 40px}.hero-stats{gap:24px;flex-wrap:wrap}
  .sec{padding:60px 24px}.pg-hero{padding:60px 24px 40px}.pg-c{padding:32px 24px}
  footer.ft{padding:40px 24px}.ft-grid{grid-template-columns:1fr}
  .fm-row{flex-direction:column;gap:0}
  .tr-row{grid-template-columns:40px 1fr 1fr}
  .art-grid{padding:0 24px 60px;gap:12px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
  .art-hero{padding:100px 24px 24px}.art-big{letter-spacing:-1px}
  .art-name{font-size:14px}
}

::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--muted)}
`;

// ─── NAV ───
function Navbar({ logged, setLogged }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/a-propos", label: "À propos" },
    { to: "/artistes", label: "Artistes" },
    { to: "/distribution-musique", label: "Distribution" },
    { to: "/studio-enregistrement", label: "Studio" },
    { to: "/booking-artistes", label: "Booking" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className={`n ${scrolled ? "s" : ""}`}>
        <Link to="/" className="n-logo">
          <span className="n-dot" />
          <span className="n-logo-t"><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></span>
        </Link>
        <ul className="n-links">
          {links.map((l) => (
            <li key={l.to}><Link to={l.to} className={loc.pathname === l.to ? "ac" : ""}>{l.label}</Link></li>
          ))}
        </ul>
        <div className="n-acts">
          {logged ? (
            <>
              <Link to="/dashboard" className="btn btn-g btn-sm">Dashboard</Link>
              <button className="btn btn-o btn-sm" onClick={() => setLogged(false)}>Déconnexion</button>
            </>
          ) : (
            <Link to="/connexion" className="btn btn-r btn-sm">Espace Artiste</Link>
          )}
          <button className="n-ham" onClick={() => setMobOpen(true)}><span /><span /><span /></button>
        </div>
      </nav>
      {mobOpen && (
        <div className="mob">
          <button className="mob-close" onClick={() => setMobOpen(false)}>✕</button>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={loc.pathname === l.to ? "ac" : ""} onClick={() => setMobOpen(false)}>{l.label}</Link>
          ))}
          <Link to={logged ? "/dashboard" : "/connexion"} onClick={() => setMobOpen(false)} style={{ color: C.gold, marginTop: 16 }}>
            {logged ? "Dashboard" : "Connexion"}
          </Link>
        </div>
      )}
    </>
  );
}

// ─── FOOTER ───
function Footer() {
  return (
    <footer className="ft">
      <div className="ft-grid">
        <div className="ft-brand">
          <Link to="/" className="n-logo-t" style={{ fontSize: 22 }}>
            <span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span>
          </Link>
          <p>Label musical indépendant dédié à l'essor des talents musicaux d'aujourd'hui et de demain. Basé à Lubumbashi, République Démocratique du Congo. Production, distribution, studio, booking et management.</p>
        </div>
        <div>
          <h5>Services</h5>
          <ul>
            <li><Link to="/distribution-musique">Distribution</Link></li>
            <li><Link to="/studio-enregistrement">Studio</Link></li>
            <li><Link to="/booking-artistes">Booking</Link></li>
            <li><Link to="/featurings">Featurings</Link></li>
            <li><Link to="/services">Consulting</Link></li>
          </ul>
        </div>
        <div>
          <h5>Label</h5>
          <ul>
            <li><Link to="/a-propos">À propos</Link></li>
            <li><Link to="/artistes">Nos artistes</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li>contact.sterkterecords@gmail.com</li>
            <li>+243 850 510 209</li>
            <li>Avenue Mama Yemo, Lubumbashi</li>
            <li style={{ marginTop: 8 }}><a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: C.blue }}>Linktree ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="ft-bottom">© 2025 Sterkte Records SARL — Tous droits réservés · Avenue Mama Yemo, Lubumbashi, RDC</div>
    </footer>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── HOME ───
function HomePage() {
  useSEO("/");
  const platforms = ["SPOTIFY", "APPLE MUSIC", "DEEZER", "YOUTUBE MUSIC", "TIDAL", "AMAZON MUSIC", "AUDIOMACK", "BOOMPLAY"];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-c">
          <div className="hero-badge"><div className="hero-badge-dot" />Label indépendant · FROM LUBUMBASHI TO THE WORLD</div>
          <h1>Votre musique sur<br /><span className="gold">150+ plateformes</span><br />en quelques <span className="red">jours</span></h1>
          <p className="hero-sub">
            Sterkte Records accompagne les artistes africains de A à Z : distribution digitale mondiale, studio d'enregistrement professionnel, booking et management. Nous transformons votre talent en carrière.
          </p>
          <div className="hero-acts">
            <Link to="/distribution-musique" className="btn btn-r btn-lg">Distribuer mon titre</Link>
            <Link to="/studio-enregistrement" className="btn btn-o btn-lg">Réserver une session studio</Link>
          </div>
          <div className="hero-stats">
            {[{ v: "150+", l: "Plateformes" }, { v: "50+", l: "Artistes" }, { v: "1M+", l: "Streams" }, { v: "15+", l: "Pays" }].map((s) => (
              <div key={s.l}><div className="stat-v">{s.v}</div><div className="stat-l">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-in">
          {[...platforms, ...platforms].map((p, i) => (
            <div key={i} className="mq-item"><span className="mq-dot" />{p}</div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="sec">
        <div className="sec-h">
          <div className="sec-tag">Nos services</div>
          <h2 className="sec-title">Tout pour lancer et développer votre carrière</h2>
          <p className="sec-desc">De la première maquette au concert sold-out, Sterkte Records vous fournit les outils, l'expertise et le réseau pour réussir dans l'industrie musicale.</p>
        </div>
        <div className="srv-grid">
          {SERVICES.map((s) => (
            <Link key={s.title} to={s.link} className="srv">
              <div className="srv-ico">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="srv-arr">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sec-h">
          <div className="sec-tag">Pourquoi nous choisir</div>
          <h2 className="sec-title">Ce qui nous différencie</h2>
          <p className="sec-desc">Sterkte Records n'est pas un simple agrégateur de distribution. Nous sommes un partenaire investi dans votre réussite à long terme.</p>
        </div>
        <div className="why-grid">
          {[
            { icon: "💎", title: "Transparence totale", desc: "Accès en temps réel à vos statistiques de streams et revenus. Pas de frais cachés, pas de surprises. Vos royalties sont claires et traçables." },
            { icon: "🌍", title: "Expertise Afrique + International", desc: "Basés en RDC avec un réseau en Europe et en Afrique. Nous comprenons les marchés locaux et savons positionner votre musique à l'international." },
            { icon: "🤝", title: "Accompagnement humain", desc: "Chaque artiste a un interlocuteur dédié. Nous ne sommes pas une plateforme automatisée : nous connaissons votre projet et nous y croyons." },
            { icon: "⚡", title: "Rapidité d'exécution", desc: "Distribution en 48h, réponses aux demandes sous 72h, rapports mensuels le 30 de chaque mois. Des engagements concrets et tenus." },
            { icon: "🎯", title: "Stratégie personnalisée", desc: "Pas de formule générique. Chaque artiste reçoit un plan adapté à son style, son marché cible et ses objectifs de carrière." },
            { icon: "📈", title: "Résultats mesurables", desc: "Nos artistes ont vu leurs streams multipliés par 3 en moyenne sur les 6 premiers mois. Des résultats concrets, pas des promesses." },
          ].map((w) => (
            <div key={w.title} className="why">
              <div className="why-ico">{w.icon}</div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ARTISTS PREVIEW */}
      <section className="sec">
        <div className="sec-h">
          <div className="sec-tag">Roster</div>
          <h2 className="sec-title">Ils nous font confiance</h2>
          <p className="sec-desc">Découvrez les artistes qui font vibrer Sterkte Records à travers le continent et au-delà.</p>
        </div>
        <div className="art-grid" style={{ padding: "0 0 0" }}>
          {ARTISTS.slice(0, 6).map((a) => (
            <div key={a.id} className="art-card">
              <img src={a.img} alt={`${a.name} – artiste ${a.tags[0]} signé chez Sterkte Records`} loading="lazy" />
              <div className="art-ov">
                <div className="art-name">{a.name}</div>
                <div className="art-genre">{a.tags.join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link to="/artistes" className="btn btn-o btn-lg">Voir tous les artistes</Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sec-h">
          <div className="sec-tag">Témoignages</div>
          <h2 className="sec-title">Ce que disent nos artistes</h2>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testi">
              <p>{t.text}</p>
              <div className="testi-author">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sec" style={{ textAlign: "center" }}>
        <div className="sec-tag">Prêt à commencer ?</div>
        <h2 className="sec-title" style={{ marginBottom: 20 }}>Transformez votre talent<br />en <span className="gold">carrière musicale</span></h2>
        <p className="sec-desc" style={{ marginBottom: 36, textAlign: "center" }}>Rejoignez un label qui investit dans votre réussite. Distribution mondiale, studio professionnel, management personnalisé — tout commence ici.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/connexion" className="btn btn-g btn-lg">Rejoindre le label</Link>
          <Link to="/contact" className="btn btn-o btn-lg">Nous contacter</Link>
        </div>
      </section>
    </>
  );
}

// ─── ABOUT ───
function AboutPage() {
  useSEO("/a-propos");
  const team = [
    { i: "AK", name: "Axel l'or Kaumba", role: "Fondateur & Distribution digitale", desc: "Expert en marketing digital avec plusieurs années d'expérience dans l'industrie musicale. Passionné par la découverte de nouveaux talents et la distribution digitale." },
    { i: "AA", name: "Abigail Angelani", role: "Directrice Marketing & Communication", desc: "Spécialiste en stratégies digitales et campagnes de promotion innovantes pour artistes émergents et confirmés." },
    { i: "DN", name: "Diadème Ngandu", role: "Manager Artistique", desc: "Accompagnement personnalisé des artistes pour le développement de carrière, gestion de projet et planification stratégique." },
  ];
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">À propos</div>
        <h1>Qui sommes-<span className="gold">nous</span> ?</h1>
        <p>Sterkte Records est né en 2020 de la passion pour la musique authentique et la volonté d'accompagner les artistes africains dans un univers en constante évolution. Fondé à Lubumbashi par Axel l'or Kaumba, notre label mise sur l'innovation, l'excellence et la proximité avec nos talents.</p>
      </div></div>
      <div className="pg-c">
        <h3 style={{ color: C.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Notre vision</h3>
        <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: 32, fontSize: 15, maxWidth: 800, textAlign: "justify" }}>
          Créer un pont entre la créativité des artistes africains et un public mondial. Nous croyons que le talent ne connaît pas de frontières, et que chaque artiste mérite un accès égal aux outils de distribution, de promotion et de monétisation de sa musique. Notre approche combine expertise locale et portée internationale pour maximiser l'impact de chaque sortie.
        </p>
        <h3 style={{ color: C.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Notre mission</h3>
        <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: 48, fontSize: 15, maxWidth: 800, textAlign: "justify" }}>
          Accompagner chaque artiste, quel que soit son style ou son parcours, pour révéler son potentiel et le propulser au-delà des frontières. De la première maquette au concert international, Sterkte Records fournit les outils, le réseau et l'expertise nécessaires pour transformer le talent en carrière durable.
        </p>
        <h3 style={{ color: C.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>L'équipe dirigeante</h3>
        <div className="team-grid">
          {team.map((m) => (
            <div key={m.name} className="team">
              <div className="team-av">{m.i}</div>
              <h4>{m.name}</h4>
              <div className="role">{m.role}</div>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ARTISTS ───
function ArtistsPage() {
  useSEO("/artistes");
  const [filter, setFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = ARTISTS.filter((a) => (filter === "Tout" || a.tags.includes(filter)) && a.name.toLowerCase().includes(search.toLowerCase()));
  const visible = showAll ? filtered : filtered.slice(0, 8);
  return (
    <div className="pg">
      <div className="art-hero">
        <h1 className="art-big">ARTISTES</h1>
        <div className="art-filters">
          {ARTIST_GENRES.map((g) => (
            <button key={g} className={`art-tag ${filter === g ? "ac" : ""}`} onClick={() => { setFilter(g); setShowAll(false); }}>{g}</button>
          ))}
        </div>
        <div className="art-search">
          <span className="art-search-ico">🔍</span>
          <input placeholder="Rechercher un artiste..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>Aucun artiste trouvé.</div> : (
        <>
          <div className="art-grid">
            {visible.map((a) => (
              <div key={a.id} className="art-card">
                <img src={a.img} alt={`${a.name} – artiste ${a.tags[0]} chez Sterkte Records`} loading="lazy" />
                <div className="art-ov"><div className="art-name">{a.name}</div><div className="art-genre">{a.tags.join(" · ")}</div><div className="art-cta">Découvrir →</div></div>
              </div>
            ))}
          </div>
          {!showAll && filtered.length > 8 && (
            <div style={{ textAlign: "center", padding: "0 60px 80px" }}>
              <button className="btn btn-o btn-lg" onClick={() => setShowAll(true)}>Voir plus</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── DISTRIBUTION ───
function DistributionPage({ logged, toast }) {
  useSEO("/distribution-musique");
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Distribution</div>
        <h1>Votre musique sur <span className="gold">150+ plateformes</span></h1>
        <p>Mettez vos titres à disposition sur Spotify, Apple Music, Deezer, YouTube Music et toutes les plateformes majeures. Distribution en 48h, suivi en temps réel, royalties chaque mois.</p>
      </div></div>
      <div className="pg-c">
        <div className="steps">
          {[
            { n: "1", t: "Créez votre compte artiste", d: "Inscription gratuite en 2 minutes. Complétez votre profil avec vos informations et votre style musical." },
            { n: "2", t: "Uploadez vos morceaux", d: "Déposez vos fichiers audio (WAV, FLAC, MP3) et votre visuel de couverture en haute qualité (3000x3000px minimum)." },
            { n: "3", t: "Renseignez les métadonnées", d: "Titre, auteurs, genre, date de sortie souhaitée. Ces informations apparaîtront sur toutes les plateformes." },
            { n: "4", t: "Validation et mise en ligne", d: "Notre équipe valide votre soumission sous 48h et distribue sur 150+ plateformes. Vous suivez tout en temps réel depuis votre dashboard." },
          ].map((s) => <div key={s.n} className="step"><div className="step-n">{s.n}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}
        </div>
        <div className="feats">
          {[
            { icon: "📊", title: "Rapports en temps réel", desc: "Suivez vos streams, revenus et tendances directement depuis votre dashboard artiste." },
            { icon: "💰", title: "Royalties transparentes", desc: "Rapport mensuel détaillé le 30 de chaque mois. Paiement par virement bancaire ou Mobile Money." },
            { icon: "🌍", title: "150+ plateformes mondiales", desc: "Spotify, Apple Music, Deezer, YouTube Music, Tidal, Amazon Music, Audiomack, Boomplay et plus." },
            { icon: "⚡", title: "Distribution en 48h", desc: "Votre musique est validée et envoyée aux plateformes en 48h maximum après soumission." },
          ].map((f) => <div key={f.title} className="feat"><div className="feat-ico">{f.icon}</div><h4>{f.title}</h4><p>{f.desc}</p></div>)}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to={logged ? "/dashboard" : "/connexion"} className="btn btn-g btn-lg">
            {logged ? "Accéder au dashboard pour distribuer" : "Créer un compte pour distribuer"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── STUDIO ───
function StudioPage({ toast }) {
  useSEO("/studio-enregistrement");
  const [form, setForm] = useState({ type: "sur-place", date: "", duration: "2", address: "", name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const price = form.type === "mobile" ? parseInt(form.duration) * 75 : parseInt(form.duration) * 50;
  const handleSubmit = async () => {
    setSending(true);
    const ok = await sendEmail({ ...form, subject: `Réservation Studio – ${form.type} – ${form.duration}h`, prix_estime: `${price}$` });
    toast(ok ? "✅ Demande de réservation studio envoyée ! Confirmation par email sous 24h." : "❌ Erreur lors de l'envoi. Réessayez ou contactez-nous directement.", ok ? "ok" : "err");
    setSending(false);
  };
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Studio</div>
        <h1>Votre son, notre <span className="gold">expertise</span></h1>
        <p>Studio d'enregistrement professionnel à Lubumbashi, équipé des dernières technologies audio. Enregistrement, mixage et mastering avec une équipe expérimentée. Option studio mobile disponible.</p>
      </div></div>
      <div className="pg-c">
        <div className="pricing">
          {[
            { title: "Enregistrement", price: "50$", unit: "/heure", items: ["Studio professionnel équipé", "Ingénieur son dédié", "Export WAV/FLAC/MP3", "Coaching vocal inclus"], ft: false },
            { title: "Mixage & Mastering", price: "200$", unit: "/titre", items: ["Mix professionnel", "Mastering haute qualité", "2 révisions incluses", "Export multi-formats"], ft: true },
            { title: "Studio Mobile", price: "75$", unit: "/heure", items: ["Déplacement inclus", "Matériel professionnel", "Enregistrement sur site", "Flexibilité totale"], ft: false },
          ].map((p) => (
            <div key={p.title} className={`price-card ${p.ft ? "ft" : ""}`}>
              <h4>{p.title}</h4><div className="price-val">{p.price}<span> {p.unit}</span></div>
              <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 48, marginBottom: 24 }}>Réserver une <span className="gold">session</span></h3>
        <div className="fm">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Type de studio</label><select className="fm-s" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="sur-place">Studio sur place</option><option value="mobile">Studio mobile</option></select></div>
            <div className="fm-g"><label className="fm-l">Durée (heures)</label><select className="fm-s" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>{[1, 2, 3, 4, 5, 6, 8].map((h) => <option key={h} value={h}>{h}h</option>)}</select></div>
          </div>
          <div className="fm-g"><label className="fm-l">Date souhaitée</label><input className="fm-i" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          {form.type === "mobile" && <div className="fm-g"><label className="fm-l">Adresse de déplacement</label><input className="fm-i" placeholder="Votre adresse complète" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>}
          <div className="fm-g"><label className="fm-l">Message (optionnel)</label><textarea className="fm-t" placeholder="Précisions sur votre projet..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Estimation du prix</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 24, color: C.gold }}>{price}$</span>
          </div>
          <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi en cours..." : "Envoyer la demande"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING ───
function BookingPage({ toast }) {
  useSEO("/booking-artistes");
  const [tab, setTab] = useState("artiste");
  const [form, setForm] = useState({ name: "", email: "", artist: "", event: "", date: "", budget: "", lieu: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async () => {
    setSending(true);
    const ok = await sendEmail({ ...form, subject: `Booking ${tab === "artiste" ? "Artiste" : "Lieu"} – ${form.event || "Événement"}` });
    toast(ok ? "✅ Demande de booking envoyée ! Réponse sous 72h." : "❌ Erreur. Réessayez ou contactez-nous.", ok ? "ok" : "err");
    if (ok) setForm({ name: "", email: "", artist: "", event: "", date: "", budget: "", lieu: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Booking</div>
        <h1>Réservez vos <span className="gold">événements</span></h1>
        <p>Réservez nos artistes pour concerts, festivals, événements privés et corporate. Gestion logistique et contractuelle complète. Réponse garantie sous 72 heures.</p>
      </div></div>
      <div className="pg-c">
        <div className="tabs">
          <button className={`tab ${tab === "artiste" ? "ac" : ""}`} onClick={() => setTab("artiste")}>Réserver un artiste</button>
          <button className={`tab ${tab === "lieu" ? "ac" : ""}`} onClick={() => setTab("lieu")}>Réserver un lieu</button>
        </div>
        <div className="fm">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          {tab === "artiste" && <div className="fm-g"><label className="fm-l">Artiste souhaité</label><select className="fm-s" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}><option value="">Sélectionner</option>{ARTISTS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}<option value="autre">Autre</option></select></div>}
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Type d'événement</label><select className="fm-s" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}><option value="">Sélectionner</option><option value="concert">Concert</option><option value="festival">Festival</option><option value="showcase">Showcase</option><option value="prive">Événement privé</option><option value="corporate">Corporate</option>{tab === "lieu" && <option value="clip">Tournage clip</option>}</select></div>
            <div className="fm-g"><label className="fm-l">Date</label><input className="fm-i" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">{tab === "artiste" ? "Budget estimé" : "Durée estimée"}</label><input className="fm-i" placeholder={tab === "artiste" ? "ex: 5000$" : "ex: 4 heures"} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Lieu / Ville</label><input className="fm-i" placeholder="Ville, pays" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" placeholder="Détails supplémentaires..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-r btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Envoyer la demande"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURING ───
function FeaturingPage({ toast }) {
  useSEO("/featurings");
  const [form, setForm] = useState({ name: "", email: "", artist: "", project: "", deadline: "", link: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async () => {
    setSending(true);
    const ok = await sendEmail({ ...form, subject: `Demande Featuring – ${form.artist} – ${form.project}` });
    toast(ok ? "✅ Demande de featuring envoyée ! Réponse sous 7 jours ouvrés." : "❌ Erreur. Réessayez.", ok ? "ok" : "err");
    if (ok) setForm({ name: "", email: "", artist: "", project: "", deadline: "", link: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Featurings</div>
        <h1>Collaborez avec nos <span className="gold">artistes</span></h1>
        <p>Soumettez votre demande de featuring et élargissez votre audience. Processus simple et transparent, réponse garantie sous 7 jours ouvrés.</p>
      </div></div>
      <div className="pg-c">
        <div className="steps" style={{ marginBottom: 48 }}>
          {[
            { n: "1", t: "Remplissez le formulaire", d: "Précisez l'artiste souhaité, votre projet et les délais." },
            { n: "2", t: "Analyse sous 7 jours", d: "Notre équipe étudie la demande et évalue la compatibilité artistique." },
            { n: "3", t: "Coordination et production", d: "Dès validation, nous coordonnons la collaboration jusqu'à la finalisation du morceau." },
          ].map((s) => <div key={s.n} className="step"><div className="step-n">{s.n}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Demande de <span className="gold">featuring</span></h3>
        <div className="fm">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Artiste souhaité</label><select className="fm-s" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}><option value="">Sélectionner</option>{ARTISTS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Nom du projet</label><input className="fm-i" placeholder="Titre du morceau / projet" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Deadline souhaitée</label><input className="fm-i" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Lien vers votre projet (optionnel)</label><input className="fm-i" placeholder="SoundCloud, Google Drive..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
          <div className="fm-g"><label className="fm-l">Description du projet</label><textarea className="fm-t" placeholder="Style, vision, détails..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Soumettre la demande"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONSULTING ───
function ConsultingPage() {
  useSEO("/services");
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Consulting & Management</div>
        <h1>Un accompagnement <span className="gold">stratégique</span></h1>
        <p>Des services de consulting adaptés à vos besoins artistiques et commerciaux. Que vous soyez un artiste émergent ou confirmé, nous avons les outils pour accélérer votre carrière.</p>
      </div></div>
      <div className="pg-c">
        <div className="feats">
          {[
            { icon: "🚀", title: "Stratégie de lancement", desc: "Plan de promotion digitale personnalisé pour maximiser l'impact de chaque sortie. Ciblage des playlists, campagnes réseaux sociaux, relations presse." },
            { icon: "📋", title: "Gestion de carrière", desc: "Négociation de contrats avec des juristes expérimentés, planification stratégique à long terme et gestion administrative." },
            { icon: "🎨", title: "Développement de marque", desc: "Coaching artistique, construction d'image de marque, positionnement sur le marché et création d'identité visuelle." },
            { icon: "📈", title: "Analyse de données", desc: "Optimisation des revenus basée sur l'analyse des statistiques d'écoute. Identification des marchés porteurs et des tendances." },
            { icon: "🎪", title: "Organisation de tournées", desc: "Planification logistique complète : billetterie, technique, transport, hébergement et promotion locale." },
            { icon: "🎬", title: "Production visuelle", desc: "Direction artistique de clips vidéo, séances photo professionnelles, conception de pochettes et supports visuels." },
          ].map((f) => <div key={f.title} className="feat"><div className="feat-ico">{f.icon}</div><h4>{f.title}</h4><p>{f.desc}</p></div>)}
        </div>
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <p style={{ color: C.muted, marginBottom: 24, fontSize: 15 }}>Confiez votre projet à une équipe expérimentée pour transformer votre passion en succès durable.</p>
          <Link to="/contact" className="btn btn-r btn-lg">Prendre contact</Link>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT ───
function ContactPage({ toast }) {
  useSEO("/contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async () => {
    setSending(true);
    const ok = await sendEmail({ ...form, subject: `Contact – ${form.subject || "Message général"}` });
    toast(ok ? "✅ Message envoyé ! Nous vous répondrons rapidement." : "❌ Erreur. Réessayez.", ok ? "ok" : "err");
    if (ok) setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Contact</div>
        <h1>Contactez-<span className="gold">nous</span></h1>
        <p>Une question, un projet, une collaboration ? Écrivez-nous. Notre équipe répond sous 48 heures.</p>
      </div></div>
      <div className="pg-c">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div className="fm">
            <div className="fm-row">
              <div className="fm-g"><label className="fm-l">Nom complet</label><input className="fm-i" placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="fm-g"><label className="fm-l">Sujet</label><select className="fm-s" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Sélectionner</option><option value="Distribution">Distribution</option><option value="Studio">Studio</option><option value="Booking">Booking</option><option value="Featuring">Featuring</option><option value="Consulting">Consulting</option><option value="Autre">Autre</option></select></div>
            <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" placeholder="Votre message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Envoyer"}</button>
          </div>
          <div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informations</h4>
              {[
                { l: "Email", v: "contact.sterkterecords@gmail.com", c: C.blue },
                { l: "Téléphone", v: "+243 850 510 209", c: C.white },
                { l: "Adresse", v: "Avenue Mama Yemo, Lubumbashi, RDC", c: C.white },
              ].map((c) => (
                <div key={c.l} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, marginBottom: 4 }}>{c.l}</div>
                  <div style={{ fontSize: 14, color: c.c }}>{c.v}</div>
                </div>
              ))}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>Tous nos réseaux sociaux ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ───
function LoginPage({ setLogged }) {
  const [isReg, setIsReg] = useState(false);
  const [form, setForm] = useState({ name: "", pseudo: "", email: "", password: "", genre: "" });
  const nav = useNavigate();
  const handleSubmit = () => { setLogged(true); nav("/dashboard"); };
  return (
    <div className="login-pg">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 24, display: "flex", justifyContent: "center", gap: 6 }}>
          <span className="n-logo-t" style={{ fontSize: 22 }}><span style={{ color: C.white }}>Sterkte</span> <span style={{ color: C.red }}>Records</span></span>
        </div>
        <h2>{isReg ? "Créer un compte" : "Connexion"}</h2>
        <p className="sub">{isReg ? "Rejoignez le label et accédez à votre espace artiste" : "Accédez à votre espace artiste"}</p>
        {isReg && <>
          <div className="fm-g"><label className="fm-l">Nom complet</label><input className="fm-i" placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="fm-g"><label className="fm-l">Nom d'artiste</label><input className="fm-i" placeholder="Nom de scène" value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} /></div>
        </>}
        <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="fm-g"><label className="fm-l">Mot de passe</label><input className="fm-i" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {isReg && <div className="fm-g"><label className="fm-l">Genre musical</label><select className="fm-s" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}><option value="">Sélectionner</option><option value="afrobeat">Afrobeat</option><option value="rnb">R&B / Soul</option><option value="hiphop">Hip-Hop / Rap</option><option value="rumba">Rumba</option><option value="gospel">Gospel</option><option value="amapiano">Amapiano</option><option value="autre">Autre</option></select></div>}
        <button className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleSubmit}>{isReg ? "Créer mon compte" : "Se connecter"}</button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{isReg ? "Déjà un compte ? " : "Pas de compte ? "}</span>
          <span style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => setIsReg(!isReg)}>{isReg ? "Se connecter" : "S'inscrire"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───
function DashboardPage({ toast }) {
  useSEO("/");
  const [dashTab, setDashTab] = useState("overview");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: "", genre: "", date: "", contributors: "" });
  const [sending, setSending] = useState(false);
  const audioRef = useRef(null);
  const coverRef = useRef(null);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title) { toast("⚠️ Veuillez renseigner le titre du morceau.", "err"); return; }
    setSending(true);
    const files = [];
    if (audioFile) files.push(audioFile);
    if (coverFile) files.push(coverFile);
    const ok = await sendEmail({
      ...uploadForm,
      subject: `Distribution – Nouveau titre : ${uploadForm.title}`,
      fichier_audio: audioFile ? `${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)} MB)` : "Non fourni",
      visuel_couverture: coverFile ? `${coverFile.name} (${(coverFile.size / 1024 / 1024).toFixed(2)} MB)` : "Non fourni",
      name: "Artiste Dashboard",
      files,
    });
    toast(ok ? "✅ Titre soumis pour distribution ! Confirmation par email sous 48h." : "❌ Erreur. Réessayez.", ok ? "ok" : "err");
    if (ok) { setAudioFile(null); setCoverFile(null); setCoverPreview(null); setUploadForm({ title: "", genre: "", date: "", contributors: "" }); }
    setSending(false);
  };

  const tracks = [
    { num: 1, title: "Merci Seigneur", date: "2025-04-15", streams: "45,230", revenue: "$12.40", status: "live" },
    { num: 2, title: "Étoile Filante", date: "2025-03-22", streams: "31,876", revenue: "$8.75", status: "live" },
    { num: 3, title: "Kinshasa Flow", date: "2025-05-01", streams: "—", revenue: "—", status: "pending" },
    { num: 4, title: "Rêve d'or", date: "2025-02-14", streams: "67,490", revenue: "$18.52", status: "live" },
    { num: 5, title: "Mama Africa", date: "2025-01-08", streams: "89,123", revenue: "$24.50", status: "live" },
  ];

  return (
    <div className="pg">
      <div className="pg-hero"><div className="pg-hero-in">
        <div className="sec-tag">Dashboard</div>
        <h1>Bienvenue, <span className="gold">Artiste</span></h1>
        <p>Suivez vos performances, gérez vos titres et distribuez votre musique directement depuis votre espace.</p>
      </div></div>
      <div className="pg-c">
        <div className="tabs">
          <button className={`tab ${dashTab === "overview" ? "ac" : ""}`} onClick={() => setDashTab("overview")}>Vue d'ensemble</button>
          <button className={`tab ${dashTab === "upload" ? "ac" : ""}`} onClick={() => setDashTab("upload")}>Distribuer un titre</button>
          <button className={`tab ${dashTab === "tracks" ? "ac" : ""}`} onClick={() => setDashTab("tracks")}>Mes titres</button>
        </div>

        {dashTab === "overview" && <>
          <div className="dash-grid">
            <div className="dash-stat"><div className="dash-stat-l">Streams totaux</div><div className="dash-stat-v" style={{ color: C.gold }}>233,719</div></div>
            <div className="dash-stat"><div className="dash-stat-l">Revenus du mois</div><div className="dash-stat-v" style={{ color: C.success }}>$64.17</div></div>
            <div className="dash-stat"><div className="dash-stat-l">Titres distribués</div><div className="dash-stat-v" style={{ color: C.blue }}>5</div></div>
            <div className="dash-stat"><div className="dash-stat-l">Plateformes actives</div><div className="dash-stat-v">12</div></div>
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Streams par plateforme</h4>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[{ name: "Spotify", pct: 42, color: "#1DB954" }, { name: "Apple Music", pct: 24, color: "#FC3C44" }, { name: "Deezer", pct: 15, color: "#A238FF" }, { name: "YouTube Music", pct: 12, color: "#FF0000" }, { name: "Autres", pct: 7, color: C.muted }].map((p) => (
                <div key={p.name} style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>{p.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: C.bgInput, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-tracks">
            <div className="dash-tracks-h"><h3>Derniers titres</h3></div>
            {tracks.slice(0, 3).map((t) => (
              <div key={t.num} className="tr-row">
                <div className="tr-num">{t.num}</div><div className="tr-title">{t.title}</div>
                <div className="tr-info">{t.streams} streams</div><div className="tr-info">{t.revenue}</div>
                <div className={`tr-status ${t.status}`}><span className="tr-dot" style={{ background: t.status === "live" ? C.success : C.gold }} />{t.status === "live" ? "En ligne" : "En attente"}</div>
              </div>
            ))}
          </div>
        </>}

        {dashTab === "upload" && <div style={{ maxWidth: 640 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Distribuer un <span className="gold">nouveau titre</span></h3>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Uploadez votre morceau et le visuel de couverture. Notre équipe valide et distribue sur 150+ plateformes sous 48h.</p>

          {/* AUDIO UPLOAD */}
          <div className={`upload ${audioFile ? "has-file" : ""}`} onClick={() => audioRef.current?.click()}>
            <div className="upload-ico">🎵</div>
            <h4>{audioFile ? audioFile.name : "Cliquez pour ajouter votre fichier audio"}</h4>
            <p>{audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB — Cliquez pour changer` : "Formats acceptés : WAV, FLAC, MP3"}</p>
            <input ref={audioRef} type="file" accept=".wav,.flac,.mp3,audio/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && setAudioFile(e.target.files[0])} />
          </div>

          {/* COVER UPLOAD — FIXED */}
          <div className={`upload ${coverFile ? "has-file" : ""}`} onClick={() => coverRef.current?.click()} style={{ padding: coverPreview ? 24 : 48 }}>
            {coverPreview ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <img src={coverPreview} alt="Aperçu couverture" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} />
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ marginBottom: 4 }}>{coverFile.name}</h4>
                  <p>{(coverFile.size / 1024 / 1024).toFixed(1)} MB — Cliquez pour changer</p>
                </div>
              </div>
            ) : (
              <>
                <div className="upload-ico">🖼️</div>
                <h4>Cliquez pour ajouter le visuel de couverture</h4>
                <p>PNG ou JPG, minimum 3000x3000px recommandé</p>
              </>
            )}
            <input ref={coverRef} type="file" accept=".png,.jpg,.jpeg,image/*" style={{ display: "none" }} onChange={handleCoverSelect} />
          </div>

          <div className="fm">
            <div className="fm-g"><label className="fm-l">Titre du morceau *</label><input className="fm-i" placeholder="Nom du titre" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
            <div className="fm-row">
              <div className="fm-g"><label className="fm-l">Genre</label><select className="fm-s" value={uploadForm.genre} onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}><option value="">Sélectionner</option><option value="afrobeat">Afrobeat</option><option value="rnb">R&B</option><option value="hiphop">Hip-Hop / Rap</option><option value="rumba">Rumba</option><option value="gospel">Gospel</option><option value="amapiano">Amapiano</option><option value="autre">Autre</option></select></div>
              <div className="fm-g"><label className="fm-l">Date de sortie souhaitée</label><input className="fm-i" type="date" value={uploadForm.date} onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })} /></div>
            </div>
            <div className="fm-g"><label className="fm-l">Contributeurs / Auteurs</label><input className="fm-i" placeholder="Noms séparés par des virgules" value={uploadForm.contributors} onChange={(e) => setUploadForm({ ...uploadForm, contributors: e.target.value })} /></div>
            <button className="btn btn-g btn-lg" style={{ marginTop: 16 }} onClick={handleUpload} disabled={sending}>{sending ? "Envoi en cours..." : "Soumettre pour distribution"}</button>
          </div>
        </div>}

        {dashTab === "tracks" && <div className="dash-tracks">
          <div className="dash-tracks-h"><h3>Tous mes titres</h3><button className="btn btn-g btn-sm" onClick={() => setDashTab("upload")}>+ Nouveau titre</button></div>
          {tracks.map((t) => (
            <div key={t.num} className="tr-row">
              <div className="tr-num">{t.num}</div><div className="tr-title">{t.title}</div>
              <div className="tr-info">{t.streams} streams</div><div className="tr-info">{t.revenue}</div>
              <div className={`tr-status ${t.status}`}><span className="tr-dot" style={{ background: t.status === "live" ? C.success : C.gold }} />{t.status === "live" ? "En ligne" : "En attente"}</div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [logged, setLogged] = useState(false);
  const [toastData, setToastData] = useState(null);
  const loc = useLocation();
  const showToast = (msg, type = "ok") => setToastData({ msg, type });
  const isLogin = loc.pathname === "/connexion";

  return (
    <div className="app">
      <style>{css}</style>
      <ScrollToTop />
      {!isLogin && <Navbar logged={logged} setLogged={setLogged} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/artistes" element={<ArtistsPage />} />
        <Route path="/distribution-musique" element={<DistributionPage logged={logged} toast={showToast} />} />
        <Route path="/studio-enregistrement" element={<StudioPage toast={showToast} />} />
        <Route path="/booking-artistes" element={<BookingPage toast={showToast} />} />
        <Route path="/featurings" element={<FeaturingPage toast={showToast} />} />
        <Route path="/services" element={<ConsultingPage />} />
        <Route path="/contact" element={<ContactPage toast={showToast} />} />
        <Route path="/connexion" element={<LoginPage setLogged={setLogged} />} />
        <Route path="/dashboard" element={<DashboardPage toast={showToast} />} />
      </Routes>
      {!isLogin && <Footer />}
      {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}
    </div>
  );
}
