import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "./supabase.js";

// ─── CONFIG ───
const EMAIL_CONFIG = {
  ACCESS_KEY: import.meta.env.VITE_WEB3FORMS_KEY || "fbc77d7c-6908-4bea-a57d-e267b09a8e76",
  ENDPOINT: "https://api.web3forms.com/submit",
};

const WHATSAPP_NUMBER = "+243850510209"; // ← Remplacez par votre vrai numéro WhatsApp (format international sans +)
const WHATSAPP_EMAIL = "contact.sterkterecords@gmail.com";

// ADMIN CONFIG — emails des membres de l'équipe autorisés à accéder au dashboard admin
const ADMIN_EMAILS = ["contact@sterkterecords.com", "contact.sterkterecords@gmail.com"];

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
  "/contact": { title: "Contact – Sterkte Records, Lubumbashi RDC", desc: "Contactez Sterkte Records. Email : contact.sterkterecords@gmail.com | +243 850 510 209" },
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

// ─── ICONES SVG ───
const Icon = {
  Music: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  Mic: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Calendar: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Handshake: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l8.42 8.42 8.42-8.42a5.4 5.4 0 0 0 0-7.65z" />
    </svg>
  ),
  BarChart: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  User: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Globe: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Rocket: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  Diamond: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
  ),
  Target: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  TrendingUp: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Zap: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Search: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Upload: ({ size = 40, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Image: ({ size = 40, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Check: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowLeft: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Clipboard: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Film: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  Map: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  Headphones: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  Instagram: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Twitter: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  Youtube: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  ),
  Facebook: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  Spotify: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 13.5a6.5 6.5 0 0 1 8 0" /><path d="M6.5 11a9 9 0 0 1 11 0" /><path d="M9.5 16a4 4 0 0 1 5 0" />
    </svg>
  ),
  Play: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Mail: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.47a16 16 0 0 0 5.62 5.62l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Link2: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Star: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Award: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Layers: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Eye: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 18, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Heart: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Whatsapp: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  Crown: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2L15 8L22 3L20 12H4L2 3L9 8L12 2Z"/>
      <rect x="4" y="13" width="16" height="2" rx="1"/>
      <rect x="5" y="16" width="14" height="3" rx="1"/>
    </svg>
  ),
  Shield: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Users: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Settings: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  AlertCircle: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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

// ─── MOCK ARTIST DATA ───
const MOCK_ARTISTS_DETAIL = {
  "dj-minho": {
    bio: "DJ Minho était l'une des figures les plus emblématiques de la scène musicale de Lubumbashi. Reconnu pour son énergie incomparable sur les platines et sa capacité à transcender les foules, il a marqué de son empreinte indélébile la scène musicale congolaise et africaine.",
    bio2: "Artiste passionné, créatif et toujours à l'avant-garde des tendances, DJ Minho nous a quittés le 01 Aout 2025. Son héritage musical continue d'inspirer une nouvelle génération de DJs et de mélomanes. Sterkte Records garde précieusement sa mémoire.",
    genre: "DJ / Afrobeat",
    origin: "Lubumbashi, RDC",
    since: "2021",
    streams: "50K+",
    plateformes: "150+",
    singles: [
      { title: "Breakfast (feat. Hbeatz)", year: "2024", streams: "180K" },
      { title: "Ama vibe", year: "2023", streams: "145K" },
      { title: "Ama vibe", year: "2022", streams: "120K" },
    ],
    socials: { instagram: "https://instagram.com", spotify: "https://open.spotify.com" },
    tribute: true,
    tributeDate: "01/08/2025",
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

// ─── AUTH CONTEXT ───
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  };

  const signUp = async (email, password, meta) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: meta.full_name, artist_name: meta.artist_name } },
    });
    if (!error && data.user) {
      await supabase.from("profiles").update({ genre: meta.genre, whatsapp: meta.whatsapp }).eq("id", data.user.id);
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

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, fetchProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── DATA HOOKS ───
function useArtists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("artists").select("*").order("created_at", { ascending: true })
      .then(({ data }) => { setArtists(data || []); setLoading(false); });
  }, []);
  return { artists, loading };
}

function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => {
    supabase.from("testimonials").select("*").eq("featured", true)
      .then(({ data }) => setTestimonials(data || []));
  }, []);
  return testimonials;
}

function useTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStreams: 0, totalRevenue: 0, count: 0, platforms: 0 });

  const fetchTracks = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("tracks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const t = data || [];
    setTracks(t);
    const totalStreams = t.reduce((s, tr) => s + (tr.streams || 0), 0);
    const totalRevenue = t.reduce((s, tr) => s + parseFloat(tr.revenue || 0), 0);
    setStats({ totalStreams, totalRevenue: totalRevenue.toFixed(2), count: t.length, platforms: t.filter(tr => tr.status === "live").length > 0 ? 20 : 0 });
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
    <>
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />
    </>
  );
}

function WaveDivider() {
  return (
    <div className="wave-div">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,20 C240,60 480,0 720,30 C960,60 1200,10 1440,40 L1440,60 L0,60 Z" opacity="0.6" />
        <path d="M0,35 C360,5 720,55 1080,25 C1260,15 1380,35 1440,30 L1440,60 L0,60 Z" opacity="0.3" />
      </svg>
    </div>
  );
}

async function sendEmail(data) {
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

function sendWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

async function uploadFile(bucket, file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return null;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

function PageBanner({ tag, title, subtitle, accent = C.red }) {
  return (
    <div className="pg-banner">
      <div className="pg-banner-bg" style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent}14 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, ${C.gold}08 0%, transparent 50%)` }} />
      <svg className="pg-banner-deco" viewBox="0 0 1200 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,150 Q300,80 600,150 T1200,150" stroke={`${accent}20`} strokeWidth="1" fill="none" />
        <path d="M0,200 Q400,120 800,200 T1600,200" stroke={`${C.gold}10`} strokeWidth="1" fill="none" />
        <circle cx="80" cy="80" r="60" stroke={`${accent}0A`} strokeWidth="1" fill="none" />
        <circle cx="1100" cy="220" r="80" stroke={`${C.gold}08`} strokeWidth="1" fill="none" />
      </svg>
      <div className="pg-banner-in">
        <div className="sec-tag">{tag}</div>
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="pg-banner-fade" />
    </div>
  );
}

// ─── ALL CSS ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${C.bg};--card:${C.bgCard};--hover:${C.bgHover};--input:${C.bgInput};--border:${C.border};--white:${C.white};--gold:${C.gold};--red:${C.red};--blue:${C.blue};--muted:${C.muted};--ok:${C.success}}
body{background:var(--bg);color:var(--white)}
.app{font-family:'Raleway',sans-serif;background:var(--bg);color:var(--white);min-height:100vh;overflow-x:hidden}
h1,h2,h3,h4,h5,h6{font-family:'Montserrat',sans-serif}
a{text-decoration:none;color:inherit}

/* ── NAVBAR ── */
nav.n{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;background:rgba(10,10,15,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(42,42,53,0.5);transition:all .3s}
nav.n.s{background:rgba(10,10,15,0.95)}
.n-logo{display:flex;align-items:center;gap:10px}
.n-logo-img{height:36px;width:auto;object-fit:contain}
.n-logo-t{font-family:'Montserrat',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.5px}
.n-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
.n-links{display:flex;align-items:center;gap:24px;list-style:none}
.n-links a{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);transition:color .3s;position:relative}
.n-links a:hover,.n-links a.ac{color:var(--white)}
.n-links a.ac::after{content:'';position:absolute;bottom:-4px;left:0;right:0;height:2px;background:var(--gold);border-radius:1px}
.n-acts{display:flex;gap:12px;align-items:center}
.n-ham{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}
.n-ham span{display:block;width:24px;height:2px;background:var(--white);transition:all .3s}

/* ── BUTTONS ── */
.btn{font-family:'Montserrat',sans-serif;font-weight:600;font-size:13px;letter-spacing:.5px;padding:10px 24px;border-radius:6px;cursor:pointer;transition:all .3s;border:none;text-transform:uppercase;display:inline-flex;align-items:center;gap:8px}
.btn-r{background:var(--red);color:var(--white)}.btn-r:hover{background:#d32f3f;transform:translateY(-1px);box-shadow:0 8px 25px rgba(230,57,70,.3)}
.btn-o{background:transparent;color:var(--white);border:1px solid var(--border)}.btn-o:hover{border-color:var(--gold);color:var(--gold)}
.btn-g{background:var(--gold);color:#000}.btn-g:hover{background:#ddb115;transform:translateY(-1px);box-shadow:0 8px 25px rgba(245,197,24,.3)}
.btn-lg{padding:14px 36px;font-size:14px;border-radius:8px}.btn-sm{padding:8px 16px;font-size:11px}
.btn:disabled{opacity:.6;cursor:not-allowed;transform:none!important;box-shadow:none!important}

/* ── HERO (Accueil) ── */
.hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:100px 60px 60px}
.hero-bg{position:absolute;inset:0;z-index:0;background:#0A0A0F;}
.hero-grid{display:none;}
.hero-c{position:relative;z-index:1;max-width:800px;text-align:center;margin:0 auto;}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.2);padding:6px 16px;border-radius:20px;margin-bottom:28px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase}
.hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero h1{font-size:clamp(32px,4.5vw,54px);font-weight:900;line-height:1.1;letter-spacing:-2px;margin-bottom:24px}
.gold{color:var(--gold)}.red{color:var(--red)}
.hero-sub{font-size:16px;line-height:1.7;color:var(--muted);max-width:560px;margin:0 auto 36px;}
.hero-acts{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:60px;justify-content:center;}
.hero-stats{display:flex;gap:48px;padding-top:40px;border-top:1px solid var(--border);justify-content:center;}
.stat-v{font-family:'Montserrat',sans-serif;font-size:32px;font-weight:800}
.stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-family:'Montserrat',sans-serif;font-weight:500}

/* Hero visual */
.hero-visual{position:absolute;right:0;top:0;bottom:0;width:50%;z-index:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.hero-wave-svg{position:absolute;inset:0;width:100%;height:100%}
.wv{transform-origin:center;animation:wvPulse 3s ease-in-out infinite}
@keyframes wvPulse{0%,100%{opacity:.08;transform:scaleY(.9)}50%{opacity:.25;transform:scaleY(1)}}
.hero-vinyl{position:absolute;right:8%;top:50%;transform:translateY(-50%);width:320px;height:320px;border-radius:50%;background:conic-gradient(from 0deg,#1a1a25,#12121a,#1a1a25,#0d0d14,#1a1a25);border:2px solid rgba(245,197,24,.15);animation:spin 20s linear infinite;opacity:.35}
.hero-vinyl::after{content:'';position:absolute;inset:30%;border-radius:50%;background:radial-gradient(circle,rgba(245,197,24,.3),transparent);border:1px solid rgba(245,197,24,.2)}
@keyframes spin{from{transform:translateY(-50%) rotate(0deg)}to{transform:translateY(-50%) rotate(360deg)}}
.hero-orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none}
.hero-orb1{width:400px;height:400px;right:-100px;top:10%;background:rgba(230,57,70,.06)}
.hero-orb2{width:300px;height:300px;right:20%;bottom:10%;background:rgba(245,197,24,.05)}

/* ── HERO SLIDER ARTISTIQUE ── */
.hero-slider{position:absolute;right:0;top:0;bottom:0;width:48%;z-index:0;overflow:hidden}
.hero-slider-track{display:flex;height:100%;transition:transform 0.9s cubic-bezier(0.77,0,0.175,1)}
.hero-slide{min-width:100%;height:100%;position:relative;overflow:hidden}
.hero-slide img{width:100%;height:100%;object-fit:cover;filter:brightness(.5) saturate(.8)}
.hero-slide-overlay{position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 0%,rgba(10,10,15,0.5) 40%,transparent 100%)}
.hero-slide-label{position:absolute;bottom:40px;right:32px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4)}
.hero-slider-nav{position:absolute;bottom:32px;left:60px;display:flex;gap:8px;z-index:2}
.hero-slider-dot{width:24px;height:3px;border-radius:2px;background:rgba(255,255,255,.25);cursor:pointer;transition:all .4s}
.hero-slider-dot.ac{background:var(--gold);width:40px}
.hero-slider-arrows{position:absolute;top:50%;right:20px;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:2}
.hero-slider-btn{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;color:var(--white)}
.hero-slider-btn:hover{background:rgba(245,197,24,.15);border-color:var(--gold)}
.hero-grain{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:1;opacity:.4}

/* ── SECTIONS ── */
.sec{padding:100px 60px;position:relative}
.sec-h{text-align:center;margin-bottom:64px}
.sec-tag{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.sec-title{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-1px;margin-bottom:16px}
.sec-desc{font-size:16px;color:var(--muted);max-width:600px;margin:0 auto;line-height:1.7;text-align:justify}

/* ── SERVICES ── */
.srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.srv{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;cursor:pointer;transition:all .4s;position:relative;overflow:hidden}
.srv:hover{border-color:var(--gold);background:var(--hover);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.srv-ico{width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:rgba(245,197,24,.08);border-radius:12px;margin-bottom:20px;color:var(--gold)}
.srv h3{font-size:18px;font-weight:700;margin-bottom:10px}.srv p{font-size:14px;color:var(--muted);line-height:1.6;text-align:justify}
.srv-arr{position:absolute;top:28px;right:28px;color:var(--gold);opacity:0;transition:all .3s}
.srv:hover .srv-arr{opacity:1;transform:translateX(4px)}

/* ── PAGE BANNER ── */
.pg-banner{padding:120px 60px 80px;position:relative;overflow:hidden;padding-top:calc(72px + 60px)}
.pg-banner-bg{position:absolute;inset:0;z-index:0}
.pg-banner-deco{position:absolute;inset:0;width:100%;height:100%;z-index:0}
.pg-banner-in{position:relative;z-index:1;max-width:800px}
.pg-banner-in h1{font-size:clamp(32px,5vw,58px);font-weight:900;letter-spacing:-2px;margin-bottom:16px;line-height:1.05}
.pg-banner-in p{font-size:17px;color:var(--muted);line-height:1.7;max-width:600px}
.pg-banner-fade{position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,var(--bg));z-index:1}

/* ── ARTISTS PAGE ── */
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
.art-search-ico{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;display:flex;align-items:center}
.art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;max-width:1200px;margin:0 auto;padding:0 60px 80px}
.art-card{position:relative;aspect-ratio:1/1;border-radius:10px;overflow:hidden;cursor:pointer;background:var(--card)}
.art-card img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.25,.46,.45,.94),filter .5s;filter:brightness(.75) saturate(.9)}
.art-card:hover img{transform:scale(1.08);filter:brightness(.55) saturate(1)}
.art-ov{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.1) 40%,transparent 60%);display:flex;flex-direction:column;justify-content:flex-end;padding:24px;transition:all .4s}
.art-card:hover .art-ov{background:linear-gradient(0deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,rgba(0,0,0,.1) 100%)}
.art-name{font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px;line-height:1.2}
.art-genre{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--gold);margin-top:6px;opacity:0;transform:translateY(8px);transition:all .4s}
.art-card:hover .art-genre{opacity:1;transform:translateY(0)}
.art-cta{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--white);background:var(--red);padding:6px 14px;border-radius:4px;margin-top:10px;opacity:0;transform:translateY(8px);transition:all .4s .05s;display:inline-flex;align-items:center;gap:6px;align-self:flex-start}
.art-card:hover .art-cta{opacity:1;transform:translateY(0)}

/* DJ Minho tribute card */
.art-card.tribute{border:2px solid rgba(245,197,24,0.3);box-shadow:0 0 40px rgba(245,197,24,0.08)}
.tribute-banner{position:absolute;top:0;left:0;right:0;z-index:3;background:linear-gradient(90deg,rgba(10,10,15,0.95),rgba(245,197,24,0.15));padding:8px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(245,197,24,0.2)}
.tribute-banner span{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.tribute-card-wrapper{grid-column:1/-1;display:flex;justify-content:center;padding:0 0 32px}
.tribute-card-inner{width:100%;max-width:420px;position:relative;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,rgba(10,10,15,0.98),rgba(18,18,26,0.9));border:1px solid rgba(245,197,24,0.25);box-shadow:0 8px 60px rgba(245,197,24,0.06),0 0 120px rgba(245,197,24,0.03);aspect-ratio:1/1;cursor:pointer}
.tribute-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(245,197,24,0.05),transparent 60%)}
.tribute-particles{position:absolute;inset:0;overflow:hidden}
.tribute-star{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(245,197,24,0.6);animation:tributeFloat 4s ease-in-out infinite}
.tribute-img{width:100%;height:100%;object-fit:cover;filter:brightness(.45) saturate(.6) sepia(.2)}
.tribute-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,10,15,0.95) 0%,rgba(10,10,15,0.5) 50%,rgba(10,10,15,0.2) 100%)}
.tribute-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;z-index:2}
.tribute-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.2);padding:4px 12px;border-radius:20px;margin-bottom:12px;width:fit-content}
.tribute-badge span{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.tribute-name{font-family:'Montserrat',sans-serif;font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;line-height:1;margin-bottom:6px;color:var(--white)}
.tribute-dates{font-family:'Montserrat',sans-serif;font-size:11px;color:rgba(245,197,24,0.7);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.tribute-quote{font-size:13px;color:rgba(255,255,255,0.5);font-style:italic;line-height:1.5;border-left:2px solid rgba(245,197,24,0.3);padding-left:12px}
@keyframes tributeFloat{0%,100%{transform:translateY(0) scale(1);opacity:.6}50%{transform:translateY(-8px) scale(1.1);opacity:1}}

/* ── ARTIST DETAIL PAGE ── */
.ap{padding-top:72px;min-height:100vh}
.ap-hero{min-height:70vh;position:relative;display:flex;align-items:flex-end;overflow:hidden}
.ap-hero-bg{position:absolute;inset:0;z-index:0}
.ap-hero-img{width:100%;height:100%;object-fit:cover;filter:brightness(.4) saturate(.8)}
.ap-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,15,.95) 40%,rgba(10,10,15,.3) 100%),linear-gradient(0deg,rgba(10,10,15,.9) 0%,transparent 50%)}
.ap-hero-c{position:relative;z-index:1;padding:60px;max-width:1200px;width:100%}
.ap-genre-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(245,197,24,.12);border:1px solid rgba(245,197,24,.25);color:var(--gold);font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:20px}
.ap-hero-name{font-family:'Montserrat',sans-serif;font-size:clamp(52px,8vw,110px);font-weight:900;line-height:.95;letter-spacing:-4px;text-transform:uppercase;margin-bottom:24px}
.ap-hero-socials{display:flex;gap:12px;margin-bottom:32px}
.ap-social-btn{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .3s;cursor:pointer}
.ap-social-btn:hover{background:rgba(245,197,24,.15);border-color:var(--gold);color:var(--gold)}
.ap-hero-acts{display:flex;gap:12px;flex-wrap:wrap}
.ap-stats-bar{display:flex;gap:40px;padding:24px 60px;background:rgba(18,18,26,.8);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.ap-stat{display:flex;flex-direction:column;gap:4px}
.ap-stat-v{font-family:'Montserrat',sans-serif;font-size:24px;font-weight:800;color:var(--gold)}
.ap-stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;font-family:'Montserrat',sans-serif;font-weight:600}
.ap-body{max-width:1200px;margin:0 auto;padding:60px}
.ap-grid{display:grid;grid-template-columns:2fr 1fr;gap:60px}
.ap-bio-title{font-size:13px;font-weight:700;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;font-family:'Montserrat',sans-serif}
.ap-bio-text{font-size:15px;color:var(--muted);line-height:1.85;margin-bottom:20px}
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

/* ── BACK BUTTON AMÉLIORÉ ── */
.ap-back-btn{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:50px;padding:10px 20px 10px 14px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;transition:all .3s;cursor:pointer;margin-bottom:32px;backdrop-filter:blur(10px)}
.ap-back-btn:hover{background:rgba(245,197,24,.1);border-color:rgba(245,197,24,.3);color:var(--white);transform:translateX(-2px)}
.ap-back-btn svg{transition:transform .3s}
.ap-back-btn:hover svg{transform:translateX(-3px)}

/* ── PAGES GÉNÉRIQUES ── */
.pg{padding-top:72px;min-height:100vh}
.pg-c{padding:60px;max-width:1200px;margin:0 auto}
.fm{max-width:640px}.fm-row{display:flex;gap:16px;margin-bottom:16px}.fm-row>*{flex:1}
.fm-g{margin-bottom:16px;position:relative}
.fm-l{display:block;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
.fm-i,.fm-s,.fm-t{width:100%;padding:12px 16px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'Raleway',sans-serif;font-size:14px;transition:border-color .3s;outline:none}
.fm-i:focus,.fm-s:focus,.fm-t:focus{border-color:var(--gold)}
.fm-t{min-height:120px;resize:vertical}.fm-s{appearance:none;cursor:pointer}
.fm-err{color:var(--red);font-size:12px;margin-top:4px;font-family:'Montserrat',sans-serif}
.fm-eye{position:absolute;right:12px;bottom:12px;cursor:pointer;color:var(--muted);transition:color .2s;background:none;border:none;padding:0;display:flex;align-items:center}
.fm-eye:hover{color:var(--white)}
.fm-i-pwd{padding-right:44px}
.feats{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin:40px 0}
.feat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:24px;transition:all .3s}
.feat:hover{border-color:rgba(245,197,24,.3)}
.feat-ico{width:44px;height:44px;border-radius:10px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:14px}
.feat h4{font-size:15px;font-weight:700;margin-bottom:8px}
.feat p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}
.steps{display:flex;flex-direction:column;gap:0;margin:40px 0;max-width:640px}
.step{display:flex;gap:20px;position:relative;padding-bottom:32px}
.step:last-child{padding-bottom:0}
.step-n{width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(245,197,24,.1);border:2px solid var(--gold);border-radius:50%;font-family:'Montserrat',sans-serif;font-weight:800;font-size:14px;color:var(--gold);position:relative;z-index:1}
.step::before{content:'';position:absolute;left:19px;top:44px;bottom:0;width:2px;background:var(--border)}
.step:last-child::before{display:none}
.step-c h4{font-size:16px;font-weight:700;margin-bottom:6px}
.step-c p{font-size:14px;color:var(--muted);line-height:1.6;text-align:justify}
.testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.testi{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;position:relative}
.testi::before{content:'"';position:absolute;top:16px;right:24px;font-size:64px;color:rgba(245,197,24,.15);font-family:Georgia,serif;line-height:1}
.testi p{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:20px;font-style:italic;text-align:justify}
.testi-author{font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700}
.testi-role{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-top:2px}
.why-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.why{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;transition:all .3s}
.why:hover{border-color:var(--gold);transform:translateY(-2px)}
.why-ico{width:52px;height:52px;border-radius:12px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:16px}
.why h4{font-size:16px;font-weight:700;margin-bottom:8px}
.why p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}
.dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:32px}
.dash-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px}
.dash-stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600;margin-bottom:8px}
.dash-stat-v{font-family:'Montserrat',sans-serif;font-size:28px;font-weight:800}
.dash-stat-note{font-size:11px;color:var(--muted);margin-top:6px;font-family:'Montserrat',sans-serif}
.dash-tracks{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.dash-tracks-h{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)}
.dash-tracks-h h3{font-size:16px;font-weight:700}
.tr-row{display:grid;grid-template-columns:40px 2fr 1fr 1fr 1fr;align-items:center;padding:14px 24px;gap:16px;border-bottom:1px solid rgba(42,42,53,.4);transition:background .2s}
.tr-row:hover{background:var(--hover)}
.tr-num{font-size:13px;color:var(--muted);font-family:'Montserrat',sans-serif;font-weight:600}
.tr-title{font-size:14px;font-weight:600}
.tr-info{font-size:13px;color:var(--muted)}
.tr-status{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;font-family:'Montserrat',sans-serif}
.tr-status.live{color:var(--ok)}.tr-status.pending{color:var(--gold)}.tr-status.rejected{color:var(--red)}
.tr-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.upload{border:2px dashed var(--border);border-radius:12px;padding:48px;text-align:center;cursor:pointer;transition:all .3s;margin:24px 0}
.upload:hover{border-color:var(--gold);background:rgba(245,197,24,.03)}
.upload.has-file{border-color:var(--ok);background:rgba(76,175,80,.05)}
.upload-ico{display:flex;justify-content:center;margin-bottom:16px;color:var(--muted)}
.upload h4{font-size:16px;font-weight:600;margin-bottom:8px}
.upload p{font-size:13px;color:var(--muted)}
.pricing{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin:40px 0}
.price-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:32px;text-align:center;transition:all .3s}
.price-card.ft{border-color:var(--gold)}.price-card:hover{transform:translateY(-4px)}
.price-card h4{font-size:18px;font-weight:700;margin-bottom:8px}
.price-val{font-family:'Montserrat',sans-serif;font-size:36px;font-weight:800;color:var(--gold);margin:16px 0}
.price-val span{font-size:14px;color:var(--muted);font-weight:400}
.price-card ul{list-style:none;text-align:left;margin:20px 0}
.price-card ul li{padding:8px 0;font-size:13px;color:var(--muted);border-bottom:1px solid rgba(42,42,53,.4);display:flex;align-items:center;gap:8px}
.price-card ul li .chk{color:var(--gold);flex-shrink:0}
.login-pg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px;background:radial-gradient(ellipse at center,rgba(230,57,70,.06) 0%,var(--bg) 70%)}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:48px;max-width:440px;width:100%}
.login-card h2{font-size:24px;font-weight:800;margin-bottom:8px;text-align:center}
.login-card .sub{font-size:14px;color:var(--muted);text-align:center;margin-bottom:32px}
.tabs{display:flex;gap:4px;margin-bottom:32px;border-bottom:1px solid var(--border)}
.tab{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;padding:12px 20px;cursor:pointer;color:var(--muted);transition:all .3s;border-bottom:2px solid transparent;text-transform:uppercase;letter-spacing:.5px;background:none;border-top:none;border-left:none;border-right:none}
.tab:hover{color:var(--white)}.tab.ac{color:var(--gold);border-bottom-color:var(--gold)}
.marquee{overflow:hidden;padding:20px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(245,197,24,.02)}
.marquee-in{display:flex;gap:60px;animation:mq 20s linear infinite;white-space:nowrap}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mq-item{font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:3px;display:flex;align-items:center;gap:20px}
.mq-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
.team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:40px}
.team{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;text-align:center;transition:all .3s}
.team:hover{border-color:rgba(245,197,24,.3);transform:translateY(-2px)}
.team-av{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--gold));margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;font-size:24px;color:#000}
.team h4{font-size:16px;font-weight:700;margin-bottom:4px}
.team .role{font-size:12px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;font-family:'Montserrat',sans-serif;font-weight:600}
.team p{font-size:13px;color:var(--muted);margin-top:12px;line-height:1.6;text-align:justify}

/* About page */
.about-values{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin:48px 0}
.about-val{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px;position:relative;overflow:hidden;transition:all .3s}
.about-val::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),transparent)}
.about-val:hover{border-color:rgba(245,197,24,.3);transform:translateY(-2px)}
.about-val-ico{width:48px;height:48px;border-radius:10px;background:rgba(245,197,24,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:16px}
.about-val h4{font-size:15px;font-weight:700;margin-bottom:8px}
.about-val p{font-size:13px;color:var(--muted);line-height:1.6}
.about-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:60px 0;background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.about-stat{padding:32px;text-align:center;border-right:1px solid var(--border)}
.about-stat:last-child{border-right:none}
.about-stat-v{font-family:'Montserrat',sans-serif;font-size:40px;font-weight:900;color:var(--gold);line-height:1}
.about-stat-l{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-top:8px;font-family:'Montserrat',sans-serif;font-weight:600}
.about-timeline{position:relative;padding-left:32px;margin:48px 0}
.about-timeline::before{content:'';position:absolute;left:6px;top:0;bottom:0;width:1px;background:linear-gradient(var(--gold),var(--border))}
.about-tl-item{position:relative;margin-bottom:40px}
.about-tl-dot{position:absolute;left:-32px;top:4px;width:13px;height:13px;border-radius:50%;background:var(--gold);border:2px solid var(--bg)}
.about-tl-year{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:2px;margin-bottom:6px}
.about-tl-item h4{font-size:15px;font-weight:700;margin-bottom:4px}
.about-tl-item p{font-size:13px;color:var(--muted);line-height:1.6;text-align:justify}

/* Wave divider */
.wave-div{line-height:0;position:relative;height:60px}
.wave-div svg{width:100%;height:100%;fill:rgba(255,255,255,.02)}
.sec-banner{padding:80px 60px;position:relative;overflow:hidden}
.sec-banner-bg{position:absolute;inset:0;z-index:0}
.sec-banner-c{position:relative;z-index:2}

footer.ft{padding:60px;border-top:1px solid var(--border);background:rgba(10,10,15,.6)}
.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;max-width:1100px;margin:0 auto 40px}
.ft-brand p{font-size:14px;color:var(--muted);line-height:1.7;margin-top:12px;max-width:320px;text-align:justify}
footer h5{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px}
footer ul{list-style:none}
footer ul li{padding:4px 0;font-size:13px;color:var(--muted);transition:color .3s}
footer ul li:hover{color:var(--blue)}
.ft-bottom{text-align:center;padding-top:32px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);max-width:1100px;margin:0 auto}
.toast{position:fixed;bottom:24px;right:24px;z-index:300;padding:14px 24px;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;animation:slideUp .3s ease;max-width:400px}
.toast.ok{background:var(--ok);color:#000}.toast.err{background:var(--red);color:#fff}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.mob{position:fixed;inset:0;z-index:200;background:rgba(10,10,15,.98);backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
.mob-close{position:absolute;top:20px;right:20px;background:none;border:none;color:var(--white);font-size:28px;cursor:pointer}
.mob a{font-family:'Montserrat',sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);transition:color .3s}
.mob a:hover,.mob a.ac{color:var(--white)}
.loading-box{display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--muted);font-size:14px}

/* ── ADMIN DASHBOARD ── */
.admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:32px}
.admin-row{display:grid;grid-template-columns:auto 1fr 1fr 1fr 1fr auto;align-items:center;padding:14px 24px;gap:16px;border-bottom:1px solid rgba(42,42,53,.4)}
.admin-row:hover{background:var(--hover)}
.admin-badge{font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:20px}
.admin-badge.pending{background:rgba(245,197,24,0.15);color:var(--gold)}
.admin-badge.live{background:rgba(76,175,80,0.15);color:var(--ok)}
.admin-badge.rejected{background:rgba(230,57,70,0.15);color:var(--red)}
.admin-action{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;padding:5px 12px;border-radius:4px;cursor:pointer;border:none;transition:all .2s}
.admin-action.approve{background:rgba(76,175,80,0.15);color:var(--ok)}.admin-action.approve:hover{background:var(--ok);color:#000}
.admin-action.reject{background:rgba(230,57,70,0.15);color:var(--red)}.admin-action.reject:hover{background:var(--red);color:#fff}
.admin-reg-row{display:grid;grid-template-columns:auto 1fr 1fr 1fr auto;align-items:center;padding:14px 24px;gap:16px;border-bottom:1px solid rgba(42,42,53,.4)}

/* ── EFFECTS ── */
.srv,.feat,.why,.testi,.team,.about-val,.dash-stat,.price-card,.login-card,.ap-sidebar-card{
  background:rgba(18,18,26,0.45)!important;backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);
  border:1px solid rgba(255,255,255,0.06)!important;box-shadow:0 4px 30px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.05);position:relative;overflow:hidden
}
.srv::before,.why::before,.testi::before,.team::before,.about-val::before,.dash-stat::before,.price-card::before{
  content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;
  background:conic-gradient(from 0deg at 50% 50%,transparent 0%,rgba(245,197,24,0.03) 25%,transparent 50%,rgba(230,57,70,0.02) 75%,transparent 100%);
  animation:glassShimmer 8s linear infinite;pointer-events:none;z-index:0
}
@keyframes glassShimmer{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.srv>*,.why>*,.testi>*,.team>*,.about-val>*,.dash-stat>*,.price-card>*{position:relative;z-index:1}
.srv:hover,.why:hover,.testi:hover,.team:hover,.price-card:hover{border-color:rgba(245,197,24,0.15)!important;box-shadow:0 8px 40px rgba(0,0,0,0.5),0 0 60px rgba(245,197,24,0.06),inset 0 1px 0 rgba(255,255,255,0.08)}
.srv-ico,.feat-ico,.why-ico,.about-val-ico{position:relative;background:rgba(245,197,24,0.06)!important;box-shadow:0 0 20px rgba(245,197,24,0.08);transition:all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)}
.srv{transform-style:preserve-3d;perspective:600px;transition:all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)!important}
.srv:hover{transform:translateY(-6px) rotateX(2deg) rotateY(-2deg)!important;box-shadow:0 25px 50px rgba(0,0,0,0.5),0 0 80px rgba(245,197,24,0.05),inset 0 1px 0 rgba(255,255,255,0.1)!important}
.hero-blob{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;mix-blend-mode:screen;z-index:0}
.hero-blob-1,.hero-blob-2,.hero-blob-3{display:none;}
@keyframes blobFloat1{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-40px) scale(1.1)}50%{transform:translate(-20px,30px) scale(0.95)}75%{transform:translate(40px,20px) scale(1.05)}}
@keyframes blobFloat2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-40px,30px) scale(1.08)}66%{transform:translate(30px,-20px) scale(0.92)}}
@keyframes blobFloat3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}}
.hero h1{text-shadow:0 0 80px rgba(245,197,24,0.08)}
.hero h1 .gold{text-shadow:0 0 40px rgba(245,197,24,0.15)}
.hero h1 .red{text-shadow:0 0 40px rgba(230,57,70,0.15)}
nav.n{background:rgba(10,10,15,0.4)!important;backdrop-filter:blur(30px) saturate(1.5)!important;-webkit-backdrop-filter:blur(30px) saturate(1.5)!important;border-bottom:1px solid rgba(255,255,255,0.04)!important;box-shadow:0 4px 30px rgba(0,0,0,0.2)}
nav.n.s{background:rgba(10,10,15,0.6)!important;box-shadow:0 4px 40px rgba(0,0,0,0.4)}
.btn{position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:left 0.6s ease}
.btn:hover::after{left:100%}
.btn-g{box-shadow:0 0 15px rgba(245,197,24,0.15)}
.btn-g:hover{box-shadow:0 4px 30px rgba(245,197,24,0.3)!important}
.btn-r{box-shadow:0 0 15px rgba(230,57,70,0.15)}
.btn-r:hover{box-shadow:0 4px 30px rgba(230,57,70,0.3)!important}
.marquee{background:rgba(245,197,24,0.015);backdrop-filter:blur(10px)}
.mq-dot{box-shadow:0 0 8px rgba(245,197,24,0.4)}
.sr-reveal{opacity:0;transform:translateY(30px);transition:opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94),transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)}
.sr-reveal.visible{opacity:1;transform:translateY(0)}
.sr-reveal-left{opacity:0;transform:translateX(-40px);transition:opacity 0.8s ease,transform 0.8s ease}
.sr-reveal-left.visible{opacity:1;transform:translateX(0)}
.srv-grid .srv:nth-child(1){transition-delay:0s}.srv-grid .srv:nth-child(2){transition-delay:0.08s}.srv-grid .srv:nth-child(3){transition-delay:0.16s}.srv-grid .srv:nth-child(4){transition-delay:0.24s}
.fm-i:focus,.fm-s:focus,.fm-t:focus{border-color:rgba(245,197,24,0.4)!important;box-shadow:0 0 0 3px rgba(245,197,24,0.06);background:rgba(22,22,31,0.8)}
.dash-stat{backdrop-filter:blur(20px)}
.dash-stat:hover{border-color:rgba(245,197,24,0.12)!important;transform:translateY(-2px);transition:all 0.3s}
.hero-badge{background:rgba(245,197,24,0.06)!important;backdrop-filter:blur(20px);border:1px solid rgba(245,197,24,0.12)!important;box-shadow:0 0 20px rgba(245,197,24,0.05)}
.pg{animation:pageIn 0.5s ease}
@keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.art-card::after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(245,197,24,0.03),transparent 50%);opacity:0;transition:opacity 0.5s;pointer-events:none}
.art-card:hover::after{opacity:1}
.toast{backdrop-filter:blur(20px);box-shadow:0 8px 30px rgba(0,0,0,0.4)}
.toast.ok{background:rgba(76,175,80,0.85)!important}.toast.err{background:rgba(230,57,70,0.85)!important}
.login-card{backdrop-filter:blur(30px) saturate(1.5)!important;box-shadow:0 8px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06)!important}
footer.ft{background:rgba(10,10,15,0.4)!important;backdrop-filter:blur(20px) saturate(1.3);border-top:1px solid rgba(255,255,255,0.04)!important}
.upload{background:rgba(18,18,26,0.3);backdrop-filter:blur(15px);border:2px dashed rgba(255,255,255,0.08)!important}
.upload:hover{border-color:rgba(245,197,24,0.2)!important;background:rgba(245,197,24,0.02);box-shadow:0 0 30px rgba(245,197,24,0.04)}
.upload.has-file{border-color:rgba(76,175,80,0.3)!important;background:rgba(76,175,80,0.03)}
.tab.ac{text-shadow:0 0 12px rgba(245,197,24,0.3)}
.hero-vinyl{box-shadow:0 0 80px rgba(245,197,24,0.05);border:1px solid rgba(245,197,24,0.08)!important}
.stat-v{text-shadow:0 0 20px rgba(255,255,255,0.06)}
.about-stat-v{text-shadow:0 0 30px rgba(245,197,24,0.12)}
.step-n{box-shadow:0 0 15px rgba(245,197,24,0.1)}
.mob{background:rgba(10,10,15,0.85)!important;backdrop-filter:blur(40px) saturate(1.5)!important}

/* ── ARTIST BG VIVANT ── */
.artists-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.artists-bg-orb{position:absolute;border-radius:50%;filter:blur(120px);mix-blend-mode:screen;animation:orbFloat 15s ease-in-out infinite}
.artists-bg-orb1{width:600px;height:600px;background:rgba(230,57,70,0.04);left:-10%;top:-10%;animation-duration:18s}
.artists-bg-orb2{width:500px;height:500px;background:rgba(245,197,24,0.03);right:-10%;bottom:10%;animation-duration:22s;animation-delay:-7s}
.artists-bg-orb3{width:400px;height:400px;background:rgba(79,195,247,0.03);left:40%;top:40%;animation-duration:15s;animation-delay:-3s}
@keyframes orbFloat{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(40px,-50px) scale(1.05)}50%{transform:translate(-30px,40px) scale(0.95)}75%{transform:translate(50px,30px) scale(1.03)}}
.artists-page-content{position:relative;z-index:1}

@media(max-width:900px){
  .n-links{display:none}.n-ham{display:flex}
  .hero{padding:100px 24px 40px}.hero-stats{gap:24px;flex-wrap:wrap}.hero-visual{display:none}.hero-slider{display:none}
  .sec{padding:60px 24px}.pg-c{padding:32px 24px}
  .pg-banner{padding:100px 24px 60px}
  footer.ft{padding:40px 24px}.ft-grid{grid-template-columns:1fr}
  .fm-row{flex-direction:column;gap:0}
  .tr-row{grid-template-columns:40px 1fr 1fr}
  .art-grid{padding:0 24px 60px;gap:12px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
  .art-hero{padding:100px 24px 24px}.art-big{letter-spacing:-1px}.art-name{font-size:14px}
  .ap-grid{grid-template-columns:1fr}.ap-hero-c{padding:32px 24px}.ap-body{padding:32px 24px}.ap-stats-bar{padding:20px 24px;gap:20px;flex-wrap:wrap}
  .about-stats{grid-template-columns:1fr 1fr}.about-stat{border-bottom:1px solid var(--border)}
  .tribute-card-wrapper{padding:0 24px 24px}
}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
`;

// ─── NAV ───
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const loc = useLocation();
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const links = [
    { to: "/", label: "Accueil" }, { to: "/a-propos", label: "À propos" }, { to: "/artistes", label: "Artistes" },
    { to: "/distribution-musique", label: "Distribution" }, { to: "/studio-enregistrement", label: "Studio" },
    { to: "/booking-artistes", label: "Booking" }, { to: "/services", label: "Services" }, { to: "/contact", label: "Contact" },
  ];
  return (
    <>
      <nav className={`n ${scrolled ? "s" : ""}`}>
        <Link to="/" className="n-logo">
          {/* Logo image — remplacez /logo.png par votre vrai fichier logo */}
          <img src="/logo.png" alt="Sterkte Records" className="n-logo-img" onError={(e) => { e.target.style.display = "none"; }} />
          <span className="n-logo-t"><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></span>
        </Link>
        <ul className="n-links">{links.map((l) => <li key={l.to}><Link to={l.to} className={loc.pathname === l.to ? "ac" : ""}>{l.label}</Link></li>)}</ul>
        <div className="n-acts">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="btn btn-o btn-sm"><Icon.Shield size={12} />Admin</Link>}
              <Link to="/dashboard" className="btn btn-g btn-sm">Dashboard</Link>
              <button className="btn btn-o btn-sm" onClick={signOut}>Déconnexion</button>
            </>
          ) : (<Link to="/connexion" className="btn btn-r btn-sm">Espace Artiste</Link>)}
          <button className="n-ham" onClick={() => setMobOpen(true)}><span /><span /><span /></button>
        </div>
      </nav>
      {mobOpen && (
        <div className="mob">
          <button className="mob-close" onClick={() => setMobOpen(false)}>✕</button>
          {links.map((l) => <Link key={l.to} to={l.to} className={loc.pathname === l.to ? "ac" : ""} onClick={() => setMobOpen(false)}>{l.label}</Link>)}
          <Link to={user ? "/dashboard" : "/connexion"} onClick={() => setMobOpen(false)} style={{ color: C.gold, marginTop: 16 }}>{user ? "Dashboard" : "Connexion"}</Link>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="ft"><div className="ft-grid">
      <div className="ft-brand">
        <img src="/logo.png" alt="Sterkte Records" style={{ height: 32, marginBottom: 12 }} onError={(e) => { e.target.style.display = "none"; }} />
        <Link to="/" className="n-logo-t" style={{ fontSize: 22 }}><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></Link>
        <p>Label musical indépendant dédié à l'essor des talents musicaux africains. Basé à Lubumbashi, RDC.</p>
      </div>
      <div><h5>Services</h5><ul><li><Link to="/distribution-musique">Distribution</Link></li><li><Link to="/studio-enregistrement">Studio</Link></li><li><Link to="/booking-artistes">Booking</Link></li><li><Link to="/featurings">Featurings</Link></li><li><Link to="/services">Consulting</Link></li></ul></div>
      <div><h5>Label</h5><ul><li><Link to="/a-propos">À propos</Link></li><li><Link to="/artistes">Nos artistes</Link></li><li><Link to="/contact">Contact</Link></li></ul></div>
      <div><h5>Contact</h5><ul><li>contact.sterkterecords@gmail.com</li><li>+243 850 510 209</li><li>Lubumbashi, RDC</li><li style={{ marginTop: 8 }}><a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: C.blue }}>Linktree ↗</a></li></ul></div>
    </div><div className="ft-bottom">© 2025 Sterkte Records SARL — Tous droits réservés</div></footer>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── HERO SLIDER ARTISTIQUE ───
function HeroSlider() {
  const slides = [
    { label: "Distribution mondiale", color: C.gold },
    { label: "Studio professionnel", color: C.red },
    { label: "Booking & Management", color: C.blue },
  ];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-slider">
      <div className="hero-grain" />
      {/* Fond vivant avec dégradés animés au lieu d'images pour garantir l'affichage */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 60% 40%, ${slides[cur].color}18 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(10,10,15,0.8) 0%, transparent 80%), linear-gradient(135deg, #0d0d14 0%, #1a1a25 100%)`, transition: "background 1.2s ease" }} />
      {/* Éléments décoratifs musicaux */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 40 }, (_, i) => {
          const h = 20 + Math.sin(i * 0.7) * 60 + Math.cos(i * 0.3) * 40;
          return <rect key={i} x={i * 15} y={400 - h / 2} width="10" height={h} rx="5" fill={i % 4 === 0 ? C.gold : i % 3 === 0 ? C.red : "rgba(255,255,255,0.3)"} style={{ animation: `wvPulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${(i * 0.07) % 2}s` }} />;
        })}
      </svg>
      {/* Disque vinyle flottant */}
      <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", width: 200, height: 200, borderRadius: "50%", background: "conic-gradient(from 0deg, #1a1a25, #12121a, #1a1a25, #0d0d14)", border: `2px solid ${slides[cur].color}30`, animation: "spin 15s linear infinite", opacity: 0.5 }}>
        <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", background: `radial-gradient(circle, ${slides[cur].color}40, transparent)`, border: `1px solid ${slides[cur].color}30` }} />
      </div>
      {/* Label actuel */}
      <div className="hero-slide-label">{slides[cur].label}</div>
      {/* Overlay fondu vers la gauche */}
      <div className="hero-slide-overlay" />
      {/* Navigation dots */}
      <div className="hero-slider-nav">
        {slides.map((_, i) => <div key={i} className={`hero-slider-dot ${i === cur ? "ac" : ""}`} onClick={() => setCur(i)} />)}
      </div>
      {/* Flèches */}
      <div className="hero-slider-arrows">
        <button className="hero-slider-btn" onClick={() => setCur((c) => (c - 1 + slides.length) % slides.length)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
        <button className="hero-slider-btn" onClick={() => setCur((c) => (c + 1) % slides.length)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── HOME ───
function HomePage() {
  useSEO("/");
  useScrollReveal();
  const { artists } = useArtists();
  const testimonials = useTestimonials();
  const platforms = ["SPOTIFY", "APPLE MUSIC", "DEEZER", "YOUTUBE MUSIC", "TIDAL", "AMAZON MUSIC", "AUDIOMACK", "BOOMPLAY"];

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.15,pointerEvents:"none",zIndex:0}} viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {Array.from({length:12},(_,i)=>(
            <path key={i} d={`M0,${180+i*38} C360,${140+i*38} 720,${220+i*38} 1080,${180+i*38} C1260,${160+i*38} 1380,${200+i*38} 1440,${190+i*38}`} stroke="#F5C518" strokeWidth="0.8" fill="none" opacity={0.55-i*0.03}/>
          ))}
        </svg>
        <div className="hero-c">
          <div className="hero-badge"><div className="hero-badge-dot" />Label indépendant · From Lubumbashi to the World</div>
          <h1>Votre musique sur<br /><span className="gold">150+ plateformes</span><br />en quelques <span className="red">jours</span></h1>
          <p className="hero-sub">Sterkte Records accompagne les artistes africains de A à Z : distribution digitale mondiale, studio professionnel, booking et management. Nous transformons votre talent en carrière.</p>
          <div className="hero-acts">
            <Link to="/distribution-musique" className="btn btn-r btn-lg"><Icon.Music size={16} color="currentColor" />Distribuer mon titre</Link>
            <Link to="/studio-enregistrement" className="btn btn-o btn-lg"><Icon.Mic size={16} color="currentColor" />Réserver le studio</Link>
          </div>
          <div className="hero-stats">{[{v:"150+",l:"Plateformes"},{v:`${artists.length||10}+`,l:"Artistes"},{v:"1M+",l:"Streams"},{v:"20+",l:"Pays"}].map((s)=><div key={s.l}><div className="stat-v">{s.v}</div><div className="stat-l">{s.l}</div></div>)}</div>
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
        title='Qui sommes-<span style="color:#F5C518">nous</span>&nbsp;?'
        subtitle="Sterkte Records est né en 2021 de la passion pour la musique authentique et de la volonté d'accompagner les artistes africains vers le monde entier. Depuis notre création à Lubumbashi, nous avons grandi pour devenir un acteur incontournable de la distribution musicale indépendante en Afrique centrale et dans la diaspora, avec une présence croissante au Maroc et en Europe."
      />
      <div className="pg-c">

        {/* Qui sommes-nous — texte enrichi */}
        <div style={{ marginBottom: 60 }}>
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
        <div className="about-stats">
          {[{ v: "2021", l: "Année de création" }, { v: "150+", l: "Plateformes" }, { v: "1M+", l: "Streams générés" }, { v: "+30", l: "Pays atteints" }].map((s) => (
            <div key={s.l} className="about-stat"><div className="about-stat-v">{s.v}</div><div className="about-stat-l">{s.l}</div></div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 60 }}>
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
        <div className="about-values">
          {[
            { Ico: Icon.Diamond, title: "Intégrité", desc: "Honnêteté totale sur les chiffres, les contrats et les décisions. Pas de zones grises." },
            { Ico: Icon.Star, title: "Excellence", desc: "Production de qualité internationale, quel que soit le budget ou le niveau de l'artiste." },
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
        <div className="about-timeline">
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
        <div className="team-grid">{team.map((m) => <div key={m.name} className="team"><div className="team-av">{m.i}</div><h4>{m.name}</h4><div className="role">{m.role}</div><p>{m.desc}</p></div>)}</div>

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
    </>
  );
}

// ─── ARTISTS PAGE ───
function ArtistsPage() {
  useSEO("/artistes");
  useScrollReveal();
  const { artists, loading } = useArtists();
  const [filter, setFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const nav = useNavigate();

  const djMinhoArtist = { id: "minho-tribute", name: "DJ Minho", tags: ["DJ"], image_url: `https://aaanvxwmhvddncarrgpn.supabase.co/storage/v1/object/public/avatars/DJ%20MINHO.jpg`, tribute: true };
  const allArtists = artists.some(a => a.name.toLowerCase().includes("minho")) ? artists : [djMinhoArtist, ...artists];

  const filtered = allArtists.filter((a) => (filter === "Tout" || (a.tags || []).includes(filter)) && a.name.toLowerCase().includes(search.toLowerCase()));
  const nonTribute = filtered.filter(a => !a.tribute);
  const tribute = filtered.filter(a => a.tribute);
  const visible = showAll ? nonTribute : nonTribute.slice(0, 8);

  const handleArtistClick = (a) => {
    if (a.tribute) {
      nav(`/artiste/dj-minho`, { state: { artist: a } });
      return;
    }
    const slug = a.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    nav(`/artiste/${slug}`, { state: { artist: a } });
  };

  return (
    <div className="pg" style={{ position: "relative" }}>
      {/* Fond vivant */}
      <div className="artists-bg">
        <div className="artists-bg-orb artists-bg-orb1" />
        <div className="artists-bg-orb artists-bg-orb2" />
        <div className="artists-bg-orb artists-bg-orb3" />
      </div>
      <div className="artists-page-content">
        <div className="art-hero">
          <h1 className="art-big">ARTISTES</h1>
          <div className="art-filters">{ARTIST_GENRES.map((g) => <button key={g} className={`art-tag ${filter === g ? "ac" : ""}`} onClick={() => { setFilter(g); setShowAll(false); }}>{g}</button>)}</div>
          <div className="art-search"><span className="art-search-ico"><Icon.Search size={16} color={C.muted} /></span><input placeholder="Rechercher un artiste..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        {loading ? <div className="loading-box">Chargement...</div> : (
          <>
            {/* Carte DJ Minho — Hommage */}
            {tribute.length > 0 && (
              <div className="tribute-card-wrapper">
                {tribute.map(a => (
                  <div key={a.id} className="tribute-card-inner" onClick={() => handleArtistClick(a)}>
                    <div className="tribute-bg" />
                    {/* Étoiles flottantes */}
                    <div className="tribute-particles">
                      {Array.from({length:12},(_,i)=>(
                        <div key={i} className="tribute-star" style={{ left: `${10 + i * 8}%`, top: `${20 + (i % 4) * 20}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${3 + (i % 3)}s` }} />
                      ))}
                    </div>
                    <img src={a.image_url} alt="DJ Minho" className="tribute-img" />
                    <div className="tribute-overlay" />
                    <div className="tribute-content">
                      <div className="tribute-badge">
                        <Icon.Heart size={10} color={C.gold} />
                        <span>En mémoire</span>
                      </div>
                      <div className="tribute-name">DJ Minho</div>
                      <div className="tribute-dates">18/11/2000 – 01/02/2025</div>
                      <div className="tribute-quote">« La musique ne meurt jamais, elle vit dans chaque âme qu'elle a touchée. »</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grille artistes normaux */}
            {filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>Aucun artiste trouvé.</div> : (
              <>
                <div className="art-grid">
                  {visible.map((a) => (
                    <div key={a.id} className="art-card" onClick={() => handleArtistClick(a)}>
                      <img src={a.image_url} alt={`${a.name} – artiste chez Sterkte Records`} loading="lazy" />
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

// ─── ARTIST DETAIL PAGE ───
function ArtistDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { artists } = useArtists();

  const artistFromState = location.state?.artist;
  const artistFromList = artists.find((a) => {
    const s = a.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return s === slug;
  });
  const artist = artistFromState || artistFromList || (slug === "dj-minho" ? { id: "minho-tribute", name: "DJ Minho", tags: ["DJ"], image_url: `https://aaanvxwmhvddncarrgpn.supabase.co/storage/v1/object/public/avatars/DJ%20MINHO.jpg` } : null);

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
  const isTribute = detail.tribute;

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
          {/* Bouton retour amélioré */}
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

          {isTribute && <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, color: "rgba(245,197,24,0.7)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Décédé le {detail.tributeDate}</div>}

          <div className="ap-hero-socials">
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Instagram size={16} /></a>}
            {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Twitter size={16} /></a>}
            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Youtube size={16} /></a>}
            {socials.spotify && <a href={socials.spotify} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Spotify size={16} /></a>}
          </div>
          <div className="ap-hero-acts">
            {socials.spotify && <a href={socials.spotify} target="_blank" rel="noreferrer" className="btn btn-g btn-lg"><Icon.Play size={14} color="#000" />Écouter sur Spotify</a>}
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
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, textAlign: "justify" }}>Toute l'équipe de Sterkte Records s'incline avec profond respect devant la mémoire de DJ Minho, artiste exceptionnel et ami précieux, qui nous a quittés le 1er février 2025. Son talent, son énergie et sa générosité resteront à jamais gravés dans nos cœurs et dans la musique qu'il nous a laissée.</p>
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
                <div key={s.title} className="ap-track">
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
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Instagram size={16} color="currentColor" />Instagram</a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Twitter size={16} color="currentColor" />Twitter / X</a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Youtube size={16} color="currentColor" />YouTube</a>}
                  {socials.spotify && <a href={socials.spotify} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Spotify size={16} color="currentColor" />Spotify</a>}
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

// ─── DISTRIBUTION ───
function DistributionPage({ toast }) {
  useSEO("/distribution-musique");
  const { user } = useAuth();
  return (
    <div className="pg">
      <PageBanner tag="Distribution" title='Distribuez votre musique sur <span style="color:#F5C518">150+ plateformes</span>' subtitle="De Spotify à Boomplay, nous mettons votre musique partout où vos fans écoutent." accent={C.gold} />
      <div className="pg-c">
        <div className="steps" style={{ marginBottom: 48 }}>{[
          { n: "1", t: "Créez votre compte artiste", d: "Inscription gratuite en 2 minutes. Recevez un code de confirmation par WhatsApp pour valider votre compte." },
          { n: "2", t: "Uploadez vos morceaux", d: "Fichiers audio (WAV ou MP3) + visuel de couverture obligatoirement en 3000x3000px." },
          { n: "3", t: "Renseignez les métadonnées", d: "Titre, auteurs, producteur, beatmaker, genre, date de sortie (minimum 8 jours à l'avance)." },
          { n: "4", t: "Validation et mise en ligne", d: "Notre équipe valide sous 48h et distribue sur 150+ plateformes. Vous recevez une confirmation par e-mail." },
        ].map((s) => <div key={s.n} className="step"><div className="step-n">{s.n}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}</div>
        <div className="feats">{[
          { Ico: Icon.BarChart, title: "Chiffres actualisés mensuellement", desc: "Suivez vos streams et revenus depuis votre dashboard. Les statistiques sont actualisées chaque 31 du mois." },
          { Ico: Icon.Diamond, title: "Revenus transparents", desc: "Rapport mensuel détaillé. Paiement par virement ou Mobile Money." },
          { Ico: Icon.Globe, title: "150+ plateformes", desc: "Spotify, Apple Music, Deezer, YouTube Music, Tidal, Boomplay, Audiomack et bien plus." },
          { Ico: Icon.Zap, title: "Distribution en 48h", desc: "Validation et envoi aux plateformes en 48h maximum après soumission." },
        ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}</div>
        <div style={{ marginTop: 40 }}><Link to={user ? "/dashboard" : "/connexion"} className="btn btn-g btn-lg"><Icon.ArrowRight size={16} />{user ? "Accéder au dashboard" : "Créer un compte pour distribuer"}</Link></div>
      </div>
    </div>
  );
}

// ─── STUDIO ───
function StudioPage({ toast }) {
  useSEO("/studio-enregistrement");
  const { user } = useAuth();
  const [form, setForm] = useState({ type: "sur-place", date: "", duration: "2", address: "", name: "", email: "", phone: "", service: "enregistrement", message: "" });
  const [sending, setSending] = useState(false);

  const prices = { "enregistrement": 40, "mix": 80, "mobile": 65 };
  const price = prices[form.service] ? prices[form.service] * parseInt(form.duration) : 0;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date || !form.service) { toast("Nom, email, service et date sont requis.", "err"); return; }
    setSending(true);
    const { error } = await supabase.from("studio_bookings").insert({
      user_id: user?.id || null, name: form.name, email: form.email,
      studio_type: form.service, duration_hours: parseInt(form.duration),
      booking_date: form.date || null, address: form.address, message: form.message, estimated_price: price,
    });
    await sendEmail({ ...form, subject: `Réservation Studio – ${form.service} – ${form.duration}h`, prix_estime: `${price}$` });
    const waMsg = `Nouvelle réservation studio – ${form.service} – ${form.name} – ${form.date} – ${form.duration}h – ${form.email}`;
    sendWhatsApp(waMsg);
    toast(error ? "Erreur. Réessayez." : "Demande de réservation envoyée ! Confirmation sous 24h.", error ? "err" : "ok");
    setSending(false);
  };

  return (
    <div className="pg">
      <PageBanner tag="Studio" title='Votre son, notre <span style="color:#F5C518">expertise</span>' subtitle="Studios professionnels à Lubumbashi + studios mobiles à Lubumbashi, au Maroc et ailleurs. Enregistrement, mixage et mastering de qualité internationale." accent={C.blue} />
      <div className="pg-c">
        {/* Description */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 48 }}>
          <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginBottom: 16, textAlign: "justify" }}>
            Sterkte Records dispose d'un studio professionnel physique à <strong style={{ color: C.white }}>Lubumbashi, RDC</strong>, équipé du meilleur matériel pour vous offrir un son de qualité internationale. Nos ingénieurs du son expérimentés maîtrisent toutes les techniques d'enregistrement pour révéler le meilleur de votre voix et de votre création.
          </p>
          <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, textAlign: "justify" }}>
            En plus du studio fixe, nous proposons des <strong style={{ color: C.white }}>studios mobiles</strong> opérationnels à <strong style={{ color: C.white }}>Lubumbashi</strong>, à <strong style={{ color: C.white }}>Agadir (Maroc)</strong> et dans d'autres villes, vous permettant d'enregistrer directement là où vous vous trouvez. Un son professionnel, sans bouger.
          </p>
        </div>

        <div className="pricing">{[
          { title: "Enregistrement", p: "40$", u: "/heure", key: "enregistrement", items: ["Studio professionnel", "Ingénieur son dédié", "Export WAV/MP3", "Coaching vocal inclus"], ft: false },
          { title: "Mix & Mastering", p: "80$", u: "/heure", key: "mix", items: ["Mix professionnel", "Mastering haute qualité", "2 révisions incluses", "Export multi-formats"], ft: true },
          { title: "Studio Mobile", p: "65$", u: "/heure", key: "mobile", items: ["Déplacement inclus", "Matériel professionnel", "Enregistrement sur site", "Lubumbashi, Agadir & +"], ft: false },
        ].map((p) => <div key={p.title} className={`price-card ${p.ft ? "ft" : ""}`}><h4>{p.title}</h4><div className="price-val">{p.p}<span> {p.u}</span></div><ul>{p.items.map((it) => <li key={it}><span className="chk"><Icon.Check size={14} color={C.gold} /></span>{it}</li>)}</ul></div>)}</div>

        <div className="feats" style={{ marginBottom: 48 }}>{[
          { Ico: Icon.Mic, title: "Enregistrement vocal", desc: "Voix, instruments, overdubs. Cabine isolée phoniquement pour une captation parfaite." },
          { Ico: Icon.Headphones, title: "Mix & Mastering", desc: "Équilibrage, spatialisation et finalisation de votre titre pour toutes les plateformes." },
          { Ico: Icon.Music, title: "Production musicale", desc: "Création de beats, arrangements, production complète de votre morceau." },
          { Ico: Icon.Film, title: "Réalisation de clips", desc: "Production vidéo professionnelle pour accompagner votre sortie musicale." },
        ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}</div>

        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Réserver une <span className="gold">session</span></h3>
        <div className="fm">
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Votre nom *</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="fm-g"><label className="fm-l">Téléphone *</label><input className="fm-i" type="tel" placeholder="+243 XXX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="fm-row">
            <div className="fm-g"><label className="fm-l">Service *</label><select className="fm-s" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}><option value="enregistrement">Enregistrement – 40$/h</option><option value="mix">Mix & Mastering – 80$/h</option><option value="mobile">Studio Mobile – 65$/h</option></select></div>
            <div className="fm-g"><label className="fm-l">Durée</label><select className="fm-s" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>{[1, 2, 3, 4, 5, 6, 8].map((h) => <option key={h} value={h}>{h}h</option>)}</select></div>
          </div>
          <div className="fm-g"><label className="fm-l">Date souhaitée *</label><input className="fm-i" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          {form.service === "mobile" && <div className="fm-g"><label className="fm-l">Adresse *</label><input className="fm-i" placeholder="Adresse complète" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>}
          <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" placeholder="Précisions sur votre projet..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.muted, fontSize: 13 }}>Estimation totale</span><span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 24, color: C.gold }}>{price}$</span></div>
          <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Envoyer la demande"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING ───
function BookingPage({ toast }) {
  useSEO("/booking-artistes");
  const { artists } = useArtists();
  const [tab, setTab] = useState("artiste");
  const [form, setForm] = useState({ name: "", email: "", artist: "", event: "", date: "", budget: "", lieu: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast("Nom et email requis.", "err"); return; }
    setSending(true);
    await supabase.from("booking_requests").insert({ name: form.name, email: form.email, request_type: tab, artist_name: form.artist, event_type: form.event, event_date: form.date || null, budget: form.budget, location: form.lieu, message: form.message });
    await sendEmail({ ...form, subject: `Booking ${tab} – ${form.event}` });
    toast("Demande envoyée ! Réponse sous 72h.", "ok");
    setForm({ name: "", email: "", artist: "", event: "", date: "", budget: "", lieu: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <PageBanner tag="Booking" title='Réservez vos <span style="color:#F5C518">événements</span>' subtitle="Réservez nos artistes pour concerts, festivals et événements. Réponse sous 72h." accent={C.red} />
      <div className="pg-c">
        <div className="tabs"><button className={`tab ${tab === "artiste" ? "ac" : ""}`} onClick={() => setTab("artiste")}>Réserver un artiste</button><button className={`tab ${tab === "lieu" ? "ac" : ""}`} onClick={() => setTab("lieu")}>Réserver un lieu</button></div>
        <div className="fm">
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Nom *</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
          {tab === "artiste" && <div className="fm-g"><label className="fm-l">Artiste</label><select className="fm-s" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}><option value="">Sélectionner</option>{artists.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}<option value="autre">Autre</option></select></div>}
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Type d'événement</label><select className="fm-s" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}><option value="">Sélectionner</option><option value="concert">Concert</option><option value="festival">Festival</option><option value="showcase">Showcase</option><option value="prive">Privé</option><option value="corporate">Corporate</option></select></div><div className="fm-g"><label className="fm-l">Date</label><input className="fm-i" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div></div>
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Budget</label><input className="fm-i" placeholder="ex: 5000$" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Lieu</label><input className="fm-i" placeholder="Ville, pays" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} /></div></div>
          <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" placeholder="Détails..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-r btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Envoyer"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURING ───
function FeaturingPage({ toast }) {
  useSEO("/featurings");
  const { artists } = useArtists();
  const [form, setForm] = useState({ name: "", email: "", artist: "", project: "", deadline: "", link: "", message: "" });
  const [sending, setSending] = useState(false);
  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast("Nom et email requis.", "err"); return; }
    setSending(true);
    await supabase.from("featuring_requests").insert({ name: form.name, email: form.email, artist_name: form.artist, project_name: form.project, deadline: form.deadline || null, project_link: form.link, message: form.message });
    await sendEmail({ ...form, subject: `Featuring – ${form.artist} – ${form.project}` });
    toast("Demande envoyée ! Réponse sous 7 jours.", "ok");
    setForm({ name: "", email: "", artist: "", project: "", deadline: "", link: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <PageBanner tag="Featurings" title='Collaborez avec nos <span style="color:#F5C518">artistes</span>' subtitle="Processus simple, réponse sous 7 jours ouvrés." accent={C.blue} />
      <div className="pg-c">
        <div className="steps" style={{ marginBottom: 48 }}>{[
          { n: "1", t: "Remplissez le formulaire", d: "Précisez l'artiste, le projet et les délais." },
          { n: "2", t: "Analyse sous 7 jours", d: "Notre équipe évalue la compatibilité artistique." },
          { n: "3", t: "Coordination et production", d: "Collaboration coordonnée jusqu'à la finalisation." },
        ].map((s) => <div key={s.n} className="step"><div className="step-n">{s.n}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Demande de <span className="gold">featuring</span></h3>
        <div className="fm">
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Nom *</label><input className="fm-i" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
          <div className="fm-g"><label className="fm-l">Artiste</label><select className="fm-s" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}><option value="">Sélectionner</option>{artists.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}</select></div>
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Projet</label><input className="fm-i" placeholder="Nom du morceau" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Deadline</label><input className="fm-i" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div></div>
          <div className="fm-g"><label className="fm-l">Lien projet</label><input className="fm-i" placeholder="SoundCloud, Drive..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
          <div className="fm-g"><label className="fm-l">Description</label><textarea className="fm-t" placeholder="Style, vision..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Soumettre"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONSULTING ───
function ConsultingPage() {
  useSEO("/services");
  const handleContact = () => {
    const msg = "Bonjour Sterkte Records, je souhaite en savoir plus sur vos services de consulting et management artistique.";
    sendWhatsApp(msg);
    window.open(`mailto:${WHATSAPP_EMAIL}?subject=Consulting%20%26%20Management%20Artistique&body=${encodeURIComponent(msg)}`, "_blank");
  };
  return (
    <div className="pg">
      <PageBanner tag="Consulting & Management" title='Accompagnement <span style="color:#F5C518">stratégique</span>' subtitle="Des services adaptés à vos besoins artistiques et commerciaux." accent={C.gold} />
      <div className="pg-c">
        <div className="feats">{[
          { Ico: Icon.Rocket, title: "Stratégie de lancement", desc: "Plan de promotion digitale personnalisé pour maximiser l'impact de vos sorties musicales sur tous les marchés cibles." },
          { Ico: Icon.Clipboard, title: "Gestion de carrière", desc: "Négociation de contrats, planification stratégique long terme et développement de partenariats commerciaux." },
          { Ico: Icon.Layers, title: "Développement de marque", desc: "Coaching artistique, image de marque cohérente et identité visuelle forte pour vous démarquer." },
          { Ico: Icon.TrendingUp, title: "Analyse de données", desc: "Optimisation des revenus et des streams grâce à une lecture fine de vos statistiques et des tendances du marché." },
          { Ico: Icon.Map, title: "Organisation de tournées", desc: "Planification logistique complète de vos tournées nationales et internationales." },
          { Ico: Icon.Film, title: "Production visuelle", desc: "Clips vidéo, photos professionnelles, pochettes d'album et contenu pour les réseaux sociaux." },
        ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}</div>
        <div style={{ marginTop: 48, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="btn btn-r btn-lg" onClick={handleContact}><Icon.Whatsapp size={16} />Prendre contact sur WhatsApp</button>
          <a href={`mailto:${WHATSAPP_EMAIL}?subject=Consulting%20Artistique`} className="btn btn-o btn-lg"><Icon.Mail size={16} />Envoyer un e-mail</a>
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
    if (!form.name || !form.email || !form.message) { toast("Tous les champs sont requis.", "err"); return; }
    setSending(true);
    await supabase.from("contact_messages").insert({ name: form.name, email: form.email, subject: form.subject, message: form.message });
    await sendEmail({ ...form, subject: `Contact – ${form.subject || "Message"}` });
    // Envoi aussi vers WhatsApp
    sendWhatsApp(`Nouveau message de ${form.name} – ${form.email} : ${form.message}`);
    toast("Message envoyé !", "ok");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };
  return (
    <div className="pg">
      <PageBanner tag="Contact" title='Contactez-<span style="color:#F5C518">nous</span>' subtitle="Notre équipe répond sous 48 heures." />
      <div className="pg-c">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div className="fm">
            <div className="fm-row"><div className="fm-g"><label className="fm-l">Nom *</label><input className="fm-i" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
            <div className="fm-g"><label className="fm-l">Sujet</label><select className="fm-s" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Sélectionner</option><option value="Distribution">Distribution</option><option value="Studio">Studio</option><option value="Booking">Booking</option><option value="Featuring">Featuring</option><option value="Consulting">Consulting</option><option value="Autre">Autre</option></select></div>
            <div className="fm-g"><label className="fm-l">Message *</label><textarea className="fm-t" placeholder="Votre message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <button className="btn btn-g btn-lg" onClick={handleSubmit} disabled={sending}>{sending ? "Envoi..." : "Envoyer"}</button>
          </div>
          <div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informations</h4>
              {[
                { Ico: Icon.Mail, l: "Email", v: "contact.sterkterecords@gmail.com", c: C.blue },
                { Ico: Icon.Phone, l: "Téléphone", v: "+243 850 510 209", c: C.white },
                { Ico: Icon.MapPin, l: "Adresse", v: "Avenue Mama Yemo, Lubumbashi, RDC", c: C.white },
              ].map((c) => <div key={c.l} style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(245,197,24,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, flexShrink: 0 }}><c.Ico size={16} color="currentColor" /></div><div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, marginBottom: 4 }}>{c.l}</div><div style={{ fontSize: 14, color: c.c }}>{c.v}</div></div></div>)}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Icon.Link2 size={16} color={C.blue} />Tous nos réseaux</a>
                <button className="btn btn-g btn-sm" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={() => sendWhatsApp("Bonjour Sterkte Records, je souhaite vous contacter.")}>
                  <Icon.Whatsapp size={14} />WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ───
function LoginPage() {
  const { signUp, signIn } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", pseudo: "", email: "", password: "", genre: "", whatsapp: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const nav = useNavigate();

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Email et mot de passe requis."); return; }
    if (isReg && (!form.name || !form.pseudo)) { setError("Nom et nom d'artiste requis."); return; }
    if (isReg && !form.whatsapp) { setError("Numéro WhatsApp actif requis."); return; }
    if (form.password.length < 6) { setError("Mot de passe : 6 caractères minimum."); return; }
    setSending(true);
    if (isReg) {
      const { error: err } = await signUp(form.email, form.password, { full_name: form.name, artist_name: form.pseudo, genre: form.genre, whatsapp: form.whatsapp });
      if (err) { setError(err.message); setSending(false); return; }
      // Notifier l'équipe
      await sendEmail({ name: form.name, pseudo: form.pseudo, email: form.email, whatsapp: form.whatsapp, genre: form.genre, subject: `Nouvelle inscription artiste – ${form.pseudo}` });
      sendWhatsApp(`Nouvelle inscription artiste sur Sterkte Records : ${form.pseudo} (${form.name}) – ${form.email} – WhatsApp: ${form.whatsapp}`);
      setSuccess("Compte créé ! Bienvenue chez Sterkte Records 🎵 Vérifiez votre email pour confirmer votre compte.");
      setSending(false);
      setTimeout(() => nav("/dashboard"), 2000);
    } else {
      const { error: err } = await signIn(form.email, form.password);
      if (err) { setError("Email ou mot de passe incorrect."); setSending(false); return; }
      nav("/dashboard");
    }
    setSending(false);
  };

  return (
    <div className="login-pg">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="Sterkte Records" style={{ height: 40, marginBottom: 8 }} onError={(e) => { e.target.style.display = "none"; }} />
          <span className="n-logo-t" style={{ fontSize: 22, display: "block" }}><span style={{ color: C.white }}>Sterkte</span> <span style={{ color: C.red }}>Records</span></span>
        </div>
        <h2>{isReg ? "Créer un compte" : "Connexion"}</h2>
        <p className="sub">{isReg ? "Rejoignez le label" : "Accédez à votre espace artiste"}</p>

        {error && <div className="fm-err" style={{ textAlign: "center", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon.AlertCircle size={14} color={C.red} />{error}</div>}
        {success && <div style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.success, textAlign: "center" }}>{success}</div>}

        {isReg && <>
          <div className="fm-g"><label className="fm-l">Nom complet *</label><input className="fm-i" placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="fm-g"><label className="fm-l">Nom d'artiste *</label><input className="fm-i" placeholder="Nom de scène" value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} /></div>
        </>}
        <div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="fm-g" style={{ position: "relative" }}>
          <label className="fm-l">Mot de passe *</label>
          <input className="fm-i fm-i-pwd" type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="fm-eye" onClick={() => setShowPwd(v => !v)}>{showPwd ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}</button>
        </div>
        {isReg && <>
          <div className="fm-g"><label className="fm-l">Numéro WhatsApp actif *</label><input className="fm-i" type="tel" placeholder="+243 XXX XXX XXX" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /><div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Vous recevrez un code de confirmation sur ce numéro</div></div>
          <div className="fm-g"><label className="fm-l">Genre musical</label>
            <select className="fm-s" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}>
              <option value="">Sélectionner</option>
              {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </>}
        <button className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleSubmit} disabled={sending}>{sending ? "Chargement..." : isReg ? "Créer mon compte" : "Se connecter"}</button>
        <div style={{ textAlign: "center", marginTop: 20 }}><span style={{ fontSize: 13, color: C.muted }}>{isReg ? "Déjà un compte ? " : "Pas de compte ? "}</span><span style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => { setIsReg(!isReg); setError(""); setSuccess(""); }}>{isReg ? "Se connecter" : "S'inscrire"}</span></div>
        {!isReg && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
            <Link to="/" style={{ fontSize: 13, color: C.muted, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.ArrowLeft size={12} />Retour à l'accueil</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───
function DashboardPage({ toast }) {
  const { user, profile } = useAuth();
  const { tracks, stats, loading, refetch } = useTracks();
  const nav = useNavigate();
  const [dashTab, setDashTab] = useState("overview");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverError, setCoverError] = useState("");
  const [uploadForm, setUploadForm] = useState({ title: "", genre: "", date: "", contributors: "", producer: "", beatmaker: "", editors: "" });
  const [sending, setSending] = useState(false);
  const audioRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => { if (!user) nav("/connexion"); }, [user, nav]);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverError("");
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 3000 || img.height < 3000) {
        setCoverError(`Image trop petite (${img.width}x${img.height}px). Minimum requis : 3000x3000px.`);
        setCoverFile(null); setCoverPreview(null);
      } else {
        setCoverFile(file);
        const r = new FileReader(); r.onload = (ev) => setCoverPreview(ev.target.result); r.readAsDataURL(file);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["wav", "mp3"].includes(ext)) { toast("Format audio invalide. Acceptés : WAV, MP3.", "err"); return; }
    setAudioFile(file);
  };

  const handleUpload = async () => {
    if (!uploadForm.title) { toast("Titre requis.", "err"); return; }
    if (!audioFile) { toast("Fichier audio requis.", "err"); return; }
    if (!coverFile) { toast("Couverture 3000x3000px requise.", "err"); return; }

    // Vérification date : minimum 8 jours
    if (uploadForm.date) {
      const releaseDate = new Date(uploadForm.date);
      const minDate = new Date(); minDate.setDate(minDate.getDate() + 8);
      if (releaseDate < minDate) {
        toast("La date de sortie doit être au minimum 8 jours à partir d'aujourd'hui.", "err"); return;
      }
    } else { toast("Date de sortie requise.", "err"); return; }

    setSending(true);
    let audioUrl = null, coverUrl = null;
    if (audioFile) { audioUrl = await uploadFile("audio", audioFile, user.id); if (!audioUrl) { toast("Erreur upload audio.", "err"); setSending(false); return; } }
    if (coverFile) { coverUrl = await uploadFile("covers", coverFile, user.id); }

    const { error } = await supabase.from("tracks").insert({
      user_id: user.id, title: uploadForm.title, genre: uploadForm.genre,
      release_date: uploadForm.date || null, contributors: uploadForm.contributors,
      producer: uploadForm.producer || "STERKTE RECORDS sous licence de " + (uploadForm.producer || "l'artiste"),
      beatmaker: uploadForm.beatmaker, editors: uploadForm.editors,
      audio_url: audioUrl, cover_url: coverUrl, status: "pending",
    });
    if (error) { toast("Erreur. Réessayez.", "err"); } else {
      // Email de confirmation artiste
      await sendEmail({
        name: profile?.artist_name || "Artiste",
        email: user.email,
        subject: `✅ Distribution confirmée – ${uploadForm.title} | Sterkte Records`,
        titre: uploadForm.title, genre: uploadForm.genre, date_sortie: uploadForm.date,
        producteur: uploadForm.producer || "STERKTE RECORDS",
        beatmaker: uploadForm.beatmaker, contributeurs: uploadForm.contributors,
        message: `Bonjour ${profile?.artist_name || "Artiste"},\n\nVotre titre "${uploadForm.title}" a bien été soumis pour distribution. Notre équipe le validera sous 48h et le distribuera sur 150+ plateformes. Vous recevrez une confirmation dès qu'il sera en ligne.\n\nBienvenue dans la famille Sterkte Records 🎵`
      });
      // Notif équipe
      await sendEmail({
        name: "Site Web", email: WHATSAPP_EMAIL,
        subject: `Nouveau titre soumis – ${uploadForm.title} par ${profile?.artist_name}`,
        titre: uploadForm.title, artiste: profile?.artist_name || user.email, genre: uploadForm.genre, date_sortie: uploadForm.date
      });
      toast("Titre soumis ! Confirmation envoyée par email. Validation sous 48h.", "ok");
      setAudioFile(null); setCoverFile(null); setCoverPreview(null);
      setUploadForm({ title: "", genre: "", date: "", contributors: "", producer: "", beatmaker: "", editors: "" });
      refetch();
    }
    setSending(false);
  };

  if (!user) return null;

  // Calcul date minimum pour sortie
  const today = new Date(); today.setDate(today.getDate() + 8);
  const minDate = today.toISOString().split("T")[0];

  return (
    <div className="pg">
      <div style={{ padding: "100px 60px 40px", background: "linear-gradient(180deg,rgba(230,57,70,.05) 0%,transparent 100%)" }}>
        <div className="sec-tag">Dashboard Artiste</div>
        <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: -2 }}>Bienvenue, <span className="gold">{profile?.artist_name || "Artiste"}</span></h1>
        <p style={{ color: C.muted, marginTop: 8 }}>Suivez vos performances et distribuez votre musique.</p>
      </div>
      <div className="pg-c">
        <div className="tabs">
          <button className={`tab ${dashTab === "overview" ? "ac" : ""}`} onClick={() => setDashTab("overview")}>Vue d'ensemble</button>
          <button className={`tab ${dashTab === "upload" ? "ac" : ""}`} onClick={() => setDashTab("upload")}>Distribuer un titre</button>
          <button className={`tab ${dashTab === "tracks" ? "ac" : ""}`} onClick={() => setDashTab("tracks")}>Mes titres</button>
        </div>

        {dashTab === "overview" && <>
          <div className="dash-grid">
            <div className="dash-stat">
              <div className="dash-stat-l">Streams totaux</div>
              <div className="dash-stat-v" style={{ color: C.gold }}>{stats.totalStreams.toLocaleString()}</div>
              <div className="dash-stat-note">Actualisé chaque 31 du mois</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-l">Revenus totaux</div>
              <div className="dash-stat-v" style={{ color: C.success }}>${stats.totalRevenue}</div>
              <div className="dash-stat-note">Actualisé chaque 31 du mois</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-l">Titres distribués</div>
              <div className="dash-stat-v" style={{ color: C.blue }}>{stats.count}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-l">Plateformes actives</div>
              <div className="dash-stat-v">{stats.platforms > 0 ? "+20" : "0"}</div>
            </div>
          </div>
          {loading ? <div className="loading-box">Chargement...</div> : tracks.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
              <p style={{ fontSize: 16, marginBottom: 20 }}>Aucun titre distribué pour l'instant.</p>
              <button className="btn btn-g btn-lg" onClick={() => setDashTab("upload")}>Distribuer mon premier titre</button>
            </div>
          ) : (
            <div className="dash-tracks">
              <div className="dash-tracks-h"><h3>Mes titres</h3></div>
              {tracks.slice(0, 5).map((t, i) => (
                <div key={t.id} className="tr-row">
                  <div className="tr-num">{i + 1}</div>
                  <div className="tr-title">{t.title}</div>
                  <div className="tr-info">{(t.streams || 0).toLocaleString()} streams</div>
                  <div className="tr-info">${parseFloat(t.revenue || 0).toFixed(2)}</div>
                  <div className={`tr-status ${t.status}`}>
                    <span className="tr-dot" style={{ background: t.status === "live" ? C.success : t.status === "pending" ? C.gold : C.red }} />
                    {t.status === "live" ? "En ligne" : t.status === "pending" ? "En attente" : "Rejeté"}
                  </div>
                </div>
              ))}
              {tracks.some(t => t.status === "rejected") && (
                <div style={{ padding: "12px 24px", background: "rgba(230,57,70,0.05)", borderTop: `1px solid rgba(230,57,70,0.1)`, display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon.AlertCircle size={14} color={C.red} />
                  <span style={{ fontSize: 13, color: C.red }}>Un ou plusieurs titres ont été refusés. Contactez-nous pour plus d'informations.</span>
                </div>
              )}
            </div>
          )}
        </>}

        {dashTab === "upload" && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Distribuer un <span className="gold">nouveau titre</span></h3>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Uploadez votre morceau et le visuel. Validation sous 48h. Vous recevrez un email de confirmation.</p>

            {/* Audio */}
            <div className={`upload ${audioFile ? "has-file" : ""}`} onClick={() => audioRef.current?.click()}>
              <div className="upload-ico"><Icon.Upload size={40} color={audioFile ? C.success : C.muted} /></div>
              <h4>{audioFile ? audioFile.name : "Cliquez pour ajouter le fichier audio *"}</h4>
              <p>{audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : "WAV ou MP3 uniquement"}</p>
              <input ref={audioRef} type="file" accept=".wav,.mp3" style={{ display: "none" }} onChange={handleAudioSelect} />
            </div>

            {/* Cover */}
            <div className={`upload ${coverFile ? "has-file" : coverError ? "" : ""}`} onClick={() => coverRef.current?.click()} style={{ padding: coverPreview ? 24 : 48, borderColor: coverError ? C.red : undefined }}>
              {coverPreview
                ? <div style={{ display: "flex", alignItems: "center", gap: 20 }}><img src={coverPreview} alt="Cover" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} /><div style={{ textAlign: "left" }}><h4 style={{ marginBottom: 4 }}>{coverFile.name}</h4><p>{(coverFile.size / 1024 / 1024).toFixed(1)} MB</p></div></div>
                : <><div className="upload-ico"><Icon.Image size={40} color={coverError ? C.red : C.muted} /></div><h4>Couverture obligatoire *</h4><p>PNG ou JPG — Minimum 3000x3000px (obligatoire)</p></>}
              <input ref={coverRef} type="file" accept=".png,.jpg,.jpeg,image/*" style={{ display: "none" }} onChange={handleCoverSelect} />
            </div>
            {coverError && <div className="fm-err" style={{ marginTop: -16, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Icon.AlertCircle size={12} />{coverError}</div>}

            <div className="fm">
              <div className="fm-g"><label className="fm-l">Titre *</label><input className="fm-i" placeholder="Nom du titre" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
              <div className="fm-row">
                <div className="fm-g"><label className="fm-l">Genre *</label>
                  <select className="fm-s" value={uploadForm.genre} onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="fm-g">
                  <label className="fm-l">Date de sortie * <span style={{ color: C.muted, fontSize: 10 }}>(min. 8 jours)</span></label>
                  <input className="fm-i" type="date" min={minDate} value={uploadForm.date} onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })} />
                </div>
              </div>
              <div className="fm-g"><label className="fm-l">Producteur <span style={{ color: C.muted, fontSize: 10 }}>(défaut: Sterkte Records)</span></label><input className="fm-i" placeholder="STERKTE RECORDS sous licence de…" value={uploadForm.producer} onChange={(e) => setUploadForm({ ...uploadForm, producer: e.target.value })} /></div>
              <div className="fm-g"><label className="fm-l">Beatmaker</label><input className="fm-i" placeholder="Nom du beatmaker" value={uploadForm.beatmaker} onChange={(e) => setUploadForm({ ...uploadForm, beatmaker: e.target.value })} /></div>
              <div className="fm-g"><label className="fm-l">Éditeurs</label><input className="fm-i" placeholder="Noms des éditeurs" value={uploadForm.editors} onChange={(e) => setUploadForm({ ...uploadForm, editors: e.target.value })} /></div>
              <div className="fm-g"><label className="fm-l">Contributeurs</label><input className="fm-i" placeholder="Noms séparés par virgules" value={uploadForm.contributors} onChange={(e) => setUploadForm({ ...uploadForm, contributors: e.target.value })} /></div>
              <button className="btn btn-g btn-lg" style={{ marginTop: 16 }} onClick={handleUpload} disabled={sending}>{sending ? "Upload en cours..." : "Soumettre pour distribution"}</button>
            </div>
          </div>
        )}

        {dashTab === "tracks" && (
          loading ? <div className="loading-box">Chargement...</div> :
          <div className="dash-tracks">
            <div className="dash-tracks-h"><h3>Tous mes titres ({tracks.length})</h3><button className="btn btn-g btn-sm" onClick={() => setDashTab("upload")}>+ Nouveau</button></div>
            {tracks.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Aucun titre.</div> :
            tracks.map((t, i) => (
              <div key={t.id} className="tr-row">
                <div className="tr-num">{i + 1}</div>
                <div className="tr-title">{t.title}</div>
                <div className="tr-info">{(t.streams || 0).toLocaleString()} streams</div>
                <div className="tr-info">${parseFloat(t.revenue || 0).toFixed(2)}</div>
                <div className={`tr-status ${t.status}`}>
                  <span className="tr-dot" style={{ background: t.status === "live" ? C.success : t.status === "pending" ? C.gold : C.red }} />
                  {t.status === "live" ? "En ligne" : t.status === "pending" ? "En attente" : "Rejeté"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ───
function AdminPage({ toast }) {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("tracks");
  const [tracks, setTracks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState({ totalArtists: 0, totalTracks: 0, pendingTracks: 0, totalStreams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { nav("/connexion"); return; }
    if (!isAdmin) { nav("/dashboard"); return; }
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    const { data: t } = await supabase.from("tracks").select("*, profiles(artist_name, full_name)").order("created_at", { ascending: false });
    const { data: p } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setTracks(t || []);
    setProfiles(p || []);
    const totalStreams = (t || []).reduce((s, tr) => s + (tr.streams || 0), 0);
    setStats({ totalArtists: (p || []).length, totalTracks: (t || []).length, pendingTracks: (t || []).filter(tr => tr.status === "pending").length, totalStreams });
    setLoading(false);
  };

  const updateTrackStatus = async (id, status, artistEmail, trackTitle) => {
    await supabase.from("tracks").update({ status }).eq("id", id);
    if (status === "rejected") {
      await sendEmail({ name: "Artiste", email: artistEmail, subject: `❌ Titre refusé – ${trackTitle} | Sterkte Records`, message: `Votre titre "${trackTitle}" a malheureusement été refusé. Notre équipe a examiné votre soumission et elle ne répond pas à nos critères actuels. Contactez-nous pour plus d'informations.` });
    } else if (status === "live") {
      await sendEmail({ name: "Artiste", email: artistEmail, subject: `✅ Titre approuvé et en ligne – ${trackTitle} | Sterkte Records`, message: `Félicitations ! Votre titre "${trackTitle}" est maintenant disponible sur toutes les plateformes. Bonne diffusion !` });
    }
    toast(`Statut mis à jour : ${status}`, "ok");
    loadData();
  };

  if (!isAdmin) return null;

  return (
    <div className="pg">
      <div style={{ padding: "100px 60px 40px", background: "linear-gradient(180deg,rgba(245,197,24,.05) 0%,transparent 100%)" }}>
        <div className="sec-tag" style={{ color: C.gold, display: "flex", alignItems: "center", gap: 8 }}><Icon.Shield size={14} />Dashboard Admin</div>
        <h1 style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: -2 }}>Gestion <span className="gold">Sterkte Records</span></h1>
        <p style={{ color: C.muted, marginTop: 8 }}>Espace réservé à l'équipe Sterkte Records.</p>
      </div>
      <div className="pg-c">
        {/* Stats globales */}
        <div className="admin-grid" style={{ marginBottom: 32 }}>
          {[
            { l: "Artistes inscrits", v: stats.totalArtists, c: C.blue },
            { l: "Titres soumis", v: stats.totalTracks, c: C.gold },
            { l: "En attente", v: stats.pendingTracks, c: C.red },
            { l: "Streams totaux", v: stats.totalStreams.toLocaleString(), c: C.success },
          ].map(s => (
            <div key={s.l} className="dash-stat"><div className="dash-stat-l">{s.l}</div><div className="dash-stat-v" style={{ color: s.c }}>{s.v}</div></div>
          ))}
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "tracks" ? "ac" : ""}`} onClick={() => setTab("tracks")}>Titres soumis</button>
          <button className={`tab ${tab === "artists" ? "ac" : ""}`} onClick={() => setTab("artists")}>Artistes inscrits</button>
        </div>

        {loading ? <div className="loading-box">Chargement...</div> : (
          <>
            {tab === "tracks" && (
              <div className="dash-tracks">
                <div className="dash-tracks-h"><h3>Tous les titres ({tracks.length})</h3></div>
                {tracks.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Aucun titre.</div> :
                tracks.map((t) => (
                  <div key={t.id} className="admin-row">
                    <div className={`admin-badge ${t.status}`}>{t.status === "live" ? "En ligne" : t.status === "pending" ? "En attente" : "Rejeté"}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{t.profiles?.artist_name || "—"} · {t.genre}</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>{t.release_date || "—"}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{(t.streams || 0).toLocaleString()} streams</div>
                    <div style={{ fontSize: 13, color: C.muted }}>Posté : {new Date(t.created_at).toLocaleDateString("fr-FR")}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {t.status !== "live" && <button className="admin-action approve" onClick={() => updateTrackStatus(t.id, "live", t.user_id, t.title)}>Approuver</button>}
                      {t.status !== "rejected" && <button className="admin-action reject" onClick={() => updateTrackStatus(t.id, "rejected", t.user_id, t.title)}>Refuser</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "artists" && (
              <div className="dash-tracks">
                <div className="dash-tracks-h"><h3>Artistes inscrits ({profiles.length})</h3></div>
                {profiles.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Aucun artiste.</div> :
                profiles.map((p) => (
                  <div key={p.id} className="admin-reg-row">
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.red}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 14, color: "#000", flexShrink: 0 }}>{(p.artist_name || "?")[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.artist_name || "—"}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{p.full_name || "—"}</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted }}>{p.genre || "—"}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{p.whatsapp || "—"}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Inscrit : {new Date(p.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── PROTECTED ROUTE ───
function ProtectedRoute({ children, toast }) {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;
  if (!user) return <LoginPage />;
  return children;
}

// ─── ADMIN PROTECTED ROUTE ───
function AdminProtectedRoute({ children, toast }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;
  if (!user) return <LoginPage />;
  if (!isAdmin) return (
    <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, minHeight: "80vh" }}>
      <Icon.Shield size={48} color={C.red} />
      <h2 style={{ color: C.white }}>Accès restreint</h2>
      <p style={{ color: C.muted }}>Cette page est réservée à l'équipe Sterkte Records.</p>
      <Link to="/" className="btn btn-g">Retour à l'accueil</Link>
    </div>
  );
  return children;
}

// ─── MAIN APP ───
export default function App() {
  const [toastData, setToastData] = useState(null);
  const loc = useLocation();
  const showToast = (msg, type = "ok") => setToastData({ msg, type });
  const isLogin = loc.pathname === "/connexion";

  return (
    <AuthProvider>
      <div className="app">
        <style>{css}</style>
        <ScrollToTop />
        {!isLogin && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/artistes" element={<ArtistsPage />} />
          <Route path="/artiste/:slug" element={<ArtistDetailPage />} />
          <Route path="/distribution-musique" element={<DistributionPage toast={showToast} />} />
          <Route path="/studio-enregistrement" element={<StudioPage toast={showToast} />} />
          <Route path="/booking-artistes" element={<BookingPage toast={showToast} />} />
          <Route path="/featurings" element={<FeaturingPage toast={showToast} />} />
          <Route path="/services" element={<ConsultingPage />} />
          <Route path="/contact" element={<ContactPage toast={showToast} />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute toast={showToast}><DashboardPage toast={showToast} /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminProtectedRoute toast={showToast}><AdminPage toast={showToast} /></AdminProtectedRoute>} />
        </Routes>
        {!isLogin && <Footer />}
        {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}
      </div>
    </AuthProvider>
  );
}
