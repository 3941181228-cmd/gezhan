"use client";

// /portfolio/[category] 路由:点击星球进入的分类二级详情页
// 根据动态参数 category 显示对应分类的作品列表(占位)
// 占位符 [作品N]/[描述] 等待替换为真实作品

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const menuItems = ["HOME", "ABOUT ME", "PORTFOLIO", "CONTACT"];
const menuTargets: Record<string, string> = {
  HOME: "/",
  "ABOUT ME": "/about",
  PORTFOLIO: "/portfolio",
  CONTACT: "/contact",
};

// 分类映射:动态参数 → 中英文名 + 作品列表(图片路径相对 /public)
// interactive: true 表示该分类嵌入可交互的 Web 应用预览(iframe),而非静态图片列表
type WorkItem = { id: number; src: string };
type CategoryMeta = { en: string; cn: string; works: WorkItem[]; interactive?: boolean; previewSrc?: string };
const categoryData: Record<string, CategoryMeta> = {
  guangfeng: {
    en: "GUANGFENG",
    cn: "广丰",
    // 广丰作品集:worker/广丰 下 21 张 3840×2160 原图,按 Figma 导出顺序编号 01-21
    works: Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      src: `/works/guangfeng/${String(i + 1).padStart(2, "0")}.webp`,
    })),
  },
  baic: {
    en: "BAIC",
    cn: "北汽",
    // 北汽作品集:worker/北汽 下 27 张 @2x 原图,按序号 01-27
    works: Array.from({ length: 27 }, (_, i) => ({
      id: i + 1,
      src: `/works/beiqi/${String(i + 1).padStart(2, "0")}.webp`,
    })),
  },
  linglong: {
    en: "LINGLONG",
    cn: "玲珑智慧屏",
    // 玲珑智慧屏作品集:worker/玲珑智慧屏 下 8 张 @2x 原图,按序号 01-08
    works: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      src: `/works/linglong/${String(i + 1).padStart(2, "0")}.webp`,
    })),
  },
  carlot: {
    en: "VOYAH CARLOT",
    cn: "岚图CarLot平台",
    // 岚图CarLot平台作品集:worker/岚图CarLot平台 下 64 张 @2x 原图,按序号 01-64
    works: Array.from({ length: 64 }, (_, i) => ({
      id: i + 1,
      src: `/works/carlot/${String(i + 1).padStart(2, "0")}.webp`,
    })),
  },
  ip: {
    en: "IP",
    cn: "IP形象",
    // IP形象作品集:worker/ip 下 19 张原图,按序号排列
    works: Array.from({ length: 19 }, (_, i) => ({
      id: i + 1,
      src: `/works/ip/${i + 1}.webp`,
    })),
  },
  // HMI Agent Studio:嵌入 worker/功能整合web 构建产物的可交互预览(iframe)
  // 产物位于 public/hmi-agent/,应用内部使用 HashRouter,可在 iframe 内自由操作
  "hmi-agent": {
    en: "HMI AGENT STUDIO",
    cn: "HMI Agent Studio",
    interactive: true,
    previewSrc: "/hmi-agent/index.html",
    works: [],
  },
};

// StarField / GridLines / BrandGlyph / Chrome 与其他页保持一致
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

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params?.category ?? "";
  const meta = categoryData[category];
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  // 返回顶部按钮:滚动超过页面一半时显示
  const [showTop, setShowTop] = useState(false);
  // 交互预览 iframe 的重载 key:自增后强制 iframe 重新挂载,实现"重新加载"
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 90);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  // 监听滚动:超过"可滚动距离的一半"时显示返回顶部按钮
  // 用 (scrollHeight - innerHeight) / 2 作为阈值,自动适配每个分类的内容多少
  // 同时监听 body 尺寸变化(图片懒加载后会撑高页面),保证判断始终准确
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // 页面几乎不可滚动(<80px)时隐藏按钮,避免内容过少时按钮一直显示
      if (scrollable < 80) {
        setShowTop(false);
        return;
      }
      setShowTop(scrolled > scrollable / 2);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // 监听 body 高度变化(图片加载/懒加载后高度会改变)
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      observer = new ResizeObserver(update);
      observer.observe(document.body);
    }

    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  // 未知分类:展示未找到提示 + 返回作品精选
  if (!meta) {
    return (
      <div className={`app-shell work-shell${ready ? " is-ready" : ""}`}>
        <StarField /><GridLines /><Chrome menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main className="work-section" aria-labelledby="not-found-title">
          <a className="about-back" href="/portfolio" aria-label="返回作品精选">
            <i /><span>BACK</span><i />
          </a>
          <div className="about-kicker" aria-hidden="true"><i /><span>NOT FOUND · 未找到</span></div>
          <h1 id="not-found-title" className="about-heading" data-text="CATEGORY NOT FOUND">CATEGORY NOT FOUND</h1>
          <p className="about-tagline">该星球暂未开放</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`app-shell work-shell${ready ? " is-ready" : ""}${menuOpen ? " menu-open" : ""}`}>
      <StarField /><GridLines /><Chrome menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="work-section" id="work" aria-labelledby="work-title">
        {/* 返回按键:返回作品精选(上一级) */}
        <a className="about-back" href="/portfolio" aria-label="返回作品精选">
          <i /><span>BACK</span><i />
        </a>

        {/* 背景大字水印:分类英文名 */}
        <p className="about-watermark" aria-hidden="true">{meta.en}</p>

        <div className="about-kicker" aria-hidden="true"><i /><span>{meta.cn} · CATEGORY</span></div>

        {/* 主标题:分类英文名 */}
        <h1 id="work-title" className="about-heading" data-text={meta.en}>{meta.en}</h1>

        <p className="about-tagline">{meta.cn}作品 · SELECTED WORKS</p>

        {/* 交互预览:嵌入功能整合 Web 应用的 iframe,可直接操作 */}
        {meta.interactive && meta.previewSrc ? (
          <div className="hmi-preview">
            {/* 浏览器式工具条:红黄绿圆点 + 地址栏 + 操作按钮 */}
            <div className="hmi-preview-bar">
              <span className="hmi-preview-dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="hmi-preview-url">HMI AGENT STUDIO · LIVE PREVIEW</span>
              <div className="hmi-preview-actions">
                <button
                  className="hmi-preview-btn"
                  type="button"
                  onClick={() => setIframeKey((key) => key + 1)}
                >
                  RELOAD
                </button>
                <a
                  className="hmi-preview-btn"
                  href={meta.previewSrc}
                  target="_blank"
                  rel="noreferrer"
                >
                  NEW TAB
                </a>
              </div>
            </div>
            {/* iframe 挂载区:应用使用 HashRouter,内部跳转均在此窗口完成 */}
            <div className="hmi-preview-frame">
              <iframe
                key={iframeKey}
                src={meta.previewSrc}
                title="HMI Agent Studio 交互预览"
                className="hmi-preview-iframe"
                allow="fullscreen"
              />
            </div>
            <p className="hmi-preview-hint">
              以上为真实应用嵌入,可直接操作 · AI 生成类功能依赖接口服务,预览环境中不可用
            </p>
          </div>
        ) : null}

        {/* 作品列表网格 */}
        <div className="work-grid">
          {meta.works.map((work) => (
            <article className="work-card" key={work.id}>
              {work.src ? (
                <img className="work-card-img" src={work.src} alt="" loading="lazy" />
              ) : (
                <div className="work-card-thumb" aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </main>

      {/* 返回顶部按钮:下滑到页面一半时出现 */}
      <button
        className={`scroll-top-btn${showTop ? " is-visible" : ""}`}
        type="button"
        aria-label="返回顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="scroll-top-arrow" />
      </button>
    </div>
  );
}
