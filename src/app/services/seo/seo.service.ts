import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private readonly baseUrl = 'https://tpstintas.com.br';
  private readonly companyName = 'TPS Tintas Cuiabá';
  private readonly defaultImage = 'https://tpstintas.com.br/assets/images/logoTps.svg';

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Monitorar mudanças de rota para atualizar canonical URL
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCanonicalUrl(this.baseUrl + event.urlAfterRedirects);
    });
  }

  updateSeoData(data: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    // Atualizar título com fallback para nome da empresa
    if (data.title) {
      this.title.setTitle(data.title);
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }

    // Atualizar descrição
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }

    // Atualizar keywords
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Atualizar imagem com fallback
    const imageUrl = data.image || this.defaultImage;
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    // Atualizar URL
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
      this.meta.updateTag({ name: 'twitter:url', content: data.url });
      this.updateCanonicalUrl(data.url);
    }

    // Atualizar tipo
    if (data.type) {
      this.meta.updateTag({ property: 'og:type', content: data.type });
    }

    // Tags adicionais para SEO local
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:site_name', content: this.companyName });
    this.meta.updateTag({ name: 'geo.region', content: 'BR-MT' });
    this.meta.updateTag({ name: 'geo.placename', content: 'Cuiabá, Mato Grosso' });
  }

  // Atualizar URL canônica
  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  // Método específico para produtos
  updateProductSeo(product: any): void {
    const title = `${product.name} - Tinta WEG | ${this.companyName}`;
    const description = `${product.name} - Tinta WEG de qualidade disponível na TPS Tintas em Cuiabá. ${product.category} com ${product.descont}% de desconto. Entrega rápida em toda região metropolitana.`;
    const productUrl = `${this.baseUrl}/catalog/${product.id}`;

    this.updateSeoData({
      title,
      description,
      keywords: `${product.name}, tinta ${product.category}, tintas weg cuiabá, ${product.brand}, comprar tinta cuiabá, ${product.color}`,
      image: product.image || this.defaultImage,
      url: productUrl,
      type: 'product'
    });

    // Schema.org para produto
    this.addProductSchema(product);
  }

  // Adicionar Schema.org para produto
  private addProductSchema(product: any): void {
    const finalPrice = product.price - ((product.price / 100) * product.descont);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": [product.image || this.defaultImage],
      "description": `${product.name} - Tinta de qualidade ${product.brand} disponível na TPS Tintas Cuiabá`,
      "sku": `TPS-${product.id}`,
      "mpn": product.id.toString(),
      "brand": {
        "@type": "Brand",
        "name": product.brand || "WEG"
      },
      "category": product.category,
      "color": product.color,
      "offers": {
        "@type": "Offer",
        "url": `${this.baseUrl}/catalog/${product.id}`,
        "priceCurrency": "BRL",
        "price": finalPrice.toFixed(2),
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "TPS Tintas",
          "url": this.baseUrl
        },
        "areaServed": {
          "@type": "State",
          "name": "Mato Grosso"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "reviewCount": "45",
        "bestRating": "5",
        "worstRating": "1"
      },
      "manufacturer": {
        "@type": "Organization",
        "name": product.brand || "WEG"
      }
    };

    this.removeSchema('product-schema');

    const script = this.document.createElement('script') as HTMLScriptElement;
    script.id = 'product-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  // Método para página de categoria
  updateCategorySeo(category: string, productCount?: number): void {
    const title = `${category} WEG - Tintas de Qualidade | ${this.companyName}`;
    const description = `Catálogo completo de ${category} WEG em Cuiabá. ${productCount ? `${productCount} produtos disponíveis.` : ''} Qualidade garantida, cores personalizadas e entrega rápida em Mato Grosso.`;

    this.updateSeoData({
      title,
      description,
      keywords: `${category}, tintas weg cuiabá, catálogo ${category}, preços tintas ${category.toLowerCase()}, comprar ${category.toLowerCase()} cuiabá`,
      url: `${this.baseUrl}/catalog?category=${encodeURIComponent(category)}`,
      type: 'website'
    });

    // Schema para categoria de produto
    this.addCategorySchema(category, productCount);
  }

  // Schema para categoria
  private addCategorySchema(category: string, productCount?: number): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category} - TPS Tintas Cuiabá`,
      "description": `Catálogo de ${category} WEG disponível na TPS Tintas em Cuiabá`,
      "url": `${this.baseUrl}/catalog?category=${encodeURIComponent(category)}`,
      "mainEntity": {
        "@type": "ItemList",
        "name": category,
        "numberOfItems": productCount || 0,
        "itemListElement": []
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": this.baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Catálogo",
            "item": `${this.baseUrl}/catalog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category,
            "item": `${this.baseUrl}/catalog?category=${encodeURIComponent(category)}`
          }
        ]
      }
    };

    this.removeSchema('category-schema');

    const script = this.document.createElement('script') as HTMLScriptElement;
    script.id = 'category-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  // Método para página de busca
  updateSearchSeo(query: string, resultCount?: number): void {
    const title = `Busca por "${query}" - ${this.companyName}`;
    const description = `Resultados da busca por "${query}" em tintas WEG. ${resultCount ? `${resultCount} produtos encontrados.` : ''} Encontre as melhores tintas em Cuiabá.`;

    this.updateSeoData({
      title,
      description,
      keywords: `${query}, busca tintas, ${query} cuiabá, procurar ${query}`,
      url: `${this.baseUrl}/catalog?search=${encodeURIComponent(query)}`,
      type: 'website'
    });
  }

  // Adicionar breadcrumb schema
  addBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };

    this.removeSchema('breadcrumb-schema');

    const script = this.document.createElement('script') as HTMLScriptElement;
    script.id = 'breadcrumb-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  // Método para FAQ Schema
  addFaqSchema(faqs: Array<{question: string, answer: string}>): void {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    this.removeSchema('faq-schema');

    const script = this.document.createElement('script') as HTMLScriptElement;
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  // Remover schemas antigos
  removeSchema(id: string): void {
    const script = this.document.getElementById(id);
    if (script) {
      script.remove();
    }
  }

  // Limpar todos os schemas
  clearAllSchemas(): void {
    const schemaIds = ['product-schema', 'category-schema', 'breadcrumb-schema', 'faq-schema'];
    schemaIds.forEach(id => this.removeSchema(id));
  }
}
