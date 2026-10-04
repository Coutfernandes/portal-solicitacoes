# Portal de Solicitações Internas

Aplicação web full stack para que colaboradores registrem solicitações internas, acompanhem o andamento e consultem indicadores e resultados filtrados.

## Funcionalidades

- Autenticação com usuário e senha, sessão por JWT e logout.
- Cadastro, edição e exclusão de solicitações abertas.
- Categorias, solicitante, data de criação e status associados às solicitações.
- Alteração de status entre aberto, em atendimento, concluído e cancelado.
- Dashboard com contagens por status.
- Pesquisa por título ou código/ID, status, categoria e período de criação.
- Ordenação da listagem e exportação dos resultados filtrados em CSV.
- Interface responsiva.

## Tecnologias e decisões

- **Python e Django REST Framework:** escolhi Python/Django porque já havia trabalhado com essas tecnologias. O Django fornece recursos maduros para autenticação, validação, administração e persistência; o DRF organiza a exposição dos dados por API.
- **React e TypeScript com Vite:** escolhi React por já ter experiência com a tecnologia e por facilitar a criação de uma interface dividida em componentes. TypeScript ajuda a detectar inconsistências nos dados consumidos da API; Vite oferece um fluxo de desenvolvimento e build direto.
- **Arquitetura desacoplada:** mantive o frontend separado do backend porque já havia trabalhado com esse modelo. A API REST faz a comunicação entre as partes, que podem ser executadas e implantadas independentemente.
- **SQLite:** atende ao escopo do mini-projeto e simplifica a execução local, sem exigir um servidor de banco separado. No deploy, o arquivo SQLite precisa ficar em armazenamento persistente.
- **Vercel:** será usada para publicar o frontend. A API Django ficará em um serviço Python com disco persistente, pois o filesystem de funções serverless não é apropriado para guardar o banco SQLite.
- **Sem Docker:** a instalação e a execução são feitas diretamente com Python e Node.js, sem contêineres.

## Estrutura do repositório

```text
backend/
  config/                 Configuração e rotas do Django
  solicitacoes/           Modelos, API, serializers e migrações
  requirements.txt        Dependências Python
  manage.py
frontend/
  src/
    components/           Componentes reutilizáveis
    pages/                Login e dashboard
    services/              Cliente HTTP da API
    types/                 Tipos TypeScript
  package.json
```

## Pré-requisitos

- Python 3.12 ou superior.
- Node.js 20.19 ou superior (ou 22.12 ou superior) e npm.
- Git, para clonar o repositório.

## Execução local no Windows

Abra dois terminais na raiz do projeto: um para o backend e outro para o frontend.

### 1. Preparar e iniciar o backend

No primeiro terminal, execute:

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

O Django cria o banco SQLite em `backend/db.sqlite3` por padrão. As migrações criam e atualizam as tabelas; não é necessário executar scripts SQL manualmente.

As migrações criam automaticamente as categorias iniciais TI, RH, Compras, Financeiro e Infraestrutura. Depois de criar o superusuário, use o painel administrativo em `http://localhost:8000/admin/` para gerenciá-las ou cadastrar outras.

O endpoint de cadastro também está disponível na tela de entrada. Não há credenciais de demonstração pré-configuradas: use a conta que criou com `createsuperuser` ou cadastre outra pela interface.

### 2. Instalar e iniciar o frontend

No segundo terminal, na raiz do projeto:

```powershell
cd frontend
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite, normalmente `http://localhost:5173`. Por padrão, o frontend chama a API local em `http://localhost:8000/api`.

### URL da API em desenvolvimento

Para usar outro endereço de API, crie `frontend/.env.local` com:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

O valor deve ser a URL base da API e incluir o sufixo `/api`. Reinicie o servidor Vite depois de alterar variáveis `VITE_*`.

## Configuração do backend

O backend lê estas variáveis de ambiente:

| Variável | Uso | Padrão local |
| --- | --- | --- |
| `SECRET_KEY` | Chave secreta do Django. Defina uma chave forte e privada fora do ambiente local. | Chave apenas para desenvolvimento |
| `DEBUG` | Ativa/desativa o modo de depuração. | `True` |
| `ALLOWED_HOSTS` | Hosts Django permitidos, separados por vírgula. | `*` |
| `CORS_ALLOWED_ORIGINS` | Origens completas autorizadas para chamar a API, separadas por vírgula. | Vazio |
| `SQLITE_PATH` | Caminho completo do arquivo SQLite. | `backend/db.sqlite3` |

Para gerar uma chave secreta:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Em produção, configure `DEBUG=False`, defina `SECRET_KEY`, informe o domínio da API em `ALLOWED_HOSTS` e o endereço HTTPS do frontend em `CORS_ALLOWED_ORIGINS`. Não publique chaves secretas nem as inclua no Git.

## API principal

As rotas da aplicação usam o prefixo `/api/`. As solicitações e categorias exigem autenticação.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/token/` | Obter tokens JWT usando usuário e senha |
| `POST` | `/api/token/refresh/` | Renovar um token JWT |
| `GET` | `/api/auth/me/` | Consultar o usuário autenticado |
| `POST` | `/api/auth/register/` | Cadastrar usuário |
| `GET`, `POST` | `/api/solicitacoes/` | Listar ou criar solicitações |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/solicitacoes/{id}/` | Consultar, alterar ou excluir uma solicitação |
| `PATCH` | `/api/solicitacoes/{id}/alterar_status/` | Alterar o status |
| `GET` | `/api/solicitacoes/kpis/` | Consultar indicadores |
| `GET` | `/api/categorias/` | Listar categorias |

Na listagem de solicitações, os parâmetros `search`, `status`, `categoria`, `data_inicio` e `data_fim` podem ser combinados. As datas usam o formato `AAAA-MM-DD`.

## Testes e verificações

Backend:

```powershell
cd backend
python manage.py test solicitacoes
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Deploy na Vercel com PostgreSQL no Neon

O frontend e o Django são publicados como dois projetos Vercel, ambos ligados ao mesmo repositório. A API usa PostgreSQL gerenciado no Neon; não use SQLite na Vercel, pois o filesystem das funções não é persistente. O projeto Django é detectado automaticamente pela Vercel usando `backend/manage.py` e `backend/config/wsgi.py`.

### 1. Criar o banco no Neon

1. Crie um projeto PostgreSQL no [Neon](https://neon.tech/).
2. Copie a **pooled connection string** do banco. Ela é a `DATABASE_URL`; mantenha-a privada e não a coloque no Git.
3. Use essa URL na configuração do projeto da API na Vercel e, temporariamente, no terminal local para aplicar as migrações iniciais.

### 2. Publicar a API Django na Vercel

1. Na Vercel, crie um novo projeto importando o mesmo repositório.
2. Defina **Root Directory** como `backend`. Mantenha a detecção automática do framework/comandos; não configure Gunicorn, pois a Vercel executa Django como uma função Python.
3. Adicione estas variáveis em **Settings → Environment Variables** para Production:

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | URL de conexão pooled copiada do Neon |
   | `SECRET_KEY` | Uma nova chave secreta forte, diferente da chave local |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | Domínio público da API na Vercel, sem `https://` |
   | `CORS_ALLOWED_ORIGINS` | `https://portal-solicitacoes-smoky.vercel.app` |

4. Faça o deploy e anote o domínio da API, por exemplo `https://portal-solicitacoes-api.vercel.app`.

### 3. Criar tabelas e categorias no Neon

As migrações criam as tabelas e as categorias iniciais. Execute-as uma vez do computador local, a partir da pasta `backend`, usando a mesma `DATABASE_URL` privada que cadastrou na Vercel:

```powershell
$secureUrl = Read-Host "Cole a DATABASE_URL do Neon" -AsSecureString
$env:DATABASE_URL = [System.Net.NetworkCredential]::new("", $secureUrl).Password
python manage.py migrate
Remove-Item Env:DATABASE_URL
```

Não cole a URL do banco em conversas, capturas de tela ou arquivos versionados. Para desenvolvimento local sem `DATABASE_URL`, o projeto continua usando SQLite.

### 4. Apontar o frontend para a nova API

No projeto Vercel do frontend, abra **Settings → Environment Variables** e defina `VITE_API_URL` para o domínio da API seguido de `/api`, por exemplo:

```text
https://portal-solicitacoes-api.vercel.app/api
```

Faça um novo deploy do frontend para aplicar a variável. Depois, confira no navegador o login e as chamadas `/api/categorias/` e `/api/solicitacoes/`.

Mantenha o serviço antigo do Render ativo até confirmar que o login, as categorias e as solicitações necessárias estão disponíveis no novo banco. A migração cria o schema e categorias padrão, mas não copia contas ou solicitações do SQLite antigo. A Vercel também não deve executar migrações durante cada invocação da API; aplique-as pelo terminal local apenas quando necessário.

## Modelo de dados resumido

- **Usuário:** utiliza o modelo de autenticação do Django.
- **Categoria:** identificador, nome, descrição opcional e data de criação.
- **Solicitação:** identificador (usado como código na interface), título, descrição, categoria, solicitante, status, prioridade, data de criação e data de atualização.

## Observações

- O banco SQLite local não contém necessariamente os dados de produção. As migrações criam as categorias iniciais, mas usuários e solicitações precisam ser cadastrados em cada ambiente.
- Não há Docker/Compose neste projeto.
- Não existem credenciais de teste compartilhadas no repositório; crie uma conta para cada ambiente.
