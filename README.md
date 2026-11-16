# 🏋️ WCF Academia

Sistema web de gestão para academias, com **três perfis de acesso** (aluno, professor e administrador). Controla modalidades, aulas, matrículas, presenças, pagamentos, fichas de treino e avaliações físicas.

O projeto é propositalmente enxuto: **um único arquivo de backend (`server.js`), uma única dependência (Express) e persistência em arquivo JSON**. O front-end é uma SPA em HTML/CSS/JS puro, servida pelo próprio backend.

> Projeto Integrador · Academia WCF

---

## 📑 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Como executar](#-como-executar)
- [Contas de demonstração](#-contas-de-demonstração)
- [Perfis e permissões](#-perfis-e-permissões)
- [API](#-api)
- [Modelo de dados](#-modelo-de-dados)
- [Regras de negócio](#-regras-de-negócio)
- [Segurança](#-segurança)
- [Limitações conhecidas](#-limitações-conhecidas)
- [Próximos passos](#-próximos-passos)

---

## ✨ Funcionalidades

**Aluno**
- Cadastro e login na plataforma
- Explorar modalidades e matricular-se
- Ver aulas futuras e confirmar/cancelar presença (respeitando lotação)
- Acompanhar matrículas, mensalidades e pagamentos
- Consultar suas fichas de treino e sua evolução física (peso, altura, % de gordura, IMC)

**Professor**
- Visualizar os alunos cadastrados
- Criar, editar e excluir **fichas de treino**
- Registrar, editar e excluir **avaliações físicas**

**Administrador**
- CRUD de alunos, modalidades e aulas
- Gestão de matrículas (criar, encerrar e reativar)
- Lançamento de mensalidades e baixa de pagamentos (pago/pendente)
- Painel com visão financeira (recebido × em aberto) e indicadores gerais
- Acesso total a fichas de treino e avaliações

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + [Express 5](https://expressjs.com/) |
| Persistência | Arquivo `data.json` (criado na primeira execução) |
| Autenticação | Token Bearer aleatório, sessões em memória |
| Hash de senha | `crypto.scrypt` com salt (nativo do Node) |
| Frontend | HTML + CSS + JavaScript puro (SPA em `public/index.html`) |
| Fontes | DM Sans e Outfit (Google Fonts) |

**Requisitos:** Node.js 18 ou superior.

---

## 📂 Estrutura do projeto

```
wcf-simples/
├── server.js        # Backend completo: API, regras de negócio e persistência
├── public/
│   └── index.html   # Front-end (SPA) integrado à API
├── data.json        # Banco de dados em arquivo (gerado automaticamente)
├── package.json
└── README.md
```

---

## 🚀 Como executar

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor
npm start
```

Acesse **http://localhost:3000**.

> ⚠️ Abra pelo endereço acima, **não** clicando diretamente no arquivo `index.html`. O front depende da API servida pelo backend.

### Variáveis de ambiente (opcionais)

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `DATA_FILE` | `./data.json` | Caminho do arquivo de dados |

```bash
PORT=8080 DATA_FILE=/tmp/wcf.json npm start
```

### Resetar os dados

Apague o `data.json` e reinicie o servidor. Os dados de demonstração serão recriados.

---

## 👤 Contas de demonstração

Todas usam a senha **`123456`**.

| Perfil | E-mail |
|---|---|
| Aluno | `aluno@wcf.com` |
| Professor | `prof@wcf.com` |
| Administrador | `admin@wcf.com` |

Também existem os alunos `mariana@wcf.com` e `pedro@wcf.com`.

---

## 🔐 Perfis e permissões

| Recurso | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Ver modalidades e aulas | ✅ | ✅ | ✅ |
| Criar/editar modalidades e aulas | ❌ | ❌ | ✅ |
| Matricular-se em modalidade | ✅ (própria) | ❌ | ✅ (qualquer aluno) |
| Encerrar/reativar matrícula | ✅ (própria) | ❌ | ✅ |
| Confirmar/cancelar presença | ✅ | ❌ | ❌ |
| Ver pagamentos | ✅ (próprios) | ❌ | ✅ (todos) |
| Lançar/baixar pagamentos | ❌ | ❌ | ✅ |
| Gerenciar alunos | ❌ | ❌ | ✅ |
| Ver fichas e avaliações | ✅ (próprias) | ✅ (todas) | ✅ (todas) |
| Criar/editar/excluir fichas e avaliações | ❌ | ✅ | ✅ |

---

## 📡 API

**Base:** `/api` · **Formato:** JSON

Os endpoints `POST /login` e `POST /register` devolvem `{ token, user }`. Todas as demais rotas exigem o cabeçalho:

```
Authorization: Bearer <token>
```

### Autenticação

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/login` | Login com `email` e `password` | Público |
| POST | `/register` | Cadastro de aluno (`name`, `email`, `phone`, `password`) | Público |
| GET | `/me` | Dados do usuário logado | Logado |
| GET | `/state` | Estado completo visível ao usuário (usado pelo front para montar as telas) | Logado |

### Recursos

| Recurso | Rotas | Acesso |
|---|---|---|
| **Alunos** | `GET /alunos?q=`, `POST /alunos`, `PUT /alunos/:id` | Admin |
| **Modalidades** | `GET /modalidades?q=` | Logado |
| | `POST /modalidades`, `PUT /modalidades/:id` | Admin |
| **Aulas** | `GET /aulas?q=` | Logado |
| | `POST /aulas`, `PUT /aulas/:id`, `DELETE /aulas/:id` | Admin |
| | `POST /aulas/:id/presenca`, `DELETE /aulas/:id/presenca` | Aluno |
| **Matrículas** | `GET /matriculas?q=&status=`, `POST /matriculas` | Logado (escopo por perfil) |
| | `PATCH /matriculas/:id/toggle` | Dono da matrícula ou Admin |
| **Pagamentos** | `GET /pagamentos?q=&status=` | Logado (escopo por perfil) |
| | `POST /pagamentos`, `PATCH /pagamentos/:id/toggle` | Admin |
| **Treinos** | `GET /treinos` | Logado (escopo por perfil) |
| | `POST /treinos`, `PUT /treinos/:id`, `DELETE /treinos/:id` | Professor e Admin |
| **Avaliações** | `GET /avaliacoes` | Logado (escopo por perfil) |
| | `POST /avaliacoes`, `PUT /avaliacoes/:id`, `DELETE /avaliacoes/:id` | Professor e Admin |

### Exemplo de uso

```bash
# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@wcf.com","password":"123456"}'

# Listar aulas futuras (substitua <token>)
curl http://localhost:3000/api/aulas \
  -H "Authorization: Bearer <token>"

# Confirmar presença na aula 1
curl -X POST http://localhost:3000/api/aulas/1/presenca \
  -H "Authorization: Bearer <token>"
```

### Códigos de resposta

| Código | Significado |
|---|---|
| `200` / `201` / `204` | Sucesso |
| `400` | Dados inválidos (e-mail, data, horário, campos obrigatórios) |
| `401` | Credenciais incorretas ou sessão ausente/expirada |
| `403` | Sem permissão para a ação |
| `404` | Registro não encontrado |
| `409` | Conflito (e-mail duplicado, matrícula repetida, turma lotada) |
| `500` | Erro interno |

Erros seguem o formato `{ "error": "mensagem em português" }`.

---

## 🗃 Modelo de dados

Todos os dados ficam em `data.json`, organizados em coleções:

| Coleção | Campos principais |
|---|---|
| `users` | `id`, `name`, `email`, `phone`, `role` (`aluno` \| `professor` \| `admin`), `password` (hash) |
| `modalidades` | `id`, `name`, `icon`, `description`, `instructor`, `days`, `time`, `capacity` |
| `aulas` | `id`, `modalityId`, `date`, `time`, `instructor`, `capacity` |
| `matriculas` | `id`, `userId`, `modalityId`, `date`, `status` (`Ativa` \| `Inativa`) |
| `presencas` | `id`, `userId`, `aulaId`, `status` (`Confirmada` \| `Cancelada`) |
| `pagamentos` | `id`, `userId`, `description`, `amount`, `due`, `status` (`Pago` \| `Pendente`) |
| `treinos` | `id`, `userId`, `professorId`, `name`, `exercises`, `date` |
| `avaliacoes` | `id`, `userId`, `professorId`, `date`, `weight`, `height`, `bf`, `notes` |

---

## 📏 Regras de negócio

- **E-mail único** por usuário; senhas com no mínimo 6 caracteres.
- **Matrícula ativa única** por aluno em cada modalidade.
- Só é possível **confirmar presença** se o aluno tiver matrícula ativa na modalidade da aula, a aula for futura e ainda houver vagas.
- **Encerrar uma matrícula cancela automaticamente** as presenças futuras daquela modalidade.
- A **capacidade de uma aula** não pode ser reduzida abaixo do número de presenças já confirmadas.
- Aulas só podem ser criadas/editadas com **data futura**; ao excluir uma aula, suas presenças são removidas.
- Presenças de outros alunos ficam **anonimizadas** (`userId: 0`) para quem não é admin.
- Datas usam o fuso **America/Fortaleza**.

---

## 🔒 Segurança

**O que já existe**
- Senhas armazenadas com **scrypt + salt** (nunca em texto puro)
- Respostas nunca expõem o hash da senha
- Controle de acesso por perfil no backend
- Validação de entrada (e-mail, datas, horários, números, tamanho de texto)
- Escape de HTML no front-end e limite de 100 KB no corpo das requisições

---

## ⚠️ Limitações conhecidas

- **Instância única:** o backend não escala horizontalmente (estado em memória e arquivo local).
- **Sessões em memória:** reiniciar o servidor desloga todos os usuários.
- **Sem limite de tentativas de login** (vulnerável a força bruta).
- **Persistência em arquivo JSON:** sem transações; não indicado para alto volume ou concorrência.
- **Sem HTTPS nativo:** em produção, use um proxy reverso (Nginx, Caddy etc.).
- **Edição/exclusão de treinos e avaliações** não verifica se o professor é o autor do registro.
- **Contas de demonstração** com senha conhecida e `data.json` versionado: não usar em produção.
- **Sem testes automatizados.**

---

## 🧭 Próximos passos

- [ ] Rate limiting no login
- [ ] Migrar para banco de dados (SQLite ou PostgreSQL)
- [ ] Sessões persistentes (JWT ou store externo)
- [ ] Restringir edição de treinos/avaliações ao professor autor
- [ ] Testes automatizados da API
- [ ] Adicionar `.gitignore` (`node_modules`, `data.json`)
- [ ] Recuperação de senha e troca de senha pelo próprio usuário
- [ ] Integração com meio de pagamento
