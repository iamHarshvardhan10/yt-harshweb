import About from "@/components/core/Home/About";
import FeaturedVideos from "@/components/core/Home/FeatureVideos";
import Hero from "@/components/core/Home/Hero";
import Listerners from "@/components/core/Home/Listeners";
import Metrics from "@/components/core/Home/Metrics";


export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedVideos />
      <Metrics />
      <About />
      <Listerners />
    </>
  );
}
