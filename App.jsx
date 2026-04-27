import React, { useState, useEffect, useRef, createContext, useContext, lazy, Suspense } from "react";
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

// ─── MOCK ARTISTS DETAIL — données enrichies pour ArtistDetailPage (modifiables après) ───
const MOCK_ARTISTS_DETAIL = {
  "dj-minho": {
    bio: "DJ Minho était l'une des figures les plus emblématiques de la scène musicale de Lubumbashi. Reconnu pour son énergie incomparable sur les platines et sa capacité à transcender les foules, il a marqué de son empreinte indélébile la scène musicale congolaise et africaine.",
    bio2: "Artiste passionné, créatif et toujours à l'avant-garde des tendances, DJ Minho nous a quittés le 1er août 2025. Son héritage musical continue d'inspirer une nouvelle génération de DJs et de mélomanes. Sterkte Records garde précieusement sa mémoire.",
    genre: "DJ / Afrobeat",
    origin: "Lubumbashi, RDC",
    since: "2021",
    streams: "50K+",
    plateformes: "150+",
    singles: [
      { title: "Breakfast (feat. Hbeatz)", year: "2024", streams: "180K" },
      { title: "Ama vibe", year: "2023", streams: "145K" },
      { title: "Best of DJ Minho Vol.1", year: "2022", streams: "120K" },
    ],
    socials: { instagram: "https://instagram.com", spotify: "https://open.spotify.com" },
    tribute: true,
    tributeDate: DJ_MINHO.deathDateFr,
  },
  default: {
    bio: "Artiste emblématique du roster Sterkte Records, il incarne la fusion entre les sonorités africaines authentiques et les productions modernes. Depuis ses débuts, il s'est imposé comme une voix incontournable de la scène musicale de Lubumbashi, portant haut les couleurs d'une Afrique créative et résolument tournée vers le monde.",
    bio2: "Avec plusieurs projets à son actif, il continue d'inspirer une nouvelle génération d'artistes en démontrant que l'excellence africaine peut résonner sur toutes les plateformes mondiales.",
    genre: "Afrobeat / R&B",
    origin: "Lubumbashi, RDC",
    since: "2021",
    streams: "850K+",
    plateformes: "150+",
    singles: [
      { title: "Kinshasa Nights", year: "2024", streams: "320K" },
      { title: "Lumière", year: "2023", streams: "180K" },
      { title: "Mama Africa", year: "2023", streams: "210K" },
      { title: "Voyage", year: "2022", streams: "140K" },
    ],
    socials: { instagram: "https://instagram.com", twitter: "https://twitter.com", youtube: "https://youtube.com", spotify: "https://open.spotify.com" },
  },
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
  // ⚠️ Vérification email DÉSACTIVÉE côté front en attendant un vrai SMTP (Resend/Brevo).
  // Pour réactiver : remplacer `true` par `user?.email_confirmed_at != null`
  // ET réactiver "Confirm email" dans Supabase Dashboard → Authentication → Providers → Email.
  const isEmailConfirmed = true;

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

/* ── ARTIST DETAIL v3 ── */
.ap-genre-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(245,197,24,.12);border:1px solid rgba(245,197,24,.25);color:var(--gold);font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:20px}
.ap-hero-name{font-family:'Montserrat',sans-serif;font-size:clamp(52px,8vw,110px);font-weight:900;line-height:.95;letter-spacing:-4px;text-transform:uppercase;margin-bottom:24px}
.ap-hero-socials{display:flex;gap:12px;margin-bottom:32px}
.ap-social-btn{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .3s;cursor:pointer}
.ap-social-btn:hover{background:rgba(245,197,24,.15);border-color:var(--gold);color:var(--gold)}
.ap-hero-acts{display:flex;gap:12px;flex-wrap:wrap}
.ap-bio-title{font-size:13px;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;font-family:'Montserrat',sans-serif}
.ap-bio-text{font-size:15px;color:var(--muted);line-height:1.85;margin-bottom:20px;text-align:justify}
.ap-disco-title{font-size:13px;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;font-family:'Montserrat',sans-serif}
.ap-track{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid rgba(42,42,53,.5);transition:background .2s;cursor:pointer}
.ap-track:hover{padding-left:8px;border-bottom-color:var(--gold)}
.ap-track-num{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--muted);font-weight:600;width:20px;text-align:center}
.ap-track-play{width:32px;height:32px;border-radius:50%;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.2);display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;transition:all .3s}
.ap-track:hover .ap-track-play{background:var(--gold);color:#000}
.ap-track-info{flex:1}
.ap-track-title{font-size:14px;font-weight:600;margin-bottom:2px}
.ap-track-meta{font-size:12px;color:var(--muted)}
.ap-track-streams{font-family:'Montserrat',sans-serif;font-size:12px;color:var(--muted);font-weight:600}
.ap-sidebar-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;margin-bottom:20px}
.ap-sidebar-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:6px}
.ap-sidebar-value{font-size:15px;font-weight:600;margin-bottom:16px}

/* ── ABOUT PAGE v3 ── */
.about-values{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin:48px 0}
.about-val{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;position:relative;overflow:hidden;transition:all .3s}
.about-val::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),transparent)}
.about-val:hover{border-color:rgba(245,197,24,.3);transform:translateY(-2px)}
.about-val-ico{width:48px;height:48px;border-radius:10px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:16px}
.about-val h4{font-size:15px;font-weight:700;margin-bottom:8px}
.about-val p{font-size:13px;color:var(--muted);line-height:1.6}
.about-timeline{position:relative;padding-left:32px;border-left:2px solid var(--border);margin:24px 0 64px}
.about-tl-item{position:relative;margin-bottom:40px}
.about-tl-dot{position:absolute;left:-40px;top:4px;width:13px;height:13px;border-radius:50%;background:var(--gold);border:2px solid var(--bg)}
.about-tl-year{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:2px;margin-bottom:6px}
.about-tl-item h4{font-size:15px;font-weight:700;margin-bottom:4px}
.about-tl-item p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}
.team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:24px}
.team{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center}
.team-av{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--gold));margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;font-size:24px;color:#000}
.team h4{font-size:16px;font-weight:700;margin-bottom:4px}
.team .role{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:12px;display:block}
.team p{font-size:13px;color:var(--muted);line-height:1.7;text-align:justify}

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
  const team = [
    { i: "AK", name: "Axel l'or Kaumba", role: "Fondateur & Distribution digitale", desc: "Visionnaire et entrepreneur passionné, Axel a fondé Sterkte Records avec la conviction profonde que la musique africaine mérite une scène mondiale. Expert en marketing digital, il orchestre les stratégies de distribution et guide chaque artiste vers la réussite internationale." },
    { i: "AA", name: "Abigail Angelani", role: "Directrice Marketing & Communication", desc: "Maîtresse des récits qui résonnent, Abigail construit l'image du label et de ses artistes sur tous les canaux digitaux. Ses campagnes créatives ont permis à plusieurs artistes de percer au-delà des frontières africaines, touchant des audiences en Europe, en Amérique et au Moyen-Orient." },
    { i: "DN", name: "Diadème Ngandu", role: "Manager Artistique", desc: "Coach, stratège et confident des artistes, Diadème est le pilier humain du label. Son approche sur-mesure permet à chaque talent de s'épanouir artistiquement tout en construisant une carrière durable et cohérente. Il coordonne les projets de bout en bout, de la création à la diffusion." },
  ];
  return (
    <div className="pg">
      <PageBanner
        tag="À propos"
        title="Qui sommes-nous ?"
        subtitle="Sterkte Records est né en 2021 de la passion pour la musique authentique et de la volonté d'accompagner les artistes africains vers le monde entier. Depuis notre création à Lubumbashi, nous avons grandi pour devenir un acteur incontournable de la distribution musicale indépendante en Afrique centrale et dans la diaspora, avec une présence croissante au Maroc et en Europe."
        accent={C.gold}
      />
      <div className="pg-c">

        {/* Qui sommes-nous — texte enrichi */}
        <div style={{ marginBottom: 60 }} className="sr-reveal">
          <p style={{ color: C.muted, lineHeight: 1.9, fontSize: 15, marginBottom: 16, textAlign: "justify" }}>
            Sterkte Records est un label musical indépendant fondé à Lubumbashi, en République Démocratique du Congo. Notre mission est simple mais ambitieuse : donner aux artistes africains les outils, les ressources et le réseau nécessaires pour exister sur la scène mondiale, sans sacrifier leur authenticité artistique.
          </p>
          <p style={{ color: C.muted, lineHeight: 1.9, fontSize: 15, marginBottom: 16, textAlign: "justify" }}>
            Nous croyons que la richesse musicale du Congo, de l'Afrique centrale et du continent tout entier mérite d'être entendue partout. C'est pourquoi nous proposons une distribution sur plus de 150 plateformes digitales mondiales, un accompagnement personnalisé, un studio professionnel, des services de booking et de management, et bien plus encore.
          </p>
          <p style={{ color: C.muted, lineHeight: 1.9, fontSize: 15, textAlign: "justify" }}>
            Notre équipe pluridisciplinaire combine expertise musicale, maîtrise du marketing digital et passion pour les artistes. Nous ne sommes pas seulement un intermédiaire : nous sommes des partenaires de carrière engagés dans votre réussite à long terme.
          </p>
        </div>

        {/* Stats */}
        <div className="about-stats sr-reveal">
          {[{ v: "2021", l: "Année de création" }, { v: "150+", l: "Plateformes" }, { v: "1M+", l: "Streams générés" }, { v: "+30", l: "Pays atteints" }].map((s) => (
            <div key={s.l} className="about-stat"><div className="about-stat-v">{s.v}</div><div className="about-stat-l">{s.l}</div></div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 60, marginBottom: 60 }} className="sr-reveal">
          <div>
            <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Notre vision</h3>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, textAlign: "justify" }}>Créer un pont solide entre la créativité débordante des artistes africains et un public mondial avide de sons nouveaux. Nous croyons que la musique de Lubumbashi, de Kinshasa, de tout le continent, a le potentiel de toucher des millions d'âmes à travers le monde.</p>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginTop: 16, textAlign: "justify" }}>Notre ambition : faire de Sterkte Records la référence incontournable pour tout artiste africain souhaitant bâtir une carrière internationale durable, éthique et profitable.</p>
          </div>
          <div>
            <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Notre mission</h3>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, textAlign: "justify" }}>Accompagner chaque artiste signé chez nous avec des outils professionnels, une équipe dédiée et une distribution sur plus de 150 plateformes mondiales. Nous gérons l'aspect technique, administratif et stratégique pour que l'artiste se concentre sur l'essentiel : créer.</p>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginTop: 16, textAlign: "justify" }}>Transparence, excellence et passion sont nos trois piliers. Chaque décision que nous prenons sert d'abord les intérêts de l'artiste.</p>
          </div>
        </div>

        {/* Valeurs */}
        <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Nos valeurs fondamentales</h3>
        <div className="about-values sr-reveal">
          {[
            { Ico: Icon.Diamond, title: "Intégrité", desc: "Honnêteté totale sur les chiffres, les contrats et les décisions. Pas de zones grises." },
            { Ico: Icon.Award, title: "Excellence", desc: "Production de qualité internationale, quel que soit le budget ou le niveau de l'artiste." },
            { Ico: Icon.Globe, title: "Ouverture", desc: "Tous les genres, toutes les cultures africaines. Notre roster est un reflet de la diversité du continent." },
            { Ico: Icon.Rocket, title: "Innovation", desc: "Toujours à la pointe des nouvelles technologies musicales, des plateformes émergentes et des tendances mondiales." },
          ].map((v) => (
            <div key={v.title} className="about-val">
              <div className="about-val-ico"><v.Ico size={22} /></div>
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Notre histoire</h3>
        <div className="about-timeline sr-reveal">
          {[
            { year: "2021", title: "Naissance de Sterkte Records", desc: "Fondation du label à Lubumbashi par Axel l'or Kaumba. Signature des premiers artistes en distribution : Mr. Freez, Feyme, et démarrage de collaborations externes. Une aventure musicale commence, portée par une vision claire : propulser la musique congolaise sur les scènes mondiales." },
            { year: "2022", title: "Premiers pas et chiffres", desc: "Lancement officiel sur Spotify, Apple Music, Deezer et les grandes plateformes. Les premières sorties franchissent rapidement les 50 000 streams. Le label pose ses bases solides et commence à construire sa crédibilité dans l'écosystème de la musique indépendante africaine." },
            { year: "2023", title: "Expansion du roster", desc: "Accueil de KBG Gad pour le gospel, intégration de beatmakers talentueux et élargissement de l'équipe créative. Le catalogue s'enrichit de nouvelles sonorités et genres. Le réseau s'étend à Kinshasa, Brazzaville et Abidjan." },
            { year: "2024", title: "Cap sur le demi-million de streams", desc: "Objectif ambitieux : atteindre les 500K streams cumulés. Lancement du studio mobile à Lubumbashi, puis à Agadir au Maroc, et dans d'autres villes. Cette innovation permet d'enregistrer les artistes là où ils se trouvent, sans contrainte géographique." },
            { year: "2025", title: "Rayonnement international", desc: "Présence établie sur plus de 20 pays. Partenariats avec des labels étrangers dont Lghorfa Music et Arteast Music au Maroc, ainsi que d'autres structures en Europe et en Afrique. Sterkte Records s'impose comme un pont entre l'Afrique et le monde, avec une empreinte digitale toujours plus forte." },
          ].map((item) => (
            <div key={item.year} className="about-tl-item">
              <div className="about-tl-dot" />
              <div className="about-tl-year">{item.year}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Équipe */}
        <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>L'équipe dirigeante</h3>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>Des professionnels passionnés au service de votre talent.</p>
        <div className="team-grid sr-reveal">{team.map((m) => <div key={m.name} className="team"><div className="team-av">{m.i}</div><h4>{m.name}</h4><span className="role">{m.role}</span><p>{m.desc}</p></div>)}</div>

        {/* CTA */}
        <div style={{ marginTop: 64, padding: "48px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, textAlign: "center" }}>
          <div className="sec-tag">Vous êtes artiste ?</div>
          <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, margin: "12px 0 16px" }}>Rejoignez l'aventure <span className="gold">Sterkte Records</span></h3>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>Quel que soit votre style, votre niveau ou vos objectifs, nous avons les outils et l'équipe pour vous propulser.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/connexion" className="btn btn-g btn-lg"><Icon.User size={16} />Créer mon espace artiste</Link>
            <Link to="/contact" className="btn btn-o btn-lg"><Icon.Mail size={16} />Nous contacter</Link>
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

// ─── ARTIST DETAIL PAGE — version v3 visuelle restaurée avec MOCK ───
function ArtistDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { artists } = useArtists();

  const artistFromState = location.state?.artist;
  const artistFromList = artists.find((a) => {
    const s = (a.slug || a.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return s === slug;
  });
  const isMinhoSlug = slug === "dj-minho";
  const minhoFromList = artists.find(a => a.name && a.name.toLowerCase().includes("minho"));
  const artist = artistFromState || artistFromList || (isMinhoSlug ? (minhoFromList || { id: "minho-tribute", name: "DJ Minho", tags: ["DJ"], image_url: null, tribute: true }) : null);

  const detail = MOCK_ARTISTS_DETAIL[slug] || MOCK_ARTISTS_DETAIL.default;

  if (!artist && artists.length > 0) {
    return (
      <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, minHeight: "80vh" }}>
        <h2 style={{ color: C.muted }}>Artiste introuvable</h2>
        <button className="btn btn-g" onClick={() => nav("/artistes")}><Icon.ArrowLeft size={14} />Retour aux artistes</button>
      </div>
    );
  }

  if (!artist) return <div className="pg"><div className="loading-box">Chargement...</div></div>;

  const socials = detail.socials;
  const imgSrc = artist.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=800&background=1A1A25&color=F5C518&bold=true&font-size=0.33`;
  const isTribute = detail.tribute || isMinhoSlug;

  return (
    <div className="ap">
      {/* HERO */}
      <div className="ap-hero" style={isTribute ? { background: "linear-gradient(135deg, #0A0A0F, #12121A)" } : {}}>
        <div className="ap-hero-bg">
          <img src={imgSrc} alt={artist.name} className="ap-hero-img" style={isTribute ? { filter: "brightness(.25) saturate(.4) sepia(.3)" } : {}} />
          <div className="ap-hero-overlay" />
          {isTribute && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(245,197,24,0.04), transparent 60%)", zIndex: 1 }} />}
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

          <div className="ap-genre-tag"><Icon.Music size={12} />{detail.genre}</div>
          <h1 className="ap-hero-name" style={isTribute ? { color: "rgba(255,255,255,0.85)" } : {}}>{artist.name}</h1>

          {isTribute && <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, color: "rgba(245,197,24,0.7)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Décédé le {detail.tributeDate || DJ_MINHO.deathDateFr}</div>}

          <div className="ap-hero-socials">
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="ap-social-btn" aria-label="Instagram"><Icon.Instagram size={16} /></a>}
            {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="ap-social-btn" aria-label="Twitter"><Icon.Twitter size={16} /></a>}
            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="ap-social-btn" aria-label="YouTube"><Icon.Youtube size={16} /></a>}
            {socials.spotify && <a href={socials.spotify} target="_blank" rel="noopener noreferrer" className="ap-social-btn" aria-label="Spotify"><Icon.Spotify size={16} /></a>}
          </div>
          <div className="ap-hero-acts">
            {socials.spotify && <a href={socials.spotify} target="_blank" rel="noopener noreferrer" className="btn btn-g btn-lg"><Icon.Play size={14} color="#000" />Écouter sur Spotify</a>}
            {!isTribute && <Link to="/booking-artistes" className="btn btn-o btn-lg"><Icon.Calendar size={14} />Réserver cet artiste</Link>}
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="ap-stats-bar" style={isTribute ? { background: "rgba(18,18,26,0.95)", borderColor: "rgba(245,197,24,0.1)" } : {}}>
        {[{ v: detail.streams, l: "Streams totaux" }, { v: detail.plateformes, l: "Plateformes" }, { v: detail.singles.length + "+", l: "Sorties" }, { v: detail.since, l: "Avec Sterkte" }].map((s) => (
          <div key={s.l} className="ap-stat"><div className="ap-stat-v">{s.v}</div><div className="ap-stat-l">{s.l}</div></div>
        ))}
      </div>

      {/* BODY */}
      <div className="ap-body">
        {isTribute && (
          <div style={{ background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.12)", borderRadius: 12, padding: 28, marginBottom: 40, display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,197,24,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Heart size={18} color={C.gold} />
            </div>
            <div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Message de Sterkte Records</div>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, textAlign: "justify" }}>Toute l'équipe de Sterkte Records s'incline avec profond respect devant la mémoire de DJ Minho, artiste exceptionnel et ami précieux, qui nous a quittés le {DJ_MINHO.deathDateFr}. Son talent, son énergie et sa générosité resteront à jamais gravés dans nos cœurs et dans la musique qu'il nous a laissée.</p>
            </div>
          </div>
        )}
        <div className="ap-grid">
          <div>
            <div className="ap-bio-title">Biographie</div>
            <p className="ap-bio-text">{detail.bio}</p>
            <p className="ap-bio-text">{detail.bio2}</p>
            <div style={{ marginTop: 48 }}>
              <div className="ap-disco-title">Discographie</div>
              {detail.singles.map((s, i) => (
                <div key={s.title + i} className="ap-track">
                  <div className="ap-track-num">{i + 1}</div>
                  <div className="ap-track-play"><Icon.Play size={12} color="currentColor" /></div>
                  <div className="ap-track-info">
                    <div className="ap-track-title">{s.title}</div>
                    <div className="ap-track-meta">{artist.name} · {s.year}</div>
                  </div>
                  <div className="ap-track-streams">{s.streams} streams</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="ap-sidebar-card">
              <div className="ap-sidebar-label">Genre</div>
              <div className="ap-sidebar-value">{detail.genre}</div>
              <div className="ap-sidebar-label">Origine</div>
              <div className="ap-sidebar-value">{detail.origin}</div>
              <div className="ap-sidebar-label">Avec Sterkte Records depuis</div>
              <div className="ap-sidebar-value">{detail.since}</div>
            </div>
            <div className="ap-sidebar-card">
              <div className="ap-bio-title" style={{ marginBottom: 16 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(artist.tags || [detail.genre]).map((t) => (
                  <span key={t} style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: C.gold, fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            </div>
            {!isTribute && (
              <div className="ap-sidebar-card">
                <div className="ap-bio-title" style={{ marginBottom: 16 }}>Réseaux sociaux</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13 }}><Icon.Instagram size={16} color="currentColor" />Instagram</a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13 }}><Icon.Twitter size={16} color="currentColor" />Twitter / X</a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13 }}><Icon.Youtube size={16} color="currentColor" />YouTube</a>}
                  {socials.spotify && <a href={socials.spotify} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13 }}><Icon.Spotify size={16} color="currentColor" />Spotify</a>}
                </div>
              </div>
            )}
            {!isTribute && <Link to="/featurings" className="btn btn-r btn-lg" style={{ width: "100%", justifyContent: "center" }}><Icon.Headphones size={16} />Demander un featuring</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── DISTRIBUTION PAGE ───
function DistributionPage() {
  useSEO("/distribution-musique");
  useScrollReveal();
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <div className="pg">
      <PageBanner tag="Distribution" title="Votre musique partout dans le monde" subtitle="Distribuez votre musique sur Spotify, Apple Music, Deezer, YouTube Music, TikTok, Boomplay et 150+ plateformes — depuis votre dashboard, en quelques clics." accent={C.gold} />
      <div className="pg-c">
        <div className="sr-reveal">
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Comment ça <span className="gold">marche</span></h3>
          <div className="steps">
            {[
              { t: "Créez votre compte", d: "Inscription gratuite. Vérifiez votre email pour activer votre espace artiste." },
              { t: "Préparez vos fichiers", d: "Audio en WAV (16/24-bit, 44.1kHz min) et cover carrée 3000×3000 px en JPG/PNG sRGB." },
              { t: "Uploadez et renseignez", d: "Métadonnées DDEX complètes : titre, ISRC/UPC, langue, contenu explicite, splits royalties, plateformes ciblées." },
              { t: "Validation par notre équipe", d: "Notre équipe vérifie la qualité audio, la cover et les droits sous 24-72h ouvrées." },
              { t: "Distribution et suivi", d: "Votre titre est envoyé aux DSP. Suivez le statut par étape et récupérez vos statistiques mensuelles." },
            ].map((s, i) => <div key={i} className="step"><div className="step-n">{i + 1}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}
          </div>
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Pourquoi nous <span className="gold">choisir</span></h3>
          <div className="feats">
            {[
              { Ico: Icon.Globe, title: "150+ plateformes", desc: "Spotify, Apple Music, Deezer, YouTube Music, TikTok, Boomplay, Audiomack, Tidal, Amazon Music, Anghami, Qobuz et bien plus." },
              { Ico: Icon.Layers, title: "Métadonnées DDEX", desc: "ISRC, UPC, P-line, C-line, songwriters, langue, explicit content, splits royalties — toutes les données pro." },
              { Ico: Icon.Diamond, title: "Splits royalties illimités", desc: "Configurez les pourcentages entre artistes, beatmakers, songwriters et éditeurs. Paiement direct à chaque ayant droit." },
              { Ico: Icon.Zap, title: "Statut par étape", desc: "Suivez où en est votre titre : reçu, en validation, approuvé, envoyé aux DSP, live." },
              { Ico: Icon.Award, title: "Validation humaine", desc: "Notre équipe vérifie chaque titre avant envoi pour éviter les rejets DSP et préserver votre image." },
              { Ico: Icon.Shield, title: "Vos masters protégés", desc: "Fichiers chiffrés et accessibles uniquement par vous et notre équipe. Pas de fuite avant sortie." },
            ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}
          </div>
        </div>

        <div className="sr-reveal" style={{ textAlign: "center", marginTop: 48 }}>
          {user
            ? <button className="btn btn-g btn-lg" onClick={() => nav("/dashboard")}><Icon.Music size={16} />Distribuer un titre maintenant</button>
            : <button className="btn btn-g btn-lg" onClick={() => nav("/connexion")}><Icon.Rocket size={16} />Créer mon compte gratuit</button>}
        </div>
      </div>
    </div>
  );
}

// ─── STUDIO PAGE ───
function StudioPage() {
  useSEO("/studio-enregistrement");
  useScrollReveal();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", studioType: "Studio Lubumbashi", duration: "2", date: "", address: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && profile) {
      setForm(f => ({ ...f, name: profile.full_name || f.name, email: user.email || f.email, phone: profile.whatsapp || f.phone }));
    }
  }, [user, profile]);

  const pricing = {
    "Studio Lubumbashi": { hourly: 15, currency: "USD", desc: "Notre studio principal à Lubumbashi" },
    "Studio mobile RDC": { hourly: 25, currency: "USD", desc: "Studio mobile dans le Haut-Katanga" },
    "Studio mobile Maroc": { hourly: 30, currency: "EUR", desc: "Studio mobile à Casablanca/Rabat" },
  };
  const currentPrice = pricing[form.studioType];
  const totalPrice = parseFloat(form.duration) * currentPrice.hourly;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!isValidEmail(form.email)) e.email = "Email invalide";
    if (!form.phone || !isValidPhone(form.phone)) e.phone = "Téléphone international requis (ex : +243...)";
    if (!form.date) e.date = "Date requise";
    if (parseFloat(form.duration) < 1) e.duration = "Durée minimum 1h";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ msg: "Vérifiez les champs en rouge", type: "err" }); return; }
    setSending(true);
    if (supabaseConfigured) {
      await supabase.from("studio_bookings").insert({
        user_id: user?.id || null,
        name: form.name, email: form.email, phone: form.phone,
        studio_type: form.studioType, duration_hours: parseFloat(form.duration),
        booking_date: form.date, address: form.address, message: form.message,
        estimated_price: `${totalPrice} ${currentPrice.currency}`,
      });
    }
    await sendEmail({
      subject: `[Studio] Réservation - ${form.studioType} - ${form.name}`,
      name: form.name, email: form.email, phone: form.phone,
      message: `Type: ${form.studioType}\nDate: ${form.date}\nDurée: ${form.duration}h\nPrix estimé: ${totalPrice} ${currentPrice.currency}\nAdresse: ${form.address}\n\nMessage:\n${form.message}`,
    });
    setToast({ msg: "Demande envoyée. Réponse sous 24h.", type: "ok" });
    setForm({ name: "", email: "", phone: "", studioType: "Studio Lubumbashi", duration: "2", date: "", address: "", message: "" });
    setSending(false);
  };

  return (
    <div className="pg">
      <PageBanner tag="Studio" title="Studio professionnel & studios mobiles" subtitle="Enregistrement, mixage et mastering. Notre studio fixe à Lubumbashi et nos studios mobiles en RDC et au Maroc s'adaptent à vos besoins." accent={C.gold} />
      <div className="pg-c">
        <div className="sr-reveal">
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Nos <span className="gold">tarifs</span></h3>
          <div className="pricing">
            {Object.entries(pricing).map(([name, p], i) => (
              <div key={name} className={`price-card ${i === 0 ? "ft" : ""}`}>
                <h4>{name}</h4>
                <div className="price-val">{p.hourly} {p.currency}<span>/heure</span></div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{p.desc}</p>
                <ul>
                  <li><div className="chk"><Icon.Check size={11} color={C.gold} /></div>Ingénieur son inclus</li>
                  <li><div className="chk"><Icon.Check size={11} color={C.gold} /></div>Mixage de base inclus</li>
                  <li><div className="chk"><Icon.Check size={11} color={C.gold} /></div>Mastering en option</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="sr-reveal" style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Réserver une session</h3>
          <form onSubmit={handleSubmit} className="fm">
            <div className="fm-row">
              <div className="fm-g"><label className="fm-l">Nom complet *</label><input className="fm-i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <div className="fm-help" style={{ color: C.red }}>{errors.name}</div>}</div>
              <div className="fm-g"><label className="fm-l">Email *</label><input type="email" className="fm-i" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <div className="fm-help" style={{ color: C.red }}>{errors.email}</div>}</div>
            </div>
            <div className="fm-row">
              <div className="fm-g"><label className="fm-l">Téléphone (international, +XXX...) *</label><input type="tel" className="fm-i" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+243850510209" />{errors.phone && <div className="fm-help" style={{ color: C.red }}>{errors.phone}</div>}</div>
              <div className="fm-g"><label className="fm-l">Type de studio *</label><select className="fm-s" value={form.studioType} onChange={(e) => setForm({ ...form, studioType: e.target.value })}>{Object.keys(pricing).map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="fm-row">
              <div className="fm-g"><label className="fm-l">Date souhaitée *</label><input type="date" className="fm-i" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} />{errors.date && <div className="fm-help" style={{ color: C.red }}>{errors.date}</div>}</div>
              <div className="fm-g"><label className="fm-l">Durée (heures) *</label><input type="number" min="1" max="12" step="0.5" className="fm-i" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /><div className="fm-help">Prix estimé : <span className="gold">{totalPrice} {currentPrice.currency}</span></div></div>
            </div>
            {form.studioType.includes("mobile") && <div className="fm-g"><label className="fm-l">Adresse de la session *</label><input className="fm-i" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adresse complète" /></div>}
            <div className="fm-g"><label className="fm-l">Message (instruments, équipement spécifique, projet...)</label><textarea className="fm-t" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <button type="submit" className="btn btn-g btn-lg" disabled={sending}>{sending ? "Envoi..." : <><Icon.Send size={14} />Envoyer la demande</>}</button>
          </form>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── BOOKING PAGE ───
function BookingPage() {
  useSEO("/booking-artistes");
  useScrollReveal();
  const { artists } = useArtists();
  const [form, setForm] = useState({ name: "", email: "", phone: "", artistName: "", eventType: "Concert", eventDate: "", budget: "", location: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!isValidEmail(form.email)) e.email = "Email invalide";
    if (!form.artistName) e.artistName = "Choisissez un artiste";
    if (!form.eventDate) e.eventDate = "Date requise";
    if (!form.location.trim()) e.location = "Lieu requis";
    if (!form.message.trim() || form.message.length < 30) e.message = "Décrivez votre événement (30 caractères min)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ msg: "Vérifiez les champs en rouge", type: "err" }); return; }
    setSending(true);
    if (supabaseConfigured) {
      await supabase.from("booking_requests").insert({
        name: form.name, email: form.email, phone: form.phone,
        artist_name: form.artistName, event_type: form.eventType,
        event_date: form.eventDate, budget: form.budget,
        location: form.location, message: form.message,
      });
    }
    await sendEmail({
      subject: `[Booking] ${form.artistName} - ${form.eventType}`,
      name: form.name, email: form.email, phone: form.phone,
      message: `Artiste: ${form.artistName}\nType: ${form.eventType}\nDate: ${form.eventDate}\nLieu: ${form.location}\nBudget: ${form.budget}\n\nMessage:\n${form.message}`,
    });
    setToast({ msg: "Demande de booking envoyée. Réponse sous 48h.", type: "ok" });
    setForm({ name: "", email: "", phone: "", artistName: "", eventType: "Concert", eventDate: "", budget: "", location: "", message: "" });
    setSending(false);
  };

  return (
    <div className="pg">
      <PageBanner tag="Booking" title="Réservez nos artistes" subtitle="Pour vos concerts, festivals, événements privés et corporate. Notre équipe vous répond sous 48h." accent={C.red} />
      <div className="pg-c">
        <form onSubmit={handleSubmit} className="fm sr-reveal">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom *</label><input className="fm-i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <div className="fm-help" style={{ color: C.red }}>{errors.name}</div>}</div>
            <div className="fm-g"><label className="fm-l">Email *</label><input type="email" className="fm-i" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <div className="fm-help" style={{ color: C.red }}>{errors.email}</div>}</div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Téléphone</label><input type="tel" className="fm-i" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+243..." /></div>
            <div className="fm-g"><label className="fm-l">Artiste souhaité *</label><select className="fm-s" value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })}><option value="">— Sélectionner —</option>{artists.filter(a => !a.tribute && !(a.name || "").toLowerCase().includes("minho")).map(a => <option key={a.id}>{a.name}</option>)}<option value="Plusieurs / À déterminer">Plusieurs / À déterminer</option></select>{errors.artistName && <div className="fm-help" style={{ color: C.red }}>{errors.artistName}</div>}</div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Type d'événement *</label><select className="fm-s" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}><option>Concert</option><option>Festival</option><option>Mariage</option><option>Événement privé</option><option>Événement corporate</option><option>Autre</option></select></div>
            <div className="fm-g"><label className="fm-l">Date de l'événement *</label><input type="date" className="fm-i" value={form.eventDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />{errors.eventDate && <div className="fm-help" style={{ color: C.red }}>{errors.eventDate}</div>}</div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Lieu (ville, pays) *</label><input className="fm-i" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />{errors.location && <div className="fm-help" style={{ color: C.red }}>{errors.location}</div>}</div>
            <div className="fm-g"><label className="fm-l">Budget approximatif</label><input className="fm-i" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Ex : 5000 USD" /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Message *</label><textarea className="fm-t" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Détaillez votre événement : audience attendue, durée du show, conditions techniques..." />{errors.message && <div className="fm-help" style={{ color: C.red }}>{errors.message}</div>}</div>
          <button type="submit" className="btn btn-r btn-lg" disabled={sending}>{sending ? "Envoi..." : <><Icon.Send size={14} />Envoyer la demande</>}</button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── FEATURING PAGE ───
function FeaturingPage() {
  useSEO("/featurings");
  useScrollReveal();
  const { artists } = useArtists();
  const [form, setForm] = useState({ name: "", email: "", phone: "", artistName: "", projectName: "", deadline: "", projectLink: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!isValidEmail(form.email)) e.email = "Email invalide";
    if (!form.artistName) e.artistName = "Choisissez un artiste";
    if (!form.projectName.trim()) e.projectName = "Nom du projet requis";
    if (!form.message.trim() || form.message.length < 50) e.message = "Décrivez votre projet (50 caractères min)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ msg: "Vérifiez les champs en rouge", type: "err" }); return; }
    setSending(true);
    if (supabaseConfigured) {
      await supabase.from("featuring_requests").insert({
        name: form.name, email: form.email, phone: form.phone,
        artist_name: form.artistName, project_name: form.projectName,
        deadline: form.deadline, project_link: form.projectLink, message: form.message,
      });
    }
    await sendEmail({
      subject: `[Featuring] ${form.artistName} - ${form.projectName}`,
      name: form.name, email: form.email, phone: form.phone,
      message: `Artiste: ${form.artistName}\nProjet: ${form.projectName}\nDeadline: ${form.deadline}\nLien: ${form.projectLink}\n\n${form.message}`,
    });
    setToast({ msg: "Demande envoyée. Réponse sous 7 jours.", type: "ok" });
    setForm({ name: "", email: "", phone: "", artistName: "", projectName: "", deadline: "", projectLink: "", message: "" });
    setSending(false);
  };

  return (
    <div className="pg">
      <PageBanner tag="Featurings" title="Collaborer avec nos artistes" subtitle="Demandez un featuring avec l'un de nos artistes. Réponse sous 7 jours ouvrés." accent={C.blue} />
      <div className="pg-c">
        <div className="sr-reveal" style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Comment ça marche</h3>
          <div className="steps">
            {[
              { t: "Soumettez votre demande", d: "Présentez votre projet, l'artiste souhaité et joignez une démo." },
              { t: "Évaluation par l'équipe", d: "Notre équipe et l'artiste examinent ensemble la pertinence artistique." },
              { t: "Devis et contrat", d: "Si validé, nous vous envoyons les conditions tarifaires et le contrat de collaboration." },
              { t: "Production du featuring", d: "Enregistrement et coordination en studio (présentiel ou à distance)." },
            ].map((s, i) => <div key={i} className="step"><div className="step-n">{i + 1}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="fm sr-reveal">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom *</label><input className="fm-i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <div className="fm-help" style={{ color: C.red }}>{errors.name}</div>}</div>
            <div className="fm-g"><label className="fm-l">Email *</label><input type="email" className="fm-i" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <div className="fm-help" style={{ color: C.red }}>{errors.email}</div>}</div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Téléphone</label><input type="tel" className="fm-i" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+243..." /></div>
            <div className="fm-g"><label className="fm-l">Artiste souhaité *</label><select className="fm-s" value={form.artistName} onChange={(e) => setForm({ ...form, artistName: e.target.value })}><option value="">— Sélectionner —</option>{artists.filter(a => !a.tribute && !(a.name || "").toLowerCase().includes("minho")).map(a => <option key={a.id}>{a.name}</option>)}</select>{errors.artistName && <div className="fm-help" style={{ color: C.red }}>{errors.artistName}</div>}</div>
          </div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Nom du projet *</label><input className="fm-i" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />{errors.projectName && <div className="fm-help" style={{ color: C.red }}>{errors.projectName}</div>}</div>
            <div className="fm-g"><label className="fm-l">Deadline souhaitée</label><input type="date" className="fm-i" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Lien démo / WeTransfer / Drive</label><input type="url" className="fm-i" value={form.projectLink} onChange={(e) => setForm({ ...form, projectLink: e.target.value })} placeholder="https://..." /></div>
          <div className="fm-g"><label className="fm-l">Présentation du projet *</label><textarea className="fm-t" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Style, vibe, label, références, vision artistique..." />{errors.message && <div className="fm-help" style={{ color: C.red }}>{errors.message}</div>}</div>
          <button type="submit" className="btn btn-g btn-lg" disabled={sending}>{sending ? "Envoi..." : <><Icon.Send size={14} />Envoyer la demande</>}</button>
        </form>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── SERVICES PAGE ───
function ServicesPage() {
  useSEO("/services");
  useScrollReveal();
  return (
    <div className="pg">
      <PageBanner tag="Services" title="Consulting & Management" subtitle="Stratégie de lancement, gestion de carrière, coaching et accompagnement personnalisé." accent={C.blue} />
      <div className="pg-c">
        <div className="feats sr-reveal">
          {[
            { Ico: Icon.Target, title: "Stratégie de lancement", desc: "Plan détaillé pour votre prochain single ou EP : positionnement, calendrier de release, plan promo." },
            { Ico: Icon.BarChart, title: "Management de carrière", desc: "Accompagnement long-terme : direction artistique, négociation, gestion d'équipe." },
            { Ico: Icon.Award, title: "Coaching artistique", desc: "Travail vocal, présence scénique, identité visuelle. Sessions individuelles." },
            { Ico: Icon.Mic, title: "Direction de production", desc: "Choix des beatmakers, supervision du studio, decision A&R sur votre projet." },
            { Ico: Icon.Globe, title: "Stratégie internationale", desc: "Développement sur l'Europe, l'Afrique francophone et le marché MENA." },
            { Ico: Icon.Layers, title: "Stratégie sociale et digitale", desc: "Plans de contenu Instagram/TikTok, calendrier éditorial, ghostwriting." },
          ].map((s) => <div key={s.title} className="feat"><div className="feat-ico"><s.Ico size={22} /></div><h4>{s.title}</h4><p>{s.desc}</p></div>)}
        </div>
        <div className="sr-reveal" style={{ textAlign: "center", marginTop: 48 }}>
          <Link to="/contact" className="btn btn-g btn-lg"><Icon.Mail size={16} />Discutons de votre projet</Link>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ───
function ContactPage() {
  useSEO("/contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!isValidEmail(form.email)) e.email = "Email invalide";
    if (!form.subject.trim()) e.subject = "Objet requis";
    if (!form.message.trim() || form.message.length < 20) e.message = "Message trop court (min. 20 caractères)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setToast({ msg: "Vérifiez les champs en rouge", type: "err" }); return; }
    setSending(true);
    if (supabaseConfigured) {
      await supabase.from("contact_messages").insert({ name: form.name, email: form.email, subject: form.subject, message: form.message });
    }
    await sendEmail({ subject: `[Contact] ${form.subject}`, name: form.name, email: form.email, message: form.message });
    setToast({ msg: "Message envoyé. Réponse sous 24h.", type: "ok" });
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <div className="pg">
      <PageBanner tag="Contact" title="Restons en contact" subtitle="Une question, un projet ? Notre équipe vous répond sous 24h." accent={C.gold} />
      <div className="pg-c">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Nos coordonnées</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, color: C.white }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(245,197,24,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.Mail size={18} color={C.gold} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Email</div><div style={{ fontSize: 14, fontWeight: 600 }}>{CONTACT_EMAIL}</div></div>
              </a>
              <a href={`tel:${WHATSAPP_NUMBER}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, color: C.white }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(76,175,80,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.Whatsapp size={18} color={C.success} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>WhatsApp / Téléphone</div><div style={{ fontSize: 14, fontWeight: 600 }}>{WHATSAPP_NUMBER}</div></div>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(230,57,70,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.MapPin size={18} color={C.red} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Adresse</div><div style={{ fontSize: 14, fontWeight: 600 }}>Lubumbashi, Haut-Katanga, RDC</div></div>
              </div>
              <a href="https://linktr.ee/sterkterecords" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, color: C.white }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(79,195,247,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.Link2 size={18} color={C.blue} /></div>
                <div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Réseaux sociaux</div><div style={{ fontSize: 14, fontWeight: 600 }}>linktr.ee/sterkterecords</div></div>
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="fm" style={{ maxWidth: "100%" }}>
            <div className="fm-g"><label className="fm-l">Nom complet *</label><input className="fm-i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <div className="fm-help" style={{ color: C.red }}>{errors.name}</div>}</div>
            <div className="fm-g"><label className="fm-l">Email *</label><input type="email" className="fm-i" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <div className="fm-help" style={{ color: C.red }}>{errors.email}</div>}</div>
            <div className="fm-g"><label className="fm-l">Objet *</label><input className="fm-i" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />{errors.subject && <div className="fm-help" style={{ color: C.red }}>{errors.subject}</div>}</div>
            <div className="fm-g"><label className="fm-l">Message *</label><textarea className="fm-t" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />{errors.message && <div className="fm-help" style={{ color: C.red }}>{errors.message}</div>}</div>
            <button type="submit" className="btn btn-g btn-lg" disabled={sending}>{sending ? "Envoi..." : <><Icon.Send size={14} />Envoyer le message</>}</button>
          </form>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── LOGIN PAGE — refonte complète sécurité + RGPD ───
function LoginPage() {
  const [mode, setMode] = useState("signin"); // signin | signup | reset | confirm-pending
  const loc = useLocation();
  const nav = useNavigate();
  const { signUp, signIn, resetPassword, user } = useAuth();
  const [showPwd, setShowPwd] = useState(false);

  // Notifications post-redirection
  const [globalMsg, setGlobalMsg] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    if (params.get("confirmed") === "1") setGlobalMsg({ msg: "Email confirmé ! Vous pouvez maintenant vous connecter.", type: "ok" });
    if (params.get("reset") === "1") setGlobalMsg({ msg: "Lien de réinitialisation valide. Choisissez un nouveau mot de passe ci-dessous.", type: "ok" });
  }, [loc.search]);

  // Si déjà connecté ET email vérifié → dashboard
  useEffect(() => {
    if (user && user.email_confirmed_at) nav("/dashboard");
  }, [user, nav]);

  const [signin, setSignin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({
    fullName: "", artistName: "", email: "", whatsapp: "",
    password: "", passwordConfirm: "", genre: "",
    cgu: false, privacy: false, newsletter: false,
  });
  const [resetEmail, setResetEmail] = useState("");

  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    if (!isValidEmail(signin.email)) { setErr("Email invalide"); setLoading(false); return; }
    if (!signin.password) { setErr("Mot de passe requis"); setLoading(false); return; }
    const { data, error } = await signIn(signin.email, signin.password);
    setLoading(false);
    if (error) {
      // Email not confirmed = compte créé mais Supabase a "Confirm email" activé.
      // Solution recommandée : désactiver "Confirm email" dans Supabase Dashboard.
      if (error.message.includes("Email not confirmed")) {
        setErr("Votre compte est en attente de confirmation côté serveur. Contactez l'admin du site (un correctif est en cours).");
      }
      else if (error.message.includes("Invalid login")) setErr("Email ou mot de passe incorrect.");
      else setErr(error.message);
      return;
    }
    nav("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);

    // Validation complète
    if (!signup.fullName.trim() || signup.fullName.trim().length < 2) return setErr("Nom complet requis");
    if (!signup.artistName.trim()) return setErr("Nom d'artiste requis");
    if (!isValidEmail(signup.email)) return setErr("Email invalide");
    if (!signup.whatsapp || !isValidPhone(signup.whatsapp)) return setErr("Numéro de téléphone international requis (ex : +243850510209)");
    if (!signup.genre) return setErr("Sélectionnez un genre musical");
    if (signup.password.length < 8) return setErr("Le mot de passe doit faire au moins 8 caractères");
    if (passwordStrength(signup.password) < 2) return setErr("Mot de passe trop faible — utilisez majuscules, chiffres ou symboles");
    if (signup.password !== signup.passwordConfirm) return setErr("Les mots de passe ne correspondent pas");
    if (!signup.cgu) return setErr("Vous devez accepter les Conditions Générales d'Utilisation");
    if (!signup.privacy) return setErr("Vous devez accepter la Politique de confidentialité");

    setLoading(true);
    const { data, error } = await signUp(signup.email, signup.password, {
      full_name: signup.fullName,
      artist_name: signup.artistName,
      genre: signup.genre,
      whatsapp: signup.whatsapp,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already")) setErr("Un compte existe déjà avec cet email.");
      else setErr(error.message);
      return;
    }

    // Notif équipe (clic utilisateur — à remplacer par webhook serveur en prod)
    sendWhatsApp(`🎵 *Nouvelle inscription Sterkte Records*\n\n👤 ${signup.fullName} (${signup.artistName})\n📧 ${signup.email}\n📞 ${signup.whatsapp}\n🎼 ${signup.genre}`);

    // Connexion automatique si Supabase ne demande pas de confirmation email
    if (data?.session) {
      nav("/dashboard");
      return;
    }
    // Sinon, on bascule en mode connexion avec un message clair
    setMode("signin");
    setMsg("Compte créé ! Connectez-vous avec votre email et mot de passe.");
    setSignin({ email: signup.email, password: "" });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    if (!isValidEmail(resetEmail)) { setErr("Email invalide"); return; }
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setMsg("Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.");
    setResetEmail("");
  };

  const ps = passwordStrength(signup.password);
  const psLabel = ["", "Faible", "Moyen", "Bon", "Excellent"][ps];

  return (
    <div className="login-pg">
      <div className="login-card">
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <img src="/logo.png" alt="" style={{ height: 32 }} onError={(e) => { e.target.style.display = "none"; }} />
          <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 18 }}>
            <span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span>
          </span>
        </Link>

        {globalMsg && <div style={{ padding: 12, background: globalMsg.type === "ok" ? "rgba(76,175,80,.08)" : "rgba(230,57,70,.08)", border: `1px solid ${globalMsg.type === "ok" ? "rgba(76,175,80,.3)" : "rgba(230,57,70,.3)"}`, borderRadius: 8, fontSize: 13, color: globalMsg.type === "ok" ? C.success : C.red, marginBottom: 16 }}>{globalMsg.msg}</div>}

        {mode === "confirm-pending" && (
          <>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(245,197,24,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon.Mail size={28} color={C.gold} />
              </div>
              <h2>Vérifiez votre email</h2>
              <p className="sub" style={{ marginTop: 12 }}>Nous venons de vous envoyer un email de confirmation. <br/>Cliquez sur le lien à l'intérieur pour activer votre compte, puis revenez vous connecter.</p>
              <p className="sub" style={{ marginTop: 16, fontSize: 12 }}>Pas reçu ? Vérifiez vos spams ou contactez-nous à {CONTACT_EMAIL}</p>
              <button onClick={() => setMode("signin")} className="btn btn-o" style={{ marginTop: 24 }}>Retour à la connexion</button>
            </div>
          </>
        )}

        {mode === "signin" && (
          <>
            <h2>Connexion</h2>
            <p className="sub">Bienvenue sur votre espace artiste</p>
            <form onSubmit={handleSignin}>
              <div className="fm-g"><label className="fm-l">Email</label><input type="email" className="fm-i" value={signin.email} onChange={(e) => setSignin({ ...signin, email: e.target.value })} required autoComplete="email" /></div>
              <div className="fm-g" style={{ position: "relative" }}>
                <label className="fm-l">Mot de passe</label>
                <input type={showPwd ? "text" : "password"} className="fm-i fm-i-pwd" value={signin.password} onChange={(e) => setSignin({ ...signin, password: e.target.value })} required autoComplete="current-password" />
                <button type="button" className="fm-eye" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPwd ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>
              {msg && <div style={{ padding: 12, background: "rgba(76,175,80,.08)", border: `1px solid rgba(76,175,80,.3)`, borderRadius: 8, fontSize: 13, color: C.success, marginBottom: 12 }}>{msg}</div>}
              {err && <div className="fm-err" style={{ marginBottom: 12 }}>{err}</div>}
              <button type="submit" className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <button type="button" className="btn-ghost" onClick={() => { setMode("reset"); setErr(null); setMsg(null); }}>Mot de passe oublié ?</button>
              </div>
              <div style={{ textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Pas encore de compte ? </span>
                <button type="button" onClick={() => { setMode("signup"); setErr(null); setMsg(null); }} style={{ background: "none", border: "none", color: C.gold, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Créer un compte</button>
              </div>
            </form>
          </>
        )}

        {mode === "signup" && (
          <>
            <h2>Créer un compte</h2>
            <p className="sub">Rejoignez Sterkte Records gratuitement</p>
            <form onSubmit={handleSignup}>
              <div className="fm-row">
                <div className="fm-g"><label className="fm-l">Nom complet *</label><input className="fm-i" value={signup.fullName} onChange={(e) => setSignup({ ...signup, fullName: e.target.value })} required autoComplete="name" /></div>
                <div className="fm-g"><label className="fm-l">Nom d'artiste *</label><input className="fm-i" value={signup.artistName} onChange={(e) => setSignup({ ...signup, artistName: e.target.value })} required /></div>
              </div>
              <div className="fm-g"><label className="fm-l">Email *</label><input type="email" className="fm-i" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required autoComplete="email" /></div>
              <div className="fm-g"><label className="fm-l">WhatsApp / Téléphone (international) *</label><input type="tel" className="fm-i" value={signup.whatsapp} onChange={(e) => setSignup({ ...signup, whatsapp: e.target.value })} required placeholder="+243850510209" /><div className="fm-help">Format international, commençant par +</div></div>
              <div className="fm-g"><label className="fm-l">Genre musical principal *</label><select className="fm-s" value={signup.genre} onChange={(e) => setSignup({ ...signup, genre: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {MUSIC_GENRES.map(g => <option key={g}>{g}</option>)}
              </select></div>
              <div className="fm-g" style={{ position: "relative" }}>
                <label className="fm-l">Mot de passe * (8 caractères min.)</label>
                <input type={showPwd ? "text" : "password"} className="fm-i fm-i-pwd" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required minLength={8} autoComplete="new-password" />
                <button type="button" className="fm-eye" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPwd ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
                {signup.password && (
                  <>
                    <div className="pwd-strength">
                      {[1,2,3,4].map(i => <div key={i} className={`pwd-bar ${ps >= i ? `f${ps}` : ""}`} />)}
                    </div>
                    <div className="fm-help">Force : {psLabel}</div>
                  </>
                )}
              </div>
              <div className="fm-g"><label className="fm-l">Confirmation du mot de passe *</label><input type={showPwd ? "text" : "password"} className="fm-i" value={signup.passwordConfirm} onChange={(e) => setSignup({ ...signup, passwordConfirm: e.target.value })} required autoComplete="new-password" /></div>

              <div className="fm-g">
                <label className="fm-cb">
                  <input type="checkbox" checked={signup.cgu} onChange={(e) => setSignup({ ...signup, cgu: e.target.checked })} required />
                  <span>J'accepte les <Link to="/cgu" target="_blank">Conditions Générales d'Utilisation</Link> *</span>
                </label>
              </div>
              <div className="fm-g">
                <label className="fm-cb">
                  <input type="checkbox" checked={signup.privacy} onChange={(e) => setSignup({ ...signup, privacy: e.target.checked })} required />
                  <span>J'accepte la <Link to="/confidentialite" target="_blank">Politique de confidentialité</Link> *</span>
                </label>
              </div>
              <div className="fm-g">
                <label className="fm-cb">
                  <input type="checkbox" checked={signup.newsletter} onChange={(e) => setSignup({ ...signup, newsletter: e.target.checked })} />
                  <span>Je souhaite recevoir les actualités de Sterkte Records</span>
                </label>
              </div>

              {err && <div className="fm-err" style={{ marginBottom: 12 }}>{err}</div>}
              <button type="submit" className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
              <div style={{ textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <span style={{ fontSize: 13, color: C.muted }}>Déjà un compte ? </span>
                <button type="button" onClick={() => { setMode("signin"); setErr(null); setMsg(null); }} style={{ background: "none", border: "none", color: C.gold, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Se connecter</button>
              </div>
            </form>
          </>
        )}

        {mode === "reset" && (
          <>
            <h2>Mot de passe oublié</h2>
            <p className="sub">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={handleReset}>
              <div className="fm-g"><label className="fm-l">Email</label><input type="email" className="fm-i" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required autoComplete="email" /></div>
              {err && <div className="fm-err" style={{ marginBottom: 12 }}>{err}</div>}
              {msg && <div style={{ padding: 12, background: "rgba(76,175,80,.08)", border: `1px solid rgba(76,175,80,.3)`, borderRadius: 8, fontSize: 13, color: C.success, marginBottom: 12 }}>{msg}</div>}
              <button type="submit" className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</button>
              <div style={{ textAlign: "center" }}>
                <button type="button" onClick={() => { setMode("signin"); setErr(null); setMsg(null); }} className="btn-ghost">← Retour à la connexion</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD — refonte complète DDEX + splits + plateformes ───
const TRACK_STATUSES = [
  { value: "received", label: "Reçu", color: C.muted },
  { value: "review", label: "En validation", color: C.blue },
  { value: "approved", label: "Approuvé", color: C.gold },
  { value: "sent", label: "Envoyé aux DSP", color: "#FF9800" },
  { value: "live", label: "Live", color: C.success },
  { value: "rejected", label: "Refusé", color: C.red },
];

function statusInfo(s) { return TRACK_STATUSES.find(t => t.value === s) || TRACK_STATUSES[0]; }

function TimelineStatus({ status }) {
  const order = ["received", "review", "approved", "sent", "live"];
  if (status === "rejected") {
    return <div style={{ padding: 16, background: "rgba(230,57,70,.08)", border: "1px solid rgba(230,57,70,.3)", borderRadius: 10, color: C.red, fontSize: 13 }}>Ce titre a été refusé. Consultez le motif dans les détails.</div>;
  }
  const idx = order.indexOf(status);
  return (
    <div className="timeline">
      {order.map((s, i) => {
        const info = statusInfo(s);
        const cls = i < idx ? "done" : i === idx ? "current" : "";
        return (
          <div key={s} className={`timeline-step ${cls}`}>
            <div className="timeline-dot">{i < idx ? <Icon.Check size={12} /> : i + 1}</div>
            <div className="timeline-label">{info.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Sub-composant : éditeur de splits royalties
function SplitsEditor({ splits, onChange }) {
  const total = splits.reduce((s, sp) => s + parseFloat(sp.percent || 0), 0);
  const isOk = Math.abs(total - 100) < 0.01;

  const update = (i, field, val) => {
    const next = [...splits];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...splits, { name: "", role: "Artiste", percent: 0 }]);
  const remove = (i) => onChange(splits.filter((_, idx) => idx !== i));

  return (
    <div className="splits-box">
      {splits.map((s, i) => (
        <div key={i} className="split-row">
          <input className="fm-i" placeholder="Nom complet de l'ayant droit" value={s.name} onChange={(e) => update(i, "name", e.target.value)} aria-label={`Nom split ${i + 1}`} />
          <select className="fm-s" value={s.role} onChange={(e) => update(i, "role", e.target.value)} aria-label={`Rôle split ${i + 1}`}>
            <option>Artiste principal</option>
            <option>Featuring</option>
            <option>Beatmaker / Producer</option>
            <option>Songwriter / Compositeur</option>
            <option>Éditeur / Publisher</option>
            <option>Autre</option>
          </select>
          <input type="number" min="0" max="100" step="0.1" className="fm-i" placeholder="%" value={s.percent} onChange={(e) => update(i, "percent", e.target.value)} aria-label={`Pourcentage split ${i + 1}`} />
          <button type="button" className="tr-act-btn danger" onClick={() => remove(i)} aria-label="Supprimer ce split"><Icon.Trash size={14} /></button>
        </div>
      ))}
      <button type="button" className="btn btn-o btn-sm" onClick={add} style={{ marginTop: 8 }}><Icon.Plus size={12} />Ajouter un ayant droit</button>
      <div className={`split-total ${isOk ? "ok" : "err"}`}>
        <span>Total :</span>
        <span style={{ fontWeight: 700 }}>{total.toFixed(1)}% {isOk ? "✓" : `(doit faire 100%)`}</span>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user, profile, signOut, deleteAccount, fetchProfile } = useAuth();
  const { tracks, stats, loading, refetch } = useTracks();
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => { document.title = "Mon dashboard - Sterkte Records"; }, []);

  const handleExport = async () => {
    if (!user) return;
    const exportData = {
      exported_at: new Date().toISOString(),
      profile: profile,
      tracks: tracks,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sterkte-export-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ msg: "Données exportées avec succès", type: "ok" });
  };

  return (
    <div className="pg">
      <div className="pg-c">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Bienvenue, <span className="gold">{profile?.artist_name || profile?.full_name || "Artiste"}</span></h1>
            <p style={{ color: C.muted, fontSize: 14 }}>Espace artiste · Statistiques mises à jour mensuellement (le 31 du mois)</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "overview" ? "ac" : ""}`} onClick={() => setTab("overview")}>Vue d'ensemble</button>
          <button className={`tab ${tab === "upload" ? "ac" : ""}`} onClick={() => setTab("upload")}>Distribuer un titre</button>
          <button className={`tab ${tab === "tracks" ? "ac" : ""}`} onClick={() => setTab("tracks")}>Mes titres ({tracks.length})</button>
          <button className={`tab ${tab === "profile" ? "ac" : ""}`} onClick={() => setTab("profile")}>Mon profil</button>
          <button className={`tab ${tab === "account" ? "ac" : ""}`} onClick={() => setTab("account")}>Compte & RGPD</button>
        </div>

        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "upload" && <UploadTab onSuccess={() => { refetch(); setTab("tracks"); setToast({ msg: "Titre soumis avec succès. Notre équipe le validera sous 24-72h.", type: "ok" }); }} />}
        {tab === "tracks" && <TracksTab tracks={tracks} loading={loading} onRefresh={refetch} setToast={setToast} />}
        {tab === "profile" && <ProfileTab profile={profile} user={user} onUpdate={() => fetchProfile(user.id)} setToast={setToast} />}
        {tab === "account" && <AccountTab onExport={handleExport} onDelete={() => setDeleteOpen(true)} onSignOut={signOut} />}
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer mon compte">
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          Cette action est <strong style={{ color: C.red }}>irréversible</strong>. Toutes vos données (profil, titres, statistiques) seront effacées définitivement, conformément à l'article 17 du RGPD.
        </p>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
          Si vous avez des titres en distribution, ils continueront d'être diffusés sur les plateformes mais ne vous seront plus rattachés. Pour un retrait complet des plateformes, contactez {CONTACT_EMAIL} avant la suppression.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-o" onClick={() => setDeleteOpen(false)}>Annuler</button>
          <button className="btn btn-danger" onClick={async () => {
            const { error } = await deleteAccount();
            if (error) { setToast({ msg: "Erreur : " + error.message, type: "err" }); }
            else { setDeleteOpen(false); }
          }}>Confirmer la suppression</button>
        </div>
      </Modal>
    </div>
  );
}

function OverviewTab({ stats }) {
  return (
    <>
      <div className="dash-grid">
        <div className="dash-stat"><div className="dash-stat-l">Streams totaux</div><div className="dash-stat-v" style={{ color: C.gold }}>{(stats.totalStreams || 0).toLocaleString("fr-FR")}</div><div className="dash-stat-note">Cumulés sur tous vos titres</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Revenus estimés</div><div className="dash-stat-v" style={{ color: C.success }}>${stats.totalRevenue}</div><div className="dash-stat-note">Avant retenues label / splits</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Titres distribués</div><div className="dash-stat-v" style={{ color: C.blue }}>{stats.count}</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Plateformes actives</div><div className="dash-stat-v" style={{ color: C.red }}>{stats.livePlatforms}</div><div className="dash-stat-note">Calculé sur titres live</div></div>
      </div>
      <div style={{ padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>À savoir</h3>
        <ul style={{ listStyle: "none", color: C.muted, fontSize: 13, lineHeight: 2 }}>
          <li>• Les statistiques sont mises à jour le 31 de chaque mois (données J-30 fournies par les DSP).</li>
          <li>• Les revenus affichés sont des estimations brutes. Le détail par plateforme et par track est envoyé chaque trimestre.</li>
          <li>• Pour toute question, contactez votre interlocuteur Sterkte ou {CONTACT_EMAIL}.</li>
        </ul>
      </div>
    </>
  );
}

function UploadTab({ onSuccess, editingTrack = null }) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(() => editingTrack || {
    // Métadonnées principales
    title: "",
    release_type: "single",
    primary_artist: profile?.artist_name || "",
    featured_artists: "",
    genre: "",
    secondary_genre: "",
    language: "Français",
    release_date: "",
    pre_order_date: "",
    explicit: "no",
    // Identifiants
    isrc: "",
    upc: "",
    // Crédits
    songwriters: "", // séparés par virgule
    composers: "",
    producer: "",
    publisher: "",
    label: "Sterkte Records",
    // Copyright
    p_line: `${new Date().getFullYear()} Sterkte Records`,
    c_line: `${new Date().getFullYear()} Sterkte Records`,
    // Détails techniques optionnels
    bpm: "",
    musical_key: "",
    // Distribution
    territories: "worldwide",
    platforms: DSP_PLATFORMS.map(p => p.id), // tout par défaut
    splits: [{ name: profile?.full_name || profile?.artist_name || "", role: "Artiste principal", percent: 100 }],
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioMeta, setAudioMeta] = useState(null); // { duration, ... }
  const [coverErr, setCoverErr] = useState(null);
  const [audioErr, setAudioErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAudio = (file) => {
    setAudioErr(null);
    if (!file) return;
    const okType = file.type === "audio/wav" || file.type === "audio/x-wav" || file.name.toLowerCase().endsWith(".wav") || file.type === "audio/flac";
    if (!okType) { setAudioErr("Format requis : WAV ou FLAC. MP3 non accepté pour préserver la qualité."); return; }
    if (file.size > 200 * 1024 * 1024) { setAudioErr("Fichier > 200 MB. Vérifiez votre export."); return; }

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      if (dur < 30) { setAudioErr("Durée trop courte : minimum 30 secondes (refusé par Spotify)."); return; }
      if (dur > 600) { setAudioErr("Durée maximale 10 minutes par track (au-delà, contactez-nous)."); return; }
      setAudioMeta({ duration: dur, sizeMB: (file.size / 1024 / 1024).toFixed(1) });
      setAudioFile(file);
    };
    audio.onerror = () => setAudioErr("Fichier audio illisible.");
  };

  const handleCover = (file) => {
    setCoverErr(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setCoverErr("Format requis : JPG ou PNG."); return; }
    if (file.size > 10 * 1024 * 1024) { setCoverErr("Cover > 10 MB."); return; }
    const img = new Image();
    img.onload = () => {
      if (img.width < 3000 || img.height < 3000) { setCoverErr(`Cover trop petite (${img.width}×${img.height}). Minimum 3000×3000 px.`); return; }
      if (img.width !== img.height) { setCoverErr(`Cover non carrée (${img.width}×${img.height}). Le format carré est requis.`); return; }
      setCoverFile(file);
    };
    img.onerror = () => setCoverErr("Image illisible.");
    img.src = URL.createObjectURL(file);
  };

  const validate = () => {
    if (!form.title.trim()) return "Titre requis";
    if (!form.primary_artist.trim()) return "Artiste principal requis";
    if (!form.genre) return "Genre principal requis";
    if (!form.release_date) return "Date de sortie requise";
    const minDate = new Date(); minDate.setDate(minDate.getDate() + 8);
    if (new Date(form.release_date) < minDate) return "Date de sortie : minimum dans 8 jours";
    if (!audioFile) return "Fichier audio requis";
    if (!coverFile) return "Pochette requise";
    if (form.platforms.length === 0) return "Sélectionnez au moins une plateforme";
    const totalSplit = form.splits.reduce((s, sp) => s + parseFloat(sp.percent || 0), 0);
    if (Math.abs(totalSplit - 100) > 0.01) return `Splits royalties : le total doit faire 100% (actuellement ${totalSplit.toFixed(1)}%)`;
    if (form.splits.some(s => !s.name.trim())) return "Tous les ayants droit doivent avoir un nom";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setSubmitting(true);
    try {
      // Upload sécurisé (path stocké, pas l'URL publique)
      const audioRes = await uploadFile("audio", audioFile, user.id, {
        maxSize: 200 * 1024 * 1024,
        allowedMimes: ["audio/wav", "audio/x-wav", "audio/flac"],
      });
      if (audioRes.error) throw new Error("Audio : " + audioRes.error);

      const coverRes = await uploadFile("covers", coverFile, user.id, {
        maxSize: 10 * 1024 * 1024,
        allowedMimes: ["image/"],
      });
      if (coverRes.error) throw new Error("Cover : " + coverRes.error);

      const isrc = form.isrc || generateISRC();
      const upc = form.upc || generateUPC();

      const payload = {
        user_id: user.id,
        title: form.title,
        release_type: form.release_type,
        primary_artist: form.primary_artist,
        featured_artists: form.featured_artists,
        genre: form.genre,
        secondary_genre: form.secondary_genre,
        language: form.language,
        release_date: form.release_date,
        pre_order_date: form.pre_order_date || null,
        explicit: form.explicit,
        isrc,
        upc,
        songwriters: form.songwriters,
        composers: form.composers,
        producer: form.producer,
        publisher: form.publisher,
        label: form.label,
        p_line: form.p_line,
        c_line: form.c_line,
        bpm: form.bpm ? parseInt(form.bpm) : null,
        musical_key: form.musical_key,
        territories: form.territories,
        platforms: form.platforms,
        splits: form.splits,
        audio_path: audioRes.url,
        cover_path: coverRes.url,
        duration_seconds: Math.round(audioMeta.duration),
        status: "received",
        streams: 0,
        revenue: 0,
      };

      const { error: dbErr } = await supabase.from("tracks").insert(payload);
      if (dbErr) throw new Error("Base de données : " + dbErr.message);

      // Notif email équipe
      await sendEmail({
        subject: `[Distribution] Nouveau titre - ${form.title} - ${form.primary_artist}`,
        name: "Sterkte System",
        email: CONTACT_EMAIL,
        message: `Nouveau titre soumis :\n\nArtiste : ${form.primary_artist}\nTitre : ${form.title}\nType : ${form.release_type}\nGenre : ${form.genre}\nISRC : ${isrc}\nUPC : ${upc}\nSortie : ${form.release_date}\nPlateformes : ${form.platforms.length}\nDurée : ${Math.round(audioMeta.duration)}s\nSubmitted by user ID : ${user.id}\n\nÀ valider dans l'admin.`,
      });

      onSuccess?.();
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="fm" style={{ maxWidth: "100%" }}>
      {error && <div className="fm-err" style={{ marginBottom: 16 }}>{error}</div>}

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>1 · Identification du titre</h3>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Titre *</label><input className="fm-i" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="fm-g"><label className="fm-l">Type de release *</label><select className="fm-s" value={form.release_type} onChange={(e) => setForm({ ...form, release_type: e.target.value })}>{RELEASE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Artiste principal *</label><input className="fm-i" value={form.primary_artist} onChange={(e) => setForm({ ...form, primary_artist: e.target.value })} required /></div>
        <div className="fm-g"><label className="fm-l">Featuring</label><input className="fm-i" value={form.featured_artists} onChange={(e) => setForm({ ...form, featured_artists: e.target.value })} placeholder="Ex : Artist 1, Artist 2" /></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Genre principal *</label><select className="fm-s" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required><option value="">— Sélectionner —</option>{MUSIC_GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
        <div className="fm-g"><label className="fm-l">Genre secondaire</label><select className="fm-s" value={form.secondary_genre} onChange={(e) => setForm({ ...form, secondary_genre: e.target.value })}><option value="">— Aucun —</option>{MUSIC_GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Langue principale *</label><select className="fm-s" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>{LYRICS_LANGUAGES.map(l => <option key={l}>{l}</option>)}</select></div>
        <div className="fm-g"><label className="fm-l">Contenu explicite *</label><select className="fm-s" value={form.explicit} onChange={(e) => setForm({ ...form, explicit: e.target.value })}><option value="no">Non — Pas de langage explicite</option><option value="yes">Oui — Langage explicite</option><option value="cleaned">Version Clean (paroles censurées)</option></select></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Date de sortie *</label><input type="date" className="fm-i" value={form.release_date} onChange={(e) => setForm({ ...form, release_date: e.target.value })} min={new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0]} required /><div className="fm-help">Minimum +8 jours (recommandé +14j pour pitching playlists)</div></div>
        <div className="fm-g"><label className="fm-l">Date de pré-commande (optionnel)</label><input type="date" className="fm-i" value={form.pre_order_date} onChange={(e) => setForm({ ...form, pre_order_date: e.target.value })} /></div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>2 · Identifiants (ISRC / UPC)</h3>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">ISRC</label><input className="fm-i" value={form.isrc} onChange={(e) => setForm({ ...form, isrc: e.target.value })} placeholder="Auto-généré si vide" /><div className="fm-help">Format CC-XXX-YY-NNNNN. Si vous n'en avez pas, nous en générons un.</div></div>
        <div className="fm-g"><label className="fm-l">UPC / EAN</label><input className="fm-i" value={form.upc} onChange={(e) => setForm({ ...form, upc: e.target.value })} placeholder="Auto-généré si vide" /><div className="fm-help">12 chiffres. Si vous n'en avez pas, nous en générons un.</div></div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>3 · Crédits</h3>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Songwriters / Auteurs</label><input className="fm-i" value={form.songwriters} onChange={(e) => setForm({ ...form, songwriters: e.target.value })} placeholder="Nom complet, séparés par virgules" /></div>
        <div className="fm-g"><label className="fm-l">Composers / Compositeurs</label><input className="fm-i" value={form.composers} onChange={(e) => setForm({ ...form, composers: e.target.value })} placeholder="Nom complet, séparés par virgules" /></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Producer / Beatmaker</label><input className="fm-i" value={form.producer} onChange={(e) => setForm({ ...form, producer: e.target.value })} /></div>
        <div className="fm-g"><label className="fm-l">Publisher / Éditeur</label><input className="fm-i" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} /></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">℗ P-line *</label><input className="fm-i" value={form.p_line} onChange={(e) => setForm({ ...form, p_line: e.target.value })} required /><div className="fm-help">Copyright master enregistrement</div></div>
        <div className="fm-g"><label className="fm-l">© C-line *</label><input className="fm-i" value={form.c_line} onChange={(e) => setForm({ ...form, c_line: e.target.value })} required /><div className="fm-help">Copyright composition</div></div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>4 · Détails techniques (optionnel)</h3>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">BPM</label><input type="number" className="fm-i" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} placeholder="Ex : 120" /></div>
        <div className="fm-g"><label className="fm-l">Tonalité (Key)</label><input className="fm-i" value={form.musical_key} onChange={(e) => setForm({ ...form, musical_key: e.target.value })} placeholder="Ex : C minor, F# major" /></div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>5 · Splits royalties (doit faire 100%)</h3>
      <SplitsEditor splits={form.splits} onChange={(splits) => setForm({ ...form, splits })} />

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>6 · Plateformes de distribution</h3>
      <div className="fm-row" style={{ marginBottom: 12 }}>
        <button type="button" className="btn btn-o btn-sm" onClick={() => setForm({ ...form, platforms: DSP_PLATFORMS.map(p => p.id) })}>Tout sélectionner</button>
        <button type="button" className="btn btn-o btn-sm" onClick={() => setForm({ ...form, platforms: [] })}>Tout désélectionner</button>
      </div>
      <div className="dsp-grid">
        {DSP_PLATFORMS.map(p => (
          <label key={p.id} className={`dsp-item ${form.platforms.includes(p.id) ? "selected" : ""}`}>
            <input type="checkbox" checked={form.platforms.includes(p.id)} onChange={(e) => {
              const next = e.target.checked ? [...form.platforms, p.id] : form.platforms.filter(x => x !== p.id);
              setForm({ ...form, platforms: next });
            }} />
            <span>{p.name}</span>
          </label>
        ))}
      </div>
      <div className="fm-g">
        <label className="fm-l" style={{ marginTop: 16 }}>Territoires de distribution</label>
        <select className="fm-s" value={form.territories} onChange={(e) => setForm({ ...form, territories: e.target.value })}>
          <option value="worldwide">Monde entier</option>
          <option value="africa">Afrique uniquement</option>
          <option value="europe">Europe uniquement</option>
          <option value="custom">Personnalisé (à préciser dans message au support)</option>
        </select>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>7 · Fichiers</h3>
      <div className="fm-row">
        <div className="fm-g">
          <label className="fm-l">Audio master (WAV/FLAC) *</label>
          <label className={`upload ${audioFile ? "has-file" : ""}`}>
            <Icon.Upload size={32} color={audioFile ? C.success : C.muted} />
            <h4 style={{ marginTop: 12 }}>{audioFile ? `✓ ${audioFile.name}` : "Cliquez pour uploader"}</h4>
            <p>{audioFile ? `${audioMeta?.sizeMB} MB · ${Math.round(audioMeta?.duration || 0)}s` : "WAV ou FLAC, 30s minimum, 200MB max"}</p>
            <input type="file" accept="audio/wav,audio/x-wav,audio/flac,.wav,.flac" onChange={(e) => handleAudio(e.target.files[0])} style={{ display: "none" }} />
          </label>
          {audioErr && <div className="fm-err">{audioErr}</div>}
        </div>
        <div className="fm-g">
          <label className="fm-l">Pochette (3000×3000 px carrée) *</label>
          <label className={`upload ${coverFile ? "has-file" : ""}`}>
            <Icon.Image size={32} color={coverFile ? C.success : C.muted} />
            <h4 style={{ marginTop: 12 }}>{coverFile ? `✓ ${coverFile.name}` : "Cliquez pour uploader"}</h4>
            <p>{coverFile ? `${(coverFile.size / 1024 / 1024).toFixed(1)} MB` : "JPG/PNG, carrée, 3000×3000 min, sRGB"}</p>
            <input type="file" accept="image/jpeg,image/png" onChange={(e) => handleCover(e.target.files[0])} style={{ display: "none" }} />
          </label>
          {coverErr && <div className="fm-err">{coverErr}</div>}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 20, background: "rgba(245,197,24,.05)", border: "1px solid rgba(245,197,24,.2)", borderRadius: 10 }}>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: C.gold }}>Avant de soumettre :</strong> en cliquant sur "Soumettre pour distribution", vous certifiez détenir tous les droits sur ce titre (master + composition) ou avoir l'autorisation des ayants droit. Toute soumission frauduleuse entraînera la suspension immédiate du compte et un signalement aux DSP.
        </p>
      </div>

      <button type="submit" className="btn btn-g btn-lg" style={{ marginTop: 20 }} disabled={submitting}>
        {submitting ? "Envoi en cours..." : <><Icon.Send size={14} />Soumettre pour distribution</>}
      </button>
    </form>
  );
}

function TracksTab({ tracks, loading, onRefresh, setToast }) {
  const [selected, setSelected] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(null);

  const handleDelete = async () => {
    if (!deleteOpen) return;
    if (deleteOpen.status !== "received" && deleteOpen.status !== "review") {
      setToast({ msg: "Seuls les titres en cours de validation peuvent être supprimés.", type: "err" });
      setDeleteOpen(null);
      return;
    }
    const { error } = await supabase.from("tracks").delete().eq("id", deleteOpen.id);
    if (error) { setToast({ msg: "Erreur : " + error.message, type: "err" }); }
    else { setToast({ msg: "Titre supprimé", type: "ok" }); onRefresh(); }
    setDeleteOpen(null);
  };

  if (loading) return <div className="loading-box">Chargement de vos titres...</div>;
  if (tracks.length === 0) return (
    <div style={{ padding: 60, textAlign: "center", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      <Icon.Music size={48} color={C.muted} />
      <h3 style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>Aucun titre pour le moment</h3>
      <p style={{ color: C.muted, marginTop: 8, fontSize: 14 }}>Cliquez sur l'onglet "Distribuer un titre" pour soumettre votre premier morceau.</p>
    </div>
  );

  return (
    <>
      <div className="dash-tracks">
        <div className="dash-tracks-h"><h3>Mes titres</h3></div>
        {tracks.map((t, i) => {
          const info = statusInfo(t.status);
          return (
            <div key={t.id} className="tr-row">
              <div className="tr-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="tr-title">{t.title}<br /><span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>{t.genre} · {t.isrc || "—"}</span></div>
              <div className="tr-info">{(t.streams || 0).toLocaleString("fr-FR")} streams</div>
              <div className="tr-info">${parseFloat(t.revenue || 0).toFixed(2)}</div>
              <div className="tr-status"><div className="tr-dot" style={{ background: info.color }} />{info.label}</div>
              <div className="tr-actions">
                <button className="tr-act-btn" onClick={() => setSelected(t)} aria-label="Voir détails"><Icon.Eye size={14} /></button>
                {(t.status === "received" || t.status === "review") && <button className="tr-act-btn danger" onClick={() => setDeleteOpen(t)} aria-label="Supprimer"><Icon.Trash size={14} /></button>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} maxWidth={640}>
        {selected && (
          <>
            <TimelineStatus status={selected.status} />
            {selected.status === "rejected" && selected.rejection_reason && (
              <div style={{ marginBottom: 20, padding: 16, background: "rgba(230,57,70,.08)", border: "1px solid rgba(230,57,70,.3)", borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Motif du refus</div>
                <p style={{ fontSize: 14, color: C.white }}>{selected.rejection_reason}</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
              <div><strong style={{ color: C.muted }}>Artiste principal :</strong><br />{selected.primary_artist}</div>
              {selected.featured_artists && <div><strong style={{ color: C.muted }}>Featuring :</strong><br />{selected.featured_artists}</div>}
              <div><strong style={{ color: C.muted }}>Genre :</strong><br />{selected.genre}</div>
              <div><strong style={{ color: C.muted }}>Langue :</strong><br />{selected.language}</div>
              <div><strong style={{ color: C.muted }}>ISRC :</strong><br />{selected.isrc || "—"}</div>
              <div><strong style={{ color: C.muted }}>UPC :</strong><br />{selected.upc || "—"}</div>
              <div><strong style={{ color: C.muted }}>Date de sortie :</strong><br />{selected.release_date}</div>
              <div><strong style={{ color: C.muted }}>Explicite :</strong><br />{selected.explicit === "yes" ? "Oui" : selected.explicit === "cleaned" ? "Version clean" : "Non"}</div>
              <div><strong style={{ color: C.muted }}>Plateformes :</strong><br />{(selected.platforms || []).length} sélectionnées</div>
              <div><strong style={{ color: C.muted }}>Durée :</strong><br />{selected.duration_seconds ? `${Math.round(selected.duration_seconds)}s` : "—"}</div>
            </div>
            {selected.splits && selected.splits.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Splits royalties</div>
                {selected.splits.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
                    <span>{s.name} <span style={{ color: C.muted }}>({s.role})</span></span>
                    <span style={{ color: C.gold, fontWeight: 700 }}>{s.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal open={!!deleteOpen} onClose={() => setDeleteOpen(null)} title="Supprimer ce titre ?">
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Vous êtes sur le point de supprimer <strong style={{ color: C.white }}>{deleteOpen?.title}</strong>. Cette action est irréversible.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-o" onClick={() => setDeleteOpen(null)}>Annuler</button>
          <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
        </div>
      </Modal>
    </>
  );
}

function ProfileTab({ profile, user, onUpdate, setToast }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    artist_name: profile?.artist_name || "",
    whatsapp: profile?.whatsapp || "",
    genre: profile?.genre || "",
    bio: profile?.bio || "",
    instagram: profile?.instagram || "",
    spotify: profile?.spotify || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) setToast({ msg: "Erreur : " + error.message, type: "err" });
    else { setToast({ msg: "Profil mis à jour", type: "ok" }); onUpdate(); }
  };

  return (
    <form onSubmit={handleSave} className="fm" style={{ maxWidth: 720 }}>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Nom complet</label><input className="fm-i" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div className="fm-g"><label className="fm-l">Nom d'artiste</label><input className="fm-i" value={form.artist_name} onChange={(e) => setForm({ ...form, artist_name: e.target.value })} /></div>
      </div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Email (non modifiable)</label><input className="fm-i" value={user?.email || ""} disabled style={{ opacity: 0.6 }} /></div>
        <div className="fm-g"><label className="fm-l">WhatsApp</label><input type="tel" className="fm-i" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
      </div>
      <div className="fm-g"><label className="fm-l">Genre principal</label><select className="fm-s" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}><option value="">— Sélectionner —</option>{MUSIC_GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
      <div className="fm-g"><label className="fm-l">Bio</label><textarea className="fm-t" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Présentation publique de votre carrière..." /></div>
      <div className="fm-row">
        <div className="fm-g"><label className="fm-l">Instagram</label><input type="url" className="fm-i" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/votrecompte" /></div>
        <div className="fm-g"><label className="fm-l">Spotify Artist</label><input type="url" className="fm-i" value={form.spotify} onChange={(e) => setForm({ ...form, spotify: e.target.value })} placeholder="https://open.spotify.com/artist/..." /></div>
      </div>
      <button type="submit" className="btn btn-g" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
    </form>
  );
}

function AccountTab({ onExport, onDelete, onSignOut }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      <div style={{ padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Exporter mes données</h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Conformément à l'article 20 du RGPD (droit à la portabilité), téléchargez l'ensemble de vos données au format JSON.</p>
        <button className="btn btn-o" onClick={onExport}><Icon.Download size={14} />Télécharger mes données</button>
      </div>

      <div style={{ padding: 24, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Déconnexion</h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Vous déconnecter de cet appareil.</p>
        <button className="btn btn-o" onClick={onSignOut}>Se déconnecter</button>
      </div>

      <div style={{ padding: 24, background: "rgba(230,57,70,.05)", border: `1px solid rgba(230,57,70,.2)`, borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: C.red }}>Zone dangereuse</h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>La suppression de votre compte est irréversible. Toutes vos données personnelles seront effacées (article 17 du RGPD).</p>
        <button className="btn btn-danger" onClick={onDelete}><Icon.Trash size={14} />Supprimer mon compte</button>
      </div>
    </div>
  );
}

// ─── ADMIN — refonte complète ───
const REJECTION_TEMPLATES = [
  "Cover non conforme : doit être carrée 3000×3000 px minimum, profil sRGB, sans texte/URL.",
  "Qualité audio insuffisante : exportez en WAV 44.1kHz/16-bit ou supérieur.",
  "Métadonnées incomplètes : les champs obligatoires DDEX ne sont pas remplis.",
  "Doute sur les droits : merci de fournir une preuve de propriété (contrat, autorisation).",
  "Date de sortie trop proche : minimum 8 jours après soumission.",
  "Splits royalties incohérents : le total ne fait pas 100%.",
  "Contenu ne respectant pas les conditions des plateformes (langage, références non autorisées).",
];

function AdminPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("tracks");
  const [toast, setToast] = useState(null);

  useEffect(() => { document.title = "Admin - Sterkte Records"; }, []);

  return (
    <div className="pg">
      <div className="pg-c">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Espace <span className="gold">Administration</span></h1>
            <p style={{ color: C.muted, fontSize: 14 }}>Connecté en tant que {profile?.full_name || "admin"}</p>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "tracks" ? "ac" : ""}`} onClick={() => setTab("tracks")}>Distributions</button>
          <button className={`tab ${tab === "stats" ? "ac" : ""}`} onClick={() => setTab("stats")}>Édition stats</button>
          <button className={`tab ${tab === "bookings" ? "ac" : ""}`} onClick={() => setTab("bookings")}>Bookings</button>
          <button className={`tab ${tab === "featurings" ? "ac" : ""}`} onClick={() => setTab("featurings")}>Featurings</button>
          <button className={`tab ${tab === "studio" ? "ac" : ""}`} onClick={() => setTab("studio")}>Studio</button>
          <button className={`tab ${tab === "contacts" ? "ac" : ""}`} onClick={() => setTab("contacts")}>Contacts</button>
          <button className={`tab ${tab === "users" ? "ac" : ""}`} onClick={() => setTab("users")}>Utilisateurs</button>
        </div>

        {tab === "tracks" && <AdminTracks setToast={setToast} />}
        {tab === "stats" && <AdminStats setToast={setToast} />}
        {tab === "bookings" && <AdminGenericList table="booking_requests" titleField="event_type" subtitleField="artist_name" setToast={setToast} />}
        {tab === "featurings" && <AdminGenericList table="featuring_requests" titleField="project_name" subtitleField="artist_name" setToast={setToast} />}
        {tab === "studio" && <AdminGenericList table="studio_bookings" titleField="studio_type" subtitleField="booking_date" setToast={setToast} />}
        {tab === "contacts" && <AdminGenericList table="contact_messages" titleField="subject" subtitleField="email" setToast={setToast} />}
        {tab === "users" && <AdminUsers setToast={setToast} />}
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function AdminTracks({ setToast }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    // Jointure avec profiles pour récupérer email
    const { data } = await supabase.from("tracks").select(`*, profiles:user_id(email, full_name, artist_name, whatsapp)`).order("created_at", { ascending: false });
    setTracks(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? tracks : tracks.filter(t => t.status === filter);

  const updateStatus = async (track, status, reason = null) => {
    const updates = { status, updated_at: new Date().toISOString() };
    if (reason) updates.rejection_reason = reason;
    const { error } = await supabase.from("tracks").update(updates).eq("id", track.id);
    if (error) { setToast({ msg: "Erreur : " + error.message, type: "err" }); return; }

    // Notif email à l'artiste — utilise bien profiles.email maintenant
    const artistEmail = track.profiles?.email;
    if (artistEmail) {
      const subjects = {
        review: `[Sterkte] Votre titre "${track.title}" est en cours de validation`,
        approved: `[Sterkte] Votre titre "${track.title}" a été approuvé !`,
        sent: `[Sterkte] Votre titre "${track.title}" est envoyé aux plateformes`,
        live: `[Sterkte] Votre titre "${track.title}" est désormais LIVE !`,
        rejected: `[Sterkte] Votre titre "${track.title}" nécessite des ajustements`,
      };
      const messages = {
        approved: `Bonjour,\n\nVotre titre "${track.title}" vient d'être approuvé par notre équipe et sera prochainement envoyé aux plateformes.\n\nL'équipe Sterkte Records`,
        sent: `Bonjour,\n\nVotre titre "${track.title}" est en cours d'envoi aux plateformes. Comptez 24-72h pour qu'il apparaisse en ligne.\n\nL'équipe Sterkte Records`,
        live: `Bonjour,\n\nFélicitations ! Votre titre "${track.title}" est désormais disponible sur les plateformes sélectionnées.\n\nConsultez votre dashboard pour le suivi des streams.\n\nL'équipe Sterkte Records`,
        rejected: `Bonjour,\n\nAprès examen, votre titre "${track.title}" nécessite des ajustements avant distribution.\n\nMotif : ${reason}\n\nMerci de corriger et de soumettre à nouveau. Pour toute question, contactez-nous à ${CONTACT_EMAIL}.\n\nL'équipe Sterkte Records`,
      };
      await sendEmail({
        subject: subjects[status] || `[Sterkte] Mise à jour : ${track.title}`,
        name: track.profiles?.artist_name || "Artiste",
        email: artistEmail,
        message: messages[status] || "Votre titre a été mis à jour.",
      });
    }

    setToast({ msg: "Statut mis à jour", type: "ok" });
    load();
    setRejectFor(null); setRejectReason("");
  };

  return (
    <>
      <div className="tabs" style={{ marginBottom: 16, fontSize: 11 }}>
        {["all", "received", "review", "approved", "sent", "live", "rejected"].map(s => (
          <button key={s} className={`tab ${filter === s ? "ac" : ""}`} onClick={() => setFilter(s)} style={{ padding: "10px 16px" }}>
            {s === "all" ? `Tous (${tracks.length})` : `${statusInfo(s).label} (${tracks.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="dash-tracks">
        {loading ? <div className="loading-box">Chargement...</div> : filtered.length === 0 ? <div className="loading-box">Aucun titre dans cette catégorie.</div> : filtered.map(t => {
          const info = statusInfo(t.status);
          return (
            <div key={t.id} className="admin-row">
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, color: C.muted }}>{new Date(t.created_at).toLocaleDateString("fr-FR")}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.primary_artist} · {t.genre}</div>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {t.profiles?.email || t.user_id}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                ISRC: {t.isrc || "—"}
              </div>
              <div className={`admin-badge ${t.status}`}>{info.label}</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button className="admin-action view" onClick={() => setSelected(t)}>Voir</button>
                {(t.status === "received" || t.status === "review") && (
                  <>
                    <button className="admin-action approve" onClick={() => updateStatus(t, "approved")}>Approuver</button>
                    <button className="admin-action reject" onClick={() => setRejectFor(t)}>Refuser</button>
                  </>
                )}
                {t.status === "approved" && <button className="admin-action approve" onClick={() => updateStatus(t, "sent")}>→ Envoyé</button>}
                {t.status === "sent" && <button className="admin-action approve" onClick={() => updateStatus(t, "live")}>→ Live</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale détails track */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} maxWidth={720}>
        {selected && <AdminTrackDetail track={selected} />}
      </Modal>

      {/* Modale refus avec template */}
      <Modal open={!!rejectFor} onClose={() => { setRejectFor(null); setRejectReason(""); }} title="Refuser ce titre">
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>L'artiste recevra cette raison par email.</p>
        <div className="fm-g">
          <label className="fm-l">Choisissez un template ou personnalisez</label>
          <select className="fm-s" onChange={(e) => setRejectReason(e.target.value)} value="" aria-label="Template de refus">
            <option value="">— Choisir un template —</option>
            {REJECTION_TEMPLATES.map((t, i) => <option key={i} value={t}>{t.slice(0, 60)}...</option>)}
          </select>
        </div>
        <div className="fm-g">
          <label className="fm-l">Raison du refus *</label>
          <textarea className="fm-t" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Expliquez clairement à l'artiste ce qui doit être corrigé." />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-o" onClick={() => { setRejectFor(null); setRejectReason(""); }}>Annuler</button>
          <button className="btn btn-danger" disabled={rejectReason.trim().length < 20} onClick={() => updateStatus(rejectFor, "rejected", rejectReason)}>Confirmer le refus</button>
        </div>
      </Modal>
    </>
  );
}

function AdminTrackDetail({ track }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (track.audio_path) getSignedUrl("audio", track.audio_path).then(setAudioUrl);
    if (track.cover_path) getSignedUrl("covers", track.cover_path).then(setCoverUrl);
  }, [track]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20, marginBottom: 20 }}>
        {coverUrl ? (
          <img src={coverUrl} alt="Cover" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "1/1", background: C.bgInput, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.Image size={32} color={C.muted} /></div>
        )}
        <div style={{ fontSize: 13 }}>
          <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Artiste :</strong> {track.primary_artist}</div>
          {track.featured_artists && <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Featuring :</strong> {track.featured_artists}</div>}
          <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Genre :</strong> {track.genre} {track.secondary_genre && `/ ${track.secondary_genre}`}</div>
          <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Sortie :</strong> {track.release_date}</div>
          <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Langue :</strong> {track.language}</div>
          <div style={{ marginBottom: 12 }}><strong style={{ color: C.muted }}>Explicite :</strong> {track.explicit === "yes" ? "Oui" : track.explicit === "cleaned" ? "Clean" : "Non"}</div>
        </div>
      </div>

      <AudioPlayer url={audioUrl} label={`Aperçu master (${Math.round(track.duration_seconds || 0)}s)`} />

      {/* Téléchargement direct des fichiers source */}
      <div style={{ marginTop: 16, padding: 16, background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📥 Télécharger les fichiers</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {audioUrl ? (
            <a href={audioUrl} download={`${track.primary_artist} - ${track.title}.${(track.audio_path || "").split(".").pop() || "wav"}`} className="btn btn-g btn-sm" target="_blank" rel="noopener noreferrer">
              <Icon.Download size={14} />Audio master ({(track.audio_path || "").split(".").pop()?.toUpperCase() || "WAV"})
            </a>
          ) : track.audio_path ? (
            <span style={{ fontSize: 12, color: C.muted }}>Audio en cours de chargement...</span>
          ) : (
            <span style={{ fontSize: 12, color: C.muted }}>Pas d'audio uploadé</span>
          )}
          {coverUrl ? (
            <a href={coverUrl} download={`${track.primary_artist} - ${track.title} - cover.${(track.cover_path || "").split(".").pop() || "jpg"}`} className="btn btn-o btn-sm" target="_blank" rel="noopener noreferrer">
              <Icon.Download size={14} />Pochette
            </a>
          ) : track.cover_path ? (
            <span style={{ fontSize: 12, color: C.muted }}>Cover en cours de chargement...</span>
          ) : null}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: "italic" }}>Les liens expirent 1h après ouverture (signed URLs Supabase). Recharge la modale pour en générer de nouveaux.</div>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
        <div><strong style={{ color: C.muted }}>ISRC :</strong> {track.isrc || "—"}</div>
        <div><strong style={{ color: C.muted }}>UPC :</strong> {track.upc || "—"}</div>
        <div><strong style={{ color: C.muted }}>P-line :</strong> ℗ {track.p_line || "—"}</div>
        <div><strong style={{ color: C.muted }}>C-line :</strong> © {track.c_line || "—"}</div>
        <div><strong style={{ color: C.muted }}>Producer :</strong> {track.producer || "—"}</div>
        <div><strong style={{ color: C.muted }}>Publisher :</strong> {track.publisher || "—"}</div>
        <div><strong style={{ color: C.muted }}>Songwriters :</strong> {track.songwriters || "—"}</div>
        <div><strong style={{ color: C.muted }}>BPM/Key :</strong> {track.bpm || "—"} {track.musical_key || ""}</div>
      </div>

      {track.splits && track.splits.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Splits royalties</div>
          {track.splits.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
              <span>{s.name} <span style={{ color: C.muted }}>({s.role})</span></span>
              <span style={{ color: C.gold, fontWeight: 700 }}>{s.percent}%</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Plateformes ({(track.platforms || []).length})</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(track.platforms || []).map(p => {
            const dsp = DSP_PLATFORMS.find(d => d.id === p);
            return <span key={p} style={{ padding: "3px 10px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 11 }}>{dsp?.name || p}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

function AdminStats({ setToast }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({}); // { trackId: { streams, revenue } }

  useEffect(() => {
    supabase.from("tracks").select(`*, profiles:user_id(artist_name)`).eq("status", "live").order("created_at", { ascending: false }).then(({ data }) => {
      setTracks(data || []); setLoading(false);
    });
  }, []);

  const save = async (trackId) => {
    const e = edits[trackId];
    if (!e) return;
    const { error } = await supabase.from("tracks").update({
      streams: parseInt(e.streams) || 0,
      revenue: parseFloat(e.revenue) || 0,
      updated_at: new Date().toISOString(),
    }).eq("id", trackId);
    if (error) setToast({ msg: "Erreur : " + error.message, type: "err" });
    else { setToast({ msg: "Stats mises à jour", type: "ok" }); setEdits({ ...edits, [trackId]: undefined }); }
  };

  if (loading) return <div className="loading-box">Chargement...</div>;
  if (tracks.length === 0) return <div className="loading-box">Aucun titre live à mettre à jour.</div>;

  return (
    <div className="dash-tracks">
      <div className="dash-tracks-h"><h3>Édition manuelle des stats (titres live uniquement)</h3></div>
      {tracks.map(t => {
        const e = edits[t.id] || { streams: t.streams || 0, revenue: t.revenue || 0 };
        const dirty = edits[t.id] !== undefined;
        return (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", gap: 16, padding: 16, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.primary_artist}</div>
            </div>
            <input type="number" className="fm-i" value={e.streams} onChange={(ev) => setEdits({ ...edits, [t.id]: { ...e, streams: ev.target.value } })} placeholder="Streams" />
            <input type="number" step="0.01" className="fm-i" value={e.revenue} onChange={(ev) => setEdits({ ...edits, [t.id]: { ...e, revenue: ev.target.value } })} placeholder="Revenu $" />
            <button className="btn btn-g btn-sm" onClick={() => save(t.id)} disabled={!dirty}>Enregistrer</button>
          </div>
        );
      })}
    </div>
  );
}

function AdminGenericList({ table, titleField, subtitleField, setToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase.from(table).select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error) setItems(data || []);
      setLoading(false);
    });
  }, [table]);

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setToast({ msg: "Erreur : " + error.message, type: "err" });
    else { setToast({ msg: "Supprimé", type: "ok" }); setItems(items.filter(i => i.id !== id)); }
  };

  if (loading) return <div className="loading-box">Chargement...</div>;
  if (items.length === 0) return <div className="loading-box">Aucune entrée.</div>;

  return (
    <>
      <div className="dash-tracks">
        {items.map(item => (
          <div key={item.id} className="admin-reg-row">
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Montserrat',sans-serif" }}>{new Date(item.created_at).toLocaleDateString("fr-FR")}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name || item.email}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{item.email}</div>
            </div>
            <div style={{ fontSize: 13 }}>{item[titleField] || "—"}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{item[subtitleField] || "—"}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="admin-action view" onClick={() => setSelected(item)}>Voir</button>
              <a href={`mailto:${item.email}`} className="admin-action approve">Répondre</a>
              <button className="admin-action reject" onClick={() => remove(item.id)}>Suppr</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.[titleField] || "Détail"} maxWidth={560}>
        {selected && (
          <div style={{ fontSize: 13 }}>
            {Object.entries(selected).filter(([k]) => !["id", "user_id", "created_at"].includes(k)).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{k.replace(/_/g, " ")}</div>
                <div style={{ color: C.white, whiteSpace: "pre-wrap" }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

function AdminUsers({ setToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setUsers(data || []); setLoading(false);
    });
  }, []);

  const toggleAdmin = async (u) => {
    const { error } = await supabase.from("profiles").update({ is_admin: !u.is_admin }).eq("id", u.id);
    if (error) setToast({ msg: "Erreur : " + error.message, type: "err" });
    else { setToast({ msg: "Statut admin mis à jour", type: "ok" }); setUsers(users.map(x => x.id === u.id ? { ...x, is_admin: !u.is_admin } : x)); }
  };

  if (loading) return <div className="loading-box">Chargement...</div>;

  return (
    <div className="dash-tracks">
      {users.map(u => (
        <div key={u.id} className="admin-reg-row">
          <div style={{ fontSize: 11, color: C.muted }}>{new Date(u.created_at).toLocaleDateString("fr-FR")}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{u.full_name || "—"} {u.is_admin && <span style={{ marginLeft: 8, padding: "2px 8px", background: C.gold, color: "#000", borderRadius: 4, fontSize: 10, fontWeight: 800 }}>ADMIN</span>}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{u.email}</div>
          </div>
          <div style={{ fontSize: 13 }}>{u.artist_name || "—"}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{u.genre || "—"}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="admin-action view" onClick={() => toggleAdmin(u)}>{u.is_admin ? "Retirer admin" : "Promouvoir admin"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PAGES LÉGALES ───
function CGUPage() {
  useSEO("/cgu");
  return (
    <div className="legal">
      <h1>Conditions Générales d'Utilisation</h1>
      <p style={{ fontStyle: "italic", color: C.muted }}>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>1. Objet</h2>
      <p>Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme Sterkte Records, exploitée par Sterkte Records SARL (ci-après "Sterkte Records", "nous", "notre") et accessible à l'adresse {SITE_URL}. Toute personne (ci-après "l'Artiste" ou "l'Utilisateur") créant un compte sur la plateforme accepte sans réserve les présentes CGU.</p>

      <h2>2. Services proposés</h2>
      <p>Sterkte Records propose les services suivants : distribution musicale digitale sur des plateformes tierces (Spotify, Apple Music, Deezer, etc.), enregistrement studio, booking d'artistes, featurings, consulting artistique. L'usage de la plateforme web est gratuit ; certains services (distribution, booking, studio) peuvent faire l'objet de conditions tarifaires distinctes.</p>

      <h2>3. Création de compte</h2>
      <p>L'inscription nécessite la fourniture d'un email valide, d'un mot de passe sécurisé (minimum 8 caractères) et de l'acceptation des présentes CGU et de la Politique de confidentialité. L'Utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. Tout compte fictif, multiple ou usurpé sera supprimé sans préavis.</p>

      <h2>4. Distribution musicale</h2>
      <h3>4.1. Garanties de l'Artiste</h3>
      <p>En soumettant un titre à la distribution, l'Artiste certifie :</p>
      <ul>
        <li>Détenir l'intégralité des droits sur le master et la composition (ou disposer des autorisations écrites des ayants droit) ;</li>
        <li>Avoir obtenu l'accord de tous les contributeurs cités dans les splits royalties ;</li>
        <li>Que le contenu ne viole aucun droit d'auteur, droit voisin ou droit à l'image de tiers ;</li>
        <li>Que le contenu respecte les conditions des plateformes tierces (Spotify, Apple Music, etc.) et la législation applicable.</li>
      </ul>

      <h3>4.2. Validation et refus</h3>
      <p>Sterkte Records se réserve le droit de refuser ou retirer un titre en cas de non-conformité, de doute sur les droits, ou de signalement par une plateforme. L'Artiste sera notifié par email du motif du refus.</p>

      <h3>4.3. Royalties et splits</h3>
      <p>Les revenus issus des plateformes sont reversés selon les splits déclarés par l'Artiste lors de la soumission. Sterkte Records prélève une commission de distribution (taux précisé dans le contrat de distribution signé séparément). Les paiements sont effectués trimestriellement à partir de 10 USD cumulés.</p>

      <h2>5. Propriété intellectuelle</h2>
      <p>L'Artiste reste propriétaire de ses œuvres. Sterkte Records dispose d'une licence non exclusive, mondiale, pour la durée du contrat de distribution, aux fins de distribution sur les plateformes tierces. Aucun transfert de propriété n'a lieu.</p>

      <h2>6. Obligations de l'Utilisateur</h2>
      <p>L'Utilisateur s'engage à ne pas : (a) téléverser de contenu illégal, diffamatoire, raciste, à caractère pédopornographique ou incitant à la violence ; (b) tenter de pirater, perturber ou contourner la sécurité de la plateforme ; (c) usurper l'identité d'un tiers ; (d) utiliser la plateforme à des fins commerciales non autorisées.</p>

      <h2>7. Suspension et résiliation</h2>
      <p>Sterkte Records peut suspendre ou supprimer un compte en cas de violation des CGU. L'Utilisateur peut supprimer son compte à tout moment depuis son espace personnel (article 17 RGPD).</p>

      <h2>8. Responsabilité</h2>
      <p>Sterkte Records met tout en œuvre pour assurer la disponibilité de la plateforme mais ne saurait être tenue responsable d'interruptions de service liées aux plateformes tierces ou à des cas de force majeure. La responsabilité de Sterkte Records est limitée au montant des sommes effectivement perçues de l'Utilisateur sur les 12 derniers mois.</p>

      <h2>9. Loi applicable</h2>
      <p>Les présentes CGU sont régies par le droit congolais (RDC). Tout litige sera porté devant les tribunaux compétents de Lubumbashi, sauf disposition d'ordre public contraire.</p>

      <h2>10. Contact</h2>
      <p>Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </div>
  );
}

function PrivacyPage() {
  useSEO("/confidentialite");
  return (
    <div className="legal">
      <h1>Politique de confidentialité</h1>
      <p style={{ fontStyle: "italic", color: C.muted }}>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>1. Responsable du traitement</h2>
      <p>Sterkte Records SARL, basée à Lubumbashi (RDC), est responsable du traitement de vos données personnelles. Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2>2. Données collectées</h2>
      <ul>
        <li><strong>Données d'inscription</strong> : nom, prénom, nom d'artiste, email, téléphone, genre musical.</li>
        <li><strong>Données de distribution</strong> : titres, métadonnées DDEX, fichiers audio, pochettes, splits royalties, statistiques.</li>
        <li><strong>Données techniques</strong> : adresse IP, navigateur, logs de connexion (durée 12 mois).</li>
      </ul>

      <h2>3. Finalités</h2>
      <p>Vos données sont utilisées pour : (a) la création et gestion de votre compte ; (b) la distribution de votre musique sur les plateformes tierces ; (c) le calcul et le versement de vos royalties ; (d) la communication relative à votre compte ; (e) le respect de nos obligations légales (comptabilité, fiscalité).</p>

      <h2>4. Bases légales</h2>
      <p>Le traitement repose sur : votre consentement (newsletter), l'exécution du contrat (compte, distribution), nos obligations légales (comptabilité), notre intérêt légitime (sécurité, prévention des fraudes).</p>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>Compte actif : durée de la relation contractuelle.</li>
        <li>Données comptables : 10 ans après la fin du contrat.</li>
        <li>Logs de connexion : 12 mois.</li>
      </ul>

      <h2>6. Destinataires</h2>
      <p>Vos données sont communiquées à : (a) Supabase (hébergement) ; (b) plateformes de distribution musicale (Spotify, Apple Music, etc.) — uniquement les données nécessaires (métadonnées DDEX, fichiers) ; (c) prestataires de paiement ; (d) autorités sur réquisition légale.</p>

      <h2>7. Transferts hors UE</h2>
      <p>Certaines plateformes (notamment américaines) impliquent des transferts hors UE, encadrés par les clauses contractuelles types de la Commission européenne.</p>

      <h2>8. Vos droits (RGPD)</h2>
      <p>Vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès</strong> : connaître les données que nous détenons sur vous.</li>
        <li><strong>Rectification</strong> : corriger une donnée inexacte.</li>
        <li><strong>Effacement</strong> (article 17) : supprimer votre compte depuis votre dashboard.</li>
        <li><strong>Portabilité</strong> (article 20) : exporter vos données au format JSON depuis votre dashboard.</li>
        <li><strong>Opposition</strong> : refuser certains traitements (newsletter, statistiques).</li>
        <li><strong>Limitation</strong> : geler temporairement le traitement de vos données.</li>
      </ul>
      <p>Pour exercer ces droits, contactez <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Vous pouvez également déposer une réclamation auprès de la CNIL (France) ou de l'autorité de protection des données compétente.</p>

      <h2>9. Cookies</h2>
      <p>La plateforme utilise un nombre minimal de cookies, strictement nécessaires au fonctionnement (session d'authentification). Aucun cookie publicitaire n'est déposé.</p>

      <h2>10. Sécurité</h2>
      <p>Vos données sont stockées sur Supabase avec chiffrement au repos et en transit (TLS 1.3). Les fichiers audio (masters non sortis) sont protégés par des URLs signées à expiration courte. Les mots de passe sont hashés (bcrypt).</p>

      <h2>11. Modifications</h2>
      <p>La présente politique peut être mise à jour. Les modifications substantielles vous seront notifiées par email.</p>
    </div>
  );
}

function MentionsLegalesPage() {
  useSEO("/mentions-legales");
  return (
    <div className="legal">
      <h1>Mentions légales</h1>

      <h2>Éditeur</h2>
      <p>
        Sterkte Records SARL<br />
        Siège social : Lubumbashi, Haut-Katanga, République Démocratique du Congo<br />
        Email : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />
        Téléphone : {WHATSAPP_NUMBER}
      </p>

      <h2>Directeur de la publication</h2>
      <p>Le Directeur de la publication est le représentant légal de Sterkte Records SARL.</p>

      <h2>Hébergement</h2>
      <p>
        Vercel Inc.<br />
        440 N Barranca Ave #4133<br />
        Covina, CA 91723, USA<br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
      </p>

      <h2>Base de données</h2>
      <p>Supabase Inc., 970 Toa Payoh North #07-04, Singapore. <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></p>

      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble des contenus de ce site (textes, images, code source) sont la propriété de Sterkte Records SARL ou de ses partenaires. Toute reproduction non autorisée est interdite.</p>

      <h2>Crédits</h2>
      <p>Conception et développement : Mwezi Partners pour Sterkte Records.</p>
    </div>
  );
}

// ─── 404 PAGE ───
function NotFoundPage() {
  useEffect(() => { document.title = "404 - Page introuvable"; }, []);
  return (
    <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "clamp(72px, 15vw, 160px)", fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg, ${C.gold}, ${C.red})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Page introuvable</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn btn-g btn-lg"><Icon.ArrowLeft size={14} />Retour à l'accueil</Link>
      </div>
    </div>
  );
}

// ─── PROTECTED ROUTES ───
function ProtectedRoute({ children, requireEmailVerified = true }) {
  const { user, loading, isEmailConfirmed } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;
  if (!user) return <Navigate to="/connexion" state={{ from: loc.pathname }} replace />;
  if (requireEmailVerified && !isEmailConfirmed) {
    return (
      <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ maxWidth: 480, padding: 40, textAlign: "center", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(245,197,24,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Icon.Mail size={28} color={C.gold} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Email non vérifié</h2>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>Vous devez vérifier votre adresse email avant d'accéder au dashboard. Consultez votre boîte de réception (et vos spams) pour le lien de confirmation.</p>
          <Link to="/connexion" className="btn btn-o">Retour à la connexion</Link>
        </div>
      </div>
    );
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, loading, isAdmin, isEmailConfirmed } = useAuth();
  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;
  if (!user || !isEmailConfirmed) return <Navigate to="/connexion" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── ERROR BOUNDARY ───
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ textAlign: "center", padding: 40, maxWidth: 500 }}>
            <Icon.AlertCircle size={48} color={C.red} />
            <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>Une erreur est survenue</h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Nous avons été notifiés. Vous pouvez recharger la page ou retourner à l'accueil.</p>
            <button onClick={() => window.location.href = "/"} className="btn btn-g">Retour à l'accueil</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── APP ROOT ───

function ConfigBanner() {
  if (supabaseConfigured) return null;
  return (
    <div className="error-banner">
      ⚠️ Configuration Supabase manquante — VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être ajoutées dans Vercel.
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <style>{css}</style>
        <ConfigBanner />
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/artistes" element={<ArtistsPage />} />
            <Route path="/artiste/:slug" element={<ArtistDetailPage />} />
            <Route path="/distribution-musique" element={<DistributionPage />} />
            <Route path="/studio-enregistrement" element={<StudioPage />} />
            <Route path="/booking-artistes" element={<BookingPage />} />
            <Route path="/featurings" element={<FeaturingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
            <Route path="/cgu" element={<CGUPage />} />
            <Route path="/confidentialite" element={<PrivacyPage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
