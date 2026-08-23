import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  interface Window {
    __VTD_READY__?: boolean;
    __VTD_METRICS__?: { drawCalls?: number | null; triangles?: number | null; engineFps?: number | null };
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        "camera-controls"?: boolean;
        autoplay?: boolean;
        exposure?: string;
        "shadow-intensity"?: string;
      };
    }
  }
}
