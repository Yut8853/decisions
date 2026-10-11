import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "JUNKBRANDING 技術判断集", short_name: "技術判断集", description: "JUNKBRANDINGによる根拠つき技術判断集", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#ffffff" }; }
