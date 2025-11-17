import { Article, Author } from '../types';

const BASE_URL = 'https://www.innovateflow.com';

/**
 * Helper function to find and update or create a meta tag.
 * @param identifier - The attribute to identify the tag (e.g., 'name', 'property').
 * @param value - The value of the identifier (e.g., 'description', 'og:title').
 * @param content - The new content for the tag.
 */
function upsertMetaTag(identifier: 'name' | 'property', value: string, content: string) {
    let element = document.querySelector(`meta[${identifier}='${value}']`) as HTMLMetaElement;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(identifier, value);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

/**
 * Updates the essential meta tags for SEO and social sharing.
 * @param title - The title of the page.
 * @param description - The meta description.
 * @param imageUrl - The URL for the Open Graph image.
 * @param pageUrl - The canonical URL for the page.
 */
export function updateMetaTags(title: string, description: string, imageUrl: string, pageUrl: string) {
    document.title = `${title} | InnovateFlow`;

    // Standard Meta Tags
    upsertMetaTag('name', 'description', description);
    
    const canonicalLink = document.getElementById('canonical-link') as HTMLLinkElement;
    if (canonicalLink) canonicalLink.href = pageUrl;

    // Open Graph / Facebook
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:image', imageUrl);
    upsertMetaTag('property', 'og:url', pageUrl);
    upsertMetaTag('property', 'og:type', 'article');
    
    // Twitter
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', imageUrl);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
}

/**
 * Resets the SEO tags to the homepage defaults.
 */
export function clearSeoTags() {
    const defaultTitle = 'InnovateFlow';
    const defaultDescription = 'Um blog moderno focado em tendências de tecnologia, ciência, cultura e negócios.';
    const defaultImage = 'https://picsum.photos/seed/innovateflow/1200/630';

    document.title = defaultTitle;
    updateMetaTags(defaultTitle, defaultDescription, defaultImage, BASE_URL);
    upsertMetaTag('property', 'og:type', 'website');
    
    const schemaScript = document.getElementById('schema-json-ld');
    if (schemaScript) {
        schemaScript.textContent = '';
    }
}

/**
 * Generates and injects Article schema JSON-LD into the head.
 * @param article - The article object.
 * @param author - The author object.
 */
export function updateArticleSchema(article: Article, author: Author) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "image": [article.imageUrl],
        "datePublished": article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
        "dateModified": article.publishedAt ? article.publishedAt.toISOString() : new Date().toISOString(),
        "author": [{
            "@type": "Person",
            "name": author.name,
            "url": `${BASE_URL}/author/${author.id}`
        }],
        "publisher": {
            "@type": "Organization",
            "name": "InnovateFlow",
            "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/logo.png`
            }
        },
        "description": article.description,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${BASE_URL}/article/${article.id}`
        }
    };

    const schemaScript = document.getElementById('schema-json-ld');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schema, null, 2);
    }
}

/**
 * Generates an XML sitemap string from a list of articles.
 * @param articles - An array of article objects.
 * @returns A string containing the sitemap XML.
 */
export function generateSitemap(articles: Article[]): string {
    const today = new Date().toISOString().split('T')[0];

    const urls = articles
        .filter(article => article.status === 'published')
        .map(article => `
  <url>
    <loc>${BASE_URL}/article/${article.id}</loc>
    <lastmod>${article.publishedAt ? article.publishedAt.toISOString().split('T')[0] : today}</lastmod>
  </url>
`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
  </url>${urls}
</urlset>`;
}
