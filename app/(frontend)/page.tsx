import type { Metadata } from "next";

import About from "@/components/core/Home/About";
import ContactUs from "@/components/core/Home/ContactUs";
import Faqs from "@/components/core/Home/Faq";
import FeaturedVideos from "@/components/core/Home/FeatureVideos";
import Hero from "@/components/core/Home/Hero";
import Listerners from "@/components/core/Home/Listeners";
import Metrics from "@/components/core/Home/Metrics";
import { getHomePageData } from "@/lib/home/queries";
import { getPublicVideos } from "@/lib/videos/queries";
import { getSiteSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

// Content is managed from /dashboard/home and /dashboard/videos — API mutations
// call revalidatePath("/"); YouTube data refreshes every 10 minutes

// Title and description are the site's own (Settings → Website)
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({ title: settings.siteTitle, absoluteTitle: true, description: settings.siteDescription, path: "/" });
}

export default async function Home() {
  const [{ hero, sections, metrics, aboutItems, testimonials, faqs }, { home: homeVideos }] = await Promise.all([
    getHomePageData(),
    getPublicVideos(),
  ]);

  return (
    <>
      {hero.isVisible && <Hero hero={hero} />}

      {sections.FEATURED_VIDEOS.isVisible && homeVideos.length > 0 && (
        <FeaturedVideos section={sections.FEATURED_VIDEOS} videos={homeVideos} />
      )}

      {sections.METRICS.isVisible && metrics.length > 0 && (
        <Metrics section={sections.METRICS} metrics={metrics} />
      )}

      {sections.ABOUT.isVisible && <About section={sections.ABOUT} items={aboutItems} />}

      {sections.TESTIMONIALS.isVisible && testimonials.length > 0 && (
        <Listerners section={sections.TESTIMONIALS} testimonials={testimonials} />
      )}

      {sections.FAQ.isVisible && faqs.length > 0 && <Faqs section={sections.FAQ} faqs={faqs} />}

      {sections.CONTACT.isVisible && <ContactUs section={sections.CONTACT} />}
    </>
  );
}
