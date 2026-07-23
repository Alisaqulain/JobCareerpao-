import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { PopularCategories } from "@/components/home/PopularCategories";
import { FeaturedCompanies } from "@/components/home/FeaturedCompanies";
import { JobSearch } from "@/components/home/JobSearch";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { SuccessStories } from "@/components/home/SuccessStories";
import { BlogSection } from "@/components/home/BlogSection";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <PopularCategories />
      <FeaturedCompanies />
      <JobSearch />
      <FeaturedJobs />
      <HowItWorks />
      <WhyChooseUs />
      <SuccessStories />
      <BlogSection />
      <HomeFAQ />
      <CTASection />
    </>
  );
}