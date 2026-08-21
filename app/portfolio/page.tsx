"use client";

// /portfolio 路由:点击菜单 PORTFOLIO 进入的作品精选页面
// 用 5 颗星球代替分类,按北斗七星状的折线(勺 + 柄)排列
// 分类名为示例占位,可替换为真实作品分类

import { useEffect, useRef, useState } from "react";

const menuItems = ["HOME", "ABOUT ME", "PORTFOLIO", "CONTACT"];
const menuTargets: Record<string, string> = {
  HOME: "/",
  "ABOUT ME": "/about",
  PORTFOLIO: "/portfolio",
  CONTACT: "/contact",
};

// 白羊座星象排列:6颗恒星对应6个作品分类
// 白羊座主要恒星:39 Ari,35 Ari,γ(Mesarthim),β(Sheratan),41 Ari,α(Hamal,最亮),δ(Botein)
// 形状:从西北到东南的折线,γ和β紧靠,α居中,δ在东南
const planets = [
  // 白羊座6颗主要恒星,按实际星图赤经/赤纬比例映射到 viewBox 620×400
  // 主连线:35 Ari → γ → β → α(Hamal) → δ(Botein)
  // 辅连线:41 Ari → α
  { id: "guangfeng", label: "广丰", cx: 100, cy: 50, lx: 100, ly: 30, anchor: "middle" },        // 35 Arietis(西北)
  { id: "baic", label: "北汽", cx: 150, cy: 160, lx: 130, ly: 166, anchor: "end" },             // γ Arietis(Mesarthim,西)
  { id: "linglong", label: "玲珑智慧屏", cx: 195, cy: 175, lx: 215, ly: 197, anchor: "start" }, // β Arietis(Sheratan,西偏东,紧邻γ)
  { id: "carlot", label: "岚图CarLot平台", cx: 340, cy: 55, lx: 340, ly: 35, anchor: "middle" }, // 41 Arietis(北偏东)
  { id: "ip", label: "IP形象", cx: 310, cy: 175, lx: 330, ly: 155, anchor: "start" },           // α Arietis(Hamal,最亮,中央)
  { id: "hmi-agent", label: "HMI Agent Studio", cx: 470, cy: 280, lx: 450, ly: 286, anchor: "end" }, // δ Arietis(Botein,东南),标签右对齐向左延伸,避免超出 viewBox 右边界被裁切
];

// StarField / GridLines / BrandGlyph / Chrome 与联系页保持一致,保证站点 chrome 统一
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
          <a href="#behance">BEHANCE</a><a href="mailto:hello@yourname.design">LET&apos;S TALK!</a>
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
              className={item === "PORTFOLIO" ? "is-active" : ""}
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

function PlanetSky() {
  return (
    <svg className="portfolio-sky" viewBox="0 0 620 400" role="img" aria-label="作品分类星座:六颗星球按白羊座星象排列">
      <defs>
        {/* 星球外发光 */}
        <filter id="planet-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        {/* 星球主体径向渐变 */}
        <radialGradient id="planet-fill">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="rgba(232,241,249,0.96)" />
          <stop offset="100%" stopColor="rgba(123,139,153,0.42)" />
        </radialGradient>
      </defs>

      {/* 北斗状连线:斗(4 颗)+ 斗柄(1 颗) */}
      <path className="sky-line" d="M100 50 L150 160 L195 175 L310 175 L470 280 M340 55 L310 175" />

      {planets.map((planet, index) => (
        <a key={planet.id} className="sky-planet" href={`/portfolio/${planet.id}`} aria-label={`进入分类:${planet.label}`} style={{ ["--planet-delay" as string]: `${index * 0.5}s` }}>
          {/* 外层光晕 */}
          <circle className="planet-halo" cx={planet.cx} cy={planet.cy} r={18} />
          {/* 主体星球 */}
          <circle className="planet-core" cx={planet.cx} cy={planet.cy} r={6} />
          {/* 分类标签 */}
          <text className="planet-label" x={planet.lx} y={planet.ly} textAnchor={planet.anchor as "start" | "middle" | "end"}>{planet.label}</text>
        </a>
      ))}
    </svg>
  );
}

export default function PortfolioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 90);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <div className={`app-shell portfolio-shell${ready ? " is-ready" : ""}${menuOpen ? " menu-open" : ""}`}>
      <StarField /><GridLines /><Chrome menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="portfolio-section" id="portfolio" aria-labelledby="portfolio-title">
        {/* 返回按键:返回首页 */}
        <a className="about-back" href="/" aria-label="返回首页">
          <i /><span>BACK HOME</span><i />
        </a>

        <p className="about-watermark" aria-hidden="true">WORK</p>

        <h1 id="portfolio-title" className="about-heading" data-text="作品精选">作品精选</h1>

        <p className="about-tagline">SIX STARS, SIX WORLDS</p>

        {/* 六颗星球星座:代替分类,白羊座星象排列 */}
        <div className="portfolio-sky-wrap">
          <PlanetSky />
          <p className="portfolio-hint">悬停或选择一颗星球,进入对应分类</p>
        </div>
      </main>
    </div>
  );
}
