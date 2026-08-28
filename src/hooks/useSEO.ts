import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

export function useSEO({ title, description, path }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = `${title} | Bhakt & Bhakti Incense`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // 3. Update Canonical Link
    const url = `https://bbincense.in${path === '/' ? '' : path}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }

    // 4. Update Open Graph Data
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (el) {
        el.setAttribute('content', content);
      } else {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:url', url);

  }, [title, description, path]);
}
