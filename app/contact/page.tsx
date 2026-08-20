"use client";

// Contact route retained from the first completed page.

import { FormEvent, useEffect, useRef, useState } from "react";

const menuItems = ["HOME", "ABOUT ME", "PORTFOLIO", "CONTACT"];
const menuTargets: Record<string, string> = {
  HOME: "/",
  "ABOUT ME": "/about",
  PORTFOLIO: "/portfolio",
  CONTACT: "/contact",
};

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animation = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let stars: Array<{ x: number; y: number; r: number; a: number; pulse: number }> = [];

    const seeded = (index: number) => {
      const value = Math.sin(index * 9187.137 + 27.11) * 43758.5453;
      return value - Math.floor(value);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(520, Math.round((width * height) / 4600));
      stars = Array.from({ length: count }, (_, index) => ({
        x: seeded(index * 5 + 1) * width,
        y: seeded(index * 5 + 2) * height,
        r: 0.2 + seeded(index * 5 + 3) * 0.85,
        a: 0.1 + seeded(index * 5 + 4) * 0.46,
        pulse: seeded(index * 5 + 5) * Math.PI * 2,
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / Math.max(1, width) - 0.5) * 5;
      targetY = (event.clientY / Math.max(1, height) - 0.5) * 5;
    };

    const draw = () => {
      frame += 0.012;
      pointerX += (targetX - pointerX) * 0.025;
      pointerY += (targetY - pointerY) * 0.025;
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const alpha = star.a * (0.78 + Math.sin(frame + star.pulse) * 0.22);
        context.beginPath();
        context.fillStyle = `rgba(255,255,255,${alpha})`;
        context.arc(star.x + pointerX * star.r, star.y + pointerY * star.r, star.r, 0, Math.PI * 2);
        context.fill();
      }
      animation = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    animation = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" aria-hidden="true" />;
}

function GridLines() {
  return (
    <div className="grid-lines" aria-hidden="true">
      {[0, 1, 2, 3].map((line) => (
        <div className="grid-line" key={line}><i className="grid-marker" /></div>
      ))}
    </div>
  );
}

function BrandGlyph({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-glyph${small ? " brand-glyph-small" : ""}`} aria-label="Zoe Design">
      <i className="glyph-slash" /><i className="glyph-dot" />
    </span>
  );
}

function Chrome({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return (
    <>
      <div className="site-chrome">
        <button
          className="menu-trigger"
          type="button"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
          <span>MENU</span>
        </button>



        <p className="site-motto">REACH<br />PERFECTION</p>
        <div className="site-legal" aria-label="版权信息">
          <span>©</span><span>2026 ZOE DESIGN</span><i>•</i><a href="#privacy">PRIVACY POLICY</a>
        </div>
        <div className="bottom-mark"><BrandGlyph small /></div>
        <div className="social-strip" aria-label="社交媒体">
          <a href="#upwork">UPWORK</a><a href="#linkedin">LINKEDIN</a>
          <a href="#behance">BEHANCE</a><a href="mailto:3941181228@qq.com">LET&apos;S TALK!</a>
        </div>
      </div>

      <div className={`menu-overlay${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="menu-art" aria-hidden="true">
          <i className="menu-art-top" /><i className="menu-art-middle" /><i className="menu-art-dot" />
        </div>
        <nav className="menu-nav" aria-label="主导航">
          {menuItems.map((item) => (
            <a
              href={menuTargets[item]}
              className={item === "CONTACT" ? "is-active" : ""}
              key={item}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item}</span><i />
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

function ScrollIndicator({ progress }: { progress: number }) {
  const [metrics, setMetrics] = useState({ top: 18, height: 72 });

  useEffect(() => {
    const measure = () => {
      const trackHeight = Math.max(120, window.innerHeight - 146 - 104 - 36);
      const ratio = Math.min(1, window.innerHeight / Math.max(window.innerHeight, document.documentElement.scrollHeight));
      const height = Math.max(72, trackHeight * ratio);
      setMetrics({ top: 18 + (trackHeight - height) * progress, height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [progress]);

  return (
    <div className="scroll-indicator" aria-hidden="true">
      <span className="scroll-label">SCROLL</span><span className="scroll-track" />
      <span className="scroll-thumb" style={{ top: metrics.top, height: metrics.height }} />
      <span className="scroll-number">{String(Math.round(progress * 100)).padStart(2, "0")}</span>
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Thanks — your message is ready to send.");
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <label className="contact-field"><span className="contact-field-label">NAME</span><input name="name" placeholder="Your name" autoComplete="name" required /></label>
      <label className="contact-field"><span className="contact-field-label">COMPANY</span><input name="company" placeholder="Your studio" autoComplete="organization" /></label>
      <label className="contact-field"><span className="contact-field-label">EMAIL</span><input name="email" type="email" placeholder="3941181228@qq.com" autoComplete="email" required /></label>
      <label className="contact-field"><span className="contact-field-label">PHONE</span><input name="phone" type="tel" placeholder="000 000 000 000" autoComplete="tel" /></label>
      <label className="contact-field contact-field-message"><span className="contact-field-label">MESSAGE</span><textarea name="message" placeholder={"Hi there,\n\nTell me about your next project."} required /></label>
      <div className="contact-form-footer">
        <div className="form-copy">
          <p>Tell me a little about the project, timeline and what kind of help you need.</p>
          <p className="form-status" role="status">{status}</p>
        </div>
        <button className="contact-submit" type="submit">
          <span className="submit-fill" />
          <i className="edge edge-top" /><i className="edge edge-right" />
          <i className="edge edge-bottom" /><i className="edge edge-left" />
          <span className="submit-label">SEND</span>
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 90);
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <div className={`app-shell${ready ? " is-ready" : ""}${menuOpen ? " menu-open" : ""}${progress > 0.84 ? " footer-visible" : ""}`}>
      <StarField /><GridLines /><Chrome menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><ScrollIndicator progress={progress} />

      <main className="contact-layout" id="contact">
        <aside className="contact-rail">
          <div className="contact-rail-stack" aria-label="Let’s talk"><span className="contact-rail-word">LET&apos;S</span><span className="contact-rail-word">TALK</span></div>
          <div className="contact-rail-details">
            <a href="mailto:3941181228@qq.com">3941181228@qq.com</a>
            <a href="tel:+8615735537058">+86 157 3553 7058</a><p>Shanghai, China</p>
          </div>
          <div className="mobile-actions" aria-label="社交媒体">
            <a href="#upwork" aria-label="Upwork">U</a><a href="#linkedin" aria-label="LinkedIn">in</a>
            <a href="#behance" aria-label="Behance">Bē</a><a href="mailto:3941181228@qq.com" aria-label="Email">@</a>
          </div>
        </aside>

        <section className="contact-content">
          <div className="contact-intro">
            <div className="contact-intro-meta"><span className="contact-kicker">ITS WONDERFUL TO HEAR FROM YOU</span></div>
            <div className="contact-stage">
              <div className="contact-stage-head">
                <div className="contact-hero">
                  <h1 className="glitch-heading" data-text={"SAY HI!\nAND LET'S CREATE\nSOMETHING OUT\nOF THIS WORLD!"}>
                    {["SAY HI!", "AND LET'S CREATE", "SOMETHING OUT", "OF THIS WORLD!"].map((line, index) => (
                      <span className="glitch-heading-line" style={{ "--line-delay": `${80 + index * 70}ms` } as React.CSSProperties} key={line}>{line}</span>
                    ))}
                  </h1>
                  <p className="contact-watermark">HELLO!</p>
                </div>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
