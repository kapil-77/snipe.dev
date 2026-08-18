import { Divider } from '@/components/ui/Divider';

import { LandingBrands } from './landing/LandingBrands';
import { LandingCta } from './landing/LandingCta';
import { LandingFaq } from './landing/LandingFaq';
import { LandingFeatures } from './landing/LandingFeatures';
import { LandingHero } from './landing/LandingHero';
import { LandingPricing } from './landing/LandingPricing';
import { LandingTestimonials } from './landing/LandingTestimonials';

/**
 * Landing page — section order per the brief, with "-----" dividers and
 * "+" corner marks at every major section boundary (Hero → Brands →
 * Features → Pricing → Testimonials → FAQ → CTA).
 */
export function Landing() {
  return (
    <>
      <LandingHero />
      <Divider gap="md" />
      <LandingBrands />
      <Divider gap="lg" />
      <LandingFeatures />
      <Divider gap="lg" />
      <LandingPricing />
      <Divider gap="lg" />
      <LandingTestimonials />
      <Divider gap="lg" />
      <LandingFaq />
      <Divider gap="lg" />
      <LandingCta />
    </>
  );
}