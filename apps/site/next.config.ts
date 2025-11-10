import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withMDX = createMDX({
  options: {
    remarkPlugins: [require.resolve("remark-gfm")],
    rehypePlugins: [
      require.resolve("rehype-slug"),
      [require.resolve("rehype-autolink-headings"), { behavior: "wrap" }],
      [require.resolve("rehype-pretty-code"), { theme: "github-dark" }],
    ],
  },
});

const nextConfig: NextConfig = {
  experimental: { mdxRs: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withMDX(nextConfig);
