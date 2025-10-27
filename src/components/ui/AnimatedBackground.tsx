'use client';

import { TwinklingStars } from "@/components/ui/TwinklingStars";
import { ShootingStars } from "@/components/ui/ShootingStar";
import { BubblesBackground } from "@/components/ui/BubblesBackground";

export const AnimatedBackground = () => (
  <>
    <ShootingStars />
    <TwinklingStars />
    <BubblesBackground />
  </>
);