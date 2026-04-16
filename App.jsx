// 🔥 AWWARDS++ VERSION — CINEMATIC / LIQUID / MORPHING / PAGE TRANSITIONS

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

// ─── CURSOR MAGNÉTIQUE AVANCÉ ───
function Cursor() {
  useEffect(() => {
    const cursor = document.querySelector(".cursor");

    const move = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
      });
    };

    document.querySelectorAll(".srv").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(cursor, { scale: 2 });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(cursor, { scale: 1 });
      });
    });

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div className="cursor" />;
}

// ─── HERO CINÉMATIQUE ───
function Hero() {
  useEffect(() => {
    const split = new SplitType(".hero h1", { types: "chars" });

    gsap.from(split.chars, {
      y: 120,
      opacity: 0,
      stagger: 0.02,
      duration: 1.4,
      ease: "power4.out",
    });

    gsap.to(".hero-blob", {
      x: 80,
      y: 80,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // PARALLAX MULTI-LAYER
    gsap.to(".layer-1", {
      yPercent: 20,
      scrollTrigger: { scrub: true },
    });

    gsap.to(".layer-2", {
      yPercent: 40,
      scrollTrigger: { scrub: true },
    });
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg layer-1" />
      <div className="hero-noise layer-2" />

      <h1 className="hero-title">Sterkte Records</h1>

      <div className="hero-blob" />
    </section>
  );
}

// ─── SERVICES MORPHING ───
function Services() {
  useEffect(() => {
    gsap.utils.toArray(".srv").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        y: 120,
        opacity: 0,
        duration: 1.2,
      });

      // MORPH HOVER
      el.addEventListener("mouseenter", () => {
        gsap.to(el, {
          borderRadius: "40px",
          duration: 0.4,
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          borderRadius: "12px",
        });
      });
    });
  }, []);

  return (
    <section className="services">
      {[1,2,3,4].map((i) => (
        <div className="srv" key={i}>
          <h3>Service {i}</h3>
        </div>
      ))}
    </section>
  );
}

// ─── TRANSITION PAGE (FAKE ROUTER STYLE) ───
function usePageTransition() {
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(".app", {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  }, []);
}

// ─── APP ───
export default function App() {
  usePageTransition();

  return (
    <div className="app">
      <Cursor />
      <Hero />
      <Services />
    </div>
  );
}

// ─── CSS ULTRA PREMIUM ───
const style = document.createElement("style");
style.innerHTML = `

body {
  background: #050507;
}

.cursor {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, gold, transparent);
  position: fixed;
  pointer-events: none;
  z-index: 9999;
}

.hero {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,215,0,0.2), transparent);
}

.hero-noise {
  position: absolute;
  inset: 0;
  background: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.2;
}

.hero-title {
  font-size: 80px;
  text-align: center;
}

.hero-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,215,0,0.3), transparent);
  filter: blur(120px);
}

.services {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px,1fr));
  gap: 20px;
  padding: 100px;
}

.srv {
  backdrop-filter: blur(30px);
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 12px;
  transition: all 0.4s ease;
  position: relative;
}

.srv::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(255,215,0,0.4), transparent);
  filter: blur(100px);
  opacity: 0;
  transition: 0.5s;
}

.srv:hover::before {
  opacity: 1;
}

.srv:hover {
  transform: translateY(-10px) scale(1.03);
}

`;

document.head.appendChild(style);
