import About from "@/components/core/Home/About";
import ContactUs from "@/components/core/Home/ContactUs";
import Faqs from "@/components/core/Home/Faq";
import FeaturedVideos from "@/components/core/Home/FeatureVideos";
import Hero from "@/components/core/Home/Hero";
import Listerners from "@/components/core/Home/Listeners";
import Metrics from "@/components/core/Home/Metrics";
import { getHomePageData } from "@/lib/home/queries";

// Content is managed from /dashboard/home — API mutations call revalidatePath("/")

export default async function Home() {
  const { hero, sections, metrics, aboutItems, testimonials, faqs } = await getHomePageData();

  return (
    <>
      {hero.isVisible && <Hero hero={hero} />}

      {sections.FEATURED_VIDEOS.isVisible && <FeaturedVideos section={sections.FEATURED_VIDEOS} />}

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
