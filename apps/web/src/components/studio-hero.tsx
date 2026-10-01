'use client';

import { GoldenHeroLanding } from "@/components/golden-hero-landing";
import { Reveal } from "@/components/ui";
import { useLanguage } from "@/context/language-context";

export function StudioHero() {
  const { isEn } = useLanguage();

  return (
    <Reveal>
      <GoldenHeroLanding isEn={isEn} />
    </Reveal>
  );
}
