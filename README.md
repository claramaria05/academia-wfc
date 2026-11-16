# WCF Academia · Backend simples

```bash
npm install
npm start      # abra http://localhost:3000
```
- O servidor já entrega o `public/index.html` (front ligado à API). Abra pelo endereço acima, não clicando no arquivo.
- Tudo está em `server.js`. Os dados ficam em `data.json` (criado na primeira execução; apague para recomeçar).
- Contas de demonstração: `aluno@wcf.com` e `admin@wcf.com`, senha `123456`.

## Rotas
Login: `POST /api/login` e `/api/register` devolvem `{ token, user }`. Nas demais, envie `Authorization: Bearer <token>`.

| Recurso | Rotas |
|---|---|
| Estado das telas | GET `/api/state` |
| Alunos (admin) | GET/POST `/api/alunos`, PUT `/api/alunos/:id` |
| Modalidades | GET `/api/modalidades`, POST/PUT (admin) |
| Aulas | GET `/api/aulas`, POST/PUT/DELETE (admin), POST/DELETE `/api/aulas/:id/presenca` |
| Matrículas | GET/POST `/api/matriculas`, PATCH `/api/matriculas/:id/toggle` |
| Pagamentos | GET `/api/pagamentos`, POST e PATCH `/:id/toggle` (admin) |

Limites: uma única instância, sessões em memória (reiniciar desloga todos), sem limite de tentativas de login.
