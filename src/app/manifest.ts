import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Find and apply for verified jobs across India — IT, hospital, fresher & remote openings.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0B4F8A",
    lang: "en-IN",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    scope: base,
  };
}
