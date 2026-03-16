import type { PostDetail } from "@/services/posts.service";

// ── Generic JSON-LD renderer ──────────────────────────────────────────────────

type Props = {
  data: Record<string, unknown>;
};

/** Server component — renders a <script type="application/ld+json"> block. */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Schema builders ───────────────────────────────────────────────────────────

/** Builds a schema.org BlogPosting object for a blog article. */
export function buildBlogPostingSchema(post: PostDetail, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? post.metaDescription ?? undefined,
    image: post.ogImage ?? post.coverImage ?? undefined,
    url,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Equipo Guvery",
    },
    publisher: {
      "@type": "Organization",
      name: "Guvery",
      logo: {
        "@type": "ImageObject",
        url: "https://guvery.com/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
    articleSection: post.category.name,
    inLanguage: "es-PE",
  };
}

export type BreadcrumbItem = { name: string; url: string };

/** Builds a schema.org BreadcrumbList object. */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
