import Footer from "@/components/core/Footer";
import About from "@/components/core/Home/About";
import ContactUs from "@/components/core/Home/ContactUs";
import Faqs from "@/components/core/Home/Faq";
import FeaturedVideos from "@/components/core/Home/FeatureVideos";
import Hero from "@/components/core/Home/Hero";
import Listerners from "@/components/core/Home/Listeners";
import Metrics from "@/components/core/Home/Metrics";
import Navbar from "@/components/core/Navbar";


export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      <Hero />
      <FeaturedVideos />
      <Metrics />
      <About />
      <Listerners />
      <Faqs />
      <ContactUs />
      {/* <Footer /> */}
    </>
  );
}
