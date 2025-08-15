import { Component, OnInit, inject } from '@angular/core';
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
  public filteredTools: Tool[] = [];

  // Marcas
  public brands: string[] = [];
  public selectedBrand: string | null = null;
  public showBrands: boolean = true;

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
        this.extractBrands();
        // Sempre começar mostrando marcas
        this.showBrands = true;
        this.selectedBrand = null;
        this.filteredTools = [];
        this.isLoading = false;
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
    // Só permite buscar quando está visualizando ferramentas de uma marca
    if (!this.selectedBrand) {
      return;
    }

    if (!this.searchTerm.trim()) {
      this.filterByBrand(this.selectedBrand);
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    const toolsInBrand = this.allTools.filter(tool => 
      tool.marca && tool.marca.trim() === this.selectedBrand
    );

    this.filteredTools = toolsInBrand.filter(tool =>
      tool.nome.toLowerCase().includes(searchLower) ||
      tool.descricao.toLowerCase().includes(searchLower) ||
      tool.info_tecnica.toLowerCase().includes(searchLower) ||
      (tool.categoria && tool.categoria.toLowerCase().includes(searchLower))
    );
  }

  // Limpar busca
  clearSearch() {
    this.searchTerm = '';
    if (this.selectedBrand) {
      this.filterByBrand(this.selectedBrand);
    }
  }

  // Navegar para detalhes da ferramenta
  viewToolDetails(toolId: number) {
    this.router.navigate(['/tools', toolId]);
  }

  // Recarregar ferramentas
  reloadTools() {
    this.loadTools();
  }

  // Extrair marcas únicas das ferramentas
  private extractBrands() {
    const brandSet = new Set<string>();
    
    this.allTools.forEach(tool => {
      if (tool.marca && tool.marca.trim()) {
        brandSet.add(tool.marca.trim());
      }
    });
    
    this.brands = Array.from(brandSet).sort();
  }

  // Selecionar marca
  selectBrand(brand: string) {
    this.selectedBrand = brand;
    this.showBrands = false;
    this.filterByBrand(brand);
  }

  // Filtrar ferramentas por marca
  private filterByBrand(brand: string) {
    this.filteredTools = this.allTools.filter(tool => 
      tool.marca && tool.marca.trim() === brand
    );
  }

  // Voltar para marcas
  backToBrands() {
    this.selectedBrand = null;
    this.showBrands = true;
    this.filteredTools = [];
    this.clearSearch();
  }

  // Obter ferramentas por marca (para contagem)
  getToolsCountByBrand(brand: string): number {
    return this.allTools.filter(tool => 
      tool.marca && tool.marca.trim() === brand
    ).length;
  }
}
