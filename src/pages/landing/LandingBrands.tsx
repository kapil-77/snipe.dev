import { Frame } from '@/components/ui/Frame';
import { Marquee } from '@/components/ui/Marquee';
import { Reveal } from '@/components/ui/Reveal';

/*
 * "Brands using" strip — text wordmarks in a dashed frame + "+" corners,
 * drifting on a paused-on-hover marquee. PLACEHOLDER names: swap in the
 * real set of teams that use snipe.dev before going public.
 */
const BRANDS: Array<{ name: string; tag: string }> = [
  { name: 'Supabase', tag: 'database' },
  { name: 'Cloudflare', tag: 'edge' },
  { name: 'Upstash', tag: 'serverless' },
  { name: 'Vercel', tag: 'deploy' },
  { name: 'Netlify', tag: 'hosting' },
  { name: 'Railway', tag: 'infra' },
  { name: 'Neon', tag: 'postgres' },
  { name: 'Resend', tag: 'email' },
];

export function LandingBrands() {
  return (
    <section aria-label="Brands building on snipe.dev">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8 lg:px-12">
        <div className="mt-8 flex flex-col items-center gap-5 sm:mt-12">
          <p className="text-center text-sm font-medium text-faint">
            Trusted by teams shipping developer tools
          </p>
          <Reveal className="w-full">
            <Frame className="w-full py-5 sm:py-6">
              <Marquee>
                {BRANDS.map((brand) => (
                  <li
                    key={brand.name}
                    className="mx-7 flex items-baseline gap-2.5 whitespace-nowrap md:mx-9"
                  >
                    <span className="text-base font-bold tracking-tight text-ink/85">
                      {brand.name}
                    </span>
                    <span className="text-xs text-faint">{brand.tag}</span>
                  </li>
                ))}
              </Marquee>
            </Frame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}