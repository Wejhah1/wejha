import { getCategories, getCities, getPublishedLocations } from "@/lib/queries";
import { BrowseClient } from "@/components/site/browse-client";
import type { LocationSetting } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    setting?: string;
    minPrice?: string;
    maxPrice?: string;
    minCapacity?: string;
  }>;
}

export const revalidate = 60;

export default async function LocationsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    category: params.category,
    city: params.city,
    setting: (params.setting as LocationSetting) || undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minCapacity: params.minCapacity ? Number(params.minCapacity) : undefined,
  };

  const [locations, categories, cities] = await Promise.all([
    getPublishedLocations(filters),
    getCategories(),
    getCities(),
  ]);

  return (
    <BrowseClient
      locations={locations}
      categories={categories}
      cities={cities}
      activeFilters={params}
    />
  );
}
