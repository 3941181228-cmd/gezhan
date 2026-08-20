'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Particle = {
  ox: number; // 原文字 x(视口坐标)
  oy: number; // 原文字 y(视口坐标)
  x: number; // 当前 x
  y: number; // 当前 y
  vx: number; // 速度 x
  vy: number; // 速度 y
  r: number; // 半径
  a: number; // alpha
};

/**
 * 粒子文字组件(全屏 canvas,无容器限制)
 * - 通过 createPortal 把 canvas 渲染到 body,脱离 .home-copy 的 filter/transform containing block
 * - position:fixed 覆盖整个视口,粒子可飞散到任意位置
 * - 离屏采样 #home-title-art 内文字像素,粒子原位用视口坐标
 * - window 监听 mousemove:指针在文字区域 → 分解;移出 → 回流
 * - 扩散粒子按距原位距离 alpha 渐隐
 */
export default function ParticleTitle({ lines }: { lines: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, hover: false });
  const rafRef = useRef(0);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const textRectRef = useRef({ l: 0, t: 0, w: 0, h: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const host = document.querySelector('#home-title-art') as HTMLElement | null;
    if (!host) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 采样文字像素生成粒子,坐标用视口坐标
    const sample = () => {
      const cs = getComputedStyle(host);
      const fontFamily = cs.fontFamily || "'Barlow Condensed', sans-serif";
      const fontWeight = cs.fontWeight || '700';
      const fontSize = parseFloat(cs.fontSize) || 64;
      const lineHeight = fontSize * 0.79;
      const hr = host.getBoundingClientRect();
      textRectRef.current = { l: hr.left, t: hr.top, w: hr.width, h: hr.height };

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';

      // 离屏只画文字区域(性能)
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(hr.width * dpr));
      off.height = Math.max(1, Math.floor(hr.height * dpr));
      const oc = off.getContext('2d');
      if (!oc) return;
      oc.scale(dpr, dpr);
      oc.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      oc.fillStyle = '#fff';
      oc.textBaseline = 'top';
      oc.textAlign = 'right';
      linesRef.current.forEach((line, i) => {
        oc.fillText(line, hr.width, i * lineHeight);
      });
      const img = oc.getImageData(0, 0, off.width, off.height).data;
      const step = 3;
      const ps: Particle[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const alpha = img[(y * off.width + x) * 4 + 3];
          if (alpha > 128) {
            const vx = hr.left + x / dpr;
            const vy = hr.top + y / dpr;
            ps.push({ ox: vx, oy: vy, x: vx, y: vy, vx: 0, vy: 0, r: 1, a: 1 });
          }
        }
      }
      particlesRef.current = ps;
    };
    sample();

    const handleResize = () => sample();
    window.addEventListener('resize', handleResize);

    // window 监听鼠标(canvas pointer-events:none 不拦截)
    const onMove = (e: MouseEvent) => {
      const tr = textRectRef.current;
      const pad = 40;
      const inText =
        e.clientX >= tr.l - pad &&
        e.clientX <= tr.l + tr.w + pad &&
        e.clientY >= tr.t - pad &&
        e.clientY <= tr.t + tr.h + pad;
      if (inText) {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.hover = true;
      } else {
        mouseRef.current.hover = false;
      }
    };
    const onLeave = () => {
      mouseRef.current.hover = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    // 主循环
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = 'rgba(255,255,255,.97)';
      const m = mouseRef.current;
      const R = 120;
      const R2 = R * R;
      for (const p of particlesRef.current) {
        if (m.hover) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 3.2;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx += (Math.random() - 0.5) * 0.3;
          p.vy += (Math.random() - 0.5) * 0.3;
          p.vx *= 0.9;
          p.vy *= 0.9;
        } else {
          p.vx += (p.ox - p.x) * 0.06;
          p.vy += (p.oy - p.y) * 0.06;
          p.vx *= 0.82;
          p.vy *= 0.82;
        }
        p.x += p.vx;
        p.y += p.vy;
        // 扩散后边缘渐隐:距原位越远 alpha 越低
        const fdx = p.x - p.ox;
        const fdy = p.y - p.oy;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        p.a = Math.max(0, 1 - Math.max(0, fdist - 120) / 280);
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, [mounted]);

  return mounted && typeof document !== 'undefined'
    ? createPortal(<canvas ref={canvasRef} className="home-title-particles" aria-hidden="true" />, document.body)
    : null;
}
