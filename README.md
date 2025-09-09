<div align="center">
	<img src="./src/assets/images/logoTps.svg" alt="TPS Tintas" height="80" />
</div>

## TPS Tintas
  
Catálogo e painel administrativo de tintas WEG (industrial, automotiva e residencial) com gestão de produtos, SEO otimizado e destaque de produtos mais vendidos.

## 🚀 Tecnologias

- Angular 16
- Tailwind CSS
- RxJS
- SEO dinâmico (metadados por rota)

## 📦 Funcionalidades Principais

- Catálogo de produtos com filtros por:
	- Categoria (família de tintas)
	- Tamanho (conteúdo da embalagem)
	- Cor comercial
	- Faixa de preço
- Destaque de produtos "Mais Vendidos" (`mais_vendidos`)
- Banner otimizado com overlay e blur
- Componentização (cards, catálogo, home, header, footer)
- Admin com CRUD de produtos (adicionar / editar)
- Upload e compressão de imagem (base64)
- Contagem dinâmica de opções disponíveis por filtro
- Remoção de logs em produção

## 📁 Estrutura (resumida)

```
src/
	app/
		components/
			home/
			catalog/
		admin/
			products/
				add/
				edit/
		services/
			products/
			cart/
			seo/
	assets/
		images/
		icons/
```

## 🛠 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor dev em http://localhost:4200 |
| `npm run build` | Gera build de produção em `dist/` |
| `npm test` | Executa testes unitários (Karma/Jasmine) |
| `npm run watch` | Build em modo watch |

## ▶️ Como Rodar

```bash
git clone <repo>
cd tps-tintas
npm install
npm start
```

Acesse: http://localhost:4200

## 📌 Variáveis / Configuração

Verifique o arquivo de ambiente em `src/environment/enviroment.ts` para endpoints e configurações de API.

## 🧩 SEO Dinâmico

O serviço `SeoService` atualiza título, descrição e keywords por rota principal (home, catálogo, etc.).

## 🛒 Carrinho

`CartService` permite adicionar produtos a partir de cards e detalhes.

## ⭐ Produtos Mais Vendidos

Campo booleano `mais_vendidos` controlado no admin. Exibido:
- Lista do catálogo (badge)
- Seção "Os Mais Vendidos" na Home

## 🤝 Contribuição

Siga o padrão Angular CLI ao gerar novos componentes e serviços.

```bash
ng generate component minha-feature
ng generate service services/minha-feature
```

## 📄 Licença

Uso interno / proprietário.

---

Qualquer melhoria desejada (ex: autenticação avançada, PWA, cache) pode ser adicionada futuramente.
