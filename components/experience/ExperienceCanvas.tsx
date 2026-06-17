"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Three.js/R3F 는 window·WebGL 컨텍스트에 의존하므로 SSR 을 끈다.
// (docs/design/02_technical_architecture.md 의 SSR 주의사항)
const Experience = dynamic(
  () => import("@/components/experience/Experience"),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  },
);

export default function ExperienceCanvas() {
  return <Experience />;
}
