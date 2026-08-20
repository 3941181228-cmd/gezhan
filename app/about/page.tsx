"use client";

// /about 路由:点击菜单 ABOUT ME 进入的「关于我」独立页面(非首屏下滑)
// 占位符 [姓名]/[职业]/[城市]/[技能]/[X] 等待替换为真实信息

import { useEffect, useRef, useState } from "react";

const menuItems = ["HOME", "ABOUT ME", "PORTFOLIO", "CONTACT"];
const menuTargets: Record<string, string> = {
  HOME: "/",
  "ABOUT ME": "/about",
  PORTFOLIO: "/#work",
  CONTACT: "/contact",
};

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
              className={item === "ABOUT ME" ? "is-active" : ""}
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

export default function AboutPage() {
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
    <div className={`app-shell about-shell${ready ? " is-ready" : ""}${menuOpen ? " menu-open" : ""}`}>
      <StarField /><GridLines /><Chrome menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="about-section" id="about" aria-labelledby="about-title">
        {/* 返回按键:返回首页,沿用 explore-work 的线条包夹风格 */}
        <a className="about-back" href="/" aria-label="返回首页">
          <i /><span>BACK HOME</span><i />
        </a>

        {/* 背景大字水印,呼应联系页 contact-watermark 的处理 */}
        <p className="about-watermark" aria-hidden="true">ABOUT</p>

        {/* 主标题:中文为主,留 data-text 便于后续接 glitch 动效 */}
        <h1 id="about-title" className="about-heading" data-text="关于ME">关于ME</h1>

        {/* 副标语:呼应首屏 BRINGS YOUR IDEAS TO LIFE */}
        <p className="about-tagline">BRINGS IDEAS TO LIFE</p>

        <div className="about-grid">
          <div className="about-bio">
            <p>我是梁缤文,一名常驻苏州的 HMI UI 设计师。专注于智能座舱、仪表与车载界面的视觉设计,相信好的设计不仅关乎美感,更应该让复杂的信息变得清晰,让抽象的想法转化为自然、易懂且可被使用的体验。</p>
            <p>过去两年,我与产品、交互和开发团队一起,从前期概念、视觉探索走向设计落地,参与过北汽、广丰、岚图等品牌项目,涉及智能仪表、车载界面与平台型产品。工作横跨 Sketch、Figma 与 MasterGo,在像素与系统之间,寻找秩序、效率与情绪体验的平衡。</p>
            <p>工作之外,我也持续关注 AI 发展、数字视觉与新型界面表达,并通过个人练习记录自己的观察与思考。</p>
          </div>

          {/* 元信息表:沿用联系页字段行的横线分隔风格 */}
          <dl className="about-meta">
            <div className="about-meta-row"><dt>职业</dt><dd>HMI UI</dd></div>
            <div className="about-meta-row"><dt>专注</dt><dd>Sketch · Figma · MasterGo</dd></div>
            <div className="about-meta-row"><dt>经验</dt><dd>两年</dd></div>
            <div className="about-meta-row"><dt>基地</dt><dd>苏州</dd></div>
            <div className="about-meta-row"><dt>合作</dt><dd><a href="/contact">开始对话 →</a></dd></div>
          </dl>
        </div>
      </main>
    </div>
  );
}
