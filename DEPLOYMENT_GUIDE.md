# Guia de Deploy Manual - YogaFlow

Siga este passo a passo para popular o banco de dados e subir os arquivos para a sua hospedagem (cPanel).

## 1. Banco de Dados (População)

Você já criou as tabelas (`users`, `poses`, etc.) usando o `database_full.sql`. Agora precisamos inserir os dados iniciais.

No **phpMyAdmin**:
1.  Selecione seu banco de dados (`yogaflowapp_yogaflow`).
2.  Vá na aba **Importar**.
3.  Importe os seguintes arquivos (nesta ordem):
    *   `backend/seed_poses.sql` (Cria as poses de yoga)
    *   `backend/seed_articles.sql` (Cria os artigos da base de conhecimento)

## 2. Criar Usuário Administrador

Como o sistema usa criptografia segura para senhas, não é recomendado inserir o administrador via SQL direto (risco da senha não funcionar).

1.  Envie o arquivo `backend/setup_admin.php` para a pasta `public_html/yogaflow/backend/` no seu servidor.
2.  Acesse pelo navegador: `https://yogaflowapp.cloud/yogaflow/backend/setup_admin.php`
3.  Você verá uma mensagem de sucesso com o login:
    *   **Email:** `admin@yogaflow.com`
    *   **Senha:** `admin123`
4.  **Importante:** Apague o arquivo `setup_admin.php` do servidor após o uso.

## 3. Upload dos Arquivos do App

Para o aplicativo funcionar, você precisa enviar dois conjuntos de arquivos para a pasta `public_html/yogaflow`:

### A. Frontend (O Site em si)
1.  No seu computador, abra o terminal e rode:
    ```bash
    npm run build
    ```
2.  Isso criará uma pasta `dist` na raiz do projeto.
3.  Abra a pasta `dist` e envie **todo o seu conteúdo** (arquivos `index.html`, pasta `assets`, etc.) para `public_html/yogaflow`.
    *   O `index.html` deve ficar diretamente dentro de `/yogaflow`.

### B. Backend (A API)
1.  Envie a pasta `backend` inteira do seu projeto para `public_html/yogaflow`.
    *   Resultado final: Você terá uma pasta `public_html/yogaflow/backend`.
2.  Verifique se o arquivo `public_html/yogaflow/backend/config/database.php` está com a senha correta do seu banco de dados da hospedagem.

## 4. Verificação Final

Sua estrutura de arquivos no servidor deve ficar assim:

```
public_html/
└── yogaflow/
    ├── index.html         (Do passo Build)
    ├── .htaccess          (Importante para rotas)
    ├── assets/            (Do passo Build)
    └── backend/           (Pasta da API)
        ├── api/
        ├── config/
        └── ...
```

Acesse `https://yogaflowapp.cloud/yogaflow` e teste o login!
