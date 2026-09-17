import { getCategories, getFeaturedLocations } from "@/lib/queries";
import { HomeHero } from "@/components/site/home-hero";
import { CategoryRail } from "@/components/site/category-rail";
import { FeaturedGrid } from "@/components/site/featured-grid";

export const revalidate = 60;

export default async function Home() {
  const [locations, categories] = await Promise.all([
    getFeaturedLocations(6),
    getCategories(),
  ]);

  return (
    <div>
      <HomeHero fallbackImage={locations[0]?.cover_image_url} />
      <CategoryRail categories={categories} />
      <FeaturedGrid locations={locations} />
    </div>
  );
}
