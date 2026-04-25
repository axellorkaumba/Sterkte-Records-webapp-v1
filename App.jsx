import { useState, useEffect, useRef, createContext, useContext, lazy, Suspense } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { supabase, supabaseConfigured } from "./supabase.js";

// ─── CONFIG ───
const EMAIL_CONFIG = {
  ACCESS_KEY: import.meta.env.VITE_WEB3FORMS_KEY || "",
  ENDPOINT: "https://api.web3forms.com/submit",
};

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "+243850510209";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "contact.sterkterecords@gmail.com";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://sterkterecords.com";

// Date de décès uniformisée — DJ Minho (1er août 2025)
const DJ_MINHO = {
  birthDate: "18/11/2000",
  deathDate: "01/08/2025",
  deathDateFr: "1er août 2025",
};

// ─── COLORS ───
const C = {
  bg: "#0A0A0F", bgCard: "#12121A", bgHover: "#1A1A25", bgInput: "#16161F",
  border: "#2A2A35", white: "#FFFFFF", gold: "#F5C518", red: "#E63946",
  blue: "#4FC3F7", muted: "#8A8A9A", success: "#4CAF50",
};

// ─── SEO ───
const SEO = {
  "/": { title: "Sterkte Records – Label musical indépendant & distribution digitale", desc: "Label musical indépendant basé à Lubumbashi, RDC. Production, distribution digitale sur 150+ plateformes, studio, booking et management d'artistes africains." },
  "/a-propos": { title: "À propos de Sterkte Records – Label passionné et innovant", desc: "Découvrez l'histoire, la vision et l'équipe de Sterkte Records, label indépendant fondé en 2021 à Lubumbashi." },
  "/artistes": { title: "Nos artistes – Roster Sterkte Records", desc: "Découvrez les talents signés chez Sterkte Records : afrobeat, rap, R&B, rumba, gospel, amapiano." },
  "/distribution-musique": { title: "Distribution musicale digitale – Sterkte Records", desc: "Distribuez votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes." },
  "/studio-enregistrement": { title: "Studio d'enregistrement professionnel – Sterkte Records Lubumbashi", desc: "Enregistrement, mixage et mastering professionnel à Lubumbashi. Studio mobile disponible." },
  "/booking-artistes": { title: "Booking artistes & événements – Sterkte Records", desc: "Réservez nos artistes pour concerts, festivals, événements privés et corporate." },
  "/featurings": { title: "Demande de featuring – Collaboration musicale Sterkte Records", desc: "Collaborez avec les artistes Sterkte Records. Réponse sous 7 jours ouvrés." },
  "/services": { title: "Consulting & Management artistique – Sterkte Records", desc: "Stratégie de lancement, gestion de carrière, coaching artistique." },
  "/contact": { title: "Contact – Sterkte Records, Lubumbashi RDC", desc: "Contactez Sterkte Records. Email : " + CONTACT_EMAIL + " | " + WHATSAPP_NUMBER },
  "/cgu": { title: "Conditions Générales d'Utilisation – Sterkte Records", desc: "CGU de Sterkte Records." },
  "/confidentialite": { title: "Politique de confidentialité – Sterkte Records", desc: "Politique de confidentialité de Sterkte Records, conforme RGPD." },
  "/mentions-legales": { title: "Mentions légales – Sterkte Records", desc: "Mentions légales de Sterkte Records SARL." },
};

const ARTIST_GENRES = ["Tout", "Afrobeat", "Rap", "R&B", "Rumba", "Gospel", "Amapiano", "DJ"];

const MUSIC_GENRES = [
  "Afrobeat","Afropop","Afrohouse","Afrotrap","Afrofusion",
  "Amapiano","Rumba congolaise","Ndombolo","Soukous","Lingala pop",
  "Rap / Hip-hop","Trap","Drill","R&B","Soul","Gospel","Zouk",
  "Dancehall","Reggae","Coupé-décalé","Gqom","Kizomba","Kuduro",
  "Highlife","Afrojuju","Bongo Flava","Benga","Mapouka","Fuji",
  "Contemporary gospel","Praise & Worship","Jazz afro","Blues",
  "Pop","Electronic","House","Techno","Deep house","Lounge",
  "Instrumental","Classical","Spoken word","Autre"
];

// Plateformes de distribution (sélection client)
const DSP_PLATFORMS = [
  { id: "spotify", name: "Spotify", category: "Streaming" },
  { id: "apple_music", name: "Apple Music", category: "Streaming" },
  { id: "deezer", name: "Deezer", category: "Streaming" },
  { id: "youtube_music", name: "YouTube Music", category: "Streaming" },
  { id: "tidal", name: "Tidal", category: "Streaming" },
  { id: "amazon_music", name: "Amazon Music", category: "Streaming" },
  { id: "audiomack", name: "Audiomack", category: "Streaming" },
  { id: "boomplay", name: "Boomplay", category: "Streaming Afrique" },
  { id: "anghami", name: "Anghami", category: "Streaming MENA" },
  { id: "napster", name: "Napster", category: "Streaming" },
  { id: "soundcloud", name: "SoundCloud Premier", category: "Streaming" },
  { id: "tiktok", name: "TikTok / Resso", category: "Social" },
  { id: "instagram", name: "Instagram / Facebook", category: "Social" },
  { id: "shazam", name: "Shazam", category: "Identification" },
  { id: "pandora", name: "Pandora", category: "Streaming US" },
  { id: "iheartradio", name: "iHeartRadio", category: "Radio" },
  { id: "qobuz", name: "Qobuz", category: "Hi-Fi" },
];

// Langues principales (codes ISO 639-1 + langues africaines courantes)
const LYRICS_LANGUAGES = [
  "Français", "Anglais", "Lingala", "Swahili", "Kikongo", "Tshiluba",
  "Wolof", "Bambara", "Yoruba", "Igbo", "Haoussa", "Amharique",
  "Arabe", "Espagnol", "Portugais", "Instrumental (sans paroles)", "Autre"
];

// Type de release
const RELEASE_TYPES = [
  { value: "single", label: "Single (1 piste)" },
  { value: "ep", label: "EP (2-6 pistes)" },
  { value: "album", label: "Album (7+ pistes)" },
];

// ─── ICONES SVG ───
const Icon = {
  Music: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Mic: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Calendar: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Handshake: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l8.42 8.42 8.42-8.42a5.4 5.4 0 0 0 0-7.65z" />
    </svg>
  ),
  BarChart: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  User: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Globe: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Rocket: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Diamond: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
  ),
  Target: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  TrendingUp: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Zap: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Search: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Upload: ({ size = 40, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Image: ({ size = 40, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Check: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowLeft: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Clipboard: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Film: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  Map: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  Headphones: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  Instagram: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Twitter: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  Youtube: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  ),
  Facebook: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Spotify: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M8 13.5a6.5 6.5 0 0 1 8 0" /><path d="M6.5 11a9 9 0 0 1 11 0" /><path d="M9.5 16a4 4 0 0 1 5 0" />
    </svg>
  ),
  Play: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Mail: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.47a16 16 0 0 0 5.62 5.62l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Link2: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Award: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Layers: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Eye: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Heart: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Whatsapp: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  Crown: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <path d="M12 2L15 8L22 3L20 12H4L2 3L9 8L12 2Z"/>
      <rect x="4" y="13" width="16" height="2" rx="1"/>
      <rect x="5" y="16" width="14" height="3" rx="1"/>
    </svg>
  ),
  Shield: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Users: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Settings: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  AlertCircle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Plus: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Edit: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Download: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  X: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Clock: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Send: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Pause: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
};

const SERVICES_LIST = [
  { Icon: Icon.Music, title: "Distribution Digitale", desc: "Votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes en quelques jours.", link: "/distribution-musique" },
  { Icon: Icon.Mic, title: "Studio d'Enregistrement", desc: "Studio professionnel à Lubumbashi + studios mobiles à Lubumbashi et au Maroc. Enregistrement, mixage et mastering.", link: "/studio-enregistrement" },
  { Icon: Icon.Calendar, title: "Booking & Événements", desc: "Réservez nos artistes pour concerts, festivals et événements privés.", link: "/booking-artistes" },
  { Icon: Icon.Handshake, title: "Featurings", desc: "Collaborez avec les artistes du roster. Processus simple, réponse sous 7 jours.", link: "/featurings" },
  { Icon: Icon.BarChart, title: "Consulting & Management", desc: "Stratégie de lancement, gestion de carrière et coaching artistique personnalisé.", link: "/services" },
  { Icon: Icon.User, title: "Espace Artiste", desc: "Dashboard personnel : suivez vos streams et gérez vos sorties.", link: "/dashboard" },
];
// ─── AUTH CONTEXT ───
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!error && data) setProfile(data);
  };

  const signUp = async (email, password, meta) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: meta.full_name, artist_name: meta.artist_name },
        emailRedirectTo: `${SITE_URL}/connexion?confirmed=1`,
      },
    });
    if (!error && data.user) {
      // Le profil est créé automatiquement via un trigger Supabase (voir SUPABASE_SCHEMA.sql)
      // On met à jour les champs additionnels
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: meta.full_name,
        artist_name: meta.artist_name,
        genre: meta.genre,
        whatsapp: meta.whatsapp,
        email: email,
        cgu_accepted_at: new Date().toISOString(),
      });
    }
    return { data, error };
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
  };

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/connexion?reset=1`,
    });
  };

  const deleteAccount = async () => {
    if (!user) return { error: new Error("Non connecté") };
    // Suppression du profil (cascade automatique via SQL si bien configuré)
    const { error: profileErr } = await supabase.from("profiles").delete().eq("id", user.id);
    if (profileErr) return { error: profileErr };
    // Note : la suppression complète du user dans auth.users nécessite un appel admin (Edge Function)
    // Pour l'instant, on déconnecte et on marque le profil comme supprimé via trigger DB
    await signOut();
    return { error: null };
  };

  // Vérification admin via colonne DB (et non liste d'emails hardcodée)
  const isAdmin = profile?.is_admin === true;
  const isEmailConfirmed = user?.email_confirmed_at != null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, deleteAccount, fetchProfile, isAdmin, isEmailConfirmed }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── DATA HOOKS ───
function useArtists(limit = 50) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); setError("Configuration Supabase manquante"); return; }
    supabase.from("artists").select("*").order("created_at", { ascending: true }).limit(limit)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setArtists(data || []);
        setLoading(false);
      });
  }, [limit]);
  return { artists, loading, error };
}

function useTestimonials(limit = 12) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }
    supabase.from("testimonials").select("*").eq("featured", true).limit(limit)
      .then(({ data }) => { setTestimonials(data || []); setLoading(false); });
  }, [limit]);
  return { testimonials, loading };
}

function useTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStreams: 0, totalRevenue: "0.00", count: 0, livePlatforms: 0 });

  const fetchTracks = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("tracks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) { setLoading(false); return; }
    const t = data || [];
    setTracks(t);
    const totalStreams = t.reduce((s, tr) => s + (tr.streams || 0), 0);
    const totalRevenue = t.reduce((s, tr) => s + parseFloat(tr.revenue || 0), 0);
    // Calcul réel du nombre de plateformes : somme des platforms uniques sur les tracks live
    const livePlatforms = new Set();
    t.filter(tr => tr.status === "live").forEach(tr => {
      (tr.platforms || []).forEach(p => livePlatforms.add(p));
    });
    setStats({
      totalStreams,
      totalRevenue: totalRevenue.toFixed(2),
      count: t.length,
      livePlatforms: livePlatforms.size,
    });
    setLoading(false);
  };

  useEffect(() => { fetchTracks(); }, [user]);
  return { tracks, stats, loading, refetch: fetchTracks };
}

// ─── HELPERS ───
function useSEO(path) {
  const seo = SEO[path] || SEO["/"];
  useEffect(() => {
    document.title = seo.title;
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", seo.desc);
    const ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", seo.title);
    const ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute("content", seo.desc);
  }, [path, seo]);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    const els = document.querySelectorAll(".sr-reveal,.sr-reveal-left,.sr-reveal-right,.sr-reveal-scale");
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

function HeroBlobs() {
  return (
    <div className="hero-blobs" aria-hidden="true">
      <div className="hero-blob hero-blob-r" />
      <div className="hero-blob hero-blob-g" />
      <div className="hero-blob hero-blob-b" />
    </div>
  );
}

function WaveDivider() {
  return (
    <div className="wave-div" aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,20 C240,60 480,0 720,30 C960,60 1200,10 1440,40 L1440,60 L0,60 Z" opacity="0.6" />
        <path d="M0,35 C360,5 720,55 1080,25 C1260,15 1380,35 1440,30 L1440,60 L0,60 Z" opacity="0.3" />
      </svg>
    </div>
  );
}

async function sendEmail(data) {
  if (!EMAIL_CONFIG.ACCESS_KEY) {
    console.warn("[Sterkte] VITE_WEB3FORMS_KEY manquant — email non envoyé");
    return false;
  }
  try {
    const fd = new FormData();
    fd.append("access_key", EMAIL_CONFIG.ACCESS_KEY);
    fd.append("subject", data.subject || "Nouveau message - Sterkte Records");
    fd.append("from_name", data.name || "Site Web");
    Object.entries(data).forEach(([k, v]) => { if (k !== "subject" && v && typeof v === "string") fd.append(k, v); });
    const res = await fetch(EMAIL_CONFIG.ENDPOINT, { method: "POST", body: fd });
    return (await res.json()).success;
  } catch { return false; }
}

// Notif équipe : ouvrir WhatsApp dans un nouvel onglet
// Note: dépend du clic utilisateur. À remplacer par un webhook serveur (Twilio/Meta API) en prod.
function sendWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

// Génération ISRC (placeholder — à remplacer par vrai système quand label aura son préfixe officiel)
// Format ISRC: CC-XXX-YY-NNNNN (Pays-Code label-Année-Numéro)
function generateISRC(year = new Date().getFullYear()) {
  const yy = String(year).slice(-2);
  const num = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  // CD = République Démocratique du Congo. STK = code label proposé pour Sterkte Records
  return `CD-STK-${yy}-${num}`;
}

// Génération UPC (placeholder — 12 chiffres)
function generateUPC() {
  const base = String(Math.floor(Math.random() * 1e11)).padStart(11, "0");
  // Chiffre de contrôle UPC-A
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += parseInt(base[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + checkDigit;
}

// Validation email
function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// Validation WhatsApp (international, +XXX...)
function isValidPhone(p) {
  return /^\+\d{8,15}$/.test(p.replace(/\s/g, ""));
}

// Force du mot de passe (0-4)
function passwordStrength(p) {
  let score = 0;
  if (!p) return 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4);
}

// Upload sécurisé : path = userId/filename, validation côté client
async function uploadFile(bucket, file, userId, options = {}) {
  const maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB par défaut
  const allowedMimes = options.allowedMimes || [];

  if (file.size > maxSize) {
    return { url: null, error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum : ${maxSize / 1024 / 1024} MB.` };
  }
  if (allowedMimes.length > 0 && !allowedMimes.some(m => file.type.startsWith(m))) {
    return { url: null, error: `Type de fichier non autorisé : ${file.type}` };
  }

  const ext = file.name.split(".").pop().toLowerCase();
  // Path UID-protégé (à combiner avec RLS Supabase qui vérifie storage.foldername(name)[1] = auth.uid())
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  // Stocker le path interne (pas l'URL publique) — on génère une signed URL à la lecture
  return { url: data.path, error: null };
}

// Génère une signed URL valide 1h pour un path stocké (audio/cover)
async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl || null;
}

function PageBanner({ tag, title, subtitle, accent = C.red }) {
  return (
    <div className="pg-banner">
      <div className="pg-banner-bg" style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent}14 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, ${C.gold}08 0%, transparent 50%)` }} />
      <svg className="pg-banner-deco" viewBox="0 0 1200 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0,150 Q300,80 600,150 T1200,150" stroke={`${accent}20`} strokeWidth="1" fill="none" />
        <path d="M0,200 Q400,120 800,200 T1600,200" stroke={`${C.gold}10`} strokeWidth="1" fill="none" />
        <circle cx="80" cy="80" r="60" stroke={`${accent}0A`} strokeWidth="1" fill="none" />
        <circle cx="1100" cy="220" r="80" stroke={`${C.gold}08`} strokeWidth="1" fill="none" />
      </svg>
      <div className="pg-banner-in">
        <div className="sec-tag">{tag}</div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="pg-banner-fade" />
    </div>
  );
}

// Modale générique réutilisable
function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer"><Icon.X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Lecteur audio inline (pour Admin & Dashboard artiste)
function AudioPlayer({ url, label }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  if (!url) return <div style={{ fontSize: 12, color: C.muted }}>Audio indisponible</div>;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.bgInput, borderRadius: 8, border: `1px solid ${C.border}` }}>
      <button onClick={toggle} className="btn btn-g btn-sm" aria-label={playing ? "Pause" : "Lecture"} style={{ width: 32, height: 32, padding: 0, justifyContent: "center" }}>
        {playing ? <Icon.Pause size={14} /> : <Icon.Play size={14} />}
      </button>
      <span style={{ fontSize: 12, color: C.muted }}>{label || "Aperçu"}</span>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" style={{ display: "none" }} />
    </div>
  );
}
// ─── ALL CSS ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${C.bg};--card:${C.bgCard};--hover:${C.bgHover};--input:${C.bgInput};--border:${C.border};--white:${C.white};--gold:${C.gold};--red:${C.red};--blue:${C.blue};--muted:${C.muted};--ok:${C.success}}
body{background:var(--bg);color:var(--white);-webkit-font-smoothing:antialiased}
.app{font-family:'Raleway',sans-serif;background:var(--bg);color:var(--white);min-height:100vh;overflow-x:hidden}
h1,h2,h3,h4,h5,h6{font-family:'Montserrat',sans-serif}
a{text-decoration:none;color:inherit}
button{cursor:pointer;font-family:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:4px}

/* ── NAVBAR ── */
nav.n{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(42,42,53,0.5);transition:all .3s}
nav.n.s{background:rgba(10,10,15,0.95)}
.n-logo{display:flex;align-items:center;gap:10px}
.n-logo-img{height:36px;width:auto;object-fit:contain}
.n-logo-t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.5px}
.n-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
.n-links{display:flex;align-items:center;gap:24px;list-style:none}
.n-links a{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);transition:color .3s;position:relative}
.n-links a:hover,.n-links a.ac{color:var(--white)}
.n-links a.ac::after{content:'';position:absolute;bottom:-4px;left:0;right:0;height:2px;background:var(--gold);border-radius:1px}
.n-acts{display:flex;gap:8px;align-items:center;flex-wrap:nowrap}
.n-ham{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}
.n-ham span{display:block;width:24px;height:2px;background:var(--white);transition:all .3s}
.mob{position:fixed;inset:0;background:rgba(10,10,15,0.98);backdrop-filter:blur(20px);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
.mob a{font-family:'Montserrat',sans-serif;font-size:18px;font-weight:600;color:var(--white);letter-spacing:.5px}
.mob a.ac{color:var(--gold)}
.mob-close{position:absolute;top:24px;right:24px;background:none;border:none;color:var(--white);font-size:32px;cursor:pointer}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:8px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.5px;border:none;transition:all .25s;text-decoration:none;cursor:pointer;white-space:nowrap}
.btn-g{background:var(--gold);color:#000}
.btn-g:hover{background:#FFD449;transform:translateY(-1px);box-shadow:0 6px 20px rgba(245,197,24,.3)}
.btn-r{background:var(--red);color:#fff}
.btn-r:hover{background:#FF4757;transform:translateY(-1px);box-shadow:0 6px 20px rgba(230,57,70,.3)}
.btn-o{background:transparent;color:var(--white);border:1px solid var(--border)}
.btn-o:hover{border-color:var(--gold);color:var(--gold)}
.btn-ghost{background:transparent;color:var(--muted);border:none;text-transform:none;letter-spacing:0;font-size:13px}
.btn-ghost:hover{color:var(--white)}
.btn-lg{padding:14px 28px;font-size:13px}
.btn-sm{padding:6px 14px;font-size:11px}
.btn-danger{background:var(--red);color:#fff}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;box-shadow:none!important}

/* ── HERO ── */
.hero{position:relative;display:flex;align-items:center;padding:120px 60px 60px;overflow:hidden;min-height:100vh}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(230,57,70,.08) 0%,transparent 50%),radial-gradient(ellipse at 70% 50%,rgba(245,197,24,.06) 0%,transparent 50%);z-index:0}
.hero-blobs{position:absolute;inset:0;z-index:0;pointer-events:none}
.hero-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.4;animation:float 18s ease-in-out infinite}
.hero-blob-r{width:400px;height:400px;background:var(--red);top:10%;left:-10%}
.hero-blob-g{width:380px;height:380px;background:var(--gold);bottom:10%;right:-10%;animation-delay:-6s}
.hero-blob-b{width:320px;height:320px;background:var(--blue);top:30%;right:30%;animation-delay:-12s}
@keyframes float{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.05)}66%{transform:translate(-30px,40px) scale(.95)}}
.hero-c{position:relative;z-index:1;max-width:800px;text-align:center;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(230,57,70,.1);border:1px solid rgba(230,57,70,.3);border-radius:20px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;color:var(--red);letter-spacing:.5px}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--red);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero-sub{font-size:16px;line-height:1.7;color:var(--muted);max-width:560px;margin:0 auto 36px}
.gold{color:var(--gold)}.red{color:var(--red)}.blue{color:var(--blue)}

/* ── MARQUEE ── */
.marquee{overflow:hidden;background:rgba(18,18,26,0.6);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:20px 0}
.marquee-in{display:flex;gap:60px;animation:scroll 30s linear infinite;width:max-content}
@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.mq-item{display:flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;white-space:nowrap}
.mq-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}

/* ── SECTIONS ── */
.sec{padding:80px 60px;position:relative}
.sec-h{text-align:center;max-width:700px;margin:0 auto 48px}
.sec-tag{display:inline-block;padding:4px 12px;border:1px solid var(--gold);border-radius:4px;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px}
.sec-title{font-size:36px;font-weight:800;letter-spacing:-1px;line-height:1.2;margin-bottom:16px}
.sec-desc{font-size:16px;color:var(--muted);max-width:600px;margin:0 auto;line-height:1.7}

/* ── SERVICES & WHY GRID ── */
.srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.srv{padding:32px;background:var(--card);border:1px solid var(--border);border-radius:12px;transition:all .3s;display:block;position:relative;overflow:hidden}
.srv:hover{border-color:var(--gold);transform:translateY(-4px);box-shadow:0 10px 40px rgba(245,197,24,.1)}
.srv-ico{width:48px;height:48px;border-radius:10px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:20px}
.srv h3{font-size:18px;font-weight:700;margin-bottom:10px}
.srv p{font-size:14px;color:var(--muted);line-height:1.6}
.srv-arr{position:absolute;top:32px;right:32px;color:var(--muted);transition:all .3s}
.srv:hover .srv-arr{color:var(--gold);transform:translate(4px,-4px)}
.why-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.why{padding:24px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.why-ico{width:42px;height:42px;border-radius:8px;background:rgba(79,195,247,.08);display:flex;align-items:center;justify-content:center;color:var(--blue);margin-bottom:16px}
.why h4{font-size:16px;font-weight:700;margin-bottom:8px}
.why p{font-size:13px;color:var(--muted);line-height:1.6}
.testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.testi{padding:28px;background:var(--card);border:1px solid var(--border);border-radius:12px}
.testi p{font-size:15px;color:var(--white);line-height:1.7;font-style:italic;margin-bottom:16px}
.testi-author{font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700}
.testi-role{font-size:12px;color:var(--muted);margin-top:2px}

/* ── PAGE BANNER ── */
.pg{padding-top:72px;min-height:80vh}
.pg-banner{position:relative;padding:120px 60px 80px;overflow:hidden;border-bottom:1px solid var(--border)}
.pg-banner-bg{position:absolute;inset:0;z-index:0}
.pg-banner-deco{position:absolute;inset:0;width:100%;height:100%;z-index:0}
.pg-banner-in{position:relative;z-index:1;max-width:800px}
.pg-banner-in h1{font-size:48px;font-weight:900;letter-spacing:-2px;line-height:1.1;margin-bottom:16px}
.pg-banner-in p{font-size:17px;color:var(--muted);line-height:1.7;max-width:600px}
.pg-banner-fade{position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,var(--bg))}
.pg-c{padding:60px;max-width:1200px;margin:0 auto}

/* ── ARTISTS ── */
.art-hero{padding:120px 60px 32px;text-align:center}
.art-big{font-family:'Montserrat',sans-serif;font-size:clamp(48px,8vw,120px);font-weight:900;letter-spacing:-3px;background:linear-gradient(180deg,var(--white),var(--muted));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;margin-bottom:24px}
.art-filters{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.art-tag{padding:6px 14px;border:1px solid var(--border);border-radius:20px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;color:var(--muted);background:transparent;cursor:pointer;letter-spacing:.5px;text-transform:uppercase;transition:all .2s}
.art-tag:hover{color:var(--white);border-color:var(--white)}
.art-tag.ac{background:var(--gold);color:#000;border-color:var(--gold)}
.art-search{max-width:360px;margin:0 auto 48px;position:relative}
.art-search input{width:100%;padding:10px 14px 10px 38px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:var(--white);font-size:13px;font-family:inherit}
.art-search input:focus{border-color:var(--gold);outline:none}
.art-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%)}
.art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;max-width:1200px;margin:0 auto;padding:0 60px 80px}
.art-card{position:relative;aspect-ratio:3/4;border-radius:12px;overflow:hidden;cursor:pointer;background:var(--card)}
.art-card img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.art-card:hover img{transform:scale(1.06)}
.art-ov{position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(0,0,0,.95));padding:20px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff}
.art-name{font-family:'Montserrat',sans-serif;font-size:18px;font-weight:800;margin-bottom:4px}
.art-genre{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-weight:600}
.art-cta{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--white);font-weight:600;margin-top:10px;text-transform:uppercase;letter-spacing:.5px;opacity:0;transform:translateY(8px);transition:all .3s}
.art-card:hover .art-cta{opacity:1;transform:translateY(0)}

/* Page artiste détail */
.ap{padding-top:72px}
.ap-hero{position:relative;height:60vh;min-height:480px;overflow:hidden;display:flex;align-items:flex-end}
.ap-hero-bg{position:absolute;inset:0}
.ap-hero-img{width:100%;height:100%;object-fit:cover;filter:brightness(.5)}
.ap-hero-overlay{position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(10,10,15,.95))}
.ap-hero-c{position:relative;z-index:1;padding:60px;max-width:1200px;width:100%}
.ap-back-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;color:var(--white);font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:24px;backdrop-filter:blur(8px)}
.ap-back-btn:hover{background:rgba(255,255,255,.15)}
.ap-stats-bar{display:flex;align-items:center;gap:40px;padding:24px 60px;border-bottom:1px solid var(--border);background:rgba(18,18,26,.5)}
.ap-stat{display:flex;flex-direction:column}
.ap-stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:4px}
.ap-stat-v{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;color:var(--gold)}
.ap-body{max-width:1200px;margin:0 auto;padding:60px}
.ap-grid{display:grid;grid-template-columns:2fr 1fr;gap:48px}

/* Tribute card DJ Minho */
.tribute-card-wrapper{display:flex;justify-content:center;padding:0 60px 24px}
.tribute-card-inner{width:100%;max-width:420px;position:relative;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,rgba(10,10,15,0.98),rgba(18,18,26,0.9));border:1px solid rgba(245,197,24,0.25);box-shadow:0 8px 60px rgba(245,197,24,0.06),0 0 120px rgba(245,197,24,0.03);aspect-ratio:1/1;cursor:pointer;transition:transform .3s}
.tribute-card-inner:hover{transform:translateY(-4px)}
.tribute-bg{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(245,197,24,.05),transparent 70%)}
.tribute-particles{position:absolute;inset:0;pointer-events:none}
.tribute-star{position:absolute;width:3px;height:3px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold);animation:twinkle 4s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.5)}50%{opacity:.7;transform:scale(1)}}
.tribute-img{width:100%;height:100%;object-fit:cover;filter:brightness(.35) saturate(.5) sepia(.2)}
.tribute-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(10,10,15,.85))}
.tribute-content{position:absolute;inset:0;padding:32px;display:flex;flex-direction:column;justify-content:flex-end;z-index:2}
.tribute-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.3);border-radius:14px;width:fit-content;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px}
.tribute-name{font-family:'Montserrat',sans-serif;font-size:26px;font-weight:900;color:var(--white);margin-bottom:4px}
.tribute-dates{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--gold);letter-spacing:1px;margin-bottom:14px;font-weight:600}
.tribute-quote{font-size:13px;font-style:italic;color:rgba(255,255,255,.7);line-height:1.5}

/* ── FORMS ── */
.fm{max-width:640px}
.fm-row{display:flex;gap:16px;margin-bottom:0}
.fm-row>*{flex:1}
.fm-g{margin-bottom:16px}
.fm-l{display:block;font-size:12px;color:var(--muted);font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase}
.fm-i,.fm-s,.fm-t{width:100%;padding:12px 14px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:inherit;font-size:14px;transition:border-color .2s}
.fm-i:focus,.fm-s:focus,.fm-t:focus{border-color:var(--gold);outline:none}
.fm-t{min-height:120px;resize:vertical}
.fm-i-pwd{padding-right:42px}
.fm-eye{position:absolute;right:12px;top:36px;background:none;border:none;color:var(--muted);cursor:pointer;display:flex;align-items:center}
.fm-eye:hover{color:var(--white)}
.fm-err{padding:10px 14px;background:rgba(230,57,70,.08);border:1px solid rgba(230,57,70,.25);border-radius:6px;font-size:12px;color:var(--red)}
.fm-help{font-size:11px;color:var(--muted);margin-top:4px}
.fm-cb{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--muted);cursor:pointer;line-height:1.5}
.fm-cb input[type="checkbox"]{margin-top:2px;width:16px;height:16px;accent-color:var(--gold);flex-shrink:0;cursor:pointer}
.fm-cb a{color:var(--blue);text-decoration:underline}
.pwd-strength{display:flex;gap:4px;margin-top:6px}
.pwd-bar{flex:1;height:3px;background:var(--border);border-radius:2px;transition:background .3s}
.pwd-bar.f1{background:#E63946}
.pwd-bar.f2{background:#F5C518}
.pwd-bar.f3{background:#4FC3F7}
.pwd-bar.f4{background:#4CAF50}

/* ── STEPS ── */
.steps{display:flex;flex-direction:column;gap:0;margin:40px 0;max-width:640px}
.step{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid var(--border);align-items:flex-start}
.step:last-child{border-bottom:none}
.step-n{width:36px;height:36px;border-radius:50%;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.3);color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;font-size:14px;flex-shrink:0}
.step-c h4{font-size:15px;font-weight:700;margin-bottom:4px}
.step-c p{font-size:13px;color:var(--muted);line-height:1.6}

/* ── FEATS / PRICING ── */
.feats{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin:32px 0}
.feat{padding:24px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.feat-ico{width:42px;height:42px;border-radius:8px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:14px}
.feat h4{font-size:14px;font-weight:700;margin-bottom:8px}
.feat p{font-size:12px;color:var(--muted);line-height:1.6}
.pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin:32px 0 48px}
.price-card{padding:32px;background:var(--card);border:1px solid var(--border);border-radius:12px;position:relative}
.price-card.ft{border-color:var(--gold)}
.price-card.ft::before{content:'POPULAIRE';position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:800;padding:4px 12px;border-radius:10px;letter-spacing:1px}
.price-card h4{font-size:14px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}
.price-val{font-family:'Montserrat',sans-serif;font-size:36px;font-weight:900;color:var(--white);margin-bottom:14px}
.price-val span{font-size:14px;color:var(--muted);font-weight:400}
.price-card ul{list-style:none}
.price-card li{font-size:13px;color:var(--muted);padding:6px 0;display:flex;align-items:center;gap:10px}
.chk{width:18px;height:18px;border-radius:50%;background:rgba(245,197,24,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* ── TABS ── */
.tabs{display:flex;gap:0;margin-bottom:32px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:14px 24px;background:transparent;border:none;color:var(--muted);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;position:relative;white-space:nowrap;transition:color .2s}
.tab:hover{color:var(--white)}
.tab.ac{color:var(--white)}
.tab.ac::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--gold)}

/* ── DASHBOARD ── */
.dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:32px}
.dash-stat{padding:24px;background:var(--card);border:1px solid var(--border);border-radius:12px}
.dash-stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:8px}
.dash-stat-v{font-family:'Montserrat',sans-serif;font-size:32px;font-weight:900;letter-spacing:-1px}
.dash-stat-note{font-size:11px;color:var(--muted);margin-top:8px;font-style:italic}
.dash-tracks{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.dash-tracks-h{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.dash-tracks-h h3{font-size:16px;font-weight:700}
.tr-row{display:grid;grid-template-columns:40px 2fr 1fr 1fr 120px 100px;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border);align-items:center;font-size:13px}
.tr-row:last-child{border-bottom:none}
.tr-row:hover{background:var(--hover)}
.tr-num{color:var(--muted);font-family:'Montserrat',sans-serif;font-weight:600}
.tr-title{font-weight:600}
.tr-info{color:var(--muted)}
.tr-status{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600}
.tr-dot{width:8px;height:8px;border-radius:50%}
.tr-actions{display:flex;gap:6px;justify-content:flex-end}
.tr-act-btn{background:transparent;border:1px solid var(--border);color:var(--muted);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.tr-act-btn:hover{border-color:var(--gold);color:var(--gold)}
.tr-act-btn.danger:hover{border-color:var(--red);color:var(--red)}

/* Upload zones */
.upload{padding:48px;background:var(--card);border:2px dashed var(--border);border-radius:12px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:16px}
.upload:hover{border-color:var(--gold);background:var(--hover)}
.upload.has-file{border-color:var(--ok);border-style:solid}
.upload-ico{margin-bottom:14px}
.upload h4{font-size:14px;font-weight:600;margin-bottom:6px}
.upload p{font-size:12px;color:var(--muted)}

/* Splits royalties (UI dynamique) */
.splits-box{background:var(--bgInput);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:16px}
.split-row{display:grid;grid-template-columns:2fr 1fr 80px 32px;gap:10px;align-items:center;margin-bottom:8px}
.split-row:last-child{margin-bottom:0}
.split-total{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:13px}
.split-total.ok{color:var(--ok)}
.split-total.err{color:var(--red)}

/* DSP platforms */
.dsp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:16px}
.dsp-item{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bgInput);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;transition:all .2s}
.dsp-item:hover{border-color:var(--gold)}
.dsp-item.selected{border-color:var(--gold);background:rgba(245,197,24,.05)}
.dsp-item input[type="checkbox"]{accent-color:var(--gold);cursor:pointer}

/* Timeline statut distribution */
.timeline{display:flex;align-items:flex-start;gap:0;margin:24px 0;padding:24px;background:var(--bgInput);border:1px solid var(--border);border-radius:10px;overflow-x:auto}
.timeline-step{flex:1;min-width:120px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative}
.timeline-dot{width:28px;height:28px;border-radius:50%;background:var(--bg);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:800;color:var(--muted);z-index:1}
.timeline-step.done .timeline-dot{background:var(--ok);border-color:var(--ok);color:#000}
.timeline-step.current .timeline-dot{background:var(--gold);border-color:var(--gold);color:#000;box-shadow:0 0 0 4px rgba(245,197,24,.15)}
.timeline-step.rejected .timeline-dot{background:var(--red);border-color:var(--red);color:#fff}
.timeline-step:not(:last-child)::after{content:'';position:absolute;top:14px;left:50%;width:100%;height:2px;background:var(--border);z-index:0}
.timeline-step.done:not(:last-child)::after{background:var(--ok)}
.timeline-label{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;color:var(--muted);margin-top:8px;text-transform:uppercase;letter-spacing:.5px;line-height:1.3}
.timeline-step.done .timeline-label,.timeline-step.current .timeline-label{color:var(--white)}

/* ── ADMIN ── */
.admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.admin-row{display:grid;grid-template-columns:90px 2fr 1fr 1fr 1fr 180px;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border);align-items:center}
.admin-row:hover{background:var(--hover)}
.admin-badge{padding:4px 10px;border-radius:4px;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;text-align:center}
.admin-badge.live{background:rgba(76,175,80,.12);color:var(--ok);border:1px solid rgba(76,175,80,.3)}
.admin-badge.pending{background:rgba(245,197,24,.12);color:var(--gold);border:1px solid rgba(245,197,24,.3)}
.admin-badge.rejected{background:rgba(230,57,70,.12);color:var(--red);border:1px solid rgba(230,57,70,.3)}
.admin-badge.review{background:rgba(79,195,247,.12);color:var(--blue);border:1px solid rgba(79,195,247,.3)}
.admin-badge.sent{background:rgba(255,152,0,.12);color:#FF9800;border:1px solid rgba(255,152,0,.3)}
.admin-action{padding:6px 12px;border-radius:6px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;border:none;cursor:pointer;text-transform:uppercase;letter-spacing:.5px}
.admin-action.approve{background:var(--ok);color:#000}
.admin-action.approve:hover{background:#5DBE60}
.admin-action.reject{background:transparent;color:var(--red);border:1px solid var(--red)}
.admin-action.reject:hover{background:var(--red);color:#fff}
.admin-action.view{background:transparent;color:var(--blue);border:1px solid var(--blue)}
.admin-reg-row{display:grid;grid-template-columns:48px 2fr 1fr 1fr 1fr;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border);align-items:center}

/* ── LOGIN ── */
.login-pg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:radial-gradient(ellipse at center,rgba(230,57,70,.06) 0%,var(--bg) 70%)}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:48px;max-width:480px;width:100%}
.login-card h2{font-size:24px;font-weight:800;margin-bottom:8px;text-align:center}
.login-card .sub{font-size:13px;color:var(--muted);text-align:center;margin-bottom:24px}

/* ── FOOTER ── */
footer.ft{background:rgba(10,10,15,.95);border-top:1px solid var(--border);padding:60px 60px 32px}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1100px;margin:0 auto 40px}
.ft-brand p{font-size:14px;color:var(--muted);line-height:1.7;margin-top:12px;max-width:320px}
.ft h5{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
.ft ul{list-style:none}
.ft li{font-size:13px;color:var(--muted);padding:4px 0}
.ft a:hover{color:var(--gold)}
.ft-bottom{text-align:center;padding-top:32px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);max-width:1100px;margin:0 auto}
.ft-legal{display:flex;gap:16px;justify-content:center;margin-top:8px;flex-wrap:wrap}
.ft-legal a{color:var(--muted);font-size:11px}

/* ── TOAST ── */
.toast{position:fixed;bottom:24px;right:24px;z-index:300;padding:14px 24px;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;animation:slideUp .3s ease;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,.4)}
.toast.ok{background:var(--ok);color:#000}
.toast.err{background:var(--red);color:#fff}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

/* ── MODAL ── */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal-card{background:var(--card);border:1px solid var(--border);border-radius:12px;width:100%;max-height:90vh;overflow:auto;animation:slideUp .25s}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border)}
.modal-header h3{font-size:16px;font-weight:700}
.modal-close{background:transparent;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:4px;display:flex;align-items:center}
.modal-close:hover{color:var(--white);background:var(--hover)}
.modal-body{padding:24px}

/* ── SCROLL REVEAL ── */
.sr-reveal,.sr-reveal-left,.sr-reveal-right,.sr-reveal-scale{opacity:0;transition:all .8s cubic-bezier(.25,.46,.45,.94)}
.sr-reveal{transform:translateY(40px)}
.sr-reveal-left{transform:translateX(-40px)}
.sr-reveal-right{transform:translateX(40px)}
.sr-reveal-scale{transform:scale(.92)}
.sr-reveal.visible,.sr-reveal-left.visible,.sr-reveal-right.visible,.sr-reveal-scale.visible{opacity:1;transform:translateY(0) translateX(0) scale(1)}

/* Loading box */
.loading-box{padding:40px;text-align:center;color:var(--muted);font-size:14px}

/* Error banner */
.error-banner{position:fixed;top:0;left:0;right:0;z-index:500;padding:12px 20px;background:var(--red);color:#fff;text-align:center;font-size:13px;font-weight:600}

/* Wave divider */
.wave-div{margin:0 -60px;line-height:0}
.wave-div svg{width:100%;height:60px;fill:rgba(18,18,26,.6)}

/* About stats */
.about-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.about-stat{padding:32px;text-align:center;border-right:1px solid var(--border)}
.about-stat:last-child{border-right:none}
.about-stat-v{font-family:'Montserrat',sans-serif;font-size:36px;font-weight:900;color:var(--gold)}
.about-stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-top:8px}

/* Artists page bg */
.artists-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.artists-bg-orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.15}
.artists-bg-orb1{width:500px;height:500px;background:var(--red);top:-20%;left:-10%}
.artists-bg-orb2{width:400px;height:400px;background:var(--gold);top:30%;right:-10%}
.artists-bg-orb3{width:350px;height:350px;background:var(--blue);bottom:-10%;left:30%}
.artists-page-content{position:relative;z-index:1}

/* Legal pages */
.legal{max-width:800px;margin:0 auto;padding:120px 60px 80px}
.legal h1{font-size:32px;font-weight:900;margin-bottom:32px;letter-spacing:-1px}
.legal h2{font-size:20px;font-weight:700;margin-top:32px;margin-bottom:16px;color:var(--gold)}
.legal h3{font-size:16px;font-weight:700;margin-top:24px;margin-bottom:8px}
.legal p,.legal li{font-size:14px;line-height:1.8;color:var(--muted);margin-bottom:12px}
.legal ul{padding-left:24px;margin-bottom:12px}
.legal a{color:var(--blue);text-decoration:underline}

/* ── RESPONSIVE ── */
@media(max-width:900px){
  nav.n{padding:0 20px}
  .n-links{display:none}.n-ham{display:flex}
  .n-acts .btn-r{font-size:10px;padding:6px 10px;letter-spacing:0}
  .hero{padding:100px 24px 40px;min-height:auto}
  .sec{padding:60px 24px}.pg-c{padding:32px 24px}
  .pg-banner{padding:100px 24px 60px}
  .pg-banner-in h1{font-size:32px;letter-spacing:-1px}
  .sec-title{font-size:28px}
  footer.ft{padding:40px 24px}.ft-grid{grid-template-columns:1fr;gap:24px}
  .fm-row{flex-direction:column;gap:0}
  .tr-row{grid-template-columns:30px 2fr 80px;gap:8px;padding:12px 16px;font-size:12px}
  .tr-row .tr-info,.tr-row .tr-actions{display:none}
  .tr-row .tr-status{justify-self:end}
  .art-grid{padding:0 24px 60px;gap:12px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .art-hero{padding:100px 24px 24px}.art-big{letter-spacing:-1px}.art-name{font-size:13px}
  .ap-grid{grid-template-columns:1fr}.ap-hero-c{padding:32px 24px}.ap-body{padding:32px 24px}.ap-stats-bar{padding:20px 24px;gap:20px;flex-wrap:wrap}
  .about-stats{grid-template-columns:1fr 1fr}.about-stat{border-bottom:1px solid var(--border)}
  .tribute-card-wrapper{padding:0 24px 24px}
  .login-card{padding:32px 24px}
  .admin-row,.admin-reg-row{grid-template-columns:1fr;gap:8px;padding:16px}
  .timeline{flex-direction:column;align-items:stretch}
  .timeline-step{flex-direction:row;gap:12px;text-align:left}
  .timeline-step::after{display:none}
  .timeline-label{margin-top:0}
  .legal{padding:100px 24px 60px}
  .split-row{grid-template-columns:1fr;gap:6px}
  .modal-card{margin:10px}
}
::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:var(--muted)}
`;
// ─── NAVBAR ───
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const loc = useLocation();
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const links = [
    { to: "/", label: "Accueil" },
    { to: "/a-propos", label: "À propos" },
    { to: "/artistes", label: "Artistes" },
    { to: "/distribution-musique", label: "Distribution" },
    { to: "/studio-enregistrement", label: "Studio" },
    { to: "/booking-artistes", label: "Booking" },
    { to: "/featurings", label: "Featurings" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
  ];
  return (
    <>
      <nav className={`n ${scrolled ? "s" : ""}`}>
        <Link to="/" className="n-logo" aria-label="Sterkte Records — Accueil">
          <img src="/logo.png" alt="" className="n-logo-img" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="n-logo-t"><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></span>
        </Link>
        <ul className="n-links">{links.map((l) => <li key={l.to}><Link to={l.to} className={loc.pathname === l.to ? "ac" : ""}>{l.label}</Link></li>)}</ul>
        <div className="n-acts">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="btn btn-o btn-sm" aria-label="Espace admin"><Icon.Shield size={12} />Admin</Link>}
              <Link to="/dashboard" className="btn btn-g btn-sm">Dashboard</Link>
              <button className="btn btn-o btn-sm" onClick={signOut}>Déconnexion</button>
            </>
          ) : (<Link to="/connexion" className="btn btn-r btn-sm">Espace Artiste</Link>)}
          <button className="n-ham" onClick={() => setMobOpen(true)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>
      {mobOpen && (
        <div className="mob">
          <button className="mob-close" onClick={() => setMobOpen(false)} aria-label="Fermer le menu">✕</button>
          {links.map((l) => <Link key={l.to} to={l.to} className={loc.pathname === l.to ? "ac" : ""} onClick={() => setMobOpen(false)}>{l.label}</Link>)}
          <Link to={user ? "/dashboard" : "/connexion"} onClick={() => setMobOpen(false)} style={{ color: C.gold, marginTop: 16 }}>{user ? "Dashboard" : "Connexion"}</Link>
          {isAdmin && <Link to="/admin" onClick={() => setMobOpen(false)} style={{ color: C.gold }}>Admin</Link>}
        </div>
      )}
    </>
  );
}

// ─── FOOTER ───
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ft"><div className="ft-grid">
      <div className="ft-brand">
        <img src="/logo.png" alt="" style={{ height: 32, marginBottom: 12 }} onError={(e) => { e.target.style.display = "none"; }} />
        <Link to="/" className="n-logo-t" style={{ fontSize: 22 }}><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></Link>
        <p>Label musical indépendant dédié à l'essor des talents musicaux africains. Basé à Lubumbashi, RDC.</p>
      </div>
      <div><h5>Services</h5><ul>
        <li><Link to="/distribution-musique">Distribution</Link></li>
        <li><Link to="/studio-enregistrement">Studio</Link></li>
        <li><Link to="/booking-artistes">Booking</Link></li>
        <li><Link to="/featurings">Featurings</Link></li>
        <li><Link to="/services">Consulting</Link></li>
      </ul></div>
      <div><h5>Label</h5><ul>
        <li><Link to="/a-propos">À propos</Link></li>
        <li><Link to="/artistes">Nos artistes</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul></div>
      <div><h5>Contact</h5><ul>
        <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
        <li><a href={`tel:${WHATSAPP_NUMBER}`}>{WHATSAPP_NUMBER}</a></li>
        <li>Lubumbashi, RDC</li>
        <li style={{ marginTop: 8 }}><a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer noopener" style={{ color: C.blue }}>Linktree ↗</a></li>
      </ul></div>
    </div>
    <div className="ft-bottom">
      © {year} Sterkte Records SARL — Tous droits réservés
      <div className="ft-legal">
        <Link to="/cgu">CGU</Link>
        <Link to="/confidentialite">Politique de confidentialité</Link>
        <Link to="/mentions-legales">Mentions légales</Link>
      </div>
    </div>
    </footer>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`} role="status" aria-live="polite">{msg}</div>;
}

// ─── HOMEPAGE ───
function HomePage() {
  useSEO("/");
  useScrollReveal();
  const { artists } = useArtists();
  const { testimonials } = useTestimonials();
  const platforms = ["SPOTIFY", "APPLE MUSIC", "DEEZER", "YOUTUBE MUSIC", "TIDAL", "AMAZON MUSIC", "AUDIOMACK", "BOOMPLAY"];
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cards = artists.slice(0, 5);
  const rotations = [-18, -9, 0, 9, 18];
  const translateY = [-20, -35, -45, -35, -20];

  return (
    <>
      <section className="hero" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: "100vh", padding: "120px 60px 80px" }}>
        <div className="hero-bg" />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none", zIndex: 0 }} viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M0,${180 + i * 38} C360,${140 + i * 38} 720,${220 + i * 38} 1080,${180 + i * 38} C1260,${160 + i * 38} 1380,${200 + i * 38} 1440,${190 + i * 38}`} stroke="#F5C518" strokeWidth="0.8" fill="none" opacity={0.55 - i * 0.03} />
          ))}
        </svg>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto" }}>
          <div className="hero-badge" style={{ display: "inline-flex", marginBottom: 32 }}><div className="hero-badge-dot" />Label indépendant · From Lubumbashi to the World</div>
          <h1 style={{ fontSize: "clamp(24px,2.6vw,38px)", fontWeight: 800, lineHeight: 1.3, letterSpacing: 1, marginBottom: 48, textTransform: "uppercase" }}>
            VOTRE MUSIQUE SUR <span className="gold">150+ PLATEFORMES</span><br/>EN QUELQUES <span className="red">JOURS</span>
          </h1>
        </div>

        {cards.length > 0 && (
          <div style={{ position: "relative", zIndex: 2, width: "100%", height: 320, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
            {cards.map((a, i) => {
              const rot = rotations[i] || 0;
              const ty = (translateY[i] || 0) + offset * 0.04 * (i % 2 === 0 ? 1 : -1);
              return (
                <div key={a.id}
                  style={{
                    position: "absolute",
                    width: 160,
                    height: 220,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "3px solid rgba(255,255,255,0.15)",
                    transform: `rotate(${rot}deg) translateY(${ty}px)`,
                    transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                    left: `calc(50% - 80px + ${(i - 2) * 120}px)`,
                    zIndex: i === 2 ? 5 : i === 1 || i === 3 ? 4 : 3,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = `rotate(${rot * 0.3}deg) translateY(${ty - 20}px) scale(1.08)`;
                    e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.6)";
                    e.currentTarget.style.zIndex = "10";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = `rotate(${rot}deg) translateY(${ty}px) scale(1)`;
                    e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)";
                    e.currentTarget.style.zIndex = String(i === 2 ? 5 : i === 1 || i === 3 ? 4 : 3);
                  }}
                >
                  <img src={a.image_url} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "20px 12px 12px" }}>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{a.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60, position: "relative", zIndex: 2 }}>
          <Link to="/distribution-musique" className="btn btn-r btn-lg"><Icon.Music size={16} />Distribuer mon titre</Link>
          <Link to="/studio-enregistrement" className="btn btn-o btn-lg"><Icon.Mic size={16} />Réserver le studio</Link>
        </div>
      </section>

      <div className="marquee"><div className="marquee-in">{[...platforms, ...platforms].map((p, i) => <div key={i} className="mq-item"><span className="mq-dot" />{p}</div>)}</div></div>

      <section className="sec">
        <div className="sec-h">
          <div className="sec-tag">Nos services</div>
          <h2 className="sec-title">Tout pour lancer et développer votre carrière</h2>
          <p className="sec-desc">De la première maquette au concert sold-out, Sterkte Records vous fournit les outils et le réseau pour réussir.</p>
        </div>
        <div className="srv-grid sr-reveal">{SERVICES_LIST.map((s) => <Link key={s.title} to={s.link} className="srv"><div className="srv-ico"><s.Icon size={24} /></div><h3>{s.title}</h3><p>{s.desc}</p><div className="srv-arr"><Icon.ArrowRight size={18} /></div></Link>)}</div>
      </section>

      <WaveDivider />

      <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sec-h"><div className="sec-tag">Pourquoi nous choisir</div><h2 className="sec-title">Ce qui nous différencie</h2></div>
        <div className="why-grid sr-reveal">{[
          { Ico: Icon.Diamond, title: "Transparence totale", desc: "Accès régulier à vos statistiques et revenus. Pas de frais cachés." },
          { Ico: Icon.Globe, title: "Expertise Afrique + International", desc: "Basés en RDC avec un réseau en Europe, au Maroc et en Afrique." },
          { Ico: Icon.Handshake, title: "Accompagnement humain", desc: "Chaque artiste a un interlocuteur dédié qui connaît son projet." },
          { Ico: Icon.Zap, title: "Rapidité d'exécution", desc: "Distribution en 48h, réponses sous 72h, rapports mensuels." },
          { Ico: Icon.Target, title: "Stratégie personnalisée", desc: "Un plan adapté à votre style, marché cible et objectifs." },
          { Ico: Icon.TrendingUp, title: "Résultats mesurables", desc: "Streams multipliés par 3 en moyenne sur 6 mois." },
        ].map((w) => <div key={w.title} className="why"><div className="why-ico"><w.Ico size={24} /></div><h4>{w.title}</h4><p>{w.desc}</p></div>)}</div>
      </section>

      <WaveDivider />

      <section className="sec">
        <div className="sec-h sr-reveal"><div className="sec-tag">Roster</div><h2 className="sec-title">Ils nous font confiance</h2></div>
        <div className="art-grid sr-reveal" style={{ padding: 0 }}>{artists.slice(0, 6).map((a) => <div key={a.id} className="art-card"><img src={a.image_url} alt={`${a.name} – artiste chez Sterkte Records`} loading="lazy" /><div className="art-ov"><div className="art-name">{a.name}</div><div className="art-genre">{(a.tags || []).join(" · ")}</div></div></div>)}</div>
        <div style={{ textAlign: "center", marginTop: 40 }}><Link to="/artistes" className="btn btn-o btn-lg"><Icon.ArrowRight size={16} />Voir tous les artistes</Link></div>
      </section>

      {testimonials.length > 0 && <>
        <WaveDivider />
        <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
          <div className="sec-h"><div className="sec-tag">Témoignages</div><h2 className="sec-title">Ce que disent nos artistes</h2></div>
          <div className="testi-grid sr-reveal">{testimonials.map((t) => <div key={t.id} className="testi"><p>{t.text}</p><div className="testi-author">{t.name}</div><div className="testi-role">{t.role}</div></div>)}</div>
        </section>
      </>}

      <section className="sec sr-reveal" style={{ textAlign: "center" }}>
        <div className="sec-tag">Prêt à commencer ?</div>
        <h2 className="sec-title" style={{ marginBottom: 20 }}>Transformez votre talent en <span className="gold">carrière musicale</span></h2>
        <p className="sec-desc" style={{ marginBottom: 36, textAlign: "center" }}>Rejoignez un label qui investit dans votre réussite.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/connexion" className="btn btn-g btn-lg"><Icon.Rocket size={16} />Rejoindre le label</Link>
          <Link to="/contact" className="btn btn-o btn-lg"><Icon.Mail size={16} />Nous contacter</Link>
        </div>
      </section>
    </>
  );
}

// ─── ABOUT ───
function AboutPage() {
  useSEO("/a-propos");
  useScrollReveal();
  return (
    <div className="pg">
      <PageBanner tag="À propos" title="Notre histoire, notre mission" subtitle="Fondé en 2021 à Lubumbashi, Sterkte Records est né d'une volonté simple : offrir aux artistes africains une structure professionnelle, transparente et exigeante." accent={C.gold} />
      <div className="pg-c">
        <div className="sr-reveal" style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Notre <span className="gold">vision</span></h3>
          <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginBottom: 16 }}>
            Sterkte Records est un label musical indépendant fondé le 7 juillet 2021 à Lubumbashi, dans la province du Haut-Katanga (RDC). Notre mission est de bâtir des carrières d'artistes africains à l'échelle internationale, en combinant la rigueur d'un label établi avec la flexibilité d'une structure indépendante.
          </p>
          <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15 }}>
            Nous accompagnons nos artistes sur l'ensemble de la chaîne de valeur : production, distribution digitale sur 150+ plateformes, booking, communication, management et stratégie de carrière. Notre ancrage africain et notre réseau international (France, Maroc, Belgique) nous permettent d'ouvrir des marchés à nos artistes là où d'autres labels s'arrêtent aux frontières.
          </p>
        </div>

        <div className="about-stats sr-reveal">
          <div className="about-stat"><div className="about-stat-v">2021</div><div className="about-stat-l">Année de fondation</div></div>
          <div className="about-stat"><div className="about-stat-v">5+</div><div className="about-stat-l">Artistes signés</div></div>
          <div className="about-stat"><div className="about-stat-v">150+</div><div className="about-stat-l">Plateformes</div></div>
          <div className="about-stat"><div className="about-stat-v">3</div><div className="about-stat-l">Pays d'opération</div></div>
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Nos <span className="gold">valeurs</span></h3>
          <div className="feats">
            {[
              { Ico: Icon.Diamond, title: "Transparence", desc: "Contrats clairs, royalties détaillées, communication ouverte. Pas de frais cachés." },
              { Ico: Icon.Award, title: "Excellence", desc: "Chaque sortie est traitée avec le même niveau d'exigence qu'un label international." },
              { Ico: Icon.Users, title: "Communauté", desc: "Nos artistes ne sont pas des numéros : un interlocuteur dédié, une vision commune." },
              { Ico: Icon.Globe, title: "Ouverture", desc: "Africain par essence, international par ambition. La musique africaine mérite le monde." },
            ].map((v) => <div key={v.title} className="feat"><div className="feat-ico"><v.Ico size={22} /></div><h4>{v.title}</h4><p>{v.desc}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── ARTISTS PAGE ───
function ArtistsPage() {
  useSEO("/artistes");
  useScrollReveal();
  const { artists, loading, error } = useArtists();
  const [filter, setFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const nav = useNavigate();

  // DJ Minho est ajouté comme tribute — uniquement si pas déjà présent dans la DB
  const djMinhoFallback = {
    id: "minho-tribute",
    name: "DJ Minho",
    tags: ["DJ"],
    image_url: null, // Sera complété si présent dans la DB
    tribute: true,
  };

  const allArtists = artists.some(a => a.name && a.name.toLowerCase().includes("minho"))
    ? artists.map(a => a.name && a.name.toLowerCase().includes("minho") ? { ...a, tribute: true } : a)
    : [djMinhoFallback, ...artists];

  const filtered = allArtists.filter((a) =>
    (filter === "Tout" || (a.tags || []).includes(filter)) &&
    (a.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const nonTribute = filtered.filter(a => !a.tribute);
  const tribute = filtered.filter(a => a.tribute);
  const visible = showAll ? nonTribute : nonTribute.slice(0, 8);

  const handleArtistClick = (a) => {
    if (a.tribute) {
      nav(`/artiste/dj-minho`, { state: { artist: a } });
      return;
    }
    const slug = (a.slug || a.name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    nav(`/artiste/${slug}`, { state: { artist: a } });
  };

  return (
    <div className="pg" style={{ position: "relative" }}>
      <div className="artists-bg" aria-hidden="true">
        <div className="artists-bg-orb artists-bg-orb1" />
        <div className="artists-bg-orb artists-bg-orb2" />
        <div className="artists-bg-orb artists-bg-orb3" />
      </div>
      <div className="artists-page-content">
        <div className="art-hero">
          <h1 className="art-big">ARTISTES</h1>
          <div className="art-filters">{ARTIST_GENRES.map((g) => <button key={g} className={`art-tag ${filter === g ? "ac" : ""}`} onClick={() => { setFilter(g); setShowAll(false); }}>{g}</button>)}</div>
          <div className="art-search">
            <span className="art-search-ico"><Icon.Search size={16} color={C.muted} /></span>
            <input placeholder="Rechercher un artiste..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher un artiste" />
          </div>
        </div>
        {error && <div style={{ textAlign: "center", padding: 24, color: C.red }}>Erreur de chargement : {error}</div>}
        {loading ? <div className="loading-box">Chargement des artistes...</div> : (
          <>
            {tribute.length > 0 && (
              <div className="tribute-card-wrapper">
                {tribute.map(a => (
                  <div key={a.id} className="tribute-card-inner" onClick={() => handleArtistClick(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleArtistClick(a)}>
                    <div className="tribute-bg" />
                    <div className="tribute-particles" aria-hidden="true">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="tribute-star" style={{ left: `${10 + i * 8}%`, top: `${20 + (i % 4) * 20}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + (i % 3)}s` }} />
                      ))}
                    </div>
                    {a.image_url && <img src={a.image_url} alt="DJ Minho" className="tribute-img" loading="lazy" />}
                    <div className="tribute-overlay" />
                    <div className="tribute-content">
                      <div className="tribute-badge">
                        <Icon.Heart size={10} color={C.gold} />
                        <span>En mémoire</span>
                      </div>
                      <div className="tribute-name">DJ Minho</div>
                      <div className="tribute-dates">{DJ_MINHO.birthDate} – {DJ_MINHO.deathDate}</div>
                      <div className="tribute-quote">« La musique ne meurt jamais, elle vit dans chaque âme qu'elle a touchée. »</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>Aucun artiste trouvé.</div> : (
              <>
                <div className="art-grid">
                  {visible.map((a) => (
                    <div key={a.id} className="art-card" onClick={() => handleArtistClick(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleArtistClick(a)}>
                      {a.image_url
                        ? <img src={a.image_url} alt={`${a.name} – artiste chez Sterkte Records`} loading="lazy" />
                        : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${C.bgCard}, ${C.bgHover})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 36 }}>{(a.name || "?")[0]}</div>
                      }
                      <div className="art-ov">
                        <div className="art-name">{a.name}</div>
                        <div className="art-genre">{(a.tags || []).join(" · ")}</div>
                        <div className="art-cta"><Icon.ArrowRight size={12} />Découvrir</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAll && nonTribute.length > 8 && <div style={{ textAlign: "center", padding: "0 60px 80px" }}><button className="btn btn-o btn-lg" onClick={() => setShowAll(true)}>Voir plus</button></div>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ARTIST DETAIL PAGE — utilise les VRAIES données de la DB (plus de MOCK) ───
function ArtistDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { artists, loading } = useArtists();

  const artistFromState = location.state?.artist;
  const artistFromList = artists.find((a) => {
    const s = (a.slug || a.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return s === slug;
  });

  const isMinho = slug === "dj-minho";
  const minhoFromList = artists.find(a => a.name && a.name.toLowerCase().includes("minho"));

  const artist = artistFromState || artistFromList || (isMinho ? (minhoFromList || { id: "minho-tribute", name: "DJ Minho", tags: ["DJ"], image_url: null, tribute: true }) : null);

  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;

  if (!artist) {
    return (
      <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, minHeight: "80vh" }}>
        <h2 style={{ color: C.muted }}>Artiste introuvable</h2>
        <button className="btn btn-g" onClick={() => nav("/artistes")}><Icon.ArrowLeft size={14} />Retour aux artistes</button>
      </div>
    );
  }

  const isTribute = artist.tribute || isMinho;
  const imgSrc = artist.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=800&background=1A1A25&color=F5C518&bold=true&font-size=0.33`;

  // Données réelles de l'artiste — tirées de la DB. Si non renseignées, on n'invente RIEN.
  const bio = artist.bio || (isTribute
    ? "DJ Minho était l'une des figures les plus emblématiques de la scène musicale de Lubumbashi. Reconnu pour son énergie incomparable sur les platines et sa capacité à transcender les foules, il a marqué de son empreinte indélébile la scène musicale congolaise et africaine."
    : null);
  const bio2 = artist.bio2 || (isTribute
    ? `Artiste passionné, créatif et toujours à l'avant-garde des tendances, DJ Minho nous a quittés le ${DJ_MINHO.deathDateFr}. Son héritage musical continue d'inspirer une nouvelle génération de DJs et de mélomanes. Sterkte Records garde précieusement sa mémoire.`
    : null);

  const socials = artist.socials || {};
  const singles = artist.singles || [];
  const stats = {
    streams: artist.total_streams,
    plateformes: artist.total_platforms,
    origin: artist.origin || (isTribute ? "Lubumbashi, RDC" : null),
    since: artist.since || "2021",
    genre: (artist.tags || []).join(" / ") || artist.genre,
  };

  return (
    <div className="ap">
      <div className="ap-hero" style={isTribute ? { background: "linear-gradient(135deg, #0A0A0F, #12121A)" } : {}}>
        <div className="ap-hero-bg">
          <img src={imgSrc} alt={artist.name} className="ap-hero-img" style={isTribute ? { filter: "brightness(.25) saturate(.4) sepia(.3)" } : {}} />
          <div className="ap-hero-overlay" />
        </div>
        <div className="ap-hero-c">
          <button className="ap-back-btn" onClick={() => nav("/artistes")}>
            <Icon.ArrowLeft size={14} />
            Retour aux artistes
          </button>

          {isTribute && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
              <Icon.Heart size={12} color={C.gold} />
              <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, textTransform: "uppercase" }}>Hommage · En mémoire</span>
            </div>
          )}

          <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, letterSpacing: -3, marginBottom: 16, color: C.white }}>{artist.name}</h1>
          {stats.genre && <div style={{ display: "inline-block", padding: "6px 14px", background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 6, color: C.gold, fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{stats.genre}</div>}
        </div>
      </div>

      {(stats.streams || stats.plateformes || stats.origin || stats.since) && (
        <div className="ap-stats-bar">
          {stats.streams && <div className="ap-stat"><div className="ap-stat-l">Streams cumulés</div><div className="ap-stat-v">{stats.streams}</div></div>}
          {stats.plateformes && <div className="ap-stat"><div className="ap-stat-l">Plateformes</div><div className="ap-stat-v">{stats.plateformes}</div></div>}
          {stats.origin && <div className="ap-stat"><div className="ap-stat-l">Origine</div><div className="ap-stat-v" style={{ fontSize: 16, color: C.white }}>{stats.origin}</div></div>}
          {stats.since && <div className="ap-stat"><div className="ap-stat-l">Chez Sterkte depuis</div><div className="ap-stat-v" style={{ fontSize: 16, color: C.white }}>{stats.since}</div></div>}
        </div>
      )}

      <div className="ap-body">
        <div className="ap-grid">
          <div>
            {bio && <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.85, marginBottom: 16 }}>{bio}</p>}
            {bio2 && <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.85 }}>{bio2}</p>}
            {!bio && !bio2 && <p style={{ color: C.muted, fontStyle: "italic" }}>Biographie à venir.</p>}

            {isTribute && (
              <div style={{ marginTop: 32, padding: 24, background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 12 }}>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8 }}>
                  Toute l'équipe de Sterkte Records s'incline avec profond respect devant la mémoire de DJ Minho, artiste exceptionnel et ami précieux, qui nous a quittés le {DJ_MINHO.deathDateFr}. Son talent, son énergie et sa générosité resteront à jamais gravés dans nos cœurs et dans la musique qu'il nous a laissée.
                </p>
              </div>
            )}

            {singles.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Singles</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {singles.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{s.year}</div>
                      </div>
                      {s.streams && <div style={{ fontSize: 13, color: C.gold, fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>{s.streams}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {Object.keys(socials).length > 0 && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1, color: C.muted }}>Suivre l'artiste</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {socials.spotify && <a href={socials.spotify} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgInput, borderRadius: 8, color: C.white, fontSize: 13 }}><Icon.Spotify size={18} color={C.success} />Spotify</a>}
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgInput, borderRadius: 8, color: C.white, fontSize: 13 }}><Icon.Instagram size={18} color="#E4405F" />Instagram</a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgInput, borderRadius: 8, color: C.white, fontSize: 13 }}><Icon.Youtube size={18} color="#FF0000" />YouTube</a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgInput, borderRadius: 8, color: C.white, fontSize: 13 }}><Icon.Twitter size={18} color="#1DA1F2" />Twitter</a>}
                  {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.bgInput, borderRadius: 8, color: C.white, fontSize: 13 }}><Icon.Facebook size={18} color="#1877F2" />Facebook</a>}
                </div>
              </div>
            )}
            {!isTribute && (
              <Link to="/featurings" className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                <Icon.Handshake size={16} />Demander un featuring
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
    // ─── DISTRIBUTION PAGE ───
function DistributionPage() {
  useSEO("/distribution-musique");
  useScrollReveal();
  return (
    <div className="pg">
      <PageBanner tag="Distribution" title={<>Votre musique sur <span className="gold">150+ plateformes</span></>} subtitle="Spotify, Apple Music, Deezer, Boomplay et bien plus. Distribution rapide, transparente et sans frais cachés." accent={C.blue} />
      <div className="pg-c">
        <div className="sr-reveal">
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Comment ça <span className="gold">fonctionne</span></h3>
          <div className="steps">
            {[
              { n: "01", title: "Créez votre compte artiste", desc: "Inscription gratuite en 2 minutes. Renseignez votre profil et vos informations de paiement." },
              { n: "02", title: "Soumettez votre titre", desc: "Uploadez votre fichier audio (WAV ou MP3 HD), votre cover art et vos métadonnées." },
              { n: "03", title: "Validation par notre équipe", desc: "Notre équipe vérifie la qualité audio et les droits sous 24-48h." },
              { n: "04", title: "Distribution mondiale", desc: "Votre musique est envoyée sur toutes les plateformes sélectionnées." },
              { n: "05", title: "Suivi & revenus", desc: "Accédez à vos statistiques en temps réel et recevez vos royalties mensuellement." },
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-n">{s.n}</div>
                <div className="step-c"><h4>{s.title}</h4><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Plateformes <span className="gold">disponibles</span></h3>
          <div className="dsp-grid">
            {DSP_PLATFORMS.map((p) => (
              <div key={p.id} className="dsp-item" style={{ cursor: "default" }}>
                <Icon.Music size={14} color={C.gold} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Nos <span className="gold">offres</span></h3>
          <div className="pricing">
            {[
              { name: "Starter", price: "Gratuit", sub: "pour les membres", features: ["1 single / an", "Spotify + Apple Music + Deezer", "Rapport trimestriel", "Support email"], featured: false },
              { name: "Pro", price: "$9", sub: "/ mois", features: ["Singles & EPs illimités", "150+ plateformes", "Rapport mensuel détaillé", "Support prioritaire", "ISRC & UPC inclus"], featured: true },
              { name: "Label", price: "Sur devis", sub: "", features: ["Artistes illimités", "Distribution accélérée", "Manager dédié", "Négociation DSP", "Rapports personnalisés"], featured: false },
            ].map((p) => (
              <div key={p.name} className={`price-card ${p.featured ? "ft" : ""}`}>
                <h4>{p.name}</h4>
                <div className="price-val">{p.price}<span> {p.sub}</span></div>
                <ul>{p.features.map((f) => <li key={f}><div className="chk"><Icon.Check size={10} color={C.gold} /></div>{f}</li>)}</ul>
                <Link to="/connexion" className={`btn ${p.featured ? "btn-g" : "btn-o"} btn-lg`} style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>Commencer</Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link to="/connexion" className="btn btn-r btn-lg"><Icon.Rocket size={16} />Distribuer ma musique</Link>
        </div>
      </div>
    </div>
  );
}

// ─── STUDIO PAGE ───
function StudioPage() {
  useSEO("/studio-enregistrement");
  useScrollReveal();
  return (
    <div className="pg">
      <PageBanner tag="Studio" title={<>Studio d'enregistrement <span className="gold">professionnel</span></>} subtitle="Enregistrement, mixage et mastering de haute qualité à Lubumbashi. Studio mobile disponible pour vos événements." accent={C.gold} />
      <div className="pg-c">
        <div className="feats sr-reveal">
          {[
            { Ico: Icon.Mic, title: "Enregistrement HD", desc: "Prise de son de qualité professionnelle avec équipement haut de gamme." },
            { Ico: Icon.Headphones, title: "Mixage & Mastering", desc: "Ingénieurs du son expérimentés pour un rendu radio-ready." },
            { Ico: Icon.Map, title: "Studio Mobile", desc: "On vient à vous : studio mobile disponible à Lubumbashi et au Maroc." },
            { Ico: Icon.Film, title: "Clip vidéo", desc: "Production de clips musicaux professionnels en partenariat avec nos réalisateurs." },
          ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Réserver une <span className="gold">session</span></h3>
          <p style={{ color: C.muted, marginBottom: 32, lineHeight: 1.7 }}>
            Pour réserver une session studio, contactez-nous via WhatsApp ou par email. Nous vous répondons sous 24h avec les disponibilités et les tarifs adaptés à votre projet.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn btn-g btn-lg" onClick={() => sendWhatsApp("Bonjour, je souhaite réserver une session studio.")}><Icon.Whatsapp size={16} />Réserver via WhatsApp</button>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Réservation Studio`} className="btn btn-o btn-lg"><Icon.Mail size={16} />Réserver par email</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING PAGE ───
function BookingPage() {
  useSEO("/booking-artistes");
  useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", phone: "", event: "", date: "", artist: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !isValidEmail(form.email) || !form.event) { setError("Veuillez remplir tous les champs obligatoires."); return; }
    setLoading(true); setError("");
    const ok = await sendEmail({ ...form, subject: `Demande de booking – ${form.artist || "Artiste"} – ${form.event}` });
    setLoading(false);
    if (ok) { setSent(true); }
    else { setError("Erreur d'envoi. Contactez-nous directement par WhatsApp."); }
  };

  return (
    <div className="pg">
      <PageBanner tag="Booking" title={<>Réservez nos <span className="gold">artistes</span></>} subtitle="Concerts, festivals, événements corporate, mariages et soirées privées. Nous gérons tout pour vous." accent={C.red} />
      <div className="pg-c">
        {sent ? (
          <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Demande envoyée !</h3>
            <p style={{ color: C.muted }}>Notre équipe vous contactera sous 48h pour confirmer les détails.</p>
          </div>
        ) : (
          <div className="fm sr-reveal">
            {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="fm-row fm-g">
              <div><label className="fm-l">Nom complet *</label><input className="fm-i" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="fm-l">Email *</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="fm-row fm-g">
              <div><label className="fm-l">Téléphone / WhatsApp</label><input className="fm-i" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="fm-l">Date de l'événement</label><input className="fm-i" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="fm-g"><label className="fm-l">Type d'événement *</label><input className="fm-i" placeholder="Concert, festival, mariage, corporate..." value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} /></div>
            <div className="fm-g"><label className="fm-l">Artiste souhaité</label><input className="fm-i" placeholder="Nom de l'artiste ou 'À définir'" value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} /></div>
            <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Décrivez votre événement, le lieu, le public attendu..." /></div>
            <button className="btn btn-r btn-lg" onClick={handleSubmit} disabled={loading}><Icon.Send size={16} />{loading ? "Envoi..." : "Envoyer la demande"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FEATURINGS PAGE ───
function FeaturingsPage() {
  useSEO("/featurings");
  useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", artist: "", genre: "", message: "", link: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !isValidEmail(form.email) || !form.artist) { setError("Veuillez remplir les champs obligatoires."); return; }
    setLoading(true); setError("");
    const ok = await sendEmail({ ...form, subject: `Demande de featuring – ${form.artist}` });
    setLoading(false);
    if (ok) setSent(true);
    else setError("Erreur. Contactez-nous par WhatsApp.");
  };

  return (
    <div className="pg">
      <PageBanner tag="Featurings" title={<>Collaborez avec nos <span className="gold">artistes</span></>} subtitle="Proposez un featuring avec les artistes du roster Sterkte Records. Réponse garantie sous 7 jours ouvrés." accent={C.gold} />
      <div className="pg-c">
        {sent ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Demande reçue !</h3>
            <p style={{ color: C.muted }}>Nous vous répondrons sous 7 jours ouvrés.</p>
          </div>
        ) : (
          <div className="fm sr-reveal">
            {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="fm-row fm-g">
              <div><label className="fm-l">Votre nom *</label><input className="fm-i" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="fm-l">Email *</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="fm-g"><label className="fm-l">Nom d'artiste *</label><input className="fm-i" value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} /></div>
            <div className="fm-g">
              <label className="fm-l">Genre musical</label>
              <select className="fm-s" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}>
                <option value="">Sélectionner...</option>
                {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="fm-g"><label className="fm-l">Lien démo / portfolio</label><input className="fm-i" placeholder="SoundCloud, YouTube, Spotify..." value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} /></div>
            <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Décrivez votre projet, l'artiste souhaité, le type de collaboration..." /></div>
            <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={loading}><Icon.Handshake size={16} />{loading ? "Envoi..." : "Envoyer la demande"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SERVICES PAGE ───
function ServicesPage() {
  useSEO("/services");
  useScrollReveal();
  return (
    <div className="pg">
      <PageBanner tag="Services" title={<>Consulting & <span className="gold">Management</span></>} subtitle="Stratégie de lancement, gestion de carrière et coaching artistique pour atteindre vos objectifs." accent={C.blue} />
      <div className="pg-c">
        <div className="feats sr-reveal">
          {[
            { Ico: Icon.Rocket, title: "Stratégie de lancement", desc: "Plan complet pour votre sortie : timing, plateformes, communication, presse." },
            { Ico: Icon.BarChart, title: "Analyse de données", desc: "Comprenez vos audiences et optimisez vos sorties grâce aux données de streaming." },
            { Ico: Icon.Globe, title: "Développement international", desc: "Ouverture de marchés en Europe, en Afrique et au Moyen-Orient." },
            { Ico: Icon.Users, title: "Management artistique", desc: "Représentation complète : négociations, contrats, relations avec les labels et DSP." },
            { Ico: Icon.Crown, title: "Coaching artistique", desc: "Travail sur l'image, le discours, la cohérence artistique et la présence scénique." },
            { Ico: Icon.Layers, title: "Relations presse", desc: "Communiqués, interviews, playlisting et placement éditorial sur les plateformes." },
          ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}
        </div>
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ color: C.muted, marginBottom: 24 }}>Tous nos services sont proposés sur devis selon votre projet et vos objectifs.</p>
          <Link to="/contact" className="btn btn-g btn-lg"><Icon.Mail size={16} />Demander un devis</Link>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ───
function ContactPage() {
  useSEO("/contact");
  useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !isValidEmail(form.email) || !form.message) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    const ok = await sendEmail({ ...form, subject: form.subject || "Contact – Sterkte Records" });
    setLoading(false);
    if (ok) setSent(true);
    else setError("Erreur d'envoi. Essayez WhatsApp.");
  };

  return (
    <div className="pg">
      <PageBanner tag="Contact" title="Parlons de votre projet" subtitle="Notre équipe vous répond sous 72h. Pour les urgences, utilisez WhatsApp." accent={C.red} />
      <div className="pg-c" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
        <div className="sr-reveal-left">
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Informations de <span className="gold">contact</span></h3>
          {[
            { Ico: Icon.Mail, label: "Email", val: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
            { Ico: Icon.Whatsapp, label: "WhatsApp", val: WHATSAPP_NUMBER, href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, "")}` },
            { Ico: Icon.MapPin, label: "Adresse", val: "Lubumbashi, Haut-Katanga, RDC", href: null },
          ].map(({ Ico, label, val, href }) => (
            <div key={label} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background: "rgba(245,197,24,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, flexShrink: 0 }}><Ico size={20} /></div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.white, fontSize: 14 }}>{val}</a> : <div style={{ color: C.white, fontSize: 14 }}>{val}</div>}
              </div>
            </div>
          ))}
          <button className="btn btn-g btn-lg" style={{ marginTop: 16 }} onClick={() => sendWhatsApp("Bonjour Sterkte Records, je souhaite vous contacter pour...")}>
            <Icon.Whatsapp size={16} />Ouvrir WhatsApp
          </button>
        </div>

        <div className="sr-reveal-right">
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Message envoyé !</h3>
              <p style={{ color: C.muted }}>Nous vous répondrons sous 72h.</p>
            </div>
          ) : (
            <>
              {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="fm-row fm-g">
                <div><label className="fm-l">Nom *</label><input className="fm-i" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="fm-l">Email *</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="fm-g"><label className="fm-l">Sujet</label><input className="fm-i" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
              <div className="fm-g"><label className="fm-l">Message *</label><textarea className="fm-t" style={{ minHeight: 140 }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
              <button className="btn btn-r btn-lg" onClick={handleSubmit} disabled={loading}><Icon.Send size={16} />{loading ? "Envoi..." : "Envoyer"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───
function LoginPage() {
  useSEO("/connexion");
  const { signIn, signUp, resetPassword, user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", artist_name: "", genre: "", whatsapp: "", cgu: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loc = useLocation();

  useEffect(() => {
    if (user) nav("/dashboard", { replace: true });
    const params = new URLSearchParams(loc.search);
    if (params.get("confirmed") === "1") setSuccess("Email confirmé ! Vous pouvez vous connecter.");
    if (params.get("reset") === "1") setSuccess("Mot de passe réinitialisé. Connectez-vous.");
  }, [user, loc]);

  const pwdStr = passwordStrength(form.password);
  const pwdColors = ["", "f1", "f2", "f3", "f4"];

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Email et mot de passe requis."); return; }
    setLoading(true); setError("");
    const { error: e } = await signIn(form.email, form.password);
    setLoading(false);
    if (e) setError(e.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : e.message);
    else nav("/dashboard");
  };

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.full_name || !form.artist_name) { setError("Tous les champs obligatoires doivent être remplis."); return; }
    if (!isValidEmail(form.email)) { setError("Email invalide."); return; }
    if (form.password.length < 8) { setError("Mot de passe trop court (8 caractères minimum)."); return; }
    if (!form.cgu) { setError("Vous devez accepter les CGU."); return; }
    setLoading(true); setError("");
    const { error: e } = await signUp(form.email, form.password, { full_name: form.full_name, artist_name: form.artist_name, genre: form.genre, whatsapp: form.whatsapp });
    setLoading(false);
    if (e) setError(e.message);
    else setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
  };

  const handleReset = async () => {
    if (!form.email) { setError("Entrez votre email."); return; }
    setLoading(true); setError("");
    const { error: e } = await resetPassword(form.email);
    setLoading(false);
    if (e) setError(e.message);
    else setSuccess("Email de réinitialisation envoyé !");
  };

  return (
    <div className="login-pg">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link to="/"><span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 22 }}><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></span></Link>
        </div>
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab === "login" ? "ac" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Connexion</button>
          <button className={`tab ${tab === "register" ? "ac" : ""}`} onClick={() => { setTab("register"); setError(""); setSuccess(""); }}>Inscription</button>
          <button className={`tab ${tab === "reset" ? "ac" : ""}`} onClick={() => { setTab("reset"); setError(""); setSuccess(""); }}>Mot de passe</button>
        </div>

        {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ padding: "10px 14px", background: "rgba(76,175,80,.08)", border: "1px solid rgba(76,175,80,.25)", borderRadius: 6, fontSize: 12, color: C.success, marginBottom: 16 }}>{success}</div>}

        {tab === "login" && (
          <>
            <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <div className="fm-g" style={{ position: "relative" }}>
              <label className="fm-l">Mot de passe</label>
              <input className="fm-i fm-i-pwd" type={showPwd ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <button className="fm-eye" onClick={() => setShowPwd(v => !v)}>{showPwd ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}</button>
            </div>
            <button className="btn btn-r btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogin} disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
          </>
        )}

        {tab === "register" && (
          <>
            <div className="fm-row fm-g">
              <div><label className="fm-l">Nom complet *</label><input className="fm-i" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
              <div><label className="fm-l">Nom d'artiste *</label><input className="fm-i" value={form.artist_name} onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))} /></div>
            </div>
            <div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="fm-g" style={{ position: "relative" }}>
              <label className="fm-l">Mot de passe * (8 car. min.)</label>
              <input className="fm-i fm-i-pwd" type={showPwd ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button className="fm-eye" onClick={() => setShowPwd(v => !v)}>{showPwd ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}</button>
              {form.password && <div className="pwd-strength">{[1,2,3,4].map(i => <div key={i} className={`pwd-bar ${pwdStr >= i ? pwdColors[pwdStr] : ""}`} />)}</div>}
            </div>
            <div className="fm-g">
              <label className="fm-l">Genre musical</label>
              <select className="fm-s" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}>
                <option value="">Sélectionner...</option>
                {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="fm-g"><label className="fm-l">WhatsApp (format +XXX...)</label><input className="fm-i" placeholder="+243..." value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
            <label className="fm-cb fm-g">
              <input type="checkbox" checked={form.cgu} onChange={e => setForm(f => ({ ...f, cgu: e.target.checked }))} />
              <span>J'accepte les <Link to="/cgu" style={{ color: C.blue }}>CGU</Link> et la <Link to="/confidentialite" style={{ color: C.blue }}>politique de confidentialité</Link></span>
            </label>
            <button className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={handleRegister} disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
          </>
        )}

        {tab === "reset" && (
          <>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <div className="fm-g"><label className="fm-l">Email</label><input className="fm-i" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <button className="btn btn-o btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={handleReset} disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───
function DashboardPage() {
  const { user, profile, signOut, loading: authLoading, isEmailConfirmed } = useAuth();
  const { tracks, stats, loading: tracksLoading, refetch } = useTracks();
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "ok") => setToast({ msg, type });

  useEffect(() => { if (!authLoading && !user) nav("/connexion", { replace: true }); }, [user, authLoading]);
  if (authLoading) return <div className="loading-box">Chargement...</div>;
  if (!user) return null;

  const statusColors = { live: C.success, pending: C.gold, review: C.blue, rejected: C.red, draft: C.muted };
  const statusLabels = { live: "Live", pending: "En attente", review: "En révision", rejected: "Rejeté", draft: "Brouillon" };

  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ padding: "40px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>Dashboard</h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Bienvenue, <span style={{ color: C.white }}>{profile?.artist_name || profile?.full_name || user.email}</span></p>
          </div>
          <button className="btn btn-r" onClick={() => setShowUpload(true)}><Icon.Plus size={14} />Nouvelle sortie</button>
        </div>

        {!isEmailConfirmed && (
          <div style={{ padding: "12px 16px", background: "rgba(245,197,24,.08)", border: "1px solid rgba(245,197,24,.3)", borderRadius: 8, marginBottom: 24, fontSize: 13, color: C.gold, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.AlertCircle size={16} />Confirmez votre email pour accéder à toutes les fonctionnalités.
          </div>
        )}

        <div className="tabs">
          {["overview", "tracks", "profile"].map(t => <button key={t} className={`tab ${tab === t ? "ac" : ""}`} onClick={() => setTab(t)}>{t === "overview" ? "Vue d'ensemble" : t === "tracks" ? "Mes titres" : "Profil"}</button>)}
        </div>

        {tab === "overview" && (
          <>
            <div className="dash-grid">
              <div className="dash-stat"><div className="dash-stat-l">Streams totaux</div><div className="dash-stat-v" style={{ color: C.gold }}>{stats.totalStreams.toLocaleString()}</div><div className="dash-stat-note">Tous titres confondus</div></div>
              <div className="dash-stat"><div className="dash-stat-l">Revenus estimés</div><div className="dash-stat-v" style={{ color: C.success }}>${stats.totalRevenue}</div><div className="dash-stat-note">Prochain versement fin du mois</div></div>
              <div className="dash-stat"><div className="dash-stat-l">Titres distribués</div><div className="dash-stat-v">{stats.count}</div></div>
              <div className="dash-stat"><div className="dash-stat-l">Plateformes actives</div><div className="dash-stat-v" style={{ color: C.blue }}>{stats.livePlatforms}</div></div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="btn btn-g" onClick={() => setShowUpload(true)}><Icon.Plus size={14} />Distribuer un titre</button>
              <button className="btn btn-o" onClick={() => sendWhatsApp(`Bonjour, je suis ${profile?.artist_name || user.email} et j'ai une question sur mon compte.`)}><Icon.Whatsapp size={14} />Contacter l'équipe</button>
            </div>
          </>
        )}

        {tab === "tracks" && (
          <div className="dash-tracks">
            <div className="dash-tracks-h">
              <h3>Mes titres</h3>
              <button className="btn btn-r btn-sm" onClick={() => setShowUpload(true)}><Icon.Plus size={12} />Ajouter</button>
            </div>
            {tracksLoading ? <div className="loading-box">Chargement...</div> : tracks.length === 0 ? (
              <div style={{ padding: "60px 24px", textAlign: "center", color: C.muted }}>
                <Icon.Music size={40} color={C.border} />
                <p style={{ marginTop: 16 }}>Aucun titre distribué pour le moment.</p>
                <button className="btn btn-g" style={{ marginTop: 16 }} onClick={() => setShowUpload(true)}>Distribuer mon premier titre</button>
              </div>
            ) : (
              <>
                <div className="tr-row" style={{ background: C.bgCard, fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  <span>#</span><span>Titre</span><span>Genre</span><span>Streams</span><span>Statut</span><span>Actions</span>
                </div>
                {tracks.map((t, i) => (
                  <div key={t.id} className="tr-row">
                    <span className="tr-num">{i + 1}</span>
                    <div><div className="tr-title">{t.title}</div><div className="tr-info" style={{ fontSize: 11 }}>{t.release_date || ""}</div></div>
                    <span className="tr-info">{t.genre || "—"}</span>
                    <span className="tr-info">{(t.streams || 0).toLocaleString()}</span>
                    <div className="tr-status"><div className="tr-dot" style={{ background: statusColors[t.status] || C.muted }} />{statusLabels[t.status] || t.status}</div>
                    <div className="tr-actions">
                      <button className="tr-act-btn" title="Voir détails" onClick={() => showToast(`Détails de "${t.title}"`, "ok")}><Icon.Eye size={12} /></button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat',sans-serif", fontWeight: 900, fontSize: 24, marginBottom: 16 }}>
                {(profile?.artist_name || user.email)[0].toUpperCase()}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{profile?.artist_name || "—"}</h3>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>{profile?.full_name}</p>
              {[
                { l: "Email", v: user.email },
                { l: "Genre", v: profile?.genre || "Non renseigné" },
                { l: "WhatsApp", v: profile?.whatsapp || "Non renseigné" },
                { l: "Membre depuis", v: user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "—" },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
              <button className="btn btn-o btn-sm" style={{ marginTop: 20 }} onClick={signOut}>Déconnexion</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Soumettre un nouveau titre" maxWidth={600}>
        <UploadTrackForm onSuccess={() => { setShowUpload(false); refetch(); showToast("Titre soumis avec succès ! Notre équipe va le valider.", "ok"); }} onClose={() => setShowUpload(false)} />
      </Modal>
    </div>
  );
}

// ─── UPLOAD TRACK FORM ───
function UploadTrackForm({ onSuccess, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", genre: "", release_type: "single", release_date: "",
    language: "", explicit: false, platforms: ["spotify", "apple_music", "deezer", "youtube_music", "tidal", "boomplay"],
    isrc: generateISRC(), upc: generateUPC(),
    splits: [{ name: "", role: "Artiste principal", percent: 100 }],
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const audioRef = useRef(null);
  const coverRef = useRef(null);

  const togglePlatform = (id) => {
    setForm(f => ({ ...f, platforms: f.platforms.includes(id) ? f.platforms.filter(p => p !== id) : [...f.platforms, id] }));
  };

  const splitTotal = form.splits.reduce((s, r) => s + Number(r.percent || 0), 0);

  const handleSubmit = async () => {
    if (!form.title) { setError("Le titre est obligatoire."); return; }
    if (splitTotal !== 100) { setError("Les splits de royalties doivent totaliser 100%."); return; }
    setLoading(true); setError("");

    let audioPath = null;
    let coverPath = null;

    if (audioFile) {
      const res = await uploadFile("audio", audioFile, user.id, { maxSize: 200 * 1024 * 1024, allowedMimes: ["audio/"] });
      if (res.error) { setError(res.error); setLoading(false); return; }
      audioPath = res.url;
    }

    if (coverFile) {
      const res = await uploadFile("covers", coverFile, user.id, { maxSize: 10 * 1024 * 1024, allowedMimes: ["image/"] });
      if (res.error) { setError(res.error); setLoading(false); return; }
      coverPath = res.url;
    }

    const { error: dbErr } = await supabase.from("tracks").insert({
      user_id: user.id,
      title: form.title,
      genre: form.genre,
      release_type: form.release_type,
      release_date: form.release_date || null,
      language: form.language,
      explicit: form.explicit,
      platforms: form.platforms,
      isrc: form.isrc,
      upc: form.upc,
      splits: form.splits,
      audio_path: audioPath,
      cover_path: coverPath,
      status: "pending",
      streams: 0,
      revenue: 0,
    });

    setLoading(false);
    if (dbErr) { setError(dbErr.message); return; }
    onSuccess();
  };

  return (
    <div>
      {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="timeline" style={{ marginBottom: 24 }}>
        {["Infos", "Fichiers", "Plateformes", "Royalties"].map((label, i) => (
          <div key={label} className={`timeline-step ${step > i + 1 ? "done" : step === i + 1 ? "current" : ""}`}>
            <div className="timeline-dot">{step > i + 1 ? <Icon.Check size={12} color="#000" /> : i + 1}</div>
            <div className="timeline-label">{label}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="fm-g"><label className="fm-l">Titre du morceau *</label><input className="fm-i" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="fm-row fm-g">
            <div><label className="fm-l">Genre</label><select className="fm-s" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}><option value="">Sélectionner...</option>{MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div><label className="fm-l">Type</label><select className="fm-s" value={form.release_type} onChange={e => setForm(f => ({ ...f, release_type: e.target.value }))}>{RELEASE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          </div>
          <div className="fm-row fm-g">
            <div><label className="fm-l">Date de sortie souhaitée</label><input className="fm-i" type="date" value={form.release_date} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} /></div>
            <div><label className="fm-l">Langue des paroles</label><select className="fm-s" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}><option value="">Sélectionner...</option>{LYRICS_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
          </div>
          <div className="fm-row fm-g">
            <div><label className="fm-l">ISRC (auto-généré)</label><input className="fm-i" value={form.isrc} onChange={e => setForm(f => ({ ...f, isrc: e.target.value }))} /></div>
            <div><label className="fm-l">UPC (auto-généré)</label><input className="fm-i" value={form.upc} onChange={e => setForm(f => ({ ...f, upc: e.target.value }))} /></div>
          </div>
          <label className="fm-cb fm-g"><input type="checkbox" checked={form.explicit} onChange={e => setForm(f => ({ ...f, explicit: e.target.checked }))} /><span>Contenu explicite (paroles)</span></label>
        </div>
      )}

      {step === 2 && (
        <div>
          <input ref={audioRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={e => setAudioFile(e.target.files[0])} />
          <div className={`upload ${audioFile ? "has-file" : ""}`} onClick={() => audioRef.current?.click()}>
            <div className="upload-ico"><Icon.Upload size={32} color={audioFile ? C.success : C.muted} /></div>
            <h4>{audioFile ? audioFile.name : "Fichier audio"}</h4>
            <p>{audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : "WAV ou MP3 HD · Max 200 MB"}</p>
          </div>
          <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { setCoverFile(e.target.files[0]); setCoverPreview(URL.createObjectURL(e.target.files[0])); }} />
          <div className={`upload ${coverFile ? "has-file" : ""}`} onClick={() => coverRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
            {coverPreview ? <img src={coverPreview} alt="cover" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} /> : <div className="upload-ico"><Icon.Image size={32} color={C.muted} /></div>}
            <div><h4>{coverFile ? coverFile.name : "Pochette (Cover Art)"}</h4><p>JPG ou PNG · 3000×3000px recommandé · Max 10 MB</p></div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Sélectionnez les plateformes sur lesquelles distribuer votre musique :</p>
          <div className="dsp-grid">
            {DSP_PLATFORMS.map(p => (
              <div key={p.id} className={`dsp-item ${form.platforms.includes(p.id) ? "selected" : ""}`} onClick={() => togglePlatform(p.id)}>
                <input type="checkbox" checked={form.platforms.includes(p.id)} onChange={() => togglePlatform(p.id)} />
                <div><div style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</div><div style={{ fontSize: 10, color: C.muted }}>{p.category}</div></div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted }}>{form.platforms.length} plateforme(s) sélectionnée(s)</p>
        </div>
      )}

      {step === 4 && (
        <div>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Définissez la répartition des royalties entre les ayants droit (total = 100%) :</p>
          <div className="splits-box">
            {form.splits.map((s, i) => (
              <div key={i} className="split-row">
                <input className="fm-i" placeholder="Nom" value={s.name} onChange={e => { const splits = [...form.splits]; splits[i].name = e.target.value; setForm(f => ({ ...f, splits })); }} />
                <select className="fm-s" value={s.role} onChange={e => { const splits = [...form.splits]; splits[i].role = e.target.value; setForm(f => ({ ...f, splits })); }}>
                  {["Artiste principal", "Featuring", "Auteur", "Compositeur", "Producteur", "Label"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input className="fm-i" type="number" min="0" max="100" value={s.percent} onChange={e => { const splits = [...form.splits]; splits[i].percent = e.target.value; setForm(f => ({ ...f, splits })); }} />
                {form.splits.length > 1 && <button className="tr-act-btn danger" onClick={() => setForm(f => ({ ...f, splits: f.splits.filter((_, j) => j !== i) }))}><Icon.Trash size={12} /></button>}
              </div>
            ))}
            <div className={`split-total ${splitTotal === 100 ? "ok" : "err"}`}>
              <button className="btn btn-o btn-sm" onClick={() => setForm(f => ({ ...f, splits: [...f.splits, { name: "", role: "Featuring", percent: 0 }] }))}><Icon.Plus size={12} />Ajouter</button>
              <span>Total : {splitTotal}% {splitTotal === 100 ? "✓" : "(doit être 100%)"}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-o" onClick={() => step === 1 ? onClose() : setStep(s => s - 1)} disabled={loading}>{step === 1 ? "Annuler" : <><Icon.ArrowLeft size={14} />Précédent</>}</button>
        {step < 4
          ? <button className="btn btn-g" onClick={() => setStep(s => s + 1)}>Suivant<Icon.ArrowRight size={14} /></button>
          : <button className="btn btn-r" onClick={handleSubmit} disabled={loading}>{loading ? "Envoi..." : <><Icon.Send size={14} />Soumettre</>}</button>
        }
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───
function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tracks");
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "ok") => setToast({ msg, type });
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) nav("/", { replace: true });
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("tracks").select("*, profiles(artist_name, email)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]).then(([t, u]) => {
      setTracks(t.data || []);
      setUsers(u.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  const updateTrackStatus = async (id, status) => {
    const { error } = await supabase.from("tracks").update({ status }).eq("id", id);
    if (error) { showToast("Erreur : " + error.message, "err"); return; }
    setTracks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
    showToast(`Statut mis à jour : ${status}`, "ok");
  };

  if (authLoading || loading) return <div className="loading-box">Chargement admin...</div>;
  if (!isAdmin) return null;

  const stats = {
    total: tracks.length,
    pending: tracks.filter(t => t.status === "pending").length,
    live: tracks.filter(t => t.status === "live").length,
    users: users.length,
  };

  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Icon.Shield size={24} color={C.gold} />
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>Espace Admin</h1>
        </div>

        <div className="admin-grid" style={{ marginBottom: 32 }}>
          {[
            { l: "Total titres", v: stats.total, c: C.white },
            { l: "En attente", v: stats.pending, c: C.gold },
            { l: "Live", v: stats.live, c: C.success },
            { l: "Utilisateurs", v: stats.users, c: C.blue },
          ].map(({ l, v, c }) => (
            <div key={l} className="dash-stat"><div className="dash-stat-l">{l}</div><div className="dash-stat-v" style={{ color: c }}>{v}</div></div>
          ))}
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "tracks" ? "ac" : ""}`} onClick={() => setTab("tracks")}>Titres ({stats.total})</button>
          <button className={`tab ${tab === "users" ? "ac" : ""}`} onClick={() => setTab("users")}>Utilisateurs ({stats.users})</button>
        </div>

        {tab === "tracks" && (
          <div className="dash-tracks">
            <div style={{ padding: "12px 24px", background: C.bgCard, borderBottom: `1px solid ${C.border}` }}>
              <div className="admin-row" style={{ background: "transparent", fontFamily: "'Montserrat',sans-serif", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, padding: 0 }}>
                <span>Statut</span><span>Titre / Artiste</span><span>Genre</span><span>Plateformes</span><span>Date</span><span>Actions</span>
              </div>
            </div>
            {tracks.map(t => (
              <div key={t.id} className="admin-row">
                <div><span className={`admin-badge ${t.status}`}>{t.status}</span></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.profiles?.artist_name || t.profiles?.email || "—"}</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{t.genre || "—"}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{(t.platforms || []).length} plateformes</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.created_at ? new Date(t.created_at).toLocaleDateString("fr-FR") : "—"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="admin-action view" onClick={() => setSelectedTrack(t)}>Voir</button>
                  {t.status !== "live" && <button className="admin-action approve" onClick={() => updateTrackStatus(t.id, "live")}>Approuver</button>}
                  {t.status !== "rejected" && <button className="admin-action reject" onClick={() => updateTrackStatus(t.id, "rejected")}>Rejeter</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="dash-tracks">
            {users.map((u, i) => (
              <div key={u.id} className="admin-reg-row">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 14 }}>
                  {(u.artist_name || u.email || "?")[0].toUpperCase()}
                </div>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{u.artist_name || "—"}</div><div style={{ fontSize: 11, color: C.muted }}>{u.email}</div></div>
                <div style={{ fontSize: 12, color: C.muted }}>{u.genre || "—"}</div>
                <div style={{ fontSize: 12 }}>{u.is_admin ? <span style={{ color: C.gold }}>Admin</span> : <span style={{ color: C.muted }}>Artiste</span>}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selectedTrack} onClose={() => setSelectedTrack(null)} title="Détails du titre" maxWidth={560}>
        {selectedTrack && (
          <div>
            {[
              { l: "Titre", v: selectedTrack.title },
              { l: "Genre", v: selectedTrack.genre },
              { l: "Type", v: selectedTrack.release_type },
              { l: "Date de sortie", v: selectedTrack.release_date },
              { l: "Langue", v: selectedTrack.language },
              { l: "Explicite", v: selectedTrack.explicit ? "Oui" : "Non" },
              { l: "ISRC", v: selectedTrack.isrc },
              { l: "UPC", v: selectedTrack.upc },
              { l: "Plateformes", v: (selectedTrack.platforms || []).join(", ") },
            ].map(({ l, v }) => v ? (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{l}</span>
                <span style={{ maxWidth: "60%", textAlign: "right" }}>{v}</span>
              </div>
            ) : null)}
            {selectedTrack.splits?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Montserrat',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Splits royalties</div>
                {selectedTrack.splits.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span>{s.name} <span style={{ color: C.muted }}>({s.role})</span></span>
                    <span style={{ color: C.gold }}>{s.percent}%</span>
                  </div>
                ))}
              </div>
            )}
            {selectedTrack.audio_path && (
              <div style={{ marginTop: 16 }}>
                <AudioPlayerFromPath path={selectedTrack.audio_path} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// Lecteur audio depuis path Supabase Storage
function AudioPlayerFromPath({ path }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    getSignedUrl("audio", path).then(setUrl);
  }, [path]);
  return <AudioPlayer url={url} label="Aperçu audio" />;
}

// ─── LEGAL PAGES ───
function CGUPage() {
  useSEO("/cgu");
  return (
    <div className="legal">
      <h1>Conditions Générales d'Utilisation</h1>
      <p style={{ color: C.muted, fontSize: 12 }}>Dernière mise à jour : janvier 2025</p>
      <h2>1. Objet</h2>
      <p>Les présentes CGU régissent l'utilisation du site sterkterecords.com et des services proposés par Sterkte Records SARL.</p>
      <h2>2. Services</h2>
      <p>Sterkte Records propose des services de distribution musicale digitale, d'enregistrement studio, de booking et de management artistique. L'accès à l'espace artiste nécessite la création d'un compte.</p>
      <h2>3. Droits et obligations</h2>
      <p>En soumettant un titre pour distribution, l'artiste certifie détenir l'intégralité des droits sur l'œuvre. Sterkte Records se réserve le droit de refuser tout contenu contraire aux lois en vigueur.</p>
      <h2>4. Propriété intellectuelle</h2>
      <p>Les artistes conservent la propriété de leurs œuvres. Sterkte Records dispose d'une licence non-exclusive de distribution pour la durée du contrat.</p>
      <h2>5. Résiliation</h2>
      <p>Chaque partie peut résilier le contrat avec un préavis de 30 jours. Les œuvres déjà distribuées pourront prendre jusqu'à 60 jours pour être retirées des plateformes.</p>
      <h2>6. Contact</h2>
      <p>Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </div>
  );
}

function PrivacyPage() {
  useSEO("/confidentialite");
  return (
    <div className="legal">
      <h1>Politique de confidentialité</h1>
      <p style={{ color: C.muted, fontSize: 12 }}>Dernière mise à jour : janvier 2025</p>
      <h2>1. Données collectées</h2>
      <p>Nous collectons : nom, email, nom d'artiste, numéro WhatsApp, genre musical, fichiers audio et pochettes soumis pour distribution.</p>
      <h2>2. Utilisation des données</h2>
      <p>Vos données sont utilisées exclusivement pour la gestion de votre compte, la distribution de votre musique et la communication liée à nos services.</p>
      <h2>3. Stockage et sécurité</h2>
      <p>Vos données sont hébergées sur Supabase (infrastructure sécurisée, conforme RGPD). Nous n'utilisons pas de cookies publicitaires.</p>
      <h2>4. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits d'accès, de rectification, de suppression et de portabilité de vos données. Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      <h2>5. Partage des données</h2>
      <p>Nous ne vendons jamais vos données. Elles peuvent être partagées avec nos partenaires de distribution (DSP) dans la stricte limite nécessaire à la distribution de votre musique.</p>
    </div>
  );
}

function LegalPage() {
  useSEO("/mentions-legales");
  return (
    <div className="legal">
      <h1>Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>Sterkte Records SARL<br />Lubumbashi, Haut-Katanga, République Démocratique du Congo</p>
      <h2>Contact</h2>
      <p>Email : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />WhatsApp : {WHATSAPP_NUMBER}</p>
      <h2>Hébergement</h2>
      <p>Site hébergé par Vercel Inc. (San Francisco, USA). Base de données hébergée par Supabase.</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble du contenu de ce site (textes, visuels, code) est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
    </div>
  );
}

// ─── NOT FOUND ───
function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: C.border }}>404</h1>
      <p style={{ color: C.muted }}>Page introuvable</p>
      <Link to="/" className="btn btn-g"><Icon.ArrowLeft size={14} />Accueil</Link>
    </div>
  );
}

// ─── APP ROOT ───
function App() {
  const [toast, setToast] = useState(null);

  return (
    <AuthProvider>
      <div className="app">
        <style>{css}</style>
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/artistes" element={<ArtistsPage />} />
          <Route path="/artiste/:slug" element={<ArtistDetailPage />} />
          <Route path="/distribution-musique" element={<DistributionPage />} />
          <Route path="/studio-enregistrement" element={<StudioPage />} />
          <Route path="/booking-artistes" element={<BookingPage />} />
          <Route path="/featurings" element={<FeaturingsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cgu" element={<CGUPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AuthProvider>
  );
}

export default App;
  );
}
