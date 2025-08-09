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
        this.filteredTools = [...data];
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
    if (!this.searchTerm.trim()) {
      this.filteredTools = [...this.allTools];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    this.filteredTools = this.allTools.filter(tool =>
      tool.nome.toLowerCase().includes(searchLower) ||
      tool.descricao.toLowerCase().includes(searchLower) ||
      tool.info_tecnica.toLowerCase().includes(searchLower)
    );
  }

  // Limpar busca
  clearSearch() {
    this.searchTerm = '';
    this.filteredTools = [...this.allTools];
  }

  // Navegar para detalhes da ferramenta
  viewToolDetails(toolId: number) {
    this.router.navigate(['/tools', toolId]);
  }

  // Recarregar ferramentas
  reloadTools() {
    this.loadTools();
  }
}
