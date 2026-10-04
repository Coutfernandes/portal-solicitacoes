# Portal de Solicitações Internas

Aplicação web para registo e acompanhamento de solicitações internas, com autenticação, categorias e dashboard de indicadores.

## Aplicação publicada

- **Frontend:** [portal-solicitacoes-smoky.vercel.app](https://portal-solicitacoes-smoky.vercel.app/)
- **API Django:** [portal-solicitacoes-88.vercel.app](https://portal-solicitacoes-88.vercel.app/)
- **Banco de dados:** PostgreSQL gerenciado no Neon

A API não possui página inicial em `/`. Para verificar o serviço, acesse uma rota da API, por exemplo `/api/categorias/`. As rotas de categorias e solicitações exigem autenticação.

## Funcionalidades

- Cadastro e autenticação de utilizadores com JWT.
- Criação, edição e exclusão de solicitações.
- Categorias, prioridade, status e datas associados às solicitações.
- Dashboard com indicadores por status.
- Filtros por título/código, status, categoria e período de criação.
- Ordenação de resultados e exportação CSV.
- Interface responsiva em português.

## Tecnologias

- **Backend:** Python, Django e Django REST Framework.
- **Frontend:** React, TypeScript, Vite e Tailwind CSS.
- **Banco local:** SQLite.
- **Banco publicado:** PostgreSQL no Neon.
- **Hospedagem:** Vercel para frontend e API; Neon para o banco de dados.
- **Arquitetura:** frontend e backend desacoplados, comunicando-se por API REST.
- **Docker:** não é necessário.

## Estrutura

```text
backend/
  config/                 Configurações, URLs e entrada WSGI do Django
  solicitacoes/           Modelos, API, serializers, testes e migrações
  requirements.txt        Dependências Python
  manage.py
frontend/
  src/
    components/           Componentes reutilizáveis
    pages/                Login e dashboard
    services/             Cliente HTTP da API
    types/                Tipos TypeScript
  package.json
```

## Requisitos

- Python 3.12 ou superior.
- Node.js 20.19 ou superior (ou 22.12 ou superior) e npm.
- Git.

## Desenvolvimento local no Windows

### Backend

No PowerShell, a partir da raiz do repositório:

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Por padrão, o Django usa `backend/db.sqlite3`. As migrações criam as tabelas e as categorias iniciais: TI, RH, Compras, Financeiro e Infraestrutura. O painel administrativo local fica em `http://localhost:8000/admin/`.

Não há contas de demonstração pré-configuradas. Crie uma conta pela tela de registo ou use o superutilizador criado acima.

### Frontend

Abra outro terminal na raiz do repositório:

```powershell
cd frontend
npm ci
npm run dev
```

O Vite normalmente inicia em `http://localhost:5173`. Sem configuração adicional, o frontend usa a API local `http://localhost:8000/api`.

Para apontar o frontend local para outra API, crie `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Reinicie o Vite após alterar variáveis `VITE_*`.

## Variáveis de ambiente

### Backend

| Variável | Finalidade |
| --- | --- |
| `SECRET_KEY` | Chave secreta do Django; use um valor privado e forte em produção. |
| `DEBUG` | Ativa ou desativa o modo de depuração. Em produção, use `False`. |
| `ALLOWED_HOSTS` | Domínios autorizados pelo Django, separados por vírgula. |
| `CORS_ALLOWED_ORIGINS` | Origens do frontend autorizadas, URLs completas separadas por vírgula, sem barra final. |
| `DATABASE_URL` | URL de conexão PostgreSQL usada na Vercel/Neon. |
| `SQLITE_PATH` | Caminho opcional do arquivo SQLite local. |

Quando `DATABASE_URL` está definida, o backend usa PostgreSQL com SSL. Sem ela, usa SQLite local.

### Frontend

| Variável | Finalidade |
| --- | --- |
| `VITE_API_URL` | URL base da API, incluindo `/api`, por exemplo `https://portal-solicitacoes-88.vercel.app/api`. |

Variáveis `VITE_*` são incorporadas no código disponibilizado ao navegador. Não coloque senhas, tokens ou connection strings nelas.

## API

As rotas usam o prefixo `/api/`.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/token/` | Obter tokens JWT. |
| `POST` | `/api/token/refresh/` | Renovar token JWT. |
| `GET` | `/api/auth/me/` | Consultar o utilizador autenticado. |
| `POST` | `/api/auth/register/` | Registar utilizador. |
| `GET`, `POST` | `/api/solicitacoes/` | Listar ou criar solicitações. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/solicitacoes/{id}/` | Consultar, editar ou excluir solicitação. |
| `PATCH` | `/api/solicitacoes/{id}/alterar_status/` | Alterar status. |
| `GET` | `/api/solicitacoes/kpis/` | Consultar indicadores. |
| `GET` | `/api/categorias/` | Listar categorias. |

As listagens de solicitações aceitam os parâmetros `search`, `status`, `categoria`, `data_inicio` e `data_fim`. As datas usam o formato `AAAA-MM-DD`. As rotas de categorias e solicitações requerem autenticação.

## Testes e validação

Backend:

```powershell
cd backend
python manage.py test solicitacoes
python manage.py makemigrations --check --dry-run
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Deploy: API Django na Vercel e Neon

O frontend e a API são projetos Vercel separados, ligados ao mesmo repositório. O PostgreSQL do Neon é persistente; o filesystem das funções Vercel não deve ser usado para guardar SQLite.

### Projeto do backend

- **Root Directory:** `backend`.
- Mantenha a deteção automática da Vercel para Django/Python; não use Gunicorn como comando de inicialização.
- Conecte o banco Neon ao projeto da API e disponibilize a variável `DATABASE_URL`.
- Configure também `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS` com o domínio da API e `CORS_ALLOWED_ORIGINS` com o domínio HTTPS do frontend.
- O domínio atual da API é `portal-solicitacoes-88.vercel.app`.

Exemplo de origem CORS de produção:

```text
https://portal-solicitacoes-smoky.vercel.app
```

Se for testar por uma URL de preview Vercel, inclua essa origem exata em `CORS_ALLOWED_ORIGINS` e faça novo deploy do backend. Endereços de preview podem mudar; prefira o domínio estável de produção.

### Projeto do frontend

- **Root Directory:** `frontend`.
- Defina `VITE_API_URL` como `https://portal-solicitacoes-88.vercel.app/api`.
- Faça novo deploy do frontend depois de criar ou alterar `VITE_API_URL`.

### Aplicar migrações no Neon

As migrações criam as tabelas e as categorias iniciais. Execute-as a partir da pasta `backend`, no PowerShell local. O comando solicita a URL pooled do Neon sem mostrá-la durante a digitação e remove a variável do ambiente ao terminar:

```powershell
$secureUrl = Read-Host "Cole a DATABASE_URL pooled do Neon" -AsSecureString
$env:DATABASE_URL = (New-Object System.Net.NetworkCredential("", $secureUrl)).Password

try {
    .\venv\Scripts\python.exe manage.py migrate
}
finally {
    Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
    $secureUrl.Dispose()
}
```

Execute esse comando a partir do diretório `backend`, onde existe `venv`. Use a connection string pooled copiada do Neon. Nunca publique a URL, não a inclua em arquivos versionados e não a envie em mensagens ou capturas.

As migrações criam o schema e as categorias padrão, mas **não copiam utilizadores ou solicitações** de outro banco. Esses dados precisam ser cadastrados novamente no Neon quando se começa com uma base vazia.

## Segurança

- Não versione arquivos `.env`, `.env.local`, secrets, tokens ou URLs de conexão.
- Não compartilhe a `DATABASE_URL` nem a `SECRET_KEY`.
- Em produção, mantenha `DEBUG=False` e restrinja `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` aos domínios necessários.
- O Neon deve ser usado como armazenamento persistente; SQLite é apenas o padrão de desenvolvimento local.
