import { getCategories } from "@/services/categories.service";
import { getAllPublishedSlugs } from "@/services/posts.service";
import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://blog.guvery.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([
    getAllPublishedSlugs(),
    getCategories(),
  ]);

  const postEntries: MetadataRoute.Sitemap = slugs.map((s) => ({
    url: `${BASE_URL}/blog/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categoria/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postEntries,
    ...categoryEntries,
  ];
}
