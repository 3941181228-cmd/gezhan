import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出:产物为纯静态 HTML/CSS/JS,可部署到任意静态托管
  output: "export",
  // 静态导出下禁用 next/image 的服务端优化(作品集用原生 <img>)
  images: { unoptimized: true },
};

export default nextConfig;
