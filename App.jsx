import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "./supabase.js";

// ─── CONFIG ───
const EMAIL_CONFIG = {
  ACCESS_KEY: import.meta.env.VITE_WEB3FORMS_KEY || "REMPLACER_PAR_VOTRE_CLE",
  ENDPOINT: "https://api.web3forms.com/submit",
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
  "/a-propos": { title: "À propos de Sterkte Records – Label passionné et innovant", desc: "Découvrez l'histoire, la vision et l'équipe de Sterkte Records, label indépendant fondé en 2020 à Lubumbashi pour accompagner les artistes africains." },
  "/artistes": { title: "Nos artistes – Roster Sterkte Records", desc: "Découvrez les talents signés chez Sterkte Records : afrobeat, rap, R&B, rumba, gospel, amapiano." },
  "/distribution-musique": { title: "Distribution musicale digitale – Sterkte Records", desc: "Distribuez votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes." },
  "/studio-enregistrement": { title: "Studio d'enregistrement professionnel – Sterkte Records Lubumbashi", desc: "Enregistrement, mixage et mastering professionnel à Lubumbashi. À partir de 50$/heure." },
  "/booking-artistes": { title: "Booking artistes & événements – Sterkte Records", desc: "Réservez nos artistes pour concerts, festivals, événements privés et corporate." },
  "/featurings": { title: "Demande de featuring – Collaboration musicale Sterkte Records", desc: "Collaborez avec les artistes Sterkte Records. Réponse sous 7 jours ouvrés." },
  "/services": { title: "Consulting & Management artistique – Sterkte Records", desc: "Stratégie de lancement, gestion de carrière, coaching artistique." },
  "/contact": { title: "Contact – Sterkte Records, Lubumbashi RDC", desc: "Contactez Sterkte Records. Email : contact.sterkterecords@gmail.com | +243 850 510 209" },
};

const ARTIST_GENRES = ["Tout", "Afrobeat", "Rap", "R&B", "Rumba", "Gospel", "Amapiano", "DJ"];

// ─── ICONES SVG (remplace tous les emojis) ───
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
};

const SERVICES_LIST = [
  { Icon: Icon.Music, title: "Distribution Digitale", desc: "Votre musique sur Spotify, Apple Music, Deezer et 150+ plateformes en quelques jours.", link: "/distribution-musique" },
  { Icon: Icon.Mic, title: "Studio d'Enregistrement", desc: "Studio professionnel à Lubumbashi + option mobile. Enregistrement, mixage et mastering.", link: "/studio-enregistrement" },
  { Icon: Icon.Calendar, title: "Booking & Événements", desc: "Réservez nos artistes pour concerts, festivals et événements privés.", link: "/booking-artistes" },
  { Icon: Icon.Handshake, title: "Featurings", desc: "Collaborez avec les artistes du roster. Processus simple, réponse sous 7 jours.", link: "/featurings" },
  { Icon: Icon.BarChart, title: "Consulting & Management", desc: "Stratégie de lancement, gestion de carrière et coaching artistique personnalisé.", link: "/services" },
  { Icon: Icon.User, title: "Espace Artiste", desc: "Dashboard personnel : suivez vos streams, revenus et gérez vos sorties.", link: "/dashboard" },
];

// ─── MOCK ARTIST DATA (à personnaliser) ───
const MOCK_ARTISTS_DETAIL = {
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
    socials: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
      spotify: "https://open.spotify.com",
    },
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
      await supabase.from("profiles").update({ genre: meta.genre }).eq("id", data.user.id);
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, fetchProfile }}>
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
    const liveCount = t.filter((tr) => tr.status === "live").length;
    setStats({ totalStreams, totalRevenue: totalRevenue.toFixed(2), count: t.length, platforms: liveCount > 0 ? 12 : 0 });
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

async function uploadFile(bucket, file, folder) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return null;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── PAGE BANNER COMPONENT (dégradé vers fond) ───
function PageBanner({ tag, title, subtitle, accent = C.red }) {
  return (
    <div className="pg-banner">
      <div className="pg-banner-bg" style={{ background: `radial-gradient(ellipse at 30% 50%, ${accent}14 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, ${C.gold}08 0%, transparent 50%)` }} />
      {/* Lignes décoratives SVG */}
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
      {/* Dégradé vers le fond en bas */}
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

/* Bannière héro côté droit : onde sonore animée SVG */
.hero-visual{position:absolute;right:0;top:0;bottom:0;width:50%;z-index:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.hero-wave-wrap{position:relative;width:100%;height:100%}
.hero-wave-svg{position:absolute;inset:0;width:100%;height:100%}
.wv{transform-origin:center;animation:wvPulse 3s ease-in-out infinite}
.wv:nth-child(1){animation-delay:0s}
.wv:nth-child(2){animation-delay:.4s}
.wv:nth-child(3){animation-delay:.8s}
.wv:nth-child(4){animation-delay:1.2s}
.wv:nth-child(5){animation-delay:1.6s}
@keyframes wvPulse{0%,100%{opacity:.08;transform:scaleY(.9)}50%{opacity:.25;transform:scaleY(1)}}

/* Disque vinyle décoratif */
.hero-vinyl{position:absolute;right:8%;top:50%;transform:translateY(-50%);width:320px;height:320px;border-radius:50%;background:conic-gradient(from 0deg,#1a1a25,#12121a,#1a1a25,#0d0d14,#1a1a25);border:2px solid rgba(245,197,24,.15);animation:spin 20s linear infinite;opacity:.35}
.hero-vinyl::after{content:'';position:absolute;inset:30%;border-radius:50%;background:radial-gradient(circle,rgba(245,197,24,.3),transparent);border:1px solid rgba(245,197,24,.2)}
@keyframes spin{from{transform:translateY(-50%) rotate(0deg)}to{transform:translateY(-50%) rotate(360deg)}}

/* Cercles lumineux */
.hero-orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none}
.hero-orb1{width:400px;height:400px;right:-100px;top:10%;background:rgba(230,57,70,.06)}
.hero-orb2{width:300px;height:300px;right:20%;bottom:10%;background:rgba(245,197,24,.05)}

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

/* ── PAGE BANNER (sous-pages) ── */
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
.ap-back{display:inline-flex;align-items:center;gap:8px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;color:var(--muted);letter-spacing:1px;text-transform:uppercase;transition:color .3s;margin-bottom:32px;cursor:pointer}
.ap-back:hover{color:var(--white)}
.ap-back svg{transition:transform .3s}
.ap-back:hover svg{transform:translateX(-3px)}

/* ── LEGACY PG (autres pages) ── */
.pg{padding-top:72px;min-height:100vh}
.pg-c{padding:60px;max-width:1200px;margin:0 auto}
.fm{max-width:640px}.fm-row{display:flex;gap:16px;margin-bottom:16px}.fm-row>*{flex:1}
.fm-g{margin-bottom:16px}
.fm-l{display:block;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
.fm-i,.fm-s,.fm-t{width:100%;padding:12px 16px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'Raleway',sans-serif;font-size:14px;transition:border-color .3s;outline:none}
.fm-i:focus,.fm-s:focus,.fm-t:focus{border-color:var(--gold)}
.fm-t{min-height:120px;resize:vertical}.fm-s{appearance:none;cursor:pointer}
.fm-err{color:var(--red);font-size:12px;margin-top:4px;font-family:'Montserrat',sans-serif}
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
.login-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:48px;max-width:420px;width:100%}
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

/* About page extras */
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
.about-tl-item p{font-size:13px;color:var(--muted);line-height:1.6}

/* Bannière section dégradée */
.sec-banner{padding:80px 60px;position:relative;overflow:hidden}
.sec-banner-fade-top{position:absolute;top:0;left:0;right:0;height:60px;background:linear-gradient(var(--bg),transparent);z-index:1}
.sec-banner-fade-bot{position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(transparent,var(--bg));z-index:1}
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
@media(max-width:900px){
  .n-links{display:none}.n-ham{display:flex}
  .hero{padding:100px 24px 40px}.hero-stats{gap:24px;flex-wrap:wrap}.hero-visual{display:none}
  .sec{padding:60px 24px}.pg-c{padding:32px 24px}
  .pg-banner{padding:100px 24px 60px}
  footer.ft{padding:40px 24px}.ft-grid{grid-template-columns:1fr}
  .fm-row{flex-direction:column;gap:0}
  .tr-row{grid-template-columns:40px 1fr 1fr}
  .art-grid{padding:0 24px 60px;gap:12px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
  .art-hero{padding:100px 24px 24px}.art-big{letter-spacing:-1px}.art-name{font-size:14px}
  .ap-grid{grid-template-columns:1fr}.ap-hero-c{padding:32px 24px}.ap-body{padding:32px 24px}.ap-stats-bar{padding:20px 24px;gap:20px;flex-wrap:wrap}
  .about-stats{grid-template-columns:1fr 1fr}.about-stat{border-bottom:1px solid var(--border)}
  .sec-banner{padding:60px 24px}
}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
`;

// ─── NAV ───
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const { user, signOut } = useAuth();
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
        <Link to="/" className="n-logo"><span className="n-dot" /><span className="n-logo-t"><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></span></Link>
        <ul className="n-links">{links.map((l) => <li key={l.to}><Link to={l.to} className={loc.pathname === l.to ? "ac" : ""}>{l.label}</Link></li>)}</ul>
        <div className="n-acts">
          {user ? (<><Link to="/dashboard" className="btn btn-g btn-sm">Dashboard</Link><button className="btn btn-o btn-sm" onClick={signOut}>Déconnexion</button></>) : (<Link to="/connexion" className="btn btn-r btn-sm">Espace Artiste</Link>)}
          <button className="n-ham" onClick={() => setMobOpen(true)}><span /><span /><span /></button>
        </div>
      </nav>
      {mobOpen && <div className="mob"><button className="mob-close" onClick={() => setMobOpen(false)}>✕</button>{links.map((l) => <Link key={l.to} to={l.to} className={loc.pathname === l.to ? "ac" : ""} onClick={() => setMobOpen(false)}>{l.label}</Link>)}<Link to={user ? "/dashboard" : "/connexion"} onClick={() => setMobOpen(false)} style={{ color: C.gold, marginTop: 16 }}>{user ? "Dashboard" : "Connexion"}</Link></div>}
    </>
  );
}

function Footer() {
  return (
    <footer className="ft"><div className="ft-grid">
      <div className="ft-brand"><Link to="/" className="n-logo-t" style={{ fontSize: 22 }}><span style={{ color: C.white }}>Sterkte </span><span style={{ color: C.red }}>Records</span></Link><p>Label musical indépendant dédié à l'essor des talents musicaux. Basé à Lubumbashi, RDC.</p></div>
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

// ─── HOME ───
function HomePage() {
  useSEO("/");
  const { artists } = useArtists();
  const testimonials = useTestimonials();
  const platforms = ["SPOTIFY", "APPLE MUSIC", "DEEZER", "YOUTUBE MUSIC", "TIDAL", "AMAZON MUSIC", "AUDIOMACK", "BOOMPLAY"];

  // Barres d'onde sonore pour la bannière
  const bars = Array.from({ length: 60 }, (_, i) => ({
    x: 60 + i * 18,
    h: 30 + Math.sin(i * 0.45) * 25 + Math.cos(i * 0.2) * 20 + Math.random() * 20,
  }));

  return (
    <>
      {/* ── HERO BANNIÈRE ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        {/* Visuel droit : onde + vinyle */}
        <div className="hero-visual">
          <div className="hero-orb hero-orb1" />
          <div className="hero-orb hero-orb2" />
          <div className="hero-vinyl" />
          <svg className="hero-wave-svg" viewBox="0 0 1100 700" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {bars.map((b, i) => (
              <rect key={i} className="wv" x={b.x} y={350 - b.h / 2} width="8" height={b.h} rx="4"
                fill={i % 5 === 0 ? C.gold : i % 3 === 0 ? C.red : "rgba(255,255,255,0.12)"}
                style={{ animationDelay: `${(i * 0.05) % 2}s` }} />
            ))}
          </svg>
        </div>

        <div className="hero-c">
          <div className="hero-badge"><div className="hero-badge-dot" />Label indépendant · From Lubumbashi to the World</div>
          <h1>Votre musique sur<br /><span className="gold">150+ plateformes</span><br />en quelques <span className="red">jours</span></h1>
          <p className="hero-sub">Sterkte Records accompagne les artistes africains de A à Z : distribution digitale mondiale, studio professionnel, booking et management. Nous transformons votre talent en carrière.</p>
          <div className="hero-acts">
            <Link to="/distribution-musique" className="btn btn-r btn-lg"><Icon.Music size={16} color="currentColor" />Distribuer mon titre</Link>
            <Link to="/studio-enregistrement" className="btn btn-o btn-lg"><Icon.Mic size={16} color="currentColor" />Réserver le studio</Link>
          </div>
          <div className="hero-stats">{[{ v: "150+", l: "Plateformes" }, { v: `${artists.length || 10}+`, l: "Artistes" }, { v: "1M+", l: "Streams" }, { v: "15+", l: "Pays" }].map((s) => <div key={s.l}><div className="stat-v">{s.v}</div><div className="stat-l">{s.l}</div></div>)}</div>
        </div>
      </section>

      {/* Marquee plateformes */}
      <div className="marquee"><div className="marquee-in">{[...platforms, ...platforms].map((p, i) => <div key={i} className="mq-item"><span className="mq-dot" />{p}</div>)}</div></div>

      {/* Services */}
      <section className="sec">
        <div className="sec-h">
          <div className="sec-tag">Nos services</div>
          <h2 className="sec-title">Tout pour lancer et développer votre carrière</h2>
          <p className="sec-desc">De la première maquette au concert sold-out, Sterkte Records vous fournit les outils et le réseau pour réussir.</p>
        </div>
        <div className="srv-grid">{SERVICES_LIST.map((s) => <Link key={s.title} to={s.link} className="srv"><div className="srv-ico"><s.Icon size={24} /></div><h3>{s.title}</h3><p>{s.desc}</p><div className="srv-arr"><Icon.ArrowRight size={18} /></div></Link>)}</div>
      </section>

      {/* Pourquoi nous */}
      <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sec-h"><div className="sec-tag">Pourquoi nous choisir</div><h2 className="sec-title">Ce qui nous différencie</h2></div>
        <div className="why-grid">{[
          { Ico: Icon.Diamond, title: "Transparence totale", desc: "Accès en temps réel à vos statistiques et revenus. Pas de frais cachés." },
          { Ico: Icon.Globe, title: "Expertise Afrique + International", desc: "Basés en RDC avec un réseau en Europe et en Afrique." },
          { Ico: Icon.Handshake, title: "Accompagnement humain", desc: "Chaque artiste a un interlocuteur dédié qui connaît son projet." },
          { Ico: Icon.Zap, title: "Rapidité d'exécution", desc: "Distribution en 48h, réponses sous 72h, rapports mensuels." },
          { Ico: Icon.Target, title: "Stratégie personnalisée", desc: "Un plan adapté à votre style, marché cible et objectifs." },
          { Ico: Icon.TrendingUp, title: "Résultats mesurables", desc: "Streams multipliés par 3 en moyenne sur 6 mois." },
        ].map((w) => <div key={w.title} className="why"><div className="why-ico"><w.Ico size={24} /></div><h4>{w.title}</h4><p>{w.desc}</p></div>)}</div>
      </section>

      {/* Roster aperçu */}
      <section className="sec">
        <div className="sec-h"><div className="sec-tag">Roster</div><h2 className="sec-title">Ils nous font confiance</h2></div>
        <div className="art-grid" style={{ padding: 0 }}>{artists.slice(0, 6).map((a) => <div key={a.id} className="art-card"><img src={a.image_url} alt={`${a.name} – artiste chez Sterkte Records`} loading="lazy" /><div className="art-ov"><div className="art-name">{a.name}</div><div className="art-genre">{(a.tags || []).join(" · ")}</div></div></div>)}</div>
        <div style={{ textAlign: "center", marginTop: 40 }}><Link to="/artistes" className="btn btn-o btn-lg"><Icon.ArrowRight size={16} />Voir tous les artistes</Link></div>
      </section>

      {/* Témoignages */}
      {testimonials.length > 0 && <section className="sec" style={{ background: "rgba(18,18,26,0.6)" }}>
        <div className="sec-h"><div className="sec-tag">Témoignages</div><h2 className="sec-title">Ce que disent nos artistes</h2></div>
        <div className="testi-grid">{testimonials.map((t) => <div key={t.id} className="testi"><p>{t.text}</p><div className="testi-author">{t.name}</div><div className="testi-role">{t.role}</div></div>)}</div>
      </section>}

      {/* CTA final */}
      <section className="sec" style={{ textAlign: "center" }}>
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
  const team = [
    { i: "AK", name: "Axel l'or Kaumba", role: "Fondateur & Distribution digitale", desc: "Visionnaire et entrepreneur passionné, Axel a fondé Sterkte Records avec la conviction profonde que la musique africaine mérite une scène mondiale. Expert en marketing digital, il orchestre les stratégies de distribution et guide chaque artiste vers la réussite." },
    { i: "AA", name: "Abigail Angelani", role: "Directrice Marketing & Communication", desc: "Maîtresse des récits qui résonnent, Abigail construit l'image du label et de ses artistes sur tous les canaux digitaux. Ses campagnes créatives ont permis à plusieurs artistes de percer au-delà des frontières africaines." },
    { i: "DN", name: "Diadème Ngandu", role: "Manager Artistique", desc: "Coach, stratège et confident des artistes, Diadème est le pilier humain du label. Son approche sur-mesure permet à chaque talent de s'épanouir artistiquement tout en construisant une carrière durable et cohérente." },
  ];
  return (
    <div className="pg">
      <PageBanner
        tag="À propos"
        title='Qui sommes-<span style="color:#F5C518">nous</span>&nbsp;?'
        subtitle="Sterkte Records est né en 2020 de la passion pour la musique authentique et de la volonté d'accompagner les artistes africains vers le monde entier."
      />
      <div className="pg-c">

        {/* Stats chiffres */}
        <div className="about-stats">
          {[{ v: "2020", l: "Année de création" }, { v: "150+", l: "Plateformes" }, { v: "1M+", l: "Streams générés" }, { v: "15+", l: "Pays atteints" }].map((s) => (
            <div key={s.l} className="about-stat"><div className="about-stat-v">{s.v}</div><div className="about-stat-l">{s.l}</div></div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 60 }}>
          <div>
            <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Notre vision</h3>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15 }}>Créer un pont solide entre la créativité débordante des artistes africains et un public mondial avide de sons nouveaux. Nous croyons que la musique de Lubumbashi, de Kinshasa, de tout le continent, a le potentiel de toucher des millions d'âmes à travers le monde.</p>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginTop: 16 }}>Notre ambition : faire de Sterkte Records la référence incontournable pour tout artiste africain souhaitant bâtir une carrière internationale durable, éthique et profitable.</p>
          </div>
          <div>
            <h3 style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Notre mission</h3>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15 }}>Accompagner chaque artiste signé chez nous avec des outils professionnels, une équipe dédiée et une distribution sur plus de 150 plateformes mondiales. Nous gérons l'aspect technique, administratif et stratégique pour que l'artiste se concentre sur l'essentiel : créer.</p>
            <p style={{ color: C.muted, lineHeight: 1.85, fontSize: 15, marginTop: 16 }}>Transparence, excellence et passion sont nos trois piliers. Chaque décision que nous prenons sert d'abord les intérêts de l'artiste.</p>
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
            { year: "2020", title: "Naissance de Sterkte Records", desc: "Fondation du label à Lubumbashi par Axel l'or Kaumba, avec la signature des deux premiers artistes et l'ouverture du studio pilote." },
            { year: "2021", title: "Premiers succès en distribution", desc: "Lancement sur Spotify, Apple Music et Deezer. Les premières sorties dépassent rapidement les 50 000 streams sur des marchés africains et européens." },
            { year: "2022", title: "Expansion du roster", desc: "Le label accueille de nouveaux genres : rumba, gospel, amapiano. Le réseau s'étend à Kinshasa, Brazzaville et Abidjan." },
            { year: "2023", title: "Cap du million de streams", desc: "Le catalogue Sterkte Records franchit collectivement le million de streams. Lancement du studio mobile pour les artistes hors de Lubumbashi." },
            { year: "2024", title: "Rayonnement international", desc: "Présence sur 15+ pays, collaborations avec des labels européens et lancement de l'espace artiste digital pour un suivi en temps réel." },
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
  const { artists, loading } = useArtists();
  const [filter, setFilter] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const nav = useNavigate();
  const filtered = artists.filter((a) => (filter === "Tout" || (a.tags || []).includes(filter)) && a.name.toLowerCase().includes(search.toLowerCase()));
  const visible = showAll ? filtered : filtered.slice(0, 8);

  const handleArtistClick = (a) => {
    const slug = a.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    nav(`/artiste/${slug}`, { state: { artist: a } });
  };

  return (
    <div className="pg">
      <div className="art-hero">
        <h1 className="art-big">ARTISTES</h1>
        <div className="art-filters">{ARTIST_GENRES.map((g) => <button key={g} className={`art-tag ${filter === g ? "ac" : ""}`} onClick={() => { setFilter(g); setShowAll(false); }}>{g}</button>)}</div>
        <div className="art-search"><span className="art-search-ico"><Icon.Search size={16} color={C.muted} /></span><input placeholder="Rechercher un artiste..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>
      {loading ? <div className="loading-box">Chargement...</div> : filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px 24px", color: C.muted }}>Aucun artiste trouvé.</div> : <>
        <div className="art-grid">{visible.map((a) => (
          <div key={a.id} className="art-card" onClick={() => handleArtistClick(a)}>
            <img src={a.image_url} alt={`${a.name} – artiste chez Sterkte Records`} loading="lazy" />
            <div className="art-ov">
              <div className="art-name">{a.name}</div>
              <div className="art-genre">{(a.tags || []).join(" · ")}</div>
              <div className="art-cta"><Icon.ArrowRight size={12} />Découvrir</div>
            </div>
          </div>
        ))}</div>
        {!showAll && filtered.length > 8 && <div style={{ textAlign: "center", padding: "0 60px 80px" }}><button className="btn btn-o btn-lg" onClick={() => setShowAll(true)}>Voir plus</button></div>}
      </>}
    </div>
  );
}

// ─── ARTIST DETAIL PAGE ───
function ArtistDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const nav = useNavigate();
  const { artists } = useArtists();

  // Récupère l'artiste depuis state ou depuis la liste
  const artistFromState = location.state?.artist;
  const artistFromList = artists.find((a) => {
    const s = a.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return s === slug;
  });
  const artist = artistFromState || artistFromList;

  const detail = MOCK_ARTISTS_DETAIL[slug] || MOCK_ARTISTS_DETAIL.default;

  if (!artist && artists.length > 0) {
    return (
      <div className="pg" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, minHeight: "80vh" }}>
        <h2 style={{ color: C.muted }}>Artiste introuvable</h2>
        <Link to="/artistes" className="btn btn-g">Retour aux artistes</Link>
      </div>
    );
  }

  if (!artist) return <div className="pg"><div className="loading-box">Chargement...</div></div>;

  const socials = detail.socials;

  // Génère un placeholder visuel si pas d'image
  const imgSrc = artist.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=800&background=1A1A25&color=F5C518&bold=true&font-size=0.33`;

  return (
    <div className="ap">
      {/* HERO */}
      <div className="ap-hero">
        <div className="ap-hero-bg">
          <img src={imgSrc} alt={artist.name} className="ap-hero-img" />
          <div className="ap-hero-overlay" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 100%, rgba(245,197,24,0.06), transparent 60%)", zIndex: 1 }} />
        <div className="ap-hero-c">
          <button className="ap-back" onClick={() => nav("/artistes")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Retour aux artistes
          </button>
          <div className="ap-genre-tag"><Icon.Music size={12} />{detail.genre}</div>
          <h1 className="ap-hero-name">{artist.name}</h1>
          <div className="ap-hero-socials">
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Instagram size={16} /></a>}
            {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Twitter size={16} /></a>}
            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Youtube size={16} /></a>}
            {socials.spotify && <a href={socials.spotify} target="_blank" rel="noreferrer" className="ap-social-btn"><Icon.Spotify size={16} /></a>}
          </div>
          <div className="ap-hero-acts">
            <a href={socials.spotify || "#"} target="_blank" rel="noreferrer" className="btn btn-g btn-lg"><Icon.Play size={14} color="#000" />Écouter sur Spotify</a>
            <Link to="/booking-artistes" className="btn btn-o btn-lg"><Icon.Calendar size={14} />Réserver cet artiste</Link>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="ap-stats-bar">
        {[{ v: detail.streams, l: "Streams totaux" }, { v: detail.plateformes, l: "Plateformes" }, { v: detail.singles.length + "+", l: "Sorties" }, { v: detail.since, l: "Avec Sterkte" }].map((s) => (
          <div key={s.l} className="ap-stat"><div className="ap-stat-v">{s.v}</div><div className="ap-stat-l">{s.l}</div></div>
        ))}
      </div>

      {/* BODY */}
      <div className="ap-body">
        <div className="ap-grid">
          {/* Gauche : bio + discographie */}
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

          {/* Droite : infos sidebar */}
          <div>
            <div className="ap-sidebar-card">
              <div>
                <div className="ap-sidebar-label">Genre</div>
                <div className="ap-sidebar-value">{detail.genre}</div>
                <div className="ap-sidebar-label">Origine</div>
                <div className="ap-sidebar-value">{detail.origin}</div>
                <div className="ap-sidebar-label">Avec Sterkte Records depuis</div>
                <div className="ap-sidebar-value">{detail.since}</div>
              </div>
            </div>
            <div className="ap-sidebar-card">
              <div className="ap-bio-title" style={{ marginBottom: 16 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(artist.tags || [detail.genre]).map((t) => (
                  <span key={t} style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)", color: C.gold, fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="ap-sidebar-card">
              <div className="ap-bio-title" style={{ marginBottom: 16 }}>Réseaux sociaux</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Instagram size={16} color="currentColor" />Instagram</a>}
                {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Twitter size={16} color="currentColor" />Twitter / X</a>}
                {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Youtube size={16} color="currentColor" />YouTube</a>}
                {socials.spotify && <a href={socials.spotify} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, fontSize: 13, transition: "color .2s" }} onMouseOver={e => e.currentTarget.style.color = C.white} onMouseOut={e => e.currentTarget.style.color = C.muted}><Icon.Spotify size={16} color="currentColor" />Spotify</a>}
              </div>
            </div>
            <Link to="/featurings" className="btn btn-r btn-lg" style={{ width: "100%", justifyContent: "center" }}><Icon.Headphones size={16} />Demander un featuring</Link>
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
      <PageBanner tag="Distribution" title='Votre musique sur <span style="color:#F5C518">150+ plateformes</span>' subtitle="Distribution en 48h, suivi en temps réel, royalties chaque mois." accent={C.gold} />
      <div className="pg-c">
        <div className="steps">{[
          { n: "1", t: "Créez votre compte artiste", d: "Inscription gratuite en 2 minutes." },
          { n: "2", t: "Uploadez vos morceaux", d: "Fichiers audio (WAV, FLAC, MP3) + visuel de couverture." },
          { n: "3", t: "Renseignez les métadonnées", d: "Titre, auteurs, genre, date de sortie." },
          { n: "4", t: "Validation et mise en ligne", d: "Notre équipe valide sous 48h et distribue sur 150+ plateformes." },
        ].map((s) => <div key={s.n} className="step"><div className="step-n">{s.n}</div><div className="step-c"><h4>{s.t}</h4><p>{s.d}</p></div></div>)}</div>
        <div className="feats">{[
          { Ico: Icon.BarChart, title: "Rapports en temps réel", desc: "Suivez vos streams et revenus depuis votre dashboard." },
          { Ico: Icon.Diamond, title: "Royalties transparentes", desc: "Rapport mensuel détaillé. Paiement par virement ou Mobile Money." },
          { Ico: Icon.Globe, title: "150+ plateformes", desc: "Spotify, Apple Music, Deezer, YouTube Music, Tidal et plus." },
          { Ico: Icon.Zap, title: "Distribution en 48h", desc: "Validation et envoi aux plateformes en 48h maximum." },
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
  const [form, setForm] = useState({ type: "sur-place", date: "", duration: "2", address: "", name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const price = form.type === "mobile" ? parseInt(form.duration) * 75 : parseInt(form.duration) * 50;
  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast("Nom et email requis.", "err"); return; }
    setSending(true);
    const { error } = await supabase.from("studio_bookings").insert({
      user_id: user?.id || null, name: form.name, email: form.email,
      studio_type: form.type, duration_hours: parseInt(form.duration),
      booking_date: form.date || null, address: form.address, message: form.message, estimated_price: price,
    });
    await sendEmail({ ...form, subject: `Réservation Studio – ${form.type} – ${form.duration}h`, prix_estime: `${price}$` });
    toast(error ? "Erreur. Réessayez." : "Demande de réservation envoyée ! Confirmation sous 24h.", error ? "err" : "ok");
    setSending(false);
  };
  return (
    <div className="pg">
      <PageBanner tag="Studio" title='Votre son, notre <span style="color:#F5C518">expertise</span>' subtitle="Studio professionnel à Lubumbashi + option mobile. Enregistrement, mixage et mastering." accent={C.blue} />
      <div className="pg-c">
        <div className="pricing">{[
          { title: "Enregistrement", p: "50$", u: "/heure", items: ["Studio professionnel", "Ingénieur son dédié", "Export WAV/FLAC/MP3", "Coaching vocal inclus"], ft: false },
          { title: "Mixage & Mastering", p: "200$", u: "/titre", items: ["Mix professionnel", "Mastering haute qualité", "2 révisions incluses", "Export multi-formats"], ft: true },
          { title: "Studio Mobile", p: "75$", u: "/heure", items: ["Déplacement inclus", "Matériel professionnel", "Enregistrement sur site", "Flexibilité totale"], ft: false },
        ].map((p) => <div key={p.title} className={`price-card ${p.ft ? "ft" : ""}`}><h4>{p.title}</h4><div className="price-val">{p.p}<span> {p.u}</span></div><ul>{p.items.map((it) => <li key={it}><span className="chk"><Icon.Check size={14} color={C.gold} /></span>{it}</li>)}</ul></div>)}</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 48, marginBottom: 24 }}>Réserver une <span className="gold">session</span></h3>
        <div className="fm">
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Votre nom *</label><input className="fm-i" placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
          <div className="fm-row"><div className="fm-g"><label className="fm-l">Type</label><select className="fm-s" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="sur-place">Studio sur place</option><option value="mobile">Studio mobile</option></select></div><div className="fm-g"><label className="fm-l">Durée</label><select className="fm-s" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>{[1, 2, 3, 4, 5, 6, 8].map((h) => <option key={h} value={h}>{h}h</option>)}</select></div></div>
          <div className="fm-g"><label className="fm-l">Date souhaitée</label><input className="fm-i" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          {form.type === "mobile" && <div className="fm-g"><label className="fm-l">Adresse</label><input className="fm-i" placeholder="Adresse complète" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>}
          <div className="fm-g"><label className="fm-l">Message</label><textarea className="fm-t" placeholder="Précisions..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.muted, fontSize: 13 }}>Estimation</span><span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: 24, color: C.gold }}>{price}$</span></div>
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
  return (
    <div className="pg">
      <PageBanner tag="Consulting & Management" title='Accompagnement <span style="color:#F5C518">stratégique</span>' subtitle="Des services adaptés à vos besoins artistiques et commerciaux." accent={C.gold} />
      <div className="pg-c">
        <div className="feats">{[
          { Ico: Icon.Rocket, title: "Stratégie de lancement", desc: "Plan de promotion digitale personnalisé." },
          { Ico: Icon.Clipboard, title: "Gestion de carrière", desc: "Négociation de contrats, planification stratégique." },
          { Ico: Icon.Layers, title: "Développement de marque", desc: "Coaching artistique, image de marque." },
          { Ico: Icon.TrendingUp, title: "Analyse de données", desc: "Optimisation des revenus et des streams." },
          { Ico: Icon.Map, title: "Organisation de tournées", desc: "Planification logistique complète." },
          { Ico: Icon.Film, title: "Production visuelle", desc: "Clips vidéo, photos, pochettes." },
        ].map((f) => <div key={f.title} className="feat"><div className="feat-ico"><f.Ico size={22} /></div><h4>{f.title}</h4><p>{f.desc}</p></div>)}</div>
        <div style={{ marginTop: 48, textAlign: "center" }}><Link to="/contact" className="btn btn-r btn-lg"><Icon.Mail size={16} />Prendre contact</Link></div>
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
          <div><div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informations</h4>
            {[
              { Ico: Icon.Mail, l: "Email", v: "contact.sterkterecords@gmail.com", c: C.blue },
              { Ico: Icon.Phone, l: "Téléphone", v: "+243 850 510 209", c: C.white },
              { Ico: Icon.MapPin, l: "Adresse", v: "Avenue Mama Yemo, Lubumbashi, RDC", c: C.white },
            ].map((c) => <div key={c.l} style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(245,197,24,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, flexShrink: 0 }}><c.Ico size={16} color="currentColor" /></div><div><div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, marginBottom: 4 }}>{c.l}</div><div style={{ fontSize: 14, color: c.c }}>{c.v}</div></div></div>)}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}><a href="https://linktr.ee/sterkterecords" target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Icon.Link2 size={16} color={C.blue} />Tous nos réseaux</a></div>
          </div></div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ───
function LoginPage() {
  const { signUp, signIn } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [form, setForm] = useState({ name: "", pseudo: "", email: "", password: "", genre: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Email et mot de passe requis."); return; }
    if (isReg && (!form.name || !form.pseudo)) { setError("Nom et nom d'artiste requis."); return; }
    if (form.password.length < 6) { setError("Mot de passe : 6 caractères minimum."); return; }
    setSending(true);
    if (isReg) {
      const { error: err } = await signUp(form.email, form.password, { full_name: form.name, artist_name: form.pseudo, genre: form.genre });
      if (err) { setError(err.message); setSending(false); return; }
      nav("/dashboard");
    } else {
      const { error: err } = await signIn(form.email, form.password);
      if (err) { setError("Email ou mot de passe incorrect."); setSending(false); return; }
      nav("/dashboard");
    }
    setSending(false);
  };

  return (<div className="login-pg"><div className="login-card">
    <div style={{ textAlign: "center", marginBottom: 24 }}><span className="n-logo-t" style={{ fontSize: 22 }}><span style={{ color: C.white }}>Sterkte</span> <span style={{ color: C.red }}>Records</span></span></div>
    <h2>{isReg ? "Créer un compte" : "Connexion"}</h2>
    <p className="sub">{isReg ? "Rejoignez le label" : "Accédez à votre espace artiste"}</p>
    {error && <div className="fm-err" style={{ textAlign: "center", marginBottom: 16 }}>{error}</div>}
    {isReg && <><div className="fm-g"><label className="fm-l">Nom complet *</label><input className="fm-i" placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
    <div className="fm-g"><label className="fm-l">Nom d'artiste *</label><input className="fm-i" placeholder="Nom de scène" value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} /></div></>}
    <div className="fm-g"><label className="fm-l">Email *</label><input className="fm-i" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
    <div className="fm-g"><label className="fm-l">Mot de passe *</label><input className="fm-i" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
    {isReg && <div className="fm-g"><label className="fm-l">Genre musical</label><select className="fm-s" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}><option value="">Sélectionner</option><option value="Afrobeat">Afrobeat</option><option value="R&B">R&B</option><option value="Rap">Rap</option><option value="Rumba">Rumba</option><option value="Gospel">Gospel</option><option value="Amapiano">Amapiano</option><option value="Autre">Autre</option></select></div>}
    <button className="btn btn-g btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={handleSubmit} disabled={sending}>{sending ? "Chargement..." : isReg ? "Créer mon compte" : "Se connecter"}</button>
    <div style={{ textAlign: "center", marginTop: 20 }}><span style={{ fontSize: 13, color: C.muted }}>{isReg ? "Déjà un compte ? " : "Pas de compte ? "}</span><span style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => { setIsReg(!isReg); setError(""); }}>{isReg ? "Se connecter" : "S'inscrire"}</span></div>
  </div></div>);
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
  const [uploadForm, setUploadForm] = useState({ title: "", genre: "", date: "", contributors: "" });
  const [sending, setSending] = useState(false);
  const audioRef = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => { if (!user) nav("/connexion"); }, [user, nav]);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); const r = new FileReader(); r.onload = (ev) => setCoverPreview(ev.target.result); r.readAsDataURL(file); }
  };

  const handleUpload = async () => {
    if (!uploadForm.title) { toast("Titre requis.", "err"); return; }
    setSending(true);
    let audioUrl = null, coverUrl = null;
    if (audioFile) { audioUrl = await uploadFile("audio", audioFile, user.id); if (!audioUrl) { toast("Erreur upload audio.", "err"); setSending(false); return; } }
    if (coverFile) { coverUrl = await uploadFile("covers", coverFile, user.id); }
    const { error } = await supabase.from("tracks").insert({
      user_id: user.id, title: uploadForm.title, genre: uploadForm.genre,
      release_date: uploadForm.date || null, contributors: uploadForm.contributors,
      audio_url: audioUrl, cover_url: coverUrl, status: "pending",
    });
    if (error) { toast("Erreur. Réessayez.", "err"); } else {
      await sendEmail({ name: profile?.artist_name || "Artiste", subject: `Distribution – ${uploadForm.title}`, titre: uploadForm.title, genre: uploadForm.genre, date_sortie: uploadForm.date, contributeurs: uploadForm.contributors, fichier_audio: audioFile?.name || "—", visuel: coverFile?.name || "—" });
      toast("Titre soumis ! Confirmation sous 48h.", "ok");
      setAudioFile(null); setCoverFile(null); setCoverPreview(null); setUploadForm({ title: "", genre: "", date: "", contributors: "" });
      refetch();
    }
    setSending(false);
  };

  if (!user) return null;

  return (<div className="pg"><div style={{ padding: "100px 60px 40px", background: "linear-gradient(180deg,rgba(230,57,70,.05) 0%,transparent 100%)" }}><div className="sec-tag">Dashboard</div><h1 style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: -2 }}>Bienvenue, <span className="gold">{profile?.artist_name || "Artiste"}</span></h1><p style={{ color: C.muted, marginTop: 8 }}>Suivez vos performances et distribuez votre musique.</p></div><div className="pg-c">
    <div className="tabs">
      <button className={`tab ${dashTab === "overview" ? "ac" : ""}`} onClick={() => setDashTab("overview")}>Vue d'ensemble</button>
      <button className={`tab ${dashTab === "upload" ? "ac" : ""}`} onClick={() => setDashTab("upload")}>Distribuer un titre</button>
      <button className={`tab ${dashTab === "tracks" ? "ac" : ""}`} onClick={() => setDashTab("tracks")}>Mes titres</button>
    </div>

    {dashTab === "overview" && <>
      <div className="dash-grid">
        <div className="dash-stat"><div className="dash-stat-l">Streams totaux</div><div className="dash-stat-v" style={{ color: C.gold }}>{stats.totalStreams.toLocaleString()}</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Revenus totaux</div><div className="dash-stat-v" style={{ color: C.success }}>${stats.totalRevenue}</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Titres distribués</div><div className="dash-stat-v" style={{ color: C.blue }}>{stats.count}</div></div>
        <div className="dash-stat"><div className="dash-stat-l">Plateformes actives</div><div className="dash-stat-v">{stats.platforms}</div></div>
      </div>
      {loading ? <div className="loading-box">Chargement...</div> : tracks.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
          <p style={{ fontSize: 16, marginBottom: 20 }}>Aucun titre distribué pour l'instant.</p>
          <button className="btn btn-g btn-lg" onClick={() => setDashTab("upload")}>Distribuer mon premier titre</button>
        </div>
      ) : (
        <div className="dash-tracks"><div className="dash-tracks-h"><h3>Mes titres</h3></div>
          {tracks.slice(0, 5).map((t, i) => (
            <div key={t.id} className="tr-row">
              <div className="tr-num">{i + 1}</div><div className="tr-title">{t.title}</div>
              <div className="tr-info">{(t.streams || 0).toLocaleString()} streams</div><div className="tr-info">${parseFloat(t.revenue || 0).toFixed(2)}</div>
              <div className={`tr-status ${t.status}`}><span className="tr-dot" style={{ background: t.status === "live" ? C.success : C.gold }} />{t.status === "live" ? "En ligne" : t.status === "pending" ? "En attente" : "Rejeté"}</div>
            </div>
          ))}
        </div>
      )}
    </>}

    {dashTab === "upload" && <div style={{ maxWidth: 640 }}>
      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Distribuer un <span className="gold">nouveau titre</span></h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Uploadez votre morceau et le visuel. Validation sous 48h.</p>
      <div className={`upload ${audioFile ? "has-file" : ""}`} onClick={() => audioRef.current?.click()}>
        <div className="upload-ico"><Icon.Upload size={40} color={audioFile ? C.success : C.muted} /></div>
        <h4>{audioFile ? audioFile.name : "Cliquez pour ajouter le fichier audio"}</h4>
        <p>{audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : "WAV, FLAC, MP3"}</p>
        <input ref={audioRef} type="file" accept=".wav,.flac,.mp3,audio/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && setAudioFile(e.target.files[0])} />
      </div>
      <div className={`upload ${coverFile ? "has-file" : ""}`} onClick={() => coverRef.current?.click()} style={{ padding: coverPreview ? 24 : 48 }}>
        {coverPreview ? <div style={{ display: "flex", alignItems: "center", gap: 20 }}><img src={coverPreview} alt="Cover" style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover" }} /><div style={{ textAlign: "left" }}><h4 style={{ marginBottom: 4 }}>{coverFile.name}</h4><p>{(coverFile.size / 1024 / 1024).toFixed(1)} MB</p></div></div>
        : <><div className="upload-ico"><Icon.Image size={40} color={C.muted} /></div><h4>Cliquez pour ajouter la couverture</h4><p>PNG ou JPG, 3000x3000px recommandé</p></>}
        <input ref={coverRef} type="file" accept=".png,.jpg,.jpeg,image/*" style={{ display: "none" }} onChange={handleCoverSelect} />
      </div>
      <div className="fm">
        <div className="fm-g"><label className="fm-l">Titre *</label><input className="fm-i" placeholder="Nom du titre" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
        <div className="fm-row"><div className="fm-g"><label className="fm-l">Genre</label><select className="fm-s" value={uploadForm.genre} onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}><option value="">Sélectionner</option><option value="Afrobeat">Afrobeat</option><option value="R&B">R&B</option><option value="Rap">Rap</option><option value="Rumba">Rumba</option><option value="Gospel">Gospel</option><option value="Amapiano">Amapiano</option><option value="Autre">Autre</option></select></div><div className="fm-g"><label className="fm-l">Date de sortie</label><input className="fm-i" type="date" value={uploadForm.date} onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })} /></div></div>
        <div className="fm-g"><label className="fm-l">Contributeurs</label><input className="fm-i" placeholder="Noms séparés par virgules" value={uploadForm.contributors} onChange={(e) => setUploadForm({ ...uploadForm, contributors: e.target.value })} /></div>
        <button className="btn btn-g btn-lg" style={{ marginTop: 16 }} onClick={handleUpload} disabled={sending}>{sending ? "Upload en cours..." : "Soumettre pour distribution"}</button>
      </div>
    </div>}

    {dashTab === "tracks" && (
      loading ? <div className="loading-box">Chargement...</div> :
      <div className="dash-tracks"><div className="dash-tracks-h"><h3>Tous mes titres ({tracks.length})</h3><button className="btn btn-g btn-sm" onClick={() => setDashTab("upload")}>+ Nouveau</button></div>
        {tracks.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted }}>Aucun titre.</div> :
        tracks.map((t, i) => <div key={t.id} className="tr-row"><div className="tr-num">{i + 1}</div><div className="tr-title">{t.title}</div><div className="tr-info">{(t.streams || 0).toLocaleString()} streams</div><div className="tr-info">${parseFloat(t.revenue || 0).toFixed(2)}</div><div className={`tr-status ${t.status}`}><span className="tr-dot" style={{ background: t.status === "live" ? C.success : t.status === "pending" ? C.gold : C.red }} />{t.status === "live" ? "En ligne" : t.status === "pending" ? "En attente" : "Rejeté"}</div></div>)}
      </div>
    )}
  </div></div>);
}

// ─── PROTECTED ROUTE ───
function ProtectedRoute({ children, toast }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pg"><div className="loading-box">Chargement...</div></div>;
  if (!user) return <LoginPage />;
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
        </Routes>
        {!isLogin && <Footer />}
        {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}
      </div>
    </AuthProvider>
  );
}
