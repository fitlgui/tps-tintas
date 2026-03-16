import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription, forkJoin, firstValueFrom, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { CartService } from '../../services/cart/cart.service';
import { ProductsService, Product } from '../../services/products/products.service';
import { ToolsService, Tool } from '../../services/tools/tools.service';
import { NotificationService } from '../../services/ui/notification.service';

interface SearchPreviewItem {
  id: number;
  type: 'product' | 'tool';
  title: string;
  subtitle: string;
  meta: string;
  routeCommands: (string | number)[];
  score: number;
}

interface SearchSnapshot {
  all: SearchPreviewItem[];
  products: SearchPreviewItem[];
  tools: SearchPreviewItem[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;
  @ViewChild('desktopSearchShell') desktopSearchShell!: ElementRef;
  @ViewChild('mobileSearchShell') mobileSearchShell!: ElementRef;
  isMobileMenuOpen = false;
  searchTerm = '';
  isSearching = false;
  isSearchOpen = false;
  searchResults: SearchPreviewItem[] = [];
  productResults: SearchPreviewItem[] = [];
  toolResults: SearchPreviewItem[] = [];
  cartService = inject(CartService);
  private readonly searchSubject = new Subject<string>();
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly toolsService: ToolsService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchSubject.pipe(
        map((term) => term.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 2) {
            this.resetSearchResults();
            return of(null);
          }

          this.isSearching = true;
          this.isSearchOpen = true;
          this.resetSearchResults();

          return this.searchAcrossCatalogs(term).pipe(
            catchError(() => of({ all: [], products: [], tools: [] }))
          );
        })
      ).subscribe((snapshot) => {
        this.isSearching = false;

        if (!snapshot) {
          return;
        }

        this.searchResults = snapshot.all;
        this.productResults = snapshot.products;
        this.toolResults = snapshot.tools;
        this.isSearchOpen = true;
      })
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.resetSearchState())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.searchSubject.complete();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isMobileMenuOpen) {
      this.mobileMenu.nativeElement.classList.remove('hidden');
      this.mobileMenu.nativeElement.classList.add('animate-fadeIn');
    } else {
      this.mobileMenu.nativeElement.classList.add('hidden');
      this.mobileMenu.nativeElement.classList.remove('animate-fadeIn');
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.mobileMenu.nativeElement.classList.add('hidden');
    this.mobileMenu.nativeElement.classList.remove('animate-fadeIn');
    this.closeSearchPreview();
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onSearchFocus(): void {
    if (this.searchTerm.trim().length >= 2 || this.isSearching || this.searchResults.length > 0) {
      this.isSearchOpen = true;
    }
  }

  async submitSearch(): Promise<void> {
    const normalizedTerm = this.searchTerm.trim();

    if (normalizedTerm.length < 2) {
      this.resetSearchState();
      return;
    }

    this.isSearching = true;
    this.resetSearchResults();

    const snapshot = await firstValueFrom(this.searchAcrossCatalogs(normalizedTerm));
    this.isSearching = false;

    if (snapshot.all.length === 0) {
      this.resetSearchState();
      await this.notificationService.info('Nenhum produto ou ferramenta foi encontrado para essa busca.', 'Sem resultados');
      return;
    }

    await this.selectSearchResult(snapshot.all[0]);
  }

  async selectSearchResult(item: SearchPreviewItem): Promise<void> {
    this.resetSearchState();
    await this.router.navigate(item.routeCommands);

    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  clearSearch(): void {
    this.resetSearchState();
  }

  closeSearchPreview(): void {
    this.isSearchOpen = false;
    this.isSearching = false;
    this.resetSearchResults();
  }

  get hasPreviewContent(): boolean {
    return this.isSearching || this.searchResults.length > 0 || (this.searchTerm.trim().length >= 2 && this.isSearchOpen);
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeSearchPreview();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    const clickedDesktop = this.desktopSearchShell?.nativeElement?.contains(target);
    const clickedMobile = this.mobileSearchShell?.nativeElement?.contains(target);
    const clickedMenu = this.mobileMenu?.nativeElement?.contains(target);

    if (!clickedDesktop && !clickedMobile && !clickedMenu) {
      this.closeSearchPreview();
    }
  }

  private searchAcrossCatalogs(term: string) {
    return forkJoin({
      products: this.productsService.getAllProducts().pipe(catchError(() => of([] as Product[]))),
      tools: this.toolsService.getTools().pipe(catchError(() => of([] as Tool[])))
    }).pipe(
      map(({ products, tools }) => this.buildSnapshot(term, products, tools))
    );
  }

  private buildSnapshot(term: string, products: Product[], tools: Tool[]): SearchSnapshot {
    const normalizedTerm = term.toLowerCase();

    const productResults = products
      .map((product) => this.mapProductResult(product, normalizedTerm))
      .filter((item): item is SearchPreviewItem => item !== null)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);

    const toolResults = tools
      .map((tool) => this.mapToolResult(tool, normalizedTerm))
      .filter((item): item is SearchPreviewItem => item !== null)
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);

    const all = [...productResults, ...toolResults].sort((left, right) => right.score - left.score);

    return {
      all,
      products: productResults,
      tools: toolResults
    };
  }

  private mapProductResult(product: Product, term: string): SearchPreviewItem | null {
    const fields = [
      product.descricao,
      product.codigo,
      product.familia_tintas,
      product.cor_comercial_tinta,
      product.linha_produtos_tintas
    ];
    const score = this.calculateScore(term, fields);

    if (score === 0 || !product.id) {
      return null;
    }

    return {
      id: product.id,
      type: 'product',
      title: product.descricao,
      subtitle: product.familia_tintas || 'Tinta WEG',
      meta: [product.codigo, product.cor_comercial_tinta, product.conteudo_embalagem].filter(Boolean).join(' • '),
      routeCommands: ['/catalog', product.id],
      score
    };
  }

  private mapToolResult(tool: Tool, term: string): SearchPreviewItem | null {
    const fields = [tool.nome, tool.descricao, tool.info_tecnica, tool.categoria, tool.marca];
    const score = this.calculateScore(term, fields);

    if (score === 0 || !tool.id) {
      return null;
    }

    return {
      id: tool.id,
      type: 'tool',
      title: tool.nome,
      subtitle: tool.marca || 'Ferramenta profissional',
      meta: [tool.categoria, tool.preco ? `R$ ${tool.preco}` : 'Sob consulta'].filter(Boolean).join(' • '),
      routeCommands: ['/tools', tool.id],
      score
    };
  }

  private calculateScore(term: string, values: Array<string | number | null | undefined>): number {
    let score = 0;

    values.forEach((value) => {
      const normalizedValue = value?.toString().toLowerCase().trim();

      if (!normalizedValue) {
        return;
      }

      if (normalizedValue === term) {
        score += 120;
        return;
      }

      if (normalizedValue.startsWith(term)) {
        score += 80;
        return;
      }

      if (normalizedValue.includes(term)) {
        score += 40;
      }
    });

    return score;
  }

  private resetSearchState(): void {
    this.searchTerm = '';
    this.isSearchOpen = false;
    this.isSearching = false;
    this.resetSearchResults();
  }

  private resetSearchResults(): void {
    this.searchResults = [];
    this.productResults = [];
    this.toolResults = [];
  }
}
