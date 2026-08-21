import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出:产物为纯静态 HTML/CSS/JS,可部署到任意静态托管
  output: "export",
  // 生成 /portfolio/hmi-agent/index.html 目录形式,
  // clean URL 在任意静态服务器(Vercel/GitHub Pages/python http.server)可直接访问
  trailingSlash: true,
  // 静态导出下禁用 next/image 的服务端优化(作品集用原生 <img>)
  images: { unoptimized: true },
};

export default nextConfig;
