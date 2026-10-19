import { notFound } from "next/navigation";
import { getLocationBySlug } from "@/lib/queries";
import { LocationDetail } from "@/components/site/location-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// Empty list: nothing is prerendered at build, but each location page is
// cached on first visit and revalidated (ISR) instead of rendered per request.
export function generateStaticParams() {
  return [];
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) notFound();

  return <LocationDetail location={location} />;
}
