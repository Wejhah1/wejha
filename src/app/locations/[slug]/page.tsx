import { notFound } from "next/navigation";
import { getLocationBySlug } from "@/lib/queries";
import { LocationDetail } from "@/components/site/location-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) notFound();

  return <LocationDetail location={location} />;
}
