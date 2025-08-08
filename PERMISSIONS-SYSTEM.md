# Sistema de Permissões - Usuários com Role "User"

## Alterações Implementadas

### 1. AuthService (`admin.service.ts`)
- **Novos métodos adicionados:**
  - `canEdit()`: Verifica se o usuário pode editar (apenas admin)
  - `canView()`: Verifica se o usuário pode visualizar (admin ou user)

### 2. Guard de Edição (`admin-edit.guard.ts`)
- **Novo guard criado** para proteger rotas de edição
- Permite acesso apenas para usuários com role "admin"
- Redireciona usuários com role "user" para páginas de visualização
- Mostra mensagem de aviso para usuários sem permissão

### 3. Componente de Usuários (`users.component.ts` e `users.component.html`)
- **Funcionalidades adicionadas:**
  - Injeção do AuthService
  - Métodos `canEdit()` e `canView()`
  - Validação de permissões antes de executar ações
  
- **Interface atualizada:**
  - Botões de "Novo Usuário", "Editar" e "Excluir" visíveis apenas para admin
  - Indicador "Modo Visualização" para usuários sem permissão de edição
  - Ícone de "Visualizar" para usuários com role "user"

### 4. Componente de Produtos (`products.component.ts` e `products.component.html`)
- **Funcionalidades adicionadas:**
  - Injeção do AuthService
  - Métodos `canEdit()` e `canView()`
  - Validação de permissões antes de executar ações
  
- **Interface atualizada:**
  - Botão "Adicionar Produto" visível apenas para admin
  - Botões de "Editar" e "Excluir" em cada produto visíveis apenas para admin
  - Indicador "Modo Visualização" no header
  - Mensagem explicativa no estado vazio

### 5. Sidebar (`sidebar.component.ts` e `sidebar.component.html`)
- **Funcionalidades adicionadas:**
  - Métodos `canEdit()`, `getCurrentUserInfo()` e `getCurrentUsername()`
  
- **Interface atualizada:**
  - Link "Adicionar Produto" visível apenas para admin
  - Indicador visual "Modo Visualização" para usuários sem permissão
  - Exibição do nome e role do usuário atual
  - Avatar com inicial do nome do usuário

### 6. Roteamento (`admin-routing.module.ts`)
- **Guards aplicados:**
  - Rotas de edição protegidas com `adminEditGuard`
  - `/admin/products/add` - apenas admin
  - `/admin/products/edit/:id` - apenas admin
  - `/admin/users/add` - apenas admin
  - `/admin/users/edit/:id` - apenas admin

## Comportamento do Sistema

### Para Usuários Admin:
- ✅ Acesso completo a todas as funcionalidades
- ✅ Pode criar, editar e excluir usuários e produtos
- ✅ Todos os botões e links visíveis
- ✅ Interface normal sem restrições

### Para Usuários com Role "User":
- ✅ Pode acessar área administrativa
- ✅ Pode visualizar listas de usuários e produtos
- ✅ Pode usar filtros e busca
- ❌ Não pode criar, editar ou excluir
- ❌ Botões de ação escondidos
- ℹ️ Indicadores visuais de "Modo Visualização"
- ℹ️ Redirecionamento automático se tentar acessar rotas de edição

### Segurança:
- **Guard no nível de rota**: Impede acesso direto via URL
- **Validação no componente**: Verifica permissões antes de executar ações
- **Interface condicional**: Esconde botões baseado em permissões
- **Mensagens informativas**: Usuário entende suas limitações

## Funcionamento
O sistema agora permite que usuários com role "user" acessem a área administrativa apenas para visualização, mantendo total controle de edição para administradores.
