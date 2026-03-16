import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToolsService, Tool } from 'src/app/services/tools/tools.service';
import { SeoService } from 'src/app/services/seo/seo.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  // Variavel para armazenar as ferramentas
  public allTools: Tool[] = [];
  public tools: Tool[] = [];
  public toolsToShow: number = 12;

  get hasMoreTools(): boolean {
    return this.tools.length > this.toolsToShow;
  }

  get visibleTools(): Tool[] {
    return this.tools.slice(0, this.toolsToShow);
  }

  // Filtros
  public brands: string[] = [];
  public categories: string[] = [];
  public selectedBrands: Set<string> = new Set();
  public selectedCategories: Set<string> = new Set();
  public minPrice: number = 0;
  public maxPrice: number = 0;

  // Busca
  public searchTerm: string = '';
  public isLoading: boolean = true;
  public error: string = '';

  constructor(
    private readonly toolsService: ToolsService,
    private router: Router,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = (params.get('q') ?? '').trim();
      this.applyFilters();
    });

    // Configurar SEO para página de ferramentas
    this.setupToolsSeo();

    // Carregar todas as ferramentas
    this.loadTools();
  }

  private setupToolsSeo() {
    const routeData = this.route.snapshot.data;
    this.seoService.updateSeoData({
      title: routeData['title'] || 'Ferramentas - TPS Tintas Cuiabá | Recursos e Utilitários',
      description: routeData['description'] || 'Explore nossa coleção de ferramentas e recursos para facilitar sua experiência com tintas WEG industriais em Cuiabá.',
      keywords: routeData['keywords'] || 'ferramentas tps tintas, recursos tintas, utilitários pintura, ferramentas weg cuiabá',
      url: 'https://tpstintas.com.br/tools',
      type: 'website'
    });
  }

  private loadTools() {
    this.isLoading = true;
    this.error = '';

    this.toolsService.getTools().subscribe({
      next: (data: Tool[]) => {
        this.allTools = data;
        this.tools = [...data];
        this.extractBrandsAndCategories();
        this.setDefaultPriceRange();
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Erro ao carregar ferramentas. Tente novamente mais tarde.';
        this.isLoading = false;
        console.error('Erro ao carregar ferramentas:', err);
      }
    });
  }

  // Buscar ferramentas por nome
  searchTools() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchTerm.trim() || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Limpar busca
  clearSearch() {
    this.searchTerm = '';
    this.searchTools();
  }

  // Navegar para detalhes da ferramenta
  viewToolDetails(toolId: number) {
    this.router.navigate(['/tools', toolId]);
  }

  // Recarregar ferramentas
  reloadTools() {
    this.loadTools();
  }

  private extractBrandsAndCategories() {
    const brandSet = new Set<string>();
    const categorySet = new Set<string>();

    this.allTools.forEach(tool => {
      if (tool.marca && tool.marca.trim()) {
        brandSet.add(tool.marca.trim());
      }
      if (tool.categoria && tool.categoria.trim()) {
        categorySet.add(tool.categoria.trim());
      }
    });

    this.brands = Array.from(brandSet).sort();
    this.categories = Array.from(categorySet).sort();
  }

  private setDefaultPriceRange() {
    if (this.allTools.length > 0) {
      const prices = this.allTools.map(tool => Number(tool.preco) || 0);
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
    }
  }

  getToolsByBrand(event: Event, brand: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedBrands.add(brand);
    } else {
      this.selectedBrands.delete(brand);
    }
    this.applyFilters();
  }

  getToolsByCategory(event: Event, category: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedCategories.add(category);
    } else {
      this.selectedCategories.delete(category);
    }
    this.applyFilters();
  }

  filterByPrice(minPrice: number, maxPrice: number) {
    if (minPrice < 0) minPrice = 0;
    if (maxPrice <= 0) maxPrice = this.getMaxPrice();
    if (minPrice > maxPrice) {
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }
    this.applyAllFilters(minPrice, maxPrice);
  }

  clearAllFilters() {
    this.selectedBrands.clear();
    this.selectedCategories.clear();
    this.searchTerm = '';
    this.tools = [...this.allTools];
    this.toolsToShow = 12;
    this.setDefaultPriceRange();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge'
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  getToolsCountByBrand(brand: string): number {
    return this.allTools.filter(tool => tool.marca?.trim() === brand).length;
  }

  getToolsCountByCategory(category: string): number {
    return this.allTools.filter(tool => tool.categoria?.trim() === category).length;
  }

  getMaxPrice(): number {
    if (this.allTools.length === 0) return 1000;
    return Math.max(...this.allTools.map(tool => Number(tool.preco) || 0));
  }

  private applyFilters() {
    this.applyAllFilters();
  }

  private applyAllFilters(minPrice?: number, maxPrice?: number): void {
    let filteredTools = [...this.allTools];

    if (this.searchTerm) {
      const normalizedTerm = this.searchTerm.toLowerCase();
      filteredTools = filteredTools.filter((tool) => this.matchesSearch(tool, normalizedTerm));
    }

    if (this.selectedBrands.size > 0) {
      filteredTools = filteredTools.filter(tool => tool.marca && this.selectedBrands.has(tool.marca.trim()));
    }

    if (this.selectedCategories.size > 0) {
      filteredTools = filteredTools.filter(tool => tool.categoria && this.selectedCategories.has(tool.categoria.trim()));
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      filteredTools = filteredTools.filter(tool => Number(tool.preco) >= minPrice && Number(tool.preco) <= maxPrice);
    }

    this.tools = filteredTools;
    this.toolsToShow = 12;
  }

  private matchesSearch(tool: Tool, term: string): boolean {
    return [tool.nome, tool.descricao, tool.info_tecnica, tool.categoria, tool.marca]
      .some((value) => value?.toLowerCase().includes(term));
  }

  loadMore() {
    this.toolsToShow += 12;
  }

  getToolImageUrl(tool: Tool): string {
    return this.toolsService.getToolImageUrl(tool);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(price) || 0);
  }
}
