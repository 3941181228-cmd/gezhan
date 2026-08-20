// /portfolio/[category] 路由:server component wrapper
// 静态导出(output:"export")要求动态路由预生成路径,故在此导出 generateStaticParams
// 真正的页面交互逻辑在 client 子组件 CategoryClient.tsx

import CategoryClient from "./CategoryClient";

// 预生成所有分类的静态页面(与 CategoryClient.tsx 中 categoryData 的 key 保持一致)
export function generateStaticParams() {
  return [
    { category: "guangfeng" },
    { category: "baic" },
    { category: "linglong" },
    { category: "carlot" },
    { category: "ip" },
    { category: "hmi-agent" },
  ];
}

export default function Page() {
  return <CategoryClient />;
}
