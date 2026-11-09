# Academia WCF — Plataforma Digital

## Sobre o projeto
Plataforma digital desenvolvida para facilitar a gestão e o atendimento dos alunos da Academia WCF.

## Objetivo
Permitir que alunos consultem modalidades, horários, realizem matrículas e acompanhem suas informações.

## Tecnologias utilizadas
- **HTML5:** estrutura das páginas.
- **CSS3:** estilização e design da interface.
- **JavaScript:** funcionalidades e regras de negócio.
- **LocalStorage:** armazenamento local dos dados no navegador.
- **Git e GitHub:** controle de versão e hospedagem do código.

## Funcionalidades
- Login e cadastro de alunos.
- Painel do aluno.
- Consulta de modalidades e horários.
- Matrículas.
- Consulta de aulas.
- Área administrativa.

## Estrutura atual
- `index.wcf.html`: arquivo principal da aplicação, contendo a interface e os códigos de funcionamento.

## Banco de dados
Nesta versão, os dados são armazenados localmente no navegador por meio do LocalStorage. A integração com um banco de dados real ainda não foi realizada.

## Mapeamento de telas e navegação

O sistema Academia WCF possui uma tela de acesso com opções de login e cadastro. Após a autenticação, o usuário é direcionado de acordo com seu perfil.

**Fluxo do aluno:**
- Acessar o sistema;
- Realizar login ou cadastro;
- Visualizar o painel inicial;
- Consultar modalidades;
- Realizar matrículas;
- Consultar aulas e confirmar presença;
- Consultar matrículas e pagamentos;
- Encerrar sessão.

**Fluxo do administrador:**
- Acessar o sistema;
- Realizar login;
- Visualizar o painel administrativo;
- Gerenciar alunos;
- Gerenciar matrículas;
- Gerenciar modalidades;
- Gerenciar aulas;
- Gerenciar pagamentos;
- Encerrar sessão.

## Semana 2 — Desenvolvimento do Core MVP

Nesta etapa, foi implementada e testada a jornada principal do sistema Academia WCF.

### 1. Implementação da jornada principal
- Login do aluno;
- Consulta das modalidades disponíveis;
- Escolha de modalidade;
- Realização de matrícula;
- Confirmação da matrícula.

### 2. Persistência e regras de negócio

O sistema utiliza o LocalStorage do navegador para armazenar e manter os dados, mesmo após atualizar a página.

Foram implementadas e testadas as seguintes regras:

- Impedir matrículas duplicadas na mesma modalidade;
- Impedir cadastro com campos obrigatórios vazios;
- Impedir cadastro com e-mail já existente;
- Salvar os dados dos alunos;
- Manter os dados após atualizar a página.

### 3. Testes realizados

As funcionalidades principais foram testadas no navegador, apresentando os resultados esperados.

**Tecnologia de armazenamento:** LocalStorage.

**Situação:** funcionalidades principais implementadas e testadas.

**Validações:** o sistema verifica os dados de acesso e apresenta mensagens quando existem informações inválidas, campos obrigatórios não preenchidos ou e-mails já cadastrados.

**Armazenamento:** nesta versão demonstrativa, os dados são armazenados no LocalStorage do navegador.
