import { Fragment } from "react";
import { SITE_URL } from "@/lib/constants";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export default function Breadcrumb({
  items,
  className = "mb-8",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href && { item: `${SITE_URL}${item.href}` }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav className={`text-sm text-gray-500 ${className} flex items-center gap-2`}>
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <span>›</span>}
            {item.href ? (
              <a href={item.href} className="hover:text-gray-900 transition-colors">
                {item.name}
              </a>
            ) : (
              <span className="text-gray-900 truncate">{item.name}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </>
  );
}
