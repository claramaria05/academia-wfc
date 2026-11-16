// WCF Academia · backend simples (1 arquivo, 1 dependência, dados em data.json)
const express = require('express'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 3000;

// ---------- utilitários ----------
const hash = (p, salt = crypto.randomBytes(8).toString('hex')) => salt + ':' + crypto.scryptSync(p, salt, 32).toString('hex');
const checkPass = (p, h) => hash(p, h.split(':')[0]) === h;
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
const addDays = n => { const d = new Date(today() + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fail = (status, msg) => { const e = new Error(msg); e.status = status; throw e; };
const text = (v, label, min = 1) => { const s = String(v ?? '').trim(); if (s.length < min || s.length > 300) fail(400, `Campo inválido: ${label}.`); return s; };
const num = (v, label, min = 1) => { const n = Number(v); if (!Number.isFinite(n) || n < min) fail(400, `Campo inválido: ${label}.`); return n; };
const validEmail = v => { const s = text(v, 'e-mail').toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) fail(400, 'E-mail inválido.'); return s; };
const validDate = v => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) fail(400, 'Data inválida.'); return v; };
const validTime = v => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v || '')) fail(400, 'Horário inválido.'); return v; };
const has = (s, q) => String(s).toLowerCase().includes(String(q || '').toLowerCase());
const next = arr => Math.max(0, ...arr.map(x => x.id)) + 1;

// ---------- dados (arquivo JSON) ----------
function seed() {
  const p = hash('123456');
  return {
    users: [
      { id: 1, name: 'Daniel Carvalho', email: 'aluno@wcf.com', phone: '(83) 99999-0000', role: 'aluno', password: p },
      { id: 2, name: 'Equipe WCF', email: 'admin@wcf.com', phone: '', role: 'admin', password: p },
      { id: 5, name: 'Prof. Carlos', email: 'prof@wcf.com', phone: '', role: 'professor', password: p },
      { id: 3, name: 'Mariana Silva', email: 'mariana@wcf.com', phone: '', role: 'aluno', password: p },
      { id: 4, name: 'Pedro Costa', email: 'pedro@wcf.com', phone: '', role: 'aluno', password: p },
    ],
    modalidades: [
      { id: 1, name: 'Musculação', icon: '▤', description: 'Treine no seu ritmo com estrutura completa e acompanhamento.', instructor: 'Equipe WCF', days: 'Seg a sáb', time: '06:00 às 22:00', capacity: 100 },
      { id: 2, name: 'Funcional', icon: '✦', description: 'Treinos dinâmicos para força, resistência e mobilidade.', instructor: 'Camila Rocha', days: 'Seg, qua e sex', time: '07:00', capacity: 20 },
      { id: 3, name: 'Spinning', icon: '◉', description: 'Energia e condicionamento em aulas coletivas de bike.', instructor: 'Rafael Lima', days: 'Ter e qui', time: '18:00', capacity: 16 },
      { id: 4, name: 'Pilates', icon: '❋', description: 'Equilíbrio, postura e consciência corporal.', instructor: 'Lívia Andrade', days: 'Ter e qui', time: '09:00', capacity: 12 },
    ],
    aulas: [
      { id: 1, modalityId: 2, date: addDays(1), time: '07:00', instructor: 'Camila Rocha', capacity: 20 },
      { id: 2, modalityId: 3, date: addDays(1), time: '18:00', instructor: 'Rafael Lima', capacity: 16 },
      { id: 3, modalityId: 4, date: addDays(2), time: '09:00', instructor: 'Lívia Andrade', capacity: 12 },
      { id: 4, modalityId: 2, date: addDays(3), time: '07:00', instructor: 'Camila Rocha', capacity: 20 },
      { id: 5, modalityId: 3, date: addDays(4), time: '18:00', instructor: 'Rafael Lima', capacity: 16 },
    ],
    matriculas: [
      { id: 1, userId: 1, modalityId: 1, date: today(), status: 'Ativa' },
      { id: 2, userId: 1, modalityId: 2, date: today(), status: 'Ativa' },
      { id: 3, userId: 3, modalityId: 3, date: today(), status: 'Ativa' },
    ],
    presencas: [{ id: 1, userId: 1, aulaId: 1, status: 'Confirmada' }],
    treinos: [{ id: 1, userId: 1, professorId: 5, name: 'Ficha A - Hipertrofia', exercises: 'Supino Reto 4x10\nLeg Press 3x12', date: today() }],
    avaliacoes: [{ id: 1, userId: 1, professorId: 5, date: today(), weight: 75.5, height: 1.75, bf: 18.2, notes: 'Aluno com boa progressão.' }],
    pagamentos: [
      { id: 1, userId: 1, description: 'Mensalidade · Setembro', amount: 129.9, due: addDays(6), status: 'Pendente' },
      { id: 2, userId: 1, description: 'Mensalidade · Agosto', amount: 129.9, due: addDays(-24), status: 'Pago' },
      { id: 3, userId: 3, description: 'Mensalidade · Setembro', amount: 109.9, due: addDays(5), status: 'Pendente' },
    ],
  };
}
const db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : seed();
const save = () => fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
if (!fs.existsSync(FILE)) save();

const mod = id => db.modalidades.find(m => m.id == id);
const usr = id => db.users.find(u => u.id == id);
const pub = u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });
const confirmed = aulaId => db.presencas.filter(p => p.aulaId === aulaId && p.status === 'Confirmada').length;
const activeMat = (userId, modalityId) => db.matriculas.find(m => m.userId === userId && m.modalityId === modalityId && m.status === 'Ativa');

// ---------- app ----------
const app = express();
app.use(express.json({ limit: '100kb' }));
const api = express.Router();
const tokens = new Map(); // token -> userId (em memória: reiniciar o servidor desloga todos)
const startSession = u => { const t = crypto.randomBytes(24).toString('hex'); tokens.set(t, u.id); return { token: t, user: pub(u) }; };
const adminOnly = (req, _res, next) => req.user.role === 'admin' ? next() : fail(403, 'Acesso restrito à administração.');

// --- login / cadastro (públicos) ---
api.post('/login', (req, res) => {
  const u = db.users.find(x => x.email === String(req.body?.email || '').trim().toLowerCase());
  if (!u || !checkPass(String(req.body?.password || ''), u.password)) fail(401, 'E-mail ou senha incorretos.');
  res.json(startSession(u));
});
api.post('/register', (req, res) => {
  const b = req.body || {}, email = validEmail(b.email);
  if (db.users.some(u => u.email === email)) fail(409, 'Esse e-mail já está cadastrado.');
  if (String(b.password || '').length < 6) fail(400, 'Use uma senha com pelo menos 6 caracteres.');
  const u = { id: next(db.users), name: text(b.name, 'nome', 2), email, phone: String(b.phone || '').trim(), role: 'aluno', password: hash(b.password) };
  db.users.push(u); save(); res.status(201).json(startSession(u));
});

// --- daqui para baixo precisa estar logado ---
api.use((req, _res, next) => {
  const u = usr(tokens.get((req.headers.authorization || '').replace('Bearer ', '')));
  if (!u) fail(401, 'Faça login para continuar.');
  req.user = u; next();
});
api.get('/me', (req, res) => res.json(pub(req.user)));

// --- estado completo que o usuário pode ver (o front usa para montar as telas) ---
api.get('/state', (req, res) => {
  const admin = req.user.role === 'admin';
  res.json({
    users: admin || req.user.role === 'professor' ? db.users.map(pub) : [pub(req.user)],
    modalidades: db.modalidades,
    aulas: db.aulas,
    matriculas: db.matriculas.filter(m => admin || m.userId === req.user.id),
    presencas: db.presencas.map(p => admin || p.userId === req.user.id ? p : { ...p, userId: 0 }), // esconde de quem é a presença dos outros
    pagamentos: db.pagamentos.filter(p => admin || p.userId === req.user.id),
    treinos: db.treinos.filter(t => admin || req.user.role === 'professor' || t.userId === req.user.id),
    avaliacoes: db.avaliacoes.filter(a => admin || req.user.role === 'professor' || a.userId === req.user.id),
  });
});

// --- alunos (admin) ---
api.get('/alunos', adminOnly, (req, res) => res.json(
  db.users.filter(u => u.role === 'aluno' && has(u.name + ' ' + u.email, req.query.q))
    .map(u => ({ ...pub(u), activeEnrollments: db.matriculas.filter(m => m.userId === u.id && m.status === 'Ativa').length }))));
const saveStudent = (req, res, existing) => {
  const b = req.body || {}, email = validEmail(b.email);
  if (db.users.some(u => u.email === email && u.id !== existing?.id)) fail(409, 'E-mail já cadastrado.');
  const data = { name: text(b.name, 'nome', 2), email, phone: String(b.phone || '').trim() };
  if (existing) Object.assign(existing, data);
  else { if (String(b.password || '').length < 6) fail(400, 'Senha provisória: mínimo de 6 caracteres.'); existing = { id: next(db.users), ...data, role: 'aluno', password: hash(b.password) }; db.users.push(existing); }
  save(); res.status(201).json(pub(existing));
};
api.post('/alunos', adminOnly, (req, res) => saveStudent(req, res));
api.put('/alunos/:id', adminOnly, (req, res) => saveStudent(req, res, usr(req.params.id) || fail(404, 'Aluno não encontrado.')));

// --- modalidades ---
api.get('/modalidades', (req, res) => res.json(db.modalidades.filter(m => has(m.name, req.query.q)).map(m => ({
  ...m, activeStudents: db.matriculas.filter(x => x.modalityId === m.id && x.status === 'Ativa').length, enrolled: !!activeMat(req.user.id, m.id) }))));
const saveModality = (req, res, existing) => {
  const b = req.body || {};
  const data = { name: text(b.name, 'nome'), instructor: text(b.instructor, 'instrutor'), days: text(b.days, 'dias'), time: text(b.time, 'horário'), description: text(b.description, 'descrição') };
  if (existing) Object.assign(existing, data);
  else { existing = { id: next(db.modalidades), icon: '✦', capacity: 20, ...data }; db.modalidades.push(existing); }
  save(); res.status(201).json(existing);
};
api.post('/modalidades', adminOnly, (req, res) => saveModality(req, res));
api.put('/modalidades/:id', adminOnly, (req, res) => saveModality(req, res, mod(req.params.id) || fail(404, 'Modalidade não encontrada.')));

// --- aulas ---
api.get('/aulas', (req, res) => res.json(db.aulas
  .filter(a => a.date >= today() && has(mod(a.modalityId)?.name || '', req.query.q))
  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  .map(a => ({ ...a, modalityName: mod(a.modalityId)?.name, confirmed: confirmed(a.id),
    confirmedByMe: db.presencas.some(p => p.aulaId === a.id && p.userId === req.user.id && p.status === 'Confirmada') }))));
const saveClass = (req, res, existing) => {
  const b = req.body || {};
  const data = { modalityId: num(b.modalityId, 'modalidade'), instructor: text(b.instructor, 'instrutor'), date: validDate(b.date), time: validTime(b.time), capacity: num(b.capacity, 'vagas') };
  if (!mod(data.modalityId)) fail(404, 'Modalidade não encontrada.');
  if (data.date < today()) fail(400, 'Escolha uma data futura.');
  if (existing && data.capacity < confirmed(existing.id)) fail(400, 'As vagas não podem ser menores que as presenças confirmadas.');
  if (existing) Object.assign(existing, data);
  else { existing = { id: next(db.aulas), ...data }; db.aulas.push(existing); }
  save(); res.status(201).json(existing);
};
const aula = id => db.aulas.find(a => a.id == id) || fail(404, 'Aula não encontrada.');
api.post('/aulas', adminOnly, (req, res) => saveClass(req, res));
api.put('/aulas/:id', adminOnly, (req, res) => saveClass(req, res, aula(req.params.id)));
api.delete('/aulas/:id', adminOnly, (req, res) => {
  const a = aula(req.params.id);
  db.aulas = db.aulas.filter(x => x !== a); db.presencas = db.presencas.filter(p => p.aulaId !== a.id);
  save(); res.status(204).end();
});
api.post('/aulas/:id/presenca', (req, res) => {
  if (req.user.role !== 'aluno') fail(403, 'Apenas alunos confirmam presença.');
  const a = aula(req.params.id);
  if (a.date < today()) fail(400, 'Aula indisponível.');
  if (!activeMat(req.user.id, a.modalityId)) fail(403, 'Matricule-se na modalidade antes de confirmar sua presença.');
  let p = db.presencas.find(x => x.aulaId === a.id && x.userId === req.user.id);
  if (p?.status === 'Confirmada') fail(409, 'Presença já confirmada.');
  if (confirmed(a.id) >= a.capacity) fail(409, 'A turma está lotada.');
  if (p) p.status = 'Confirmada'; else db.presencas.push({ id: next(db.presencas), userId: req.user.id, aulaId: a.id, status: 'Confirmada' });
  save(); res.status(201).json({ ok: true });
});
api.delete('/aulas/:id/presenca', (req, res) => {
  const p = db.presencas.find(x => x.aulaId == req.params.id && x.userId === req.user.id && x.status === 'Confirmada') || fail(404, 'Presença não encontrada.');
  p.status = 'Cancelada'; save(); res.json({ ok: true });
});

// --- matrículas ---
api.get('/matriculas', (req, res) => res.json(db.matriculas
  .filter(m => (req.user.role === 'admin' || m.userId === req.user.id) && (!req.query.status || m.status === req.query.status)
    && has((mod(m.modalityId)?.name || '') + ' ' + (usr(m.userId)?.name || ''), req.query.q))
  .map(m => ({ ...m, userName: usr(m.userId)?.name, modalityName: mod(m.modalityId)?.name }))));
api.post('/matriculas', (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const userId = isAdmin ? num(req.body?.userId, 'aluno') : req.user.id, modalityId = num(req.body?.modalityId, 'modalidade');
  if (usr(userId)?.role !== 'aluno') fail(404, 'Aluno não encontrado.');
  if (!mod(modalityId)) fail(404, 'Modalidade não encontrada.');
  if (activeMat(userId, modalityId)) fail(409, 'Já existe matrícula ativa nesta modalidade.');
  const m = { id: next(db.matriculas), userId, modalityId, date: today(), status: 'Ativa' };
  db.matriculas.push(m); save(); res.status(201).json(m);
});
api.patch('/matriculas/:id/toggle', (req, res) => {
  const m = db.matriculas.find(x => x.id == req.params.id) || fail(404, 'Matrícula não encontrada.');
  if (req.user.role !== 'admin' && m.userId !== req.user.id) fail(403, 'Sem permissão.');
  if (m.status === 'Ativa') {
    m.status = 'Inativa'; // cancela presenças futuras dessa modalidade
    db.presencas.forEach(p => { const a = db.aulas.find(x => x.id === p.aulaId); if (p.userId === m.userId && a?.modalityId === m.modalityId && a.date >= today()) p.status = 'Cancelada'; });
  } else {
    if (activeMat(m.userId, m.modalityId)) fail(409, 'Já existe matrícula ativa nesta modalidade.');
    m.status = 'Ativa';
  }
  save(); res.json({ id: m.id, status: m.status });
});

// --- pagamentos ---
api.get('/pagamentos', (req, res) => res.json(db.pagamentos
  .filter(p => (req.user.role === 'admin' || p.userId === req.user.id) && (!req.query.status || p.status === req.query.status)
    && has(p.description + ' ' + (usr(p.userId)?.name || ''), req.query.q))
  .map(p => ({ ...p, userName: usr(p.userId)?.name }))));
api.post('/pagamentos', adminOnly, (req, res) => {
  const b = req.body || {}, userId = num(b.userId, 'aluno');
  if (usr(userId)?.role !== 'aluno') fail(404, 'Aluno não encontrado.');
  const p = { id: next(db.pagamentos), userId, description: text(b.description, 'descrição'), amount: Math.round(num(b.amount, 'valor', 0.01) * 100) / 100, due: validDate(b.due), status: 'Pendente' };
  db.pagamentos.push(p); save(); res.status(201).json(p);
});
api.patch('/pagamentos/:id/toggle', adminOnly, (req, res) => {
  const p = db.pagamentos.find(x => x.id == req.params.id) || fail(404, 'Pagamento não encontrado.');
  p.status = p.status === 'Pago' ? 'Pendente' : 'Pago'; save(); res.json({ id: p.id, status: p.status });
});


// --- treinos ---
api.get('/treinos', (req, res) => res.json(db.treinos.filter(t => req.user.role === 'admin' || req.user.role === 'professor' || t.userId === req.user.id).map(t => ({ ...t, userName: usr(t.userId)?.name }))));
api.post('/treinos', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  const b = req.body || {};
  const t = { id: next(db.treinos), userId: num(b.userId, 'aluno'), professorId: req.user.id, name: text(b.name, 'nome da ficha'), exercises: text(b.exercises, 'exercícios'), date: today() };
  db.treinos.push(t); save(); res.status(201).json(t);
});
api.put('/treinos/:id', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  const t = db.treinos.find(x => x.id == req.params.id) || fail(404, 'Treino não encontrado.');
  Object.assign(t, { name: text(req.body.name, 'nome'), exercises: text(req.body.exercises, 'exercícios') });
  save(); res.json(t);
});
api.delete('/treinos/:id', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  db.treinos = db.treinos.filter(x => x.id != req.params.id); save(); res.status(204).end();
});


// --- avaliacoes ---
api.get('/avaliacoes', (req, res) => res.json(db.avaliacoes.filter(a => req.user.role === 'admin' || req.user.role === 'professor' || a.userId === req.user.id).map(a => ({ ...a, userName: usr(a.userId)?.name }))));
api.post('/avaliacoes', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  const b = req.body || {};
  const a = { id: next(db.avaliacoes), userId: num(b.userId, 'aluno'), professorId: req.user.id, date: validDate(b.date), weight: num(b.weight, 'peso', 1), height: num(b.height, 'altura', 0.1), bf: num(b.bf, 'bf', 0), notes: text(b.notes || ' ', 'observações', 0) };
  db.avaliacoes.push(a); save(); res.status(201).json(a);
});
api.put('/avaliacoes/:id', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  const a = db.avaliacoes.find(x => x.id == req.params.id) || fail(404, 'Avaliação não encontrada.');
  Object.assign(a, { date: validDate(req.body.date), weight: num(req.body.weight, 'peso', 1), height: num(req.body.height, 'altura', 0.1), bf: num(req.body.bf, 'bf', 0), notes: text(req.body.notes || ' ', 'observações', 0) });
  save(); res.json(a);
});
api.delete('/avaliacoes/:id', (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'professor') fail(403, 'Acesso restrito.');
  db.avaliacoes = db.avaliacoes.filter(x => x.id != req.params.id); save(); res.status(204).end();
});

app.use('/api', api);
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, _req, res, _next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
  console.error(err); res.status(500).json({ error: 'Erro interno.' });
});

module.exports = app;
if (require.main === module) app.listen(PORT, () => console.log(`WCF rodando em http://localhost:${PORT}`));
