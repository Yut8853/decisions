import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Verified Technology Decisions", short_name: "VTD", description: "JUNKBRANDINGによる根拠つき技術判断集", start_url: "/", display: "standalone", background_color: "#080a0c", theme_color: "#b6ff3b" }; }
