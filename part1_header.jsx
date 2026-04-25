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
