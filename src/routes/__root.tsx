import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarClock } from "lucide-react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site.functions";
import {
  absUrl,
  DEFAULT_OG_IMAGE,
  ORG_ID,
  LOCAL_BUSINESS_ADDRESS,
  LOCAL_BUSINESS_HOURS,
} from "@/lib/seo";
import { BOOKING_URL } from "@/lib/site-data";

// Toasts (sonner) are only ever triggered by form submissions (lead form,
// admin, auth) — never needed for the initial render of any page. Loading
// it lazily keeps its code out of the shared vendor chunk that every route
// (including the homepage) would otherwise pay to parse/execute upfront.
const Toaster = lazy(() => import("sonner").then((m) => ({ default: m.Toaster })));

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MIR Appliance Repair | Sub-Zero, Wolf & Viking Repair in Chicago" },
      {
        name: "description",
        content:
          "Premium residential appliance repair in Chicago — Sub-Zero, Viking, Wolf, Thermador, Bosch and Dacor. Honest, transparent, expert service.",
      },
      { name: "author", content: "MIR Appliance Repair" },
      { property: "og:site_name", content: "MIR Appliance Repair" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      // Site-wide fallback — pages with their own og:title/description/image
      // override these via their own head()'s twitterMeta() call.
      {
        name: "twitter:title",
        content: "MIR Appliance Repair | Sub-Zero, Wolf & Viking Repair in Chicago",
      },
      {
        name: "twitter:description",
        content:
          "Premium residential appliance repair in Chicago — Sub-Zero, Viking, Wolf, Thermador, Bosch and Dacor.",
      },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "theme-color", content: "#0f1115" },
      // TODO: this Bing site-verification token is tied to the old NY domain
      // — replace with a new token once the Chicago domain is verified in
      // Bing Webmaster Tools.
      { name: "msvalidate.01", content: "8603B5AEE860A3E9A624B9A128FDD7C7" },
    ],
    links: [
      // Fonts are self-hosted (see styles.css) and preloaded here so they
      // start fetching immediately instead of waiting for the CSS that
      // references them to be discovered.
      {
        rel: "preload",
        href: "/fonts/montserrat-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/opensans-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon-512.png" },
    ],
    scripts: [
      // TODO: add the Chicago Google Ads tag (gtag.js) and the phone-click
      // "Contact" conversion here once the Chicago Ads account exists. The
      // Charlotte tag and the GoHighLevel chat widget were removed on purpose:
      // they were tied to the other business's Ads account and CRM.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": ORG_ID,
          name: "MIR Appliance Repair",
          url: absUrl("/"),
          logo: absUrl("/images/logo.webp"),
          telephone: "+1-888-647-2775",
          email: "info@subzerovikingchicago.com",
          address: LOCAL_BUSINESS_ADDRESS,
          openingHoursSpecification: LOCAL_BUSINESS_HOURS,
          areaServed: [
            "Chicago",
            "Lincoln Park",
            "Evanston",
            "Gold Coast",
            "Naperville",
            "Oak Park",
            "Schaumburg",
            "North Shore",
          ],
          sameAs: [],
        }),
      },
    ],
  }),
  // SiteHeader and SiteFooter (rendered on every route below) both read the
  // "site-settings" query for phone/social links. Without prefetching it
  // here, pages that don't already load it themselves (only index/contact
  // did) would render header/footer with no data during SSR and then patch
  // in real data on the client — a server/client HTML mismatch that made
  // React discard and re-render the page on hydration (visible as a flash/
  // layout jump right at the top of the page, between header and hero).
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["site-settings"],
      queryFn: () => getSiteSettings(),
    }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  // Hidden while the page's top hero/banner block (every page's first
  // <section>) is on screen, so it doesn't duplicate/overlap that section's
  // own CTA — appears once the visitor scrolls past it.
  const [showMobileCta, setShowMobileCta] = useState(false);

  // Standalone ad landing pages ("/lp/...") render outside the normal site
  // chrome — no header nav, no footer, no site-wide sticky CTA bar — so paid
  // traffic lands on a single-focus page with nothing to click but the
  // page's own call-to-action. See src/routes/lp/ for these routes.
  const isLandingPage = router.state.location.pathname.startsWith("/lp/");

  useEffect(() => {
    if (isLandingPage) return;
    // Every page component renders one wrapping <div>, whose own first
    // child is the actual hero/banner <section> — that inner element is
    // the one to observe, not the wrapper (which spans the entire page).
    const pageRoot = mainRef.current?.firstElementChild;
    const hero = pageRoot?.firstElementChild ?? pageRoot;
    if (!hero) {
      setShowMobileCta(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setShowMobileCta(!entry.isIntersecting);
    });
    observer.observe(hero);
    return () => observer.disconnect();
    // Re-observe whenever the route changes — each page has its own hero element.
  }, [router.state.location.pathname, isLandingPage]);

  if (isLandingPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <main ref={mainRef}>
          <Outlet />
        </main>
        <Suspense fallback={null}>
          <Toaster position="top-right" richColors closeButton />
        </Suspense>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col pb-20 md:pb-0">
        <SiteHeader />
        <main ref={mainRef} className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 md:hidden ${
          showMobileCta ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a href={BOOKING_URL}>
          <Button
            size="lg"
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <CalendarClock className="h-4 w-4" /> Request Service
          </Button>
        </a>
      </div>
      <Suspense fallback={null}>
        <Toaster position="top-right" richColors closeButton />
      </Suspense>
    </QueryClientProvider>
  );
}
