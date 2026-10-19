import type { Metadata } from "next";
import { getCategories, getCities } from "@/lib/queries";
import { RequestLocationPage } from "@/components/request/request-location-page";
import type { Category, City } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "نموذج طلب إضافة موقع | وجهة",
  description: "اعرض موقعك على وجهة — List your filming location on Wejha",
};

export default async function RequestLocationRoute() {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  return <RequestLocationPage categories={categories as Category[]} cities={cities as City[]} />;
}
