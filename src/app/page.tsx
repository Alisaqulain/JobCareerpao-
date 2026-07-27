import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { PopularCategories } from "@/components/home/PopularCategories";
import { FeaturedCompanies, type ApiCompany } from "@/components/home/FeaturedCompanies";
import { JobSearch } from "@/components/home/JobSearch";
import { FeaturedJobs, type ApiJob } from "@/components/home/FeaturedJobs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { SuccessStories } from "@/components/home/SuccessStories";
import { BlogSection, type ApiBlog } from "@/components/home/BlogSection";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { CTASection } from "@/components/home/CTASection";
import { listJobs } from "@/lib/services/job.service";
import { listCompanies } from "@/lib/services/company.service";
import { listBlogs } from "@/lib/services/blog.service";

export const revalidate = 60;

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function HomePage() {
  const [jobsResult, companiesResult, blogsResult] = await Promise.all([
    listJobs({ limit: 6, admin: false }).catch(() => ({ jobs: [], pagination: null })),
    listCompanies({ limit: 10 }).catch(() => ({ companies: [], pagination: null })),
    listBlogs({ limit: 3, featured: true }).catch(() => ({ blogs: [], pagination: null })),
  ]);

  let blogs = blogsResult.blogs;
  if (!blogs.length) {
    const fallback = await listBlogs({ limit: 3 }).catch(() => ({ blogs: [], pagination: null }));
    blogs = fallback.blogs;
  }

  return (
    <>
      <Hero />
      <Stats />
      <PopularCategories />
      <FeaturedCompanies initialCompanies={serialize(companiesResult.companies) as ApiCompany[]} />
      <JobSearch />
      <FeaturedJobs initialJobs={serialize(jobsResult.jobs) as ApiJob[]} />
      <HowItWorks />
      <WhyChooseUs />
      <SuccessStories />
      <BlogSection initialPosts={serialize(blogs) as ApiBlog[]} />
      <HomeFAQ />
      <CTASection />
    </>
  );
}
