import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───
const COLORS = {
  bg: "#0A0A0F",
  bgCard: "#12121A",
  bgCardHover: "#1A1A25",
  bgInput: "#16161F",
  border: "#2A2A35",
  white: "#FFFFFF",
  gold: "#F5C518",
  red: "#E63946",
  blue: "#4FC3F7",
  muted: "#8A8A9A",
  success: "#4CAF50",
};

const PAGES = {
  HOME: "home",
  ABOUT: "about",
  ARTISTS: "artists",
  DISTRIBUTION: "distribution",
  STUDIO: "studio",
  BOOKING: "booking",
  FEATURING: "featuring",
  CONSULTING: "consulting",
  CONTACT: "contact",
  DASHBOARD: "dashboard",
  LOGIN: "login",
};

// ─── MOCK DATA ───
const ARTIST_GENRES = ["Tout", "Afrobeat", "Rap", "R&B", "Rumba", "Gospel", "Amapiano", "DJ"];

const ARTISTS_DATA = [
  { id: 1, name: "Eliel Luwala", genre: "Afrobeat", tags: ["Afrobeat", "Gospel"], img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=face", streams: "245K", tracks: 12 },
  { id: 2, name: "Sarah Mbeki", genre: "R&B", tags: ["R&B"], img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop&crop=face", streams: "189K", tracks: 8 },
  { id: 3, name: "DJ Katanga", genre: "Amapiano", tags: ["Amapiano", "DJ"], img: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=600&fit=crop&crop=face", streams: "520K", tracks: 24 },
  { id: 4, name: "Malu Beats", genre: "Rap", tags: ["Rap"], img: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=600&fit=crop&crop=face", streams: "312K", tracks: 16 },
  { id: 5, name: "Grace Tshala", genre: "Rumba", tags: ["Rumba"], img: "https://images.unsplash.com/photo-1508854710579-5cecc3a9ff17?w=600&h=600&fit=crop&crop=face", streams: "156K", tracks: 6 },
  { id: 6, name: "Kenzo Flow", genre: "Rap", tags: ["Rap"], img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop&crop=face", streams: "410K", tracks: 19 },
  { id: 7, name: "Naya Kiese", genre: "R&B", tags: ["R&B", "Afrobeat"], img: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=600&h=600&fit=crop&crop=face", streams: "178K", tracks: 9 },
  { id: 8, name: "Tumba MC", genre: "Rap", tags: ["Rap"], img: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=600&h=600&fit=crop&crop=face", streams: "267K", tracks: 14 },
  { id: 9, name: "Mukalay", genre: "Gospel", tags: ["Gospel"], img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&h=600&fit=crop&crop=face", streams: "132K", tracks: 7 },
  { id: 10, name: "Shango Bass", genre: "Amapiano", tags: ["Amapiano", "DJ"], img: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600&h=600&fit=crop&crop=face", streams: "345K", tracks: 21 },
  { id: 11, name: "Liya Moon", genre: "Afrobeat", tags: ["Afrobeat", "R&B"], img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop&crop=face", streams: "289K", tracks: 11 },
  { id: 12, name: "Papa Wemba Jr", genre: "Rumba", tags: ["Rumba"], img: "https://images.unsplash.com/photo-1501386761578-0a55b6ea6e42?w=600&h=600&fit=crop&crop=face", streams: "198K", tracks: 10 },
];

const SERVICES_DATA = [
  { icon: "🎵", title: "Distribution Digitale", desc: "Diffusez votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes mondiales.", link: PAGES.DISTRIBUTION },
  { icon: "🎙️", title: "Studio", desc: "Enregistrement, mixage et mastering dans un studio équipé des dernières technologies.", link: PAGES.STUDIO },
  { icon: "🎤", title: "Booking", desc: "Réservez nos artistes pour vos concerts, festivals et événements privés.", link: PAGES.BOOKING },
  { icon: "🤝", title: "Featurings", desc: "Collaborez avec nos artistes et élargissez votre audience.", link: PAGES.FEATURING },
  { icon: "📊", title: "Consulting", desc: "Stratégie, coaching et management pour développer votre carrière.", link: PAGES.CONSULTING },
  { icon: "👤", title: "Espace Artiste", desc: "Gérez vos titres, suivez vos streams et royalties en temps réel.", link: PAGES.DASHBOARD },
];

const STATS = [
  { value: "150+", label: "Plateformes" },
  { value: "50+", label: "Artistes" },
  { value: "1M+", label: "Streams" },
  { value: "15+", label: "Pays" },
];

// ─── STYLES ───
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: ${COLORS.bg};
    --bg-card: ${COLORS.bgCard};
    --bg-card-hover: ${COLORS.bgCardHover};
    --bg-input: ${COLORS.bgInput};
    --border: ${COLORS.border};
    --white: ${COLORS.white};
    --gold: ${COLORS.gold};
    --red: ${COLORS.red};
    --blue: ${COLORS.blue};
    --muted: ${COLORS.muted};
    --success: ${COLORS.success};
  }

  body { background: var(--bg); color: var(--white); }

  .sr-app {
    font-family: 'Raleway', sans-serif;
    background: var(--bg);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Montserrat', sans-serif;
  }

  /* ─── NAVBAR ─── */
  .sr-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 72px;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(42,42,53,0.5);
    transition: all 0.3s ease;
  }
  .sr-nav.scrolled { background: rgba(10,10,15,0.95); }
  .sr-nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .sr-nav-logo-text {
    font-family: 'Montserrat', sans-serif;
    font-weight: 800; font-size: 20px; letter-spacing: -0.5px;
  }
  .sr-nav-logo-text span:first-child { color: var(--white); }
  .sr-nav-logo-text span:last-child { color: var(--red); }
  .sr-nav-logo-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }

  .sr-nav-links {
    display: flex; align-items: center; gap: 28px; list-style: none;
  }
  .sr-nav-links li {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; cursor: pointer;
    color: var(--muted); transition: color 0.3s;
    position: relative;
  }
  .sr-nav-links li:hover, .sr-nav-links li.active { color: var(--white); }
  .sr-nav-links li.active::after {
    content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
    height: 2px; background: var(--gold); border-radius: 1px;
  }

  .sr-nav-actions { display: flex; gap: 12px; align-items: center; }

  .sr-nav-hamburger {
    display: none; flex-direction: column; gap: 5px; cursor: pointer;
    background: none; border: none; padding: 4px;
  }
  .sr-nav-hamburger span {
    display: block; width: 24px; height: 2px; background: var(--white);
    transition: all 0.3s;
  }

  /* ─── BUTTONS ─── */
  .sr-btn {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
    padding: 10px 24px; border-radius: 6px;
    cursor: pointer; transition: all 0.3s; border: none;
    text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px;
  }
  .sr-btn-primary { background: var(--red); color: var(--white); }
  .sr-btn-primary:hover { background: #d32f3f; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(230,57,70,0.3); }
  .sr-btn-secondary { background: transparent; color: var(--white); border: 1px solid var(--border); }
  .sr-btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
  .sr-btn-gold { background: var(--gold); color: #000; }
  .sr-btn-gold:hover { background: #ddb115; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(245,197,24,0.3); }
  .sr-btn-blue { background: var(--blue); color: #000; }
  .sr-btn-blue:hover { background: #3ab0e8; }
  .sr-btn-lg { padding: 14px 36px; font-size: 14px; border-radius: 8px; }
  .sr-btn-sm { padding: 8px 16px; font-size: 11px; }

  /* ─── HERO ─── */
  .sr-hero {
    min-height: 100vh; display: flex; align-items: center;
    position: relative; overflow: hidden;
    padding: 100px 60px 60px;
  }
  .sr-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(245,197,24,0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(79,195,247,0.04) 0%, transparent 50%),
      var(--bg);
  }
  .sr-hero-grid {
    position: absolute; inset: 0; z-index: 0;
    background-image: 
      linear-gradient(rgba(42,42,53,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,42,53,0.15) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  }
  .sr-hero-content { position: relative; z-index: 1; max-width: 720px; }
  .sr-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(245,197,24,0.1); border: 1px solid rgba(245,197,24,0.2);
    padding: 6px 16px; border-radius: 20px; margin-bottom: 28px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 600; color: var(--gold);
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .sr-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .sr-hero h1 {
    font-size: clamp(40px, 6vw, 72px); font-weight: 900;
    line-height: 1.05; letter-spacing: -2px; margin-bottom: 24px;
  }
  .sr-hero h1 .gold { color: var(--gold); }
  .sr-hero h1 .red { color: var(--red); }

  .sr-hero-sub {
    font-size: 17px; line-height: 1.7; color: var(--muted);
    max-width: 560px; margin-bottom: 36px;
  }
  .sr-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 60px; }

  .sr-hero-stats {
    display: flex; gap: 48px;
    padding-top: 40px; border-top: 1px solid var(--border);
  }
  .sr-hero-stat-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 32px; font-weight: 800; color: var(--white);
  }
  .sr-hero-stat-label {
    font-size: 12px; color: var(--muted); text-transform: uppercase;
    letter-spacing: 1px; margin-top: 4px;
    font-family: 'Montserrat', sans-serif; font-weight: 500;
  }

  /* ─── SECTIONS ─── */
  .sr-section {
    padding: 100px 60px; position: relative;
  }
  .sr-section-header {
    text-align: center; margin-bottom: 64px;
  }
  .sr-section-tag {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700; color: var(--gold);
    letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px;
  }
  .sr-section-title {
    font-size: clamp(28px, 4vw, 44px); font-weight: 800;
    letter-spacing: -1px; margin-bottom: 16px;
  }
  .sr-section-desc {
    font-size: 16px; color: var(--muted); max-width: 600px;
    margin: 0 auto; line-height: 1.7;
  }

  /* ─── SERVICES GRID ─── */
  .sr-services-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px; max-width: 1100px; margin: 0 auto;
  }
  .sr-service-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 32px; cursor: pointer;
    transition: all 0.4s; position: relative; overflow: hidden;
  }
  .sr-service-card:hover {
    border-color: var(--gold);
    background: var(--bg-card-hover);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  .sr-service-card-icon {
    font-size: 32px; margin-bottom: 20px;
    width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;
    background: rgba(245,197,24,0.08); border-radius: 12px;
  }
  .sr-service-card h3 {
    font-size: 18px; font-weight: 700; margin-bottom: 10px;
    color: var(--white);
  }
  .sr-service-card p {
    font-size: 14px; color: var(--muted); line-height: 1.6;
  }
  .sr-service-card-arrow {
    position: absolute; top: 28px; right: 28px;
    color: var(--gold); opacity: 0; transition: all 0.3s;
    font-size: 18px;
  }
  .sr-service-card:hover .sr-service-card-arrow { opacity: 1; transform: translateX(4px); }

  /* ─── ARTISTS (TOTEM STYLE) ─── */
  .sr-artists-page-hero {
    padding: 120px 60px 40px; text-align: center;
    position: relative; overflow: hidden;
  }
  .sr-artists-page-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.08) 0%, transparent 60%);
    pointer-events: none;
  }
  .sr-artists-page-title {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(56px, 10vw, 120px);
    font-weight: 900; letter-spacing: -3px;
    color: var(--white); line-height: 1;
    margin-bottom: 40px; position: relative;
  }

  .sr-artists-filters {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; flex-wrap: wrap; margin-bottom: 24px;
    position: relative;
  }
  .sr-artists-filter-tag {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 10px 22px; border-radius: 50px;
    cursor: pointer; transition: all 0.3s;
    border: 1px solid var(--border);
    background: transparent; color: var(--muted);
  }
  .sr-artists-filter-tag:hover {
    border-color: var(--gold); color: var(--white);
  }
  .sr-artists-filter-tag.active {
    background: var(--gold); color: #000;
    border-color: var(--gold);
  }

  .sr-artists-search {
    max-width: 360px; margin: 0 auto 48px; position: relative;
  }
  .sr-artists-search input {
    width: 100%; padding: 14px 20px 14px 44px;
    background: var(--bg-input); border: 1px solid var(--border);
    border-radius: 50px; color: var(--white);
    font-family: 'Raleway', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.3s;
  }
  .sr-artists-search input:focus { border-color: var(--gold); }
  .sr-artists-search input::placeholder { color: var(--muted); }
  .sr-artists-search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--muted); font-size: 16px; pointer-events: none;
  }

  .sr-artists-totem-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; max-width: 1200px; margin: 0 auto;
    padding: 0 60px 80px;
  }
  .sr-artist-totem-card {
    position: relative; aspect-ratio: 1/1;
    border-radius: 10px; overflow: hidden;
    cursor: pointer;
    background: var(--bg-card);
  }
  .sr-artist-totem-card img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s;
    filter: brightness(0.75) saturate(0.9);
  }
  .sr-artist-totem-card:hover img {
    transform: scale(1.08);
    filter: brightness(0.55) saturate(1);
  }
  .sr-artist-totem-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 40%, transparent 60%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 24px; transition: all 0.4s;
  }
  .sr-artist-totem-card:hover .sr-artist-totem-overlay {
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%);
  }
  .sr-artist-totem-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 20px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--white); line-height: 1.2;
  }
  .sr-artist-totem-genre {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--gold); margin-top: 6px;
    opacity: 0; transform: translateY(8px);
    transition: all 0.4s;
  }
  .sr-artist-totem-card:hover .sr-artist-totem-genre {
    opacity: 1; transform: translateY(0);
  }
  .sr-artist-totem-cta {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--blue); margin-top: 10px;
    opacity: 0; transform: translateY(8px);
    transition: all 0.4s 0.05s;
  }
  .sr-artist-totem-card:hover .sr-artist-totem-cta {
    opacity: 1; transform: translateY(0);
  }

  .sr-artists-empty {
    text-align: center; padding: 60px 24px;
    color: var(--muted); font-size: 16px;
  }
  .sr-artists-load-more {
    text-align: center; padding: 0 60px 80px;
  }

  /* ─── ARTISTS on HOME ─── */
  .sr-artists-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; max-width: 1200px; margin: 0 auto;
  }
  .sr-artist-card {
    position: relative; border-radius: 12px; overflow: hidden;
    aspect-ratio: 3/4; cursor: pointer; group: true;
  }
  .sr-artist-card img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s; filter: brightness(0.7);
  }
  .sr-artist-card:hover img { transform: scale(1.05); filter: brightness(0.5); }
  .sr-artist-card-info {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 24px;
    background: linear-gradient(transparent, rgba(0,0,0,0.9));
  }
  .sr-artist-card-info h3 {
    font-size: 20px; font-weight: 700; margin-bottom: 4px;
  }
  .sr-artist-card-info span {
    font-size: 12px; color: var(--gold); text-transform: uppercase;
    letter-spacing: 1px; font-family: 'Montserrat', sans-serif; font-weight: 600;
  }
  .sr-artist-card-stats {
    display: flex; gap: 16px; margin-top: 10px;
    font-size: 12px; color: var(--muted);
  }

  /* ─── PAGE LAYOUTS ─── */
  .sr-page { padding-top: 72px; min-height: 100vh; }
  .sr-page-hero {
    padding: 80px 60px 60px;
    background: linear-gradient(180deg, rgba(230,57,70,0.06) 0%, transparent 60%);
    border-bottom: 1px solid var(--border);
  }
  .sr-page-hero-inner { max-width: 800px; }
  .sr-page-hero h1 {
    font-size: clamp(32px, 5vw, 52px); font-weight: 800;
    letter-spacing: -1.5px; margin-bottom: 16px;
  }
  .sr-page-hero h1 .gold { color: var(--gold); }
  .sr-page-hero p {
    font-size: 17px; color: var(--muted); line-height: 1.7; max-width: 600px;
  }

  .sr-page-content { padding: 60px; max-width: 1200px; margin: 0 auto; }

  /* ─── FORMS ─── */
  .sr-form { max-width: 640px; }
  .sr-form-row { display: flex; gap: 16px; margin-bottom: 16px; }
  .sr-form-row > * { flex: 1; }
  .sr-form-group { margin-bottom: 16px; }
  .sr-form-label {
    display: block; font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
  }
  .sr-form-input, .sr-form-select, .sr-form-textarea {
    width: 100%; padding: 12px 16px;
    background: var(--bg-input); border: 1px solid var(--border);
    border-radius: 8px; color: var(--white);
    font-family: 'Raleway', sans-serif; font-size: 14px;
    transition: border-color 0.3s; outline: none;
  }
  .sr-form-input:focus, .sr-form-select:focus, .sr-form-textarea:focus {
    border-color: var(--gold);
  }
  .sr-form-textarea { min-height: 120px; resize: vertical; }
  .sr-form-select { appearance: none; cursor: pointer; }

  /* ─── FEATURE BLOCKS ─── */
  .sr-features {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; margin: 40px 0;
  }
  .sr-feature {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 10px; padding: 24px;
    transition: all 0.3s;
  }
  .sr-feature:hover { border-color: rgba(245,197,24,0.3); }
  .sr-feature-icon {
    font-size: 24px; margin-bottom: 14px;
    color: var(--gold);
  }
  .sr-feature h4 {
    font-size: 15px; font-weight: 700; margin-bottom: 8px;
  }
  .sr-feature p { font-size: 13px; color: var(--muted); line-height: 1.6; }

  /* ─── PROCESS STEPS ─── */
  .sr-steps { display: flex; flex-direction: column; gap: 0; margin: 40px 0; max-width: 640px; }
  .sr-step {
    display: flex; gap: 20px; position: relative;
    padding-bottom: 32px;
  }
  .sr-step:last-child { padding-bottom: 0; }
  .sr-step-num {
    width: 40px; height: 40px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(245,197,24,0.1); border: 2px solid var(--gold);
    border-radius: 50%; font-family: 'Montserrat', sans-serif;
    font-weight: 800; font-size: 14px; color: var(--gold);
    position: relative; z-index: 1;
  }
  .sr-step::before {
    content: ''; position: absolute;
    left: 19px; top: 44px; bottom: 0;
    width: 2px; background: var(--border);
  }
  .sr-step:last-child::before { display: none; }
  .sr-step-content h4 {
    font-size: 16px; font-weight: 700; margin-bottom: 6px;
  }
  .sr-step-content p { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* ─── DASHBOARD ─── */
  .sr-dash-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px; margin-bottom: 32px;
  }
  .sr-dash-stat {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
  }
  .sr-dash-stat-label {
    font-size: 12px; color: var(--muted); text-transform: uppercase;
    letter-spacing: 1px; font-family: 'Montserrat', sans-serif;
    font-weight: 600; margin-bottom: 8px;
  }
  .sr-dash-stat-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 28px; font-weight: 800;
  }
  .sr-dash-stat-value.gold { color: var(--gold); }
  .sr-dash-stat-value.blue { color: var(--blue); }
  .sr-dash-stat-value.red { color: var(--red); }
  .sr-dash-stat-value.green { color: var(--success); }

  .sr-dash-tracks {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
  }
  .sr-dash-tracks-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
  }
  .sr-dash-tracks-header h3 { font-size: 16px; font-weight: 700; }

  .sr-track-row {
    display: grid; grid-template-columns: 40px 2fr 1fr 1fr 1fr;
    align-items: center; padding: 14px 24px; gap: 16px;
    border-bottom: 1px solid rgba(42,42,53,0.4);
    transition: background 0.2s;
  }
  .sr-track-row:hover { background: var(--bg-card-hover); }
  .sr-track-row-num { font-size: 13px; color: var(--muted); font-family: 'Montserrat', sans-serif; font-weight: 600; }
  .sr-track-row-title { font-size: 14px; font-weight: 600; }
  .sr-track-row-info { font-size: 13px; color: var(--muted); }
  .sr-track-row-status {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.5px; font-family: 'Montserrat', sans-serif;
  }
  .sr-track-row-status.live { color: var(--success); }
  .sr-track-row-status.pending { color: var(--gold); }

  /* ─── UPLOAD ZONE ─── */
  .sr-upload-zone {
    border: 2px dashed var(--border); border-radius: 12px;
    padding: 48px; text-align: center; cursor: pointer;
    transition: all 0.3s; margin: 24px 0;
  }
  .sr-upload-zone:hover { border-color: var(--gold); background: rgba(245,197,24,0.03); }
  .sr-upload-zone-icon { font-size: 40px; margin-bottom: 16px; }
  .sr-upload-zone h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .sr-upload-zone p { font-size: 13px; color: var(--muted); }

  /* ─── PRICING CARDS ─── */
  .sr-pricing {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px; margin: 40px 0;
  }
  .sr-price-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 32px; text-align: center;
    transition: all 0.3s;
  }
  .sr-price-card.featured { border-color: var(--gold); }
  .sr-price-card:hover { transform: translateY(-4px); }
  .sr-price-card h4 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .sr-price-card .price {
    font-family: 'Montserrat', sans-serif;
    font-size: 36px; font-weight: 800; color: var(--gold); margin: 16px 0;
  }
  .sr-price-card .price span { font-size: 14px; color: var(--muted); font-weight: 400; }
  .sr-price-card ul {
    list-style: none; text-align: left; margin: 20px 0;
  }
  .sr-price-card ul li {
    padding: 8px 0; font-size: 13px; color: var(--muted);
    border-bottom: 1px solid rgba(42,42,53,0.4);
    display: flex; align-items: center; gap: 8px;
  }
  .sr-price-card ul li::before { content: '✓'; color: var(--gold); font-weight: 700; }

  /* ─── LOGIN ─── */
  .sr-login-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 40px;
    background: radial-gradient(ellipse at center, rgba(230,57,70,0.06) 0%, var(--bg) 70%);
  }
  .sr-login-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 16px; padding: 48px; max-width: 420px; width: 100%;
  }
  .sr-login-card h2 {
    font-size: 24px; font-weight: 800; margin-bottom: 8px; text-align: center;
  }
  .sr-login-card .sub {
    font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 32px;
  }

  /* ─── FOOTER ─── */
  .sr-footer {
    padding: 60px; border-top: 1px solid var(--border);
    background: rgba(10,10,15,0.6);
  }
  .sr-footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px; max-width: 1100px; margin: 0 auto 40px;
  }
  .sr-footer-brand p {
    font-size: 14px; color: var(--muted); line-height: 1.7; margin-top: 12px;
    max-width: 320px;
  }
  .sr-footer h5 {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 700; color: var(--gold);
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;
  }
  .sr-footer ul { list-style: none; }
  .sr-footer ul li {
    padding: 4px 0; font-size: 13px; color: var(--muted);
    cursor: pointer; transition: color 0.3s;
  }
  .sr-footer ul li:hover { color: var(--blue); }
  .sr-footer-bottom {
    text-align: center; padding-top: 32px; border-top: 1px solid var(--border);
    font-size: 12px; color: var(--muted);
    max-width: 1100px; margin: 0 auto;
  }

  /* ─── ABOUT PAGE ─── */
  .sr-about-team {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px; margin-top: 40px;
  }
  .sr-team-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; padding: 28px; text-align: center;
  }
  .sr-team-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, var(--red), var(--gold));
    margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;
    font-family: 'Montserrat', sans-serif; font-weight: 800;
    font-size: 24px; color: #000;
  }
  .sr-team-card h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .sr-team-card .role {
    font-size: 12px; color: var(--gold); text-transform: uppercase;
    letter-spacing: 1px; font-family: 'Montserrat', sans-serif; font-weight: 600;
  }
  .sr-team-card p { font-size: 13px; color: var(--muted); margin-top: 12px; line-height: 1.6; }

  /* ─── MOBILE MENU ─── */
  .sr-mobile-menu {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,10,15,0.98); backdrop-filter: blur(20px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 24px;
  }
  .sr-mobile-menu-close {
    position: absolute; top: 20px; right: 20px;
    background: none; border: none; color: var(--white);
    font-size: 28px; cursor: pointer;
  }
  .sr-mobile-menu li {
    list-style: none; font-family: 'Montserrat', sans-serif;
    font-size: 18px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 2px; cursor: pointer; color: var(--muted);
    transition: color 0.3s;
  }
  .sr-mobile-menu li:hover, .sr-mobile-menu li.active { color: var(--white); }

  /* ─── TOAST ─── */
  .sr-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 300;
    background: var(--success); color: #000;
    padding: 14px 24px; border-radius: 8px;
    font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 900px) {
    .sr-nav-links { display: none; }
    .sr-nav-hamburger { display: flex; }
    .sr-hero { padding: 100px 24px 40px; }
    .sr-hero-stats { gap: 24px; flex-wrap: wrap; }
    .sr-section { padding: 60px 24px; }
    .sr-page-hero { padding: 60px 24px 40px; }
    .sr-page-content { padding: 32px 24px; }
    .sr-footer { padding: 40px 24px; }
    .sr-footer-grid { grid-template-columns: 1fr; }
    .sr-form-row { flex-direction: column; gap: 0; }
    .sr-track-row { grid-template-columns: 40px 1fr 1fr; }
    .sr-track-row-info:nth-child(4), .sr-track-row-info:nth-child(5) { display: none; }
    .sr-artists-totem-grid { padding: 0 24px 60px; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    .sr-artists-page-hero { padding: 100px 24px 24px; }
    .sr-artists-page-title { letter-spacing: -1px; }
    .sr-artist-totem-name { font-size: 14px; }
  }

  /* ─── SCROLLBAR ─── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  /* ─── TAB SYSTEM ─── */
  .sr-tabs {
    display: flex; gap: 4px; margin-bottom: 32px;
    border-bottom: 1px solid var(--border); padding-bottom: 0;
  }
  .sr-tab {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 600; padding: 12px 20px;
    cursor: pointer; color: var(--muted); transition: all 0.3s;
    border-bottom: 2px solid transparent; text-transform: uppercase;
    letter-spacing: 0.5px; background: none; border-top: none;
    border-left: none; border-right: none;
  }
  .sr-tab:hover { color: var(--white); }
  .sr-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* ─── MARQUEE ─── */
  .sr-marquee {
    overflow: hidden; padding: 20px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(245,197,24,0.02);
  }
  .sr-marquee-inner {
    display: flex; gap: 60px; animation: marquee 20s linear infinite;
    white-space: nowrap;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .sr-marquee-item {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 3px;
    display: flex; align-items: center; gap: 20px;
  }
  .sr-marquee-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
`;

// ─── COMPONENTS ───

function Navbar({ page, setPage, isLoggedIn, setIsLoggedIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navItems = [
    { id: PAGES.HOME, label: "Accueil" },
    { id: PAGES.ABOUT, label: "À propos" },
    { id: PAGES.ARTISTS, label: "Artistes" },
    { id: PAGES.DISTRIBUTION, label: "Distribution" },
    { id: PAGES.STUDIO, label: "Studio" },
    { id: PAGES.BOOKING, label: "Booking" },
    { id: PAGES.CONSULTING, label: "Services" },
    { id: PAGES.CONTACT, label: "Contact" },
  ];

  const goTo = (p) => { setPage(p); setMobileOpen(false); window.scrollTo(0,0); };

  return (
    <>
      <nav className={`sr-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="sr-nav-logo" onClick={() => goTo(PAGES.HOME)}>
          <div className="sr-nav-logo-dot" />
          <div className="sr-nav-logo-text">
            <span>Sterkte </span><span>Records</span>
          </div>
        </div>

        <ul className="sr-nav-links">
          {navItems.map((it) => (
            <li key={it.id} className={page === it.id ? "active" : ""} onClick={() => goTo(it.id)}>
              {it.label}
            </li>
          ))}
        </ul>

        <div className="sr-nav-actions">
          {isLoggedIn ? (
            <>
              <button className="sr-btn sr-btn-gold sr-btn-sm" onClick={() => goTo(PAGES.DASHBOARD)}>Dashboard</button>
              <button className="sr-btn sr-btn-secondary sr-btn-sm" onClick={() => setIsLoggedIn(false)}>Déconnexion</button>
            </>
          ) : (
            <button className="sr-btn sr-btn-primary sr-btn-sm" onClick={() => goTo(PAGES.LOGIN)}>Espace Artiste</button>
          )}
          <button className="sr-nav-hamburger" onClick={() => setMobileOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="sr-mobile-menu">
          <button className="sr-mobile-menu-close" onClick={() => setMobileOpen(false)}>✕</button>
          {navItems.map((it) => (
            <li key={it.id} className={page === it.id ? "active" : ""} onClick={() => goTo(it.id)}>
              {it.label}
            </li>
          ))}
          <li style={{ marginTop: 16 }} onClick={() => { goTo(isLoggedIn ? PAGES.DASHBOARD : PAGES.LOGIN); }}>
            {isLoggedIn ? "Dashboard" : "Connexion"}
          </li>
        </div>
      )}
    </>
  );
}

function Footer({ setPage }) {
  const goTo = (p) => { setPage(p); window.scrollTo(0,0); };
  return (
    <footer className="sr-footer">
      <div className="sr-footer-grid">
        <div className="sr-footer-brand">
          <div className="sr-nav-logo-text" style={{ fontSize: 22, cursor: "pointer" }} onClick={() => goTo(PAGES.HOME)}>
            <span style={{ color: COLORS.white }}>Sterkte </span>
            <span style={{ color: COLORS.red }}>Records</span>
          </div>
          <p>Label musical indépendant dédié à l'essor des talents musicaux d'aujourd'hui et de demain. Basé à Lubumbashi, RDC.</p>
        </div>
        <div>
          <h5>Services</h5>
          <ul>
            <li onClick={() => goTo(PAGES.DISTRIBUTION)}>Distribution</li>
            <li onClick={() => goTo(PAGES.STUDIO)}>Studio</li>
            <li onClick={() => goTo(PAGES.BOOKING)}>Booking</li>
            <li onClick={() => goTo(PAGES.FEATURING)}>Featurings</li>
            <li onClick={() => goTo(PAGES.CONSULTING)}>Consulting</li>
          </ul>
        </div>
        <div>
          <h5>Label</h5>
          <ul>
            <li onClick={() => goTo(PAGES.ABOUT)}>À propos</li>
            <li onClick={() => goTo(PAGES.ARTISTS)}>Nos artistes</li>
            <li onClick={() => goTo(PAGES.CONTACT)}>Contact</li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li>contact.sterkterecords@gmail.com</li>
            <li>+243 850 510 209</li>
            <li>Avenue Mama Yemo, Lubumbashi</li>
            <li style={{ color: COLORS.blue, marginTop: 8 }}>
              <a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: COLORS.blue, textDecoration: "none" }}>
                Linktree ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="sr-footer-bottom">
        © 2025 Sterkte Records SARL — Tous droits réservés · Avenue Mama Yemo, Lubumbashi, RDC
      </div>
    </footer>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="sr-toast">{message}</div>;
}

// ─── PAGES ───

function HomePage({ setPage }) {
  const goTo = (p) => { setPage(p); window.scrollTo(0,0); };
  const platforms = ["SPOTIFY", "APPLE MUSIC", "DEEZER", "YOUTUBE MUSIC", "TIDAL", "AMAZON MUSIC", "AUDIOMACK", "BOOMPLAY"];

  return (
    <>
      {/* HERO */}
      <section className="sr-hero">
        <div className="sr-hero-bg" />
        <div className="sr-hero-grid" />
        <div className="sr-hero-content">
          <div className="sr-hero-badge">
            <div className="sr-hero-badge-dot" />
            Label indépendant · Lubumbashi, RDC
          </div>
          <h1>
            Votre mélodie<br />
            <span className="gold">prend vie ici</span> et fait<br />
            <span className="red">écho au monde</span>
          </h1>
          <p className="sr-hero-sub">
            Production, distribution digitale, management et booking — un accompagnement complet 
            pour faire rayonner votre musique et toucher vos fans partout dans le monde.
          </p>
          <div className="sr-hero-actions">
            <button className="sr-btn sr-btn-primary sr-btn-lg" onClick={() => goTo(PAGES.LOGIN)}>
              Créer un compte artiste
            </button>
            <button className="sr-btn sr-btn-secondary sr-btn-lg" onClick={() => goTo(PAGES.DISTRIBUTION)}>
              Distribuer un titre
            </button>
          </div>
          <div className="sr-hero-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="sr-hero-stat-value">{s.value}</div>
                <div className="sr-hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="sr-marquee">
        <div className="sr-marquee-inner">
          {[...platforms, ...platforms].map((p, i) => (
            <div key={i} className="sr-marquee-item">
              <span className="sr-marquee-dot" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="sr-section">
        <div className="sr-section-header">
          <div className="sr-section-tag">Nos services</div>
          <h2 className="sr-section-title">Tout pour votre carrière musicale</h2>
          <p className="sr-section-desc">
            De la composition au succès, Sterkte Records vous guide à chaque étape avec des services complets et personnalisés.
          </p>
        </div>
        <div className="sr-services-grid">
          {SERVICES_DATA.map((s) => (
            <div key={s.title} className="sr-service-card" onClick={() => goTo(s.link)}>
              <div className="sr-service-card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="sr-service-card-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ARTISTS */}
      <section className="sr-section" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sr-section-header">
          <div className="sr-section-tag">Roster</div>
          <h2 className="sr-section-title">Nos artistes</h2>
          <p className="sr-section-desc">
            Découvrez les talents qui font vibrer Sterkte Records.
          </p>
        </div>
        <div className="sr-artists-grid">
          {ARTISTS_DATA.slice(0, 6).map((a) => (
            <div key={a.id} className="sr-artist-totem-card">
              <img src={a.img} alt={a.name} />
              <div className="sr-artist-totem-overlay">
                <div className="sr-artist-totem-name">{a.name}</div>
                <div className="sr-artist-totem-genre">{a.tags.join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button className="sr-btn sr-btn-secondary sr-btn-lg" onClick={() => goTo(PAGES.ARTISTS)}>
            Voir tous les artistes
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="sr-section" style={{ textAlign: "center" }}>
        <div className="sr-section-tag">Prêt à commencer ?</div>
        <h2 className="sr-section-title" style={{ marginBottom: 20 }}>
          Libérez votre créativité,<br />
          <span style={{ color: COLORS.gold }}>on s'occupe du reste.</span>
        </h2>
        <p className="sr-section-desc" style={{ marginBottom: 36 }}>
          Plus qu'un label, une famille dédiée à votre succès. Rejoignez Sterkte Records et propulsez votre carrière.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="sr-btn sr-btn-gold sr-btn-lg" onClick={() => goTo(PAGES.LOGIN)}>Rejoindre le label</button>
          <button className="sr-btn sr-btn-secondary sr-btn-lg" onClick={() => goTo(PAGES.CONTACT)}>Nous contacter</button>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const team = [
    { initials: "AK", name: "Axel l'or Kaumba", role: "Fondateur & Distribution digitale", desc: "Expert en marketing digital avec plusieurs années d'expérience dans l'industrie. Passionné par la découverte de nouveaux talents." },
    { initials: "AA", name: "Abigail Angelani", role: "Directrice Marketing & Communication", desc: "Spécialiste en stratégies digitales et campagnes de promotion innovantes." },
    { initials: "DN", name: "Diadème Ngandu", role: "Manager Artistique", desc: "Accompagnement personnalisé des artistes pour le développement de carrière et gestion de projet." },
  ];

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">À propos</div>
          <h1>Qui sommes-<span className="gold">nous</span> ?</h1>
          <p>Sterkte Records est né de la passion pour la musique authentique et la volonté d'accompagner les artistes dans un univers en constante évolution.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div style={{ maxWidth: 800 }}>
          <h3 style={{ color: COLORS.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Notre vision</h3>
          <p style={{ color: COLORS.muted, lineHeight: 1.8, marginBottom: 32, fontSize: 15 }}>
            Créer un pont entre la créativité des artistes et un public mondial grâce à des stratégies 
            personnalisées, une distribution digitale optimale, et un management transparent. 
            Fondé en 2020, notre label mise sur l'innovation, l'excellence et la proximité avec nos talents.
          </p>

          <h3 style={{ color: COLORS.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Notre mission</h3>
          <p style={{ color: COLORS.muted, lineHeight: 1.8, marginBottom: 48, fontSize: 15 }}>
            Accompagner chaque artiste, quel que soit son style ou son parcours, pour révéler son potentiel 
            et le propulser au-delà des frontières. De la composition au succès, Sterkte Records vous guide à chaque étape.
          </p>
        </div>

        <h3 style={{ color: COLORS.gold, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>L'équipe dirigeante</h3>
        <div className="sr-about-team">
          {team.map((m) => (
            <div key={m.name} className="sr-team-card">
              <div className="sr-team-avatar">{m.initials}</div>
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

function ArtistsPage() {
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = ARTISTS_DATA.filter((a) => {
    const matchGenre = activeFilter === "Tout" || a.tags.includes(activeFilter);
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div className="sr-page">
      {/* Hero title */}
      <div className="sr-artists-page-hero">
        <h1 className="sr-artists-page-title">ARTISTES</h1>

        {/* Genre filter pills */}
        <div className="sr-artists-filters">
          {ARTIST_GENRES.map((g) => (
            <button
              key={g}
              className={`sr-artists-filter-tag ${activeFilter === g ? "active" : ""}`}
              onClick={() => { setActiveFilter(g); setShowAll(false); }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="sr-artists-search">
          <span className="sr-artists-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Artists grid */}
      {filtered.length === 0 ? (
        <div className="sr-artists-empty">
          Aucun artiste trouvé pour cette recherche.
        </div>
      ) : (
        <>
          <div className="sr-artists-totem-grid">
            {visible.map((a) => (
              <div key={a.id} className="sr-artist-totem-card">
                <img src={a.img} alt={a.name} loading="lazy" />
                <div className="sr-artist-totem-overlay">
                  <div className="sr-artist-totem-name">{a.name}</div>
                  <div className="sr-artist-totem-genre">{a.tags.join(" · ")}</div>
                  <div className="sr-artist-totem-cta">Découvrir →</div>
                </div>
              </div>
            ))}
          </div>

          {!showAll && filtered.length > 8 && (
            <div className="sr-artists-load-more">
              <button className="sr-btn sr-btn-secondary sr-btn-lg" onClick={() => setShowAll(true)}>
                Voir plus
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DistributionPage({ isLoggedIn, setPage, setToast }) {
  const goTo = (p) => { setPage(p); window.scrollTo(0,0); };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Distribution</div>
          <h1>Distribuez votre musique <span className="gold">partout</span></h1>
          <p>Mettez vos titres à disposition sur toutes les plateformes majeures : Spotify, Apple Music, Deezer, YouTube Music, et bien plus.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-steps">
          {[
            { n: "1", t: "Créez votre compte artiste", d: "Inscrivez-vous et complétez votre profil avec vos informations personnelles et professionnelles." },
            { n: "2", t: "Téléchargez vos morceaux", d: "Uploadez vos titres en haute qualité (WAV, FLAC, MP3) avec le visuel de couverture." },
            { n: "3", t: "Renseignez les métadonnées", d: "Titre, auteurs, genre, date de sortie souhaitée et contributeurs." },
            { n: "4", t: "Validation et mise en ligne", d: "Notre équipe valide votre soumission et distribue sur 150+ plateformes. Suivez en temps réel." },
          ].map((s) => (
            <div key={s.n} className="sr-step">
              <div className="sr-step-num">{s.n}</div>
              <div className="sr-step-content">
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sr-features">
          {[
            { icon: "📊", title: "Rapports détaillés", desc: "Statistiques de streams et revenus en temps réel sur votre dashboard." },
            { icon: "💰", title: "Gestion des royalties", desc: "Suivi transparent de vos revenus avec rapports mensuels détaillés." },
            { icon: "🌍", title: "150+ plateformes", desc: "Spotify, Apple Music, Deezer, YouTube Music, Tidal, Amazon Music et plus." },
            { icon: "⚡", title: "Mise en ligne rapide", desc: "Votre musique disponible en quelques jours sur toutes les plateformes." },
          ].map((f) => (
            <div key={f.title} className="sr-feature">
              <div className="sr-feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          {isLoggedIn ? (
            <button className="sr-btn sr-btn-gold sr-btn-lg" onClick={() => goTo(PAGES.DASHBOARD)}>
              Accéder au dashboard pour distribuer
            </button>
          ) : (
            <button className="sr-btn sr-btn-primary sr-btn-lg" onClick={() => goTo(PAGES.LOGIN)}>
              Créer un compte pour distribuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StudioPage({ setToast }) {
  const [form, setForm] = useState({ type: "sur-place", date: "", duration: "2", address: "" });

  const handleSubmit = () => {
    setToast("✅ Demande de réservation studio envoyée !");
  };

  const price = form.type === "mobile" ? parseInt(form.duration) * 75 : parseInt(form.duration) * 50;

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Studio</div>
          <h1>Votre son, notre <span className="gold">expertise</span></h1>
          <p>Studio d'enregistrement professionnel équipé des dernières technologies. Enregistrement, mixage, mastering.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-pricing">
          {[
            { title: "Enregistrement", price: "50$", unit: "/heure", items: ["Studio professionnel équipé", "Ingénieur son dédié", "Formats WAV/FLAC/MP3", "Coaching vocal inclus"], featured: false },
            { title: "Mixage & Mastering", price: "200$", unit: "/titre", items: ["Mix professionnel", "Mastering haute qualité", "2 révisions incluses", "Export multi-formats"], featured: true },
            { title: "Studio Mobile", price: "75$", unit: "/heure", items: ["Déplacement inclus", "Matériel professionnel", "Enregistrement sur site", "Flexibilité totale"], featured: false },
          ].map((p) => (
            <div key={p.title} className={`sr-price-card ${p.featured ? "featured" : ""}`}>
              <h4>{p.title}</h4>
              <div className="price">{p.price}<span> {p.unit}</span></div>
              <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              <button className="sr-btn sr-btn-primary" style={{ width: "100%" }}>Réserver</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
            Réserver une <span style={{ color: COLORS.gold }}>session</span>
          </h3>
          <div className="sr-form">
            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Type de studio</label>
                <select className="sr-form-select" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                  <option value="sur-place">Studio sur place</option>
                  <option value="mobile">Studio mobile</option>
                </select>
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Durée (heures)</label>
                <select className="sr-form-select" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})}>
                  {[1,2,3,4,5,6,8].map((h) => <option key={h} value={h}>{h}h</option>)}
                </select>
              </div>
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Date souhaitée</label>
              <input className="sr-form-input" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
            </div>
            {form.type === "mobile" && (
              <div className="sr-form-group">
                <label className="sr-form-label">Adresse de déplacement</label>
                <input className="sr-form-input" placeholder="Votre adresse complète" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
              </div>
            )}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>Estimation du prix</span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.gold }}>{price}$</span>
            </div>
            <button className="sr-btn sr-btn-gold sr-btn-lg" onClick={handleSubmit}>Envoyer la demande</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingPage({ setToast }) {
  const [tab, setTab] = useState("artiste");
  const [form, setForm] = useState({ artist: "", event: "", date: "", budget: "", lieu: "", message: "" });

  const handleSubmit = () => {
    setToast("✅ Demande de booking envoyée ! Réponse sous 72h.");
    setForm({ artist: "", event: "", date: "", budget: "", lieu: "", message: "" });
  };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Booking</div>
          <h1>Réservez vos <span className="gold">événements</span></h1>
          <p>Réservez nos artistes pour concerts, festivals, événements privés et corporate, ou trouvez le lieu idéal pour votre événement.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-tabs">
          <button className={`sr-tab ${tab === "artiste" ? "active" : ""}`} onClick={() => setTab("artiste")}>Réserver un artiste</button>
          <button className={`sr-tab ${tab === "lieu" ? "active" : ""}`} onClick={() => setTab("lieu")}>Réserver un lieu</button>
        </div>

        {tab === "artiste" ? (
          <div className="sr-form">
            <div className="sr-form-group">
              <label className="sr-form-label">Artiste souhaité</label>
              <select className="sr-form-select" value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})}>
                <option value="">Sélectionner un artiste</option>
                {ARTISTS_DATA.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
                <option value="autre">Autre (préciser)</option>
              </select>
            </div>
            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Type d'événement</label>
                <select className="sr-form-select" value={form.event} onChange={(e) => setForm({...form, event: e.target.value})}>
                  <option value="">Sélectionner</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="showcase">Showcase</option>
                  <option value="prive">Événement privé</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Date</label>
                <input className="sr-form-input" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
              </div>
            </div>
            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Budget estimé</label>
                <input className="sr-form-input" placeholder="ex: 5000$" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} />
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Lieu</label>
                <input className="sr-form-input" placeholder="Ville, pays" value={form.lieu} onChange={(e) => setForm({...form, lieu: e.target.value})} />
              </div>
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Message</label>
              <textarea className="sr-form-textarea" placeholder="Détails supplémentaires..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
            </div>
            <button className="sr-btn sr-btn-primary sr-btn-lg" onClick={handleSubmit}>Envoyer la demande</button>
          </div>
        ) : (
          <div className="sr-form">
            <div className="sr-form-group">
              <label className="sr-form-label">Type d'événement</label>
              <select className="sr-form-select" value={form.event} onChange={(e) => setForm({...form, event: e.target.value})}>
                <option value="">Sélectionner</option>
                <option value="concert">Concert / Showcase</option>
                <option value="clip">Tournage de clip</option>
                <option value="prive">Événement privé</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Date</label>
                <input className="sr-form-input" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Durée estimée</label>
                <input className="sr-form-input" placeholder="ex: 4 heures" />
              </div>
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Message</label>
              <textarea className="sr-form-textarea" placeholder="Décrivez votre besoin..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
            </div>
            <button className="sr-btn sr-btn-primary sr-btn-lg" onClick={handleSubmit}>Demander un devis</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturingPage({ setToast }) {
  const [form, setForm] = useState({ artist: "", project: "", deadline: "", link: "", message: "" });

  const handleSubmit = () => {
    setToast("✅ Demande de featuring envoyée ! Réponse sous 7 jours ouvrés.");
    setForm({ artist: "", project: "", deadline: "", link: "", message: "" });
  };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Featurings</div>
          <h1>Collaborez avec nos <span className="gold">artistes</span></h1>
          <p>Soumettez votre demande de featuring et élargissez votre audience. Nous privilégions les projets qualitatifs et respectueux.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-steps" style={{ marginBottom: 48 }}>
          {[
            { n: "1", t: "Remplissez le formulaire", d: "Précisez le projet, l'artiste souhaité et les délais." },
            { n: "2", t: "Analyse sous 7 jours", d: "Notre équipe étudie la demande et évalue la compatibilité artistique." },
            { n: "3", t: "Coordination et finalisation", d: "Dès validation, nous coordonnons la collaboration jusqu'à la finalisation du morceau." },
          ].map((s) => (
            <div key={s.n} className="sr-step">
              <div className="sr-step-num">{s.n}</div>
              <div className="sr-step-content"><h4>{s.t}</h4><p>{s.d}</p></div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
          Demande de <span style={{ color: COLORS.gold }}>featuring</span>
        </h3>
        <div className="sr-form">
          <div className="sr-form-group">
            <label className="sr-form-label">Artiste souhaité</label>
            <select className="sr-form-select" value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})}>
              <option value="">Sélectionner un artiste</option>
              {ARTISTS_DATA.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
          <div className="sr-form-row">
            <div className="sr-form-group">
              <label className="sr-form-label">Nom du projet</label>
              <input className="sr-form-input" placeholder="Titre du morceau / projet" value={form.project} onChange={(e) => setForm({...form, project: e.target.value})} />
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Deadline souhaitée</label>
              <input className="sr-form-input" type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Lien vers votre projet (optionnel)</label>
            <input className="sr-form-input" placeholder="Lien SoundCloud, Google Drive..." value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Description du projet</label>
            <textarea className="sr-form-textarea" placeholder="Style, vision, détails..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
          </div>
          <button className="sr-btn sr-btn-gold sr-btn-lg" onClick={handleSubmit}>Soumettre la demande</button>
        </div>
      </div>
    </div>
  );
}

function ConsultingPage({ setPage }) {
  const goTo = (p) => { setPage(p); window.scrollTo(0,0); };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Consulting & Management</div>
          <h1>Un accompagnement <span className="gold">stratégique</span></h1>
          <p>Des services de consulting adaptés à vos besoins artistiques et commerciaux, à chaque étape de votre carrière.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-features">
          {[
            { icon: "🚀", title: "Stratégie de lancement", desc: "Plan de promotion digitale personnalisé pour maximiser l'impact de vos sorties." },
            { icon: "📋", title: "Gestion de carrière", desc: "Négociation de contrats avec des juristes expérimentés et planification stratégique." },
            { icon: "🎨", title: "Développement de marque", desc: "Coaching artistique, image de marque et positionnement sur le marché." },
            { icon: "📈", title: "Analyse de données", desc: "Optimisation des revenus basée sur l'analyse des statistiques d'écoute." },
            { icon: "🎪", title: "Organisation de tournées", desc: "Planification logistique complète pour vos concerts et événements." },
            { icon: "🎬", title: "Production complète", desc: "Clips vidéo, séances photo, conception de pochettes et supports visuels." },
          ].map((f) => (
            <div key={f.title} className="sr-feature">
              <div className="sr-feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <p style={{ color: COLORS.muted, marginBottom: 24, fontSize: 15 }}>
            Confiez votre projet à une équipe expérimentée pour transformer votre passion en succès durable.
          </p>
          <button className="sr-btn sr-btn-primary sr-btn-lg" onClick={() => goTo(PAGES.CONTACT)}>
            Prendre contact
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactPage({ setToast }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = () => {
    setToast("✅ Message envoyé ! Nous vous répondrons rapidement.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Contact</div>
          <h1>Contactez-<span className="gold">nous</span></h1>
          <p>Une question, un projet, une collaboration ? N'hésitez pas à nous écrire.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div className="sr-form">
            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Nom complet</label>
                <input className="sr-form-input" placeholder="Votre nom" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Email</label>
                <input className="sr-form-input" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Sujet</label>
              <select className="sr-form-select" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})}>
                <option value="">Sélectionner</option>
                <option value="distribution">Distribution</option>
                <option value="studio">Réservation studio</option>
                <option value="booking">Booking</option>
                <option value="featuring">Featuring</option>
                <option value="consulting">Consulting</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Message</label>
              <textarea className="sr-form-textarea" placeholder="Votre message..." value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
            </div>
            <button className="sr-btn sr-btn-gold sr-btn-lg" onClick={handleSubmit}>Envoyer</button>
          </div>
          <div>
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informations</h4>
              {[
                { label: "Email", value: "contact.sterkterecords@gmail.com", color: COLORS.blue },
                { label: "Téléphone", value: "+243 850 510 209", color: COLORS.white },
                { label: "Adresse", value: "Avenue Mama Yemo, Lubumbashi, RDC", color: COLORS.white },
              ].map((c) => (
                <div key={c.label} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 14, color: c.color }}>{c.value}</div>
                </div>
              ))}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
                <a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: COLORS.blue, textDecoration: "none", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  Tous nos réseaux sociaux ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ setIsLoggedIn, setPage }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", pseudo: "", email: "", password: "", genre: "", bio: "" });

  const handleSubmit = () => {
    setIsLoggedIn(true);
    setPage(PAGES.DASHBOARD);
    window.scrollTo(0, 0);
  };

  return (
    <div className="sr-login-page">
      <div className="sr-login-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="sr-nav-logo-text" style={{ fontSize: 22, justifyContent: "center", display: "flex", gap: 6 }}>
            <span style={{ color: COLORS.white }}>Sterkte</span>
            <span style={{ color: COLORS.red }}>Records</span>
          </div>
        </div>
        <h2>{isRegister ? "Créer un compte" : "Connexion"}</h2>
        <p className="sub">{isRegister ? "Rejoignez le label et accédez à votre espace artiste" : "Accédez à votre espace artiste"}</p>

        {isRegister && (
          <>
            <div className="sr-form-group">
              <label className="sr-form-label">Nom complet</label>
              <input className="sr-form-input" placeholder="Votre nom complet" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Nom d'artiste</label>
              <input className="sr-form-input" placeholder="Votre pseudo / nom de scène" value={form.pseudo} onChange={(e) => setForm({...form, pseudo: e.target.value})} />
            </div>
          </>
        )}
        <div className="sr-form-group">
          <label className="sr-form-label">Email</label>
          <input className="sr-form-input" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
        </div>
        <div className="sr-form-group">
          <label className="sr-form-label">Mot de passe</label>
          <input className="sr-form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
        </div>
        {isRegister && (
          <div className="sr-form-group">
            <label className="sr-form-label">Genre musical</label>
            <select className="sr-form-select" value={form.genre} onChange={(e) => setForm({...form, genre: e.target.value})}>
              <option value="">Sélectionner</option>
              <option value="afrobeat">Afrobeat</option>
              <option value="rnb">R&B / Soul</option>
              <option value="hiphop">Hip-Hop / Rap</option>
              <option value="rumba">Rumba</option>
              <option value="gospel">Gospel</option>
              <option value="amapiano">Amapiano / Afro House</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        )}
        <button className="sr-btn sr-btn-gold sr-btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleSubmit}>
          {isRegister ? "Créer mon compte" : "Se connecter"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: COLORS.muted }}>
            {isRegister ? "Déjà un compte ? " : "Pas encore de compte ? "}
          </span>
          <span style={{ fontSize: 13, color: COLORS.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Se connecter" : "S'inscrire"}
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ setToast }) {
  const [dashTab, setDashTab] = useState("overview");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: "", genre: "", date: "", contributors: "" });
  const fileRef = useRef(null);

  const mockTracks = [
    { num: 1, title: "Merci Seigneur", date: "2025-04-15", streams: "45,230", revenue: "$12.40", status: "live" },
    { num: 2, title: "Étoile Filante", date: "2025-03-22", streams: "31,876", revenue: "$8.75", status: "live" },
    { num: 3, title: "Kinshasa Flow", date: "2025-05-01", streams: "—", revenue: "—", status: "pending" },
    { num: 4, title: "Rêve d'or", date: "2025-02-14", streams: "67,490", revenue: "$18.52", status: "live" },
    { num: 5, title: "Mama Africa", date: "2025-01-08", streams: "89,123", revenue: "$24.50", status: "live" },
  ];

  const handleUpload = () => {
    setToast("✅ Titre soumis pour distribution ! Confirmation par email sous 48h.");
    setUploadFile(null);
    setUploadForm({ title: "", genre: "", date: "", contributors: "" });
  };

  return (
    <div className="sr-page">
      <div className="sr-page-hero">
        <div className="sr-page-hero-inner">
          <div className="sr-section-tag">Dashboard</div>
          <h1>Bienvenue, <span className="gold">Artiste</span></h1>
          <p>Suivez vos performances, gérez vos titres et distribuez votre musique.</p>
        </div>
      </div>
      <div className="sr-page-content">
        <div className="sr-tabs">
          <button className={`sr-tab ${dashTab === "overview" ? "active" : ""}`} onClick={() => setDashTab("overview")}>Vue d'ensemble</button>
          <button className={`sr-tab ${dashTab === "upload" ? "active" : ""}`} onClick={() => setDashTab("upload")}>Distribuer un titre</button>
          <button className={`sr-tab ${dashTab === "tracks" ? "active" : ""}`} onClick={() => setDashTab("tracks")}>Mes titres</button>
        </div>

        {dashTab === "overview" && (
          <>
            <div className="sr-dash-grid">
              <div className="sr-dash-stat">
                <div className="sr-dash-stat-label">Streams totaux</div>
                <div className="sr-dash-stat-value gold">233,719</div>
              </div>
              <div className="sr-dash-stat">
                <div className="sr-dash-stat-label">Revenus du mois</div>
                <div className="sr-dash-stat-value green">$64.17</div>
              </div>
              <div className="sr-dash-stat">
                <div className="sr-dash-stat-label">Titres distribués</div>
                <div className="sr-dash-stat-value blue">5</div>
              </div>
              <div className="sr-dash-stat">
                <div className="sr-dash-stat-label">Plateformes actives</div>
                <div className="sr-dash-stat-value">12</div>
              </div>
            </div>

            {/* Mini chart placeholder */}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Streams par plateforme</h4>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { name: "Spotify", pct: 42, color: "#1DB954" },
                  { name: "Apple Music", pct: 24, color: "#FC3C44" },
                  { name: "Deezer", pct: 15, color: "#A238FF" },
                  { name: "YouTube Music", pct: 12, color: "#FF0000" },
                  { name: "Autres", pct: 7, color: COLORS.muted },
                ].map((p) => (
                  <div key={p.name} style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: COLORS.bgInput, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sr-dash-tracks">
              <div className="sr-dash-tracks-header">
                <h3>Derniers titres</h3>
              </div>
              {mockTracks.slice(0, 3).map((t) => (
                <div key={t.num} className="sr-track-row">
                  <div className="sr-track-row-num">{t.num}</div>
                  <div className="sr-track-row-title">{t.title}</div>
                  <div className="sr-track-row-info">{t.streams} streams</div>
                  <div className="sr-track-row-info">{t.revenue}</div>
                  <div className={`sr-track-row-status ${t.status}`}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.status === "live" ? COLORS.success : COLORS.gold, display: "inline-block" }} />
                    {t.status === "live" ? "En ligne" : "En attente"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {dashTab === "upload" && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Distribuer un <span style={{ color: COLORS.gold }}>nouveau titre</span>
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>
              Uploadez votre morceau et renseignez les métadonnées. Notre équipe validera et distribuera sur 150+ plateformes.
            </p>

            <div className="sr-upload-zone" onClick={() => fileRef.current?.click()}>
              <div className="sr-upload-zone-icon">🎵</div>
              <h4>{uploadFile ? uploadFile.name : "Glissez votre fichier audio ici"}</h4>
              <p>{uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB` : "Formats acceptés : WAV, FLAC, MP3"}</p>
              <input ref={fileRef} type="file" accept=".wav,.flac,.mp3" style={{ display: "none" }} onChange={(e) => setUploadFile(e.target.files[0])} />
            </div>

            <div className="sr-form">
              <div className="sr-form-group">
                <label className="sr-form-label">Titre du morceau</label>
                <input className="sr-form-input" placeholder="Nom du titre" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} />
              </div>
              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label className="sr-form-label">Genre</label>
                  <select className="sr-form-select" value={uploadForm.genre} onChange={(e) => setUploadForm({...uploadForm, genre: e.target.value})}>
                    <option value="">Sélectionner</option>
                    <option value="afrobeat">Afrobeat</option>
                    <option value="rnb">R&B / Soul</option>
                    <option value="hiphop">Hip-Hop / Rap</option>
                    <option value="rumba">Rumba</option>
                    <option value="gospel">Gospel</option>
                    <option value="amapiano">Amapiano</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="sr-form-group">
                  <label className="sr-form-label">Date de sortie souhaitée</label>
                  <input className="sr-form-input" type="date" value={uploadForm.date} onChange={(e) => setUploadForm({...uploadForm, date: e.target.value})} />
                </div>
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Contributeurs / Auteurs</label>
                <input className="sr-form-input" placeholder="Noms séparés par des virgules" value={uploadForm.contributors} onChange={(e) => setUploadForm({...uploadForm, contributors: e.target.value})} />
              </div>

              <div className="sr-upload-zone" style={{ padding: 32 }} onClick={() => {}}>
                <div className="sr-upload-zone-icon">🖼️</div>
                <h4>Visuel de couverture</h4>
                <p>PNG ou JPG, minimum 3000x3000px recommandé</p>
              </div>

              <button className="sr-btn sr-btn-gold sr-btn-lg" style={{ marginTop: 16 }} onClick={handleUpload}>
                Soumettre pour distribution
              </button>
            </div>
          </div>
        )}

        {dashTab === "tracks" && (
          <div className="sr-dash-tracks">
            <div className="sr-dash-tracks-header">
              <h3>Tous mes titres</h3>
              <button className="sr-btn sr-btn-gold sr-btn-sm" onClick={() => setDashTab("upload")}>+ Nouveau titre</button>
            </div>
            {mockTracks.map((t) => (
              <div key={t.num} className="sr-track-row">
                <div className="sr-track-row-num">{t.num}</div>
                <div className="sr-track-row-title">{t.title}</div>
                <div className="sr-track-row-info">{t.streams} streams</div>
                <div className="sr-track-row-info">{t.revenue}</div>
                <div className={`sr-track-row-status ${t.status}`}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.status === "live" ? COLORS.success : COLORS.gold, display: "inline-block" }} />
                  {t.status === "live" ? "En ligne" : "En attente"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const renderPage = () => {
    switch (page) {
      case PAGES.HOME: return <HomePage setPage={setPage} />;
      case PAGES.ABOUT: return <AboutPage />;
      case PAGES.ARTISTS: return <ArtistsPage />;
      case PAGES.DISTRIBUTION: return <DistributionPage isLoggedIn={isLoggedIn} setPage={setPage} setToast={showToast} />;
      case PAGES.STUDIO: return <StudioPage setToast={showToast} />;
      case PAGES.BOOKING: return <BookingPage setToast={showToast} />;
      case PAGES.FEATURING: return <FeaturingPage setToast={showToast} />;
      case PAGES.CONSULTING: return <ConsultingPage setPage={setPage} />;
      case PAGES.CONTACT: return <ContactPage setToast={showToast} />;
      case PAGES.LOGIN: return <LoginPage setIsLoggedIn={setIsLoggedIn} setPage={setPage} />;
      case PAGES.DASHBOARD: return <DashboardPage setToast={showToast} />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="sr-app">
      <style>{css}</style>
      {page !== PAGES.LOGIN && (
        <Navbar page={page} setPage={setPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}
      {renderPage()}
      {page !== PAGES.LOGIN && <Footer setPage={setPage} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
