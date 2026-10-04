'use strict';

// A data de referência pertence ao cenário demonstrativo do Figma.
const DEMO_DATE = '2026-10-02';
const DATA_KEY = 'cocamar-prototype-data-v1';
const SESSION_KEY = 'cocamar-prototype-session-v1';
const PAGE_SIZE = 6;
const app = document.querySelector('#app');
const overlayRoot = document.querySelector('#overlay-root');
const toastRoot = document.querySelector('#toast-root');
const assets = { info: '8567a.svg', check: 'be72f.svg' };
const units = [
  { name: 'Maringá', recommended: 62, contacted: 36, high: 18, overdue: 6, purchases: 11 },
  { name: 'Londrina', recommended: 48, contacted: 35, high: 8, overdue: 4, purchases: 12 },
  { name: 'Cianorte', recommended: 40, contacted: 30, high: 6, overdue: 3, purchases: 9 },
  { name: 'Paranavaí', recommended: 34, contacted: 25, high: 4, overdue: 1, purchases: 6 }
];
const outcomes = ['Não atendeu', 'Sem interesse agora', 'Retornar depois', 'Demonstrou interesse'];
const outcomeDefaults = {
  'Não atendeu': { note: 'Tentativa sem resposta às 10:15. Fazer uma nova ligação no fim da tarde.', action: 'Fazer nova tentativa de contato' },
  'Sem interesse agora': { note: 'Não precisa de novos insumos agora. Prefere procurar a unidade quando houver necessidade.', action: 'Planejar novo contato' },
  'Retornar depois': { note: 'Pediu condições para a próxima compra de fertilizantes. Combinar novo contato no fim da tarde.', action: 'Apresentar condições' },
  'Demonstrou interesse': { note: 'Demonstrou interesse nas condições de fertilizantes. Enviar proposta e acompanhar o retorno.', action: 'Enviar proposta comercial' }
};
function readStorage(storage, key) {
  try { return JSON.parse(storage.getItem(key)); } catch { return null; }
}
function storeData() {
  try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { showToast('Alterações mantidas nesta sessão', 'O navegador está com o armazenamento local indisponível.'); }
}
function seedData() {
  const first = [
    ['004182', 'João Carlos da Silva', 'JC', 'Soja e milho', 'Alta', '12 set. 2026', '', 'Pendente', 'Ana Costa', 'Sítio Boa Esperança', 84],
    ['003507', 'Maria Aparecida Souza', 'MA', 'Soja', 'Alta', '08 set. 2026', '01 out. 2026', 'Retorno atrasado', 'Pedro Alves', 'Sítio São José', 62],
    ['007214', 'Antonio Rodrigues', 'AR', 'Milho', 'Alta', '19 set. 2026', '30 set. 2026', 'Retornar hoje', 'Ana Costa', 'Fazenda Recanto', 96],
    ['005038', 'Carlos Eduardo Lima', 'CE', 'Soja e trigo', 'Média', '05 set. 2026', '28 set. 2026', 'Demonstrou interesse', 'Pedro Alves', 'Fazenda Santa Clara', 116],
    ['008926', 'Helena Martins', 'HM', 'Soja', 'Média', '17 set. 2026', '', 'Pendente', 'Sem responsável', 'Sítio Primavera', 48],
    ['006135', 'Luiza Fernandes', 'LF', 'Milho', 'Média', '20 set. 2026', '01 out. 2026', 'Retornar depois', 'Ana Costa', 'Fazenda Horizonte', 78]
  ];
  const given = ['Paulo', 'Fernanda', 'José', 'Juliana', 'Roberto', 'Mariana', 'Rogério', 'Patrícia', 'Sérgio', 'Luciana', 'Marcos', 'Adriana', 'Pedro', 'Cláudia', 'Ricardo', 'Beatriz', 'Eduardo', 'Sandra', 'Marcelo', 'Camila', 'Fernando', 'Daniela', 'André', 'Carolina', 'Márcio', 'Renata', 'Nelson', 'Simone', 'Gustavo', 'Eliane', 'Alberto'];
  const surnames = ['Pereira', 'Oliveira', 'Santos', 'Almeida', 'Ferreira', 'Ribeiro'];
  let members = first.map((row, index) => ({ id: row[0], name: row[1], initials: row[2], crops: row[3], priority: row[4], lastPurchase: row[5], lastContact: row[6], status: row[7], responsible: row[8], farm: row[9], hectares: row[10], unit: 'Maringá', queue: true, operationPending: true, phone: index === 3 ? '(44) 9••••-3710' : '(44) 9••••-4821', history: [], action: ['Primeiro contato', 'Retomar conversa', 'Enviar condições', 'Acompanhar proposta', 'Definir atendimento', 'Planejar novo contato'][index], due: ['2026-10-02', '2026-09-30', '2026-10-02', '2026-10-03', '', '2026-10-03'][index], time: ['17:00', '16:00', '14:00', '10:00', '', '09:00'][index] }));
  for (let i = 6; i < 184; i++) {
    const unit = i < 62 ? 'Maringá' : i < 110 ? 'Londrina' : i < 150 ? 'Cianorte' : 'Paranavaí';
    const name = given[(i - 6) % given.length] + ' ' + surnames[Math.floor((i - 6) / given.length) % surnames.length];
    const isReturn = i >= 6 && i < 13;
    members.push({ id: String(10000 + i).padStart(6, '0'), name, initials: name.split(' ').map(word => word[0]).join(''), crops: ['Soja', 'Milho', 'Soja e trigo'][i % 3], priority: i < 15 ? 'Alta' : 'Média', lastPurchase: `${String(5 + i % 24).padStart(2, '0')} set. 2026`, lastContact: isReturn ? '30 set. 2026' : '', status: isReturn ? 'Retornar depois' : 'Pendente', responsible: i % 3 ? 'Ana Costa' : 'Pedro Alves', farm: `Sítio ${['Santa Luzia', 'Bela Vista', 'São Pedro', 'Boa Vista'][i % 4]}`, hectares: 40 + i % 140, unit, queue: i < 42, operationPending: i < 24 || (unit !== 'Maringá' && i % 3 !== 0), phone: '(44) 9••••-' + String(4200 + i), history: [], action: isReturn ? 'Enviar condições' : 'Primeiro contato', due: '2026-10-02', time: '16:00' });
  }
  // Onze retornos na fila; os demais 31 cooperados estão pendentes.
  const followups = [
    { memberId: '004182', action: 'Apresentar condições', responsible: 'Ana Costa', date: DEMO_DATE, time: '16:00', result: 'Retornar depois', purchased: false },
    { memberId: '003507', action: 'Retomar conversa', responsible: 'Ana Costa', date: '2026-09-30', time: '16:00', result: 'Não atendeu', purchased: false },
    { memberId: '007214', action: 'Enviar condições', responsible: 'Ana Costa', date: DEMO_DATE, time: '14:00', result: 'Retornar depois', purchased: false },
    { memberId: '005038', action: 'Agradecer e acompanhar', responsible: 'Ana Costa', date: DEMO_DATE, time: '17:00', result: 'Demonstrou interesse', purchased: true, order: '29184', amount: 7850 },
    { memberId: '006135', action: 'Planejar novo contato', responsible: 'Ana Costa', date: '2026-10-03', time: '09:00', result: 'Sem interesse agora', purchased: false }
  ];
  for (let i = 0; i < 13; i++) followups.push({ memberId: members[i + 6].id, action: 'Acompanhar proposta', responsible: 'Ana Costa', date: i < 6 ? DEMO_DATE : i < 8 ? '2026-09-29' : '2026-10-05', time: `${10 + i % 8}:00`, result: i > 7 ? 'Demonstrou interesse' : 'Retornar depois', purchased: i > 7, order: String(29185 + i), amount: 6400 + i * 100 });
  return { version: 1, members, followups };
}
const savedData = readStorage(localStorage, DATA_KEY);
const data = savedData?.version === 1 && Array.isArray(savedData.members) && Array.isArray(savedData.followups) ? savedData : seedData();
let session = readStorage(localStorage, SESSION_KEY) || readStorage(sessionStorage, SESSION_KEY);
if (!['balconista', 'gestor'].includes(session?.role)) session = null;
const state = { loginRole: session?.role || 'balconista', screen: '', filter: 'all', query: '', page: 1, sort: 'priority', unit: 'Maringá', regionUnit: 'all', period: 'september', responsible: 'all', modal: null, memberId: null, selected: [], draft: null };
let previousFocus = null;
let toastTimer;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const attr = escapeHtml;
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const memberById = id => data.members.find(member => member.id === id);
function icon(name) { const size = ['clock', 'info'].includes(name) ? 20 : name === 'down' ? 16 : 18; return `<img class="icon${name === 'down' ? ' down-icon' : ''}" src="assets/${assets[name]}" width="${size}" height="${size}" alt="" aria-hidden="true">`; }
function logo(nav = false) { return `<span class="logo${nav ? ' nav-logo' : ''}"><img src="assets/3c1a1.svg" width="168" height="29.908" alt="Cocamar"></span>`; }
function button(text, action, style = '', attributes = '') { return `<button type="button" class="btn ${style}" data-action="${action}" ${attributes}>${text}</button>`; }
function badge(text, tone = '', priority = false) { return `<span class="badge ${tone} ${priority ? 'priority-badge' : ''}">${escapeHtml(text)}</span>`; }
function statusTone(status) { return status.includes('atrasado') ? 'danger' : status.includes('Retorn') ? 'warning' : ['Demonstrou interesse', 'Interesse registrado', 'Confirmada', 'Compra confirmada'].includes(status) ? '' : 'neutral'; }
function symbol(name, size = 20) {
  const paths = {
    queue: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    follow: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2"/>',
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    operation: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 8v2M15 8v2"/>',
    results: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3"/>',
    people: '<path d="M3 21v-2a6 6 0 0 1 12 0v2M17 14a5 5 0 0 1 4 5v2"/><circle cx="9" cy="6" r="4"/><path d="M17 3a4 4 0 0 1 0 8"/>',
    warning: '<path d="m10.2 4-8 14a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3l-8-14a2 2 0 0 0-3.6 0ZM12 9v4M12 17h.01"/>',
    check: '<path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="9"/>',
    exit: '<path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    sliders: '<path d="M4 7h8m4 0h4M4 17h2m4 0h10"/><circle cx="14" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'
  };
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.queue}</svg>`;
}
function kpi(label, value, note, glyph = 'people', tone = '') {
  return `<article class="card kpi ${tone}"><div class="kpi-value"><strong>${escapeHtml(value)}</strong><span class="kpi-icon">${symbol(glyph, 18)}</span></div><p class="kpi-label">${escapeHtml(label)}</p>${note ? `<small>${escapeHtml(note)}</small>` : ''}</article>`;
}
function activityPanel(content, title = 'Atividade', note = '') {
  return `<section class="activity-panel"><div class="panel-heading"><h2>${title}</h2>${note ? `<span>${note}</span>` : ''}</div>${content}</section>`;
}

function memberCell(member) { return `<div class="member"><span class="avatar">${escapeHtml(member.initials)}</span><div><p class="member-name">${escapeHtml(member.name)}</p><small>#${member.id} • ${escapeHtml(member.crops)}</small></div></div>`; }
function heading(title, action = '') { return `<div class="screen-heading"><h1>${escapeHtml(title)}</h1>${action || `<div class="date-context">${symbol('calendar', 16)}<span>02 out. 2026</span><span class="demo-label">Demonstração</span></div>`}</div>`; }
function metricHelp(title, content) { return `<details class="metric-help"><summary aria-label="Sobre ${attr(title)}">${symbol('info', 16)}<span>Sobre ${escapeHtml(title)}</span></summary><div class="help-content">${content}</div></details>`; }

function searchInput(placeholder) { return `<div class="search-wrap">${symbol('search')}<input type="search" class="field search" id="table-search" placeholder="${placeholder}" aria-label="${placeholder}" value="${attr(state.query)}"></div>`; }
function tableHeading(title, action = '') { return `<div class="table-heading"><h2>${title}</h2>${action}</div>`; }
function labeledFilter(label, control) { return `<div class="filter-field"><span>${label}</span>${control}</div>`; }
function filterTabs(content) { return `<div class="filter-tabs" aria-label="Filtros da tabela">${content}</div>`; }
function filterButton(label, value) { return button(label, 'filter', state.filter === value ? '' : 'secondary', `data-filter="${value}" aria-pressed="${state.filter === value}"`); }
function matchQuery(member) { return normalize([member.name, member.id, member.responsible, member.crops].join(' ')).includes(normalize(state.query)); }
function loginView() {
  const manager = state.loginRole === 'gestor';
  return `<main class="login">
    <picture class="login-landscape" aria-hidden="true">
      <source media="(max-width: 700px)" srcset="assets/login-campo-mobile.webp">
      <img src="assets/login-campo.webp" width="1672" height="941" alt="" fetchpriority="high">
    </picture>
    <header class="login-header">
      <div class="login-brand"><img src="assets/cocamar-branco.png" width="168" height="30" alt="Cocamar"></div>
      <a class="login-about" href="https://www.cocamar.com.br/sobre/quem-somos" target="_blank" rel="noopener noreferrer">Conheça a Cocamar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg></a>
    </header>
    <div class="login-content">
      <section class="login-hero" aria-labelledby="login-hero-title">
        <h1 id="login-hero-title">Boas relações.<br>Grandes colheitas.</h1>
        <p class="hero-description">Cada conversa aproxima.<br>Cada parceria faz o campo crescer.</p>
      </section>
      <form class="login-form" id="login-form" aria-labelledby="login-title">
        <div class="login-intro"><h2 id="login-title">Bom ter você por perto.</h2><p class="muted">Acesse e cultive novas oportunidades.</p></div>
        <div class="role-switch" data-pill-group="login-role" role="group" aria-label="Escolha de perfil">${button('Sou balconista', 'login-role', manager ? 'ghost' : '', 'data-role="balconista" aria-pressed="' + !manager + '"')}${button('Sou gestor', 'login-role', manager ? '' : 'ghost', 'data-role="gestor" aria-pressed="' + manager + '"')}</div>
        <div class="login-fields">
          <label class="field-label" for="login-email">E-mail corporativo<input class="field" id="login-email" type="email" name="email" autocomplete="username" spellcheck="false" autocapitalize="none" value="${manager ? 'rafael.lima' : 'ana.costa'}@exemplo.com" required></label>
          <div class="field-label"><label for="login-password">Senha</label><div class="password-field"><input class="field" id="login-password" type="password" name="password" autocomplete="current-password" value="demonstracao" required><button class="password-toggle" type="button" data-action="toggle-password" aria-label="Mostrar senha" aria-pressed="false" aria-controls="login-password"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg></button></div></div>
        </div>
        <label class="remember"><span class="check-box"><input type="checkbox" name="remember" checked>${icon('check')}</span>Manter conectado neste dispositivo</label>
        <button class="btn login-submit" type="submit"><span>Entrar como ${manager ? 'gestor' : 'balconista'}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button>
        <p class="login-demo caption">Acesso de demonstração <span aria-hidden="true">·</span> Sem autenticação real</p>
      </form>
    </div>
  </main>`;
}
function topbar() {
  const manager = session.role === 'gestor';
  const links = manager ? [['overview', 'Visão geral'], ['operation', 'Operação'], ['results', 'Resultados']] : [['queue', 'Minha fila'], ['follow', 'Acompanhamento']];
  return `<header class="topbar"><div class="branding"><img src="assets/3c1a1.svg" width="150" height="27" alt="Cocamar"></div><nav class="nav ${session.role}" data-pill-group="navigation" aria-label="Navegação principal">${links.map(([screen, label]) => button(symbol(screen) + label, 'navigate', state.screen === screen ? '' : 'ghost', `data-screen="${screen}" ${state.screen === screen ? 'aria-current="page"' : ''}`)).join('')}</nav><div class="profile"><button type="button" class="profile-button" data-profile-trigger data-name="${manager ? 'Rafael Lima' : 'Ana Costa'}" data-unit="${manager ? 'Regional' : 'Maringá'}" data-role="${manager ? 'Gestor' : 'Balconista'}" aria-label="Abrir perfil" aria-haspopup="dialog" aria-expanded="false" aria-controls="profile-popover"><span class="profile-avatar">${manager ? 'RL' : 'AC'}</span><span class="profile-copy"><strong>${manager ? 'Rafael Lima' : 'Ana Costa'}</strong><small>${manager ? 'Gestor regional' : 'Balconista · Maringá'}</small></span></button>${button(symbol('exit'), 'logout', 'logout-button ghost', 'aria-label="Sair" title="Sair"')}</div></header>`;
}

function queueMembers() {
  const list = data.members.filter(member => member.queue && matchQuery(member) && (state.filter === 'all' || (state.filter === 'pending' ? member.status === 'Pendente' : member.status !== 'Pendente')));
  if (state.sort === 'priority') list.sort((a, b) => (a.priority === 'Alta' ? 0 : 1) - (b.priority === 'Alta' ? 0 : 1));
  if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  if (state.sort === 'purchase') list.sort((a, b) => Number(b.lastPurchase.slice(0, 2)) - Number(a.lastPurchase.slice(0, 2)));
  return list;
}
function pagination(total, noun = 'cooperados') {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total ? (state.page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(state.page * PAGE_SIZE, total);
  return `<div class="pagination"><span><strong>${start}–${end}</strong> de ${total} ${noun}</span><div class="page-controls"><span>Página ${state.page} de ${pages}</span><button type="button" data-action="page" data-direction="-1" aria-label="Página anterior" ${state.page <= 1 ? 'disabled' : ''}>‹</button><button type="button" data-action="page" data-direction="1" aria-label="Próxima página" ${state.page >= pages ? 'disabled' : ''}>›</button></div></div>`;
}

function queueRows() {
  const members = queueMembers();
  state.page = Math.min(state.page, Math.max(1, Math.ceil(members.length / PAGE_SIZE)));
  return `<div class="table-scroll"><table class="data-table" aria-label="Fila priorizada de cooperados"><colgroup>${[24.7, 11.9, 12.8, 13.55, 18.9, 18.15].map(width => `<col style="width:${width}%">`).join('')}</colgroup><thead><tr>${['Cooperado', 'Prioridade', 'Última compra', 'Último contato', 'Atendimento', ''].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${members.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE).map(member => `<tr><td data-label="Cooperado">${memberCell(member)}</td><td data-label="Prioridade">${badge(member.priority, member.priority === 'Alta' ? '' : 'neutral', true)}</td><td data-label="Última compra">${escapeHtml(member.lastPurchase)}</td><td data-label="Último contato" class="muted">${escapeHtml(member.lastContact || 'Ainda não contatado')}</td><td data-label="Atendimento">${badge(member.status, statusTone(member.status))}</td><td class="row-action"><button type="button" class="cell-btn" data-action="detail" data-id="${member.id}" aria-label="Ver detalhe de ${attr(member.name)}">Ver cooperado ${symbol('arrow', 16)}</button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">Nenhum cooperado encontrado. Tente outro nome ou código.</div></td></tr>'}</tbody></table></div>${pagination(members.length)}`;
}
function queueView() {
  const list = data.members.filter(member => member.queue);
  const pending = list.filter(member => member.status === 'Pendente').length;
  const recommended = list.find(member => member.status === 'Pendente' && member.priority === 'Alta') || list.find(member => member.status === 'Pendente') || list[0];
  const today = data.followups.filter(item => item.date === DEMO_DATE).length;
  const overdue = data.followups.filter(item => item.date && item.date < DEMO_DATE).length;
  return `<main class="screen queue">${heading('Minha fila')}<section class="queue-summary" aria-label="Resumo do dia"><article class="card recommendation"><div class="recommendation-top"><h2>Próximo contato</h2>${badge(recommended.priority + ' prioridade')}</div><div class="recommendation-person"><span class="avatar">${escapeHtml(recommended.initials)}</span><div><h3>${escapeHtml(recommended.name)}</h3><p>#${recommended.id} · ${escapeHtml(recommended.crops)}</p></div></div><p class="recommendation-reason">Histórico de compras neste período do ano.</p><div class="recommendation-bottom"><span>${escapeHtml(recommended.farm)}</span>${button('Abrir cooperado ' + symbol('arrow', 16), 'detail', '', `data-id="${recommended.id}"`)}</div></article>${activityPanel(`<section class="kpis two" aria-label="Indicadores do dia">${kpi('Cooperados na fila', list.length, pending + ' aguardam o primeiro contato', 'people')}${kpi('Retornos de hoje', today, overdue + ' retornos atrasados', 'calendar', 'attention')}</section>`, 'Hoje', 'Maringá')}</section><section class="card table-card" aria-label="Fila priorizada">${tableHeading('Cooperados', searchInput('Buscar por nome ou código'))}<div class="toolbar">${filterTabs(`${filterButton('Todos <span class="filter-count">' + list.length + '</span>', 'all')}${filterButton('Pendentes <span class="filter-count">' + pending + '</span>', 'pending')}${filterButton('Retornos <span class="filter-count">' + (list.length - pending) + '</span>', 'returns')}`)}<div class="sort-control"><span>Ordenar por</span><select id="sort-select" aria-label="Ordenar cooperados"><option value="priority" ${state.sort === 'priority' ? 'selected' : ''}>Prioridade</option><option value="name" ${state.sort === 'name' ? 'selected' : ''}>Nome</option><option value="purchase" ${state.sort === 'purchase' ? 'selected' : ''}>Última compra</option></select></div></div><div id="table-content">${queueRows()}</div></section></main>`;
}

function dateLabel(date, time, overdueWord = 'atrasado') {
  if (!date) return 'Não agendado';
  if (date === DEMO_DATE) return `Hoje • ${time || 'a definir'}`;
  const parts = date.split('-');
  const month = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'][Number(parts[1]) - 1];
  return `${parts[2]} ${month} • ${date < DEMO_DATE ? overdueWord : time || 'a definir'}`;
}
function followMembers() {
  return data.followups.filter(item => {
    const member = memberById(item.memberId);
    return member && matchQuery(member) && (state.filter === 'all' || (state.filter === 'today' && item.date === DEMO_DATE) || (state.filter === 'overdue' && item.date && item.date < DEMO_DATE) || (state.filter === 'purchases' && item.purchased));
  });
}
function followRows() {
  const list = followMembers();
  state.page = Math.min(state.page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
  return `<div class="table-scroll"><table class="data-table" aria-label="Acompanhamentos"><colgroup>${[21, 19, 12, 14, 16, 14, 4].map(width => `<col style="width:${width}%">`).join('')}</colgroup><thead><tr>${['Cooperado', 'Próxima ação', 'Responsável', 'Prazo', 'Resultado do contato', 'Compra', ''].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE).map(item => { const member = memberById(item.memberId); return `<tr class="interactive-row" data-action="detail" data-id="${member.id}"><td data-label="Cooperado">${memberCell(member)}</td><td data-label="Próxima ação">${escapeHtml(item.action)}</td><td data-label="Responsável" class="muted">${escapeHtml(item.responsible)}</td><td data-label="Prazo" class="${item.date && item.date < DEMO_DATE ? 'danger' : 'muted'}">${escapeHtml(dateLabel(item.date, item.time))}</td><td data-label="Resultado do contato">${badge(item.result, statusTone(item.result))}</td><td data-label="Compra">${badge(item.purchased ? 'Confirmada' : 'Não identificada', item.purchased ? '' : 'neutral')}${item.purchased ? `<small class="purchase-detail">02 out. • Pedido #${attr(item.order)}</small>` : ''}</td><td class="row-action"><button type="button" class="cell-btn icon-button" data-action="detail" data-id="${member.id}" aria-label="Abrir acompanhamento de ${attr(member.name)}">${symbol('arrow', 16)}</button></td></tr>`; }).join('') || '<tr><td colspan="7"><div class="empty">Nenhum acompanhamento encontrado para este filtro.</div></td></tr>'}</tbody></table></div>${pagination(list.length, 'acompanhamentos')}`;
}
function followView() {
  const today = data.followups.filter(item => item.date === DEMO_DATE).length;
  const overdue = data.followups.filter(item => item.date && item.date < DEMO_DATE).length;
  const purchases = data.followups.filter(item => item.purchased).length;
  return `<main class="screen follow">${heading('Acompanhamento')}<section class="follow-summary">${activityPanel(`<section class="kpis three" aria-label="Resumo dos acompanhamentos">${kpi('Retornos de hoje', today, '', 'calendar')}${kpi('Retornos atrasados', overdue, '', 'follow', 'attention')}${kpi('Compras identificadas', purchases, '', 'check', 'positive')}</section>`, 'Hoje', 'Maringá')}${overdue ? `<aside class="card follow-priority"><span class="attention-icon">${symbol('follow', 18)}</span><h2>${overdue} retornos atrasados</h2><p>Retome os contatos com prazo vencido.</p>${button('Ver atrasados ' + symbol('arrow', 16), 'filter', 'secondary', 'data-filter="overdue"')}</aside>` : ''}</section><section class="card table-card">${tableHeading('Próximas ações', searchInput('Buscar cooperado'))}<div class="toolbar">${filterTabs(`${filterButton('Todos <span class="filter-count">' + data.followups.length + '</span>', 'all')}${filterButton('Hoje <span class="filter-count">' + today + '</span>', 'today')}${filterButton('Atrasados <span class="filter-count">' + overdue + '</span>', 'overdue')}${filterButton('Compras <span class="filter-count">' + purchases + '</span>', 'purchases')}`)}${metricHelp('compras identificadas', '<p>Compra confirmada por uma transação posterior ao contato. Um cooperado com compra pode ainda ter um retorno agendado.</p>')}</div><div id="table-content">${followRows()}</div></section></main>`;
}

function periodSelect() { return `<select class="select-pill period-select" id="period-select" aria-label="Período dos indicadores"><option value="september" ${state.period === 'september' ? 'selected' : ''}>01–30 set. 2026</option><option value="august" ${state.period === 'august' ? 'selected' : ''}>01–31 ago. 2026</option></select>`; }
function unitSelect(operation = false) { return `<select class="select-pill unit-select" id="${operation ? 'operation-unit' : 'region-unit'}" aria-label="Filtrar unidade">${operation ? '' : `<option value="all" ${state.regionUnit === 'all' ? 'selected' : ''}>Todas as unidades</option>`}${units.map(unit => `<option value="${attr(unit.name)}" ${(operation ? state.unit : state.regionUnit) === unit.name ? 'selected' : ''}>${operation ? 'Unidade ' : ''}${escapeHtml(unit.name)}</option>`).join('')}</select>`; }
function regionFilters() { return `<div class="filters">${labeledFilter('Período', periodSelect())}${labeledFilter('Unidade', unitSelect())}<small>${symbol('check', 16)} Período encerrado <span>·</span> ${state.regionUnit === 'all' ? '4 unidades' : '1 unidade'}</small></div>`; }

function regionalMetrics() {
  const factor = state.period === 'august' ? .86 : 1;
  const list = (state.regionUnit === 'all' ? units : units.filter(unit => unit.name === state.regionUnit)).map(unit => ({
    name: unit.name,
    ...Object.fromEntries(['recommended', 'contacted', 'high', 'overdue', 'purchases'].map(key => [key, Math.round(unit[key] * factor)]))
  }));
  const sum = property => list.reduce((total, unit) => total + unit[property], 0);
  return { list, recommended: sum('recommended'), contacted: sum('contacted'), high: sum('high'), overdue: sum('overdue'), purchases: sum('purchases') };
}
const percent = (part, total) => (total ? 100 * part / total : 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
function overviewView() {
  const metrics = regionalMetrics();
  const focus = metrics.list.reduce((largest, unit) => unit.high > largest.high ? unit : largest, metrics.list[0]);
  return `<main class="screen overview">${heading('Visão geral')}${regionFilters()}<section class="overview-summary" aria-label="Resumo da regional"><aside class="card focus-card"><div class="focus-heading"><span class="attention-icon">${symbol('warning', 18)}</span><h2>Prioridade da regional</h2></div><h3>${escapeHtml(focus.name)}</h3><div class="focus-value"><strong>${focus.high}</strong><span>prioridades altas<br>sem contato</span></div><p class="focus-overdue">${symbol('follow', 15)} ${focus.overdue} retornos vencidos</p>${button('Investigar unidade ' + symbol('arrow', 16), 'investigate', '', `data-unit="${attr(focus.name)}"`)}</aside>${activityPanel(`<section class="kpis" aria-label="Indicadores regionais">${kpi('Cooperados recomendados', metrics.recommended, '', 'people')}${kpi('Cooperados contatados', metrics.contacted, percent(metrics.contacted, metrics.recommended) + ' dos recomendados', 'check', 'positive')}${kpi('Retornos vencidos', metrics.overdue, '', 'follow', 'attention')}${kpi('Compras após contato', metrics.purchases, percent(metrics.purchases, metrics.contacted) + ' dos contatados', 'results', 'positive')}</section>`, 'Atividade no período')}</section><section class="card table-card unit-table-card">${tableHeading('Operação por unidade', `<span class="table-meta">${metrics.list.length} ${metrics.list.length === 1 ? 'unidade' : 'unidades'} no período</span>`)}<div class="table-scroll"><table class="data-table unit-table" aria-label="Operação por unidade"><thead><tr>${['Unidade', 'Recomendados', 'Contatados', 'Alta sem contato', 'Retornos vencidos', 'Compras após contato', ''].map((label, i) => `<th scope="col" class="${i > 0 && i < 6 ? 'numeric' : ''}">${label}</th>`).join('')}</tr></thead><tbody>${metrics.list.map(unit => `<tr><td data-label="Unidade"><button type="button" class="unit-link" data-action="investigate" data-unit="${attr(unit.name)}"><span class="unit-icon">${symbol('operation')}</span>${unit.name}</button></td><td class="numeric" data-label="Recomendados">${unit.recommended}</td><td class="numeric" data-label="Contatados"><div class="coverage"><span><strong>${unit.contacted}</strong><small>${percent(unit.contacted, unit.recommended)}</small></span><div class="track"><span style="width:${unit.contacted / unit.recommended * 100}%"></span></div></div></td><td class="numeric" data-label="Alta sem contato">${badge(unit.high, 'warning')}</td><td class="numeric" data-label="Retornos vencidos"><span class="${unit.overdue ? 'danger' : ''}">${unit.overdue}</span></td><td class="numeric" data-label="Compras após contato"><strong>${unit.purchases}</strong><span class="cell-secondary">${percent(unit.purchases, unit.contacted)} dos contatados</span></td><td class="row-action"><button type="button" class="cell-btn icon-button" data-action="investigate" data-unit="${attr(unit.name)}" aria-label="Investigar ${attr(unit.name)}">${symbol('arrow')}</button></td></tr>`).join('')}</tbody></table></div><div class="table-help">${metricHelp('os indicadores', '<p><strong>Recomendados:</strong> cooperados únicos no período.</p><p><strong>Contatados:</strong> cooperados com registro de contato, inclusive tentativas sem resposta.</p><p><strong>Retornos vencidos:</strong> pendentes no fim do período.</p><p><strong>Compras:</strong> transações posteriores ao contato e dentro do período selecionado. Não representa atribuição de venda.</p>')}</div></section></main>`;
}

function operationMembers() { return data.members.filter(member => member.unit === state.unit && matchQuery(member) && (state.filter !== 'pending' || member.operationPending) && (state.responsible === 'all' || member.responsible === state.responsible)); }
function operationRows() {
  const list = operationMembers();
  state.page = Math.min(state.page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
  const visible = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
  return `<div class="table-scroll"><table class="data-table operation-table" aria-label="Operação da unidade"><thead><tr><th class="selection-cell"><input type="checkbox" data-select-page aria-label="Selecionar cooperados desta página" ${visible.length && visible.every(member => state.selected.includes(member.id)) ? 'checked' : ''} ${visible.length ? '' : 'disabled'}></th>${['Cooperado', 'Prioridade', 'Responsável', 'Próxima ação', 'Prazo / retorno', 'Atendimento', ''].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${visible.map(member => `<tr class="${state.selected.includes(member.id) ? 'selected-row' : ''}"><td class="selection-cell"><input type="checkbox" data-select-member="${member.id}" aria-label="Selecionar ${attr(member.name)}" ${state.selected.includes(member.id) ? 'checked' : ''}></td><td data-label="Cooperado">${memberCell(member)}</td><td data-label="Prioridade">${badge(member.priority, member.priority === 'Alta' ? '' : 'neutral', true)}</td><td data-label="Responsável" class="${member.responsible === 'Sem responsável' ? 'warning' : 'muted'}">${escapeHtml(member.responsible)}</td><td data-label="Próxima ação">${escapeHtml(member.action)}</td><td data-label="Prazo / retorno" class="${member.due && member.due < DEMO_DATE ? 'danger' : 'muted'}">${escapeHtml(dateLabel(member.due, member.time, 'vencido'))}</td><td data-label="Atendimento">${badge(member.status === 'Demonstrou interesse' ? 'Interesse registrado' : member.status, statusTone(member.status))}</td><td class="row-action"><button type="button" class="cell-btn icon-button" data-action="detail" data-id="${member.id}" aria-label="Abrir cooperado ${attr(member.name)}">${symbol('arrow')}</button></td></tr>`).join('') || '<tr><td colspan="8"><div class="empty">Nenhum cooperado encontrado. Experimente outros filtros.</div></td></tr>'}</tbody></table></div>${pagination(list.length)}<p class="table-note">Fila atual em 02 out. 2026. Os indicadores acima se referem ao período selecionado.</p>`;
}

function operationView() {
  const sourceUnit = units.find(item => item.name === state.unit);
  const factor = state.period === 'august' ? .86 : 1;
  const unit = { name: sourceUnit.name, ...Object.fromEntries(['recommended', 'contacted', 'high', 'overdue', 'purchases'].map(key => [key, Math.round(sourceUnit[key] * factor)])) };
  const members = data.members.filter(member => member.unit === state.unit);
  const pending = members.filter(member => member.operationPending).length;
  return `<main class="screen operation">${heading('Operação da unidade')}<div class="filters">${labeledFilter('Período', periodSelect())}${labeledFilter('Unidade', unitSelect(true))}${labeledFilter('Responsável', `<select class="select-pill responsible-select" id="responsible-select" aria-label="Filtrar responsável">${[['all', 'Todos os responsáveis'], ['Ana Costa', 'Ana Costa'], ['Pedro Alves', 'Pedro Alves'], ['Sem responsável', 'Sem responsável']].map(([value, label]) => `<option value="${value}" ${state.responsible === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`)}</div>${activityPanel(`<section class="kpis" aria-label="Indicadores da unidade">${kpi('Recomendados', unit.recommended, unit.contacted + ' já foram contatados', 'people')}${kpi('Alta sem atendimento', unit.high, '', 'warning', 'attention')}${kpi('Retornos vencidos', unit.overdue, '', 'follow', 'attention')}${kpi('Compras após contato', unit.purchases, percent(unit.purchases, unit.contacted) + ' dos contatados', 'results', 'positive')}</section>`, 'Atividade no período')}<section class="card table-card">${tableHeading('Atendimentos · ' + escapeHtml(state.unit), searchInput('Buscar cooperado ou responsável'))}<div class="toolbar">${filterTabs(`${filterButton('Pendências <span class="filter-count">' + pending + '</span>', 'pending')}${filterButton('Todos <span class="filter-count">' + members.length + '</span>', 'all')}`)}<div class="bulk-actions"><span id="selection-summary" aria-live="polite">${state.selected.length ? state.selected.length + ' selecionados' : 'Nenhum selecionado'}</span>${button(symbol('sliders', 18) + ' Ajustar atendimento', 'adjust', '', `id="bulk-adjust" ${state.selected.length ? '' : 'disabled'}`)}</div></div><div id="table-content">${operationRows()}</div></section></main>`;
}

function resultsView() {
  const metrics = regionalMetrics();
  const weekly = [24, 31, 35, 36].map((value, i) => i === 3 ? 0 : Math.round(value * metrics.contacted / 126));
  weekly[3] = metrics.contacted - weekly[0] - weekly[1] - weekly[2];
  const outcomeCounts = [44, 40, 24, 18].map((value, i) => i === 3 ? 0 : Math.round(value * metrics.contacted / 126));
  outcomeCounts[3] = metrics.contacted - outcomeCounts[0] - outcomeCounts[1] - outcomeCounts[2];
  const month = state.period === 'september' ? 'set.' : 'ago.';
  return `<main class="screen results">${heading('Resultados')}${regionFilters(true)}<div class="results-content"><section class="chart-grid"><article class="card evolution"><div class="section-top"><h3>Evolução dos contatos</h3>${badge(metrics.contacted + ' cooperados')}</div><div class="bar-chart" role="img" aria-label="Contatos por semana: ${weekly.join(', ')}">${weekly.map((value, i) => `<div class="bar-column"><span class="small"><strong>${value}</strong></span><div class="vertical-bar" style="--bar-ratio:${value / Math.max(...weekly)}" title="${value} cooperados"></div><small>${['01–07', '08–14', '15–21', '22–' + (month === 'set.' ? '30' : '31')][i]} ${month}</small></div>`).join('')}</div></article><article class="card conversion"><h3>Compras após contato</h3><strong>${percent(metrics.purchases, metrics.contacted)}</strong><p>${metrics.purchases} de ${metrics.contacted} cooperados contatados</p><div class="track"><span style="width:${metrics.purchases / metrics.contacted * 100}%"></span></div>${button('Ver operação da unidade ' + symbol('arrow'), 'investigate', 'secondary', `data-unit="${state.regionUnit === 'all' ? 'Maringá' : attr(state.regionUnit)}"`)}</article></section><section class="chart-grid"><article class="card outcomes"><h3>Resultado dos contatos</h3>${['Demonstrou interesse', 'Retornar depois', 'Sem interesse agora', 'Não atendeu'].map((label, i) => `<div class="outcome-row"><p>${label}</p><div class="track"><span style="width:${outcomeCounts[i] / Math.max(...outcomeCounts) * 100}%;background:var(--brand);opacity:${[1, .7, .45, .25][i]}"></span></div><strong class="small">${outcomeCounts[i]}</strong></div>`).join('')}<small class="muted">Último resultado por cooperado · ${metrics.contacted} no total</small></article><aside class="card coverage-card"><div class="section-top"><h3>Cobertura da carteira</h3><span class="kpi-icon">${symbol('people', 18)}</span></div><strong>${percent(metrics.contacted, metrics.recommended)}</strong><p>${metrics.contacted} de ${metrics.recommended} recomendados contatados</p><div class="track"><span style="width:${metrics.contacted / metrics.recommended * 100}%"></span></div><span class="coverage-remaining">${metrics.recommended - metrics.contacted} ainda sem contato</span></aside></section><div class="results-help">${metricHelp('a leitura dos resultados', `<p><strong>Contatos por semana:</strong> cooperados com primeiro registro no período, inclusive tentativas sem resposta.</p><p><strong>Compras após contato:</strong> ${metrics.purchases} com transação confirmada ÷ ${metrics.contacted} contatados × 100 = ${percent(metrics.purchases, metrics.contacted)}. A compra precisa ser posterior ao contato e estar no período selecionado; não atribui a venda ao contato.</p>`)}</div></div></main>`;
}
function render() {
  const previousPills = CocamarUI.capturePills();
  CocamarUI.closePopover();
  if (!session) { app.innerHTML = loginView(); CocamarUI.mount(previousPills); return; }
  const views = { queue: queueView, follow: followView, overview: overviewView, operation: operationView, results: resultsView };
  app.innerHTML = `<div class="shell">${topbar()}${views[state.screen]()}</div>`;
  CocamarUI.mount(previousPills);
  updateSelection();
  document.title = `${({ queue: 'Minha fila', follow: 'Acompanhamento', overview: 'Visão geral', operation: 'Operação', results: 'Resultados' })[state.screen]} · Cocamar`;
}
function navigate(screen) { closeModal(); const hash = '#/' + session.role + '/' + screen; if (location.hash === hash) route(); else location.hash = hash; }
function route() {
  closeModal();
  if (!session) { state.screen = 'login'; render(); return; }
  const allowed = session.role === 'gestor' ? ['overview', 'operation', 'results'] : ['queue', 'follow'];
  const requested = location.hash.split('/')[2];
  state.screen = allowed.includes(requested) ? requested : allowed[0];
  state.filter = state.screen === 'operation' ? 'pending' : 'all';
  state.query = ''; state.page = 1;
  render(); window.scrollTo(0, 0);
}
function refreshTable() {
  const renderRows = { queue: queueRows, follow: followRows, operation: operationRows }[state.screen];
  const target = document.querySelector('#table-content');
  if (target && renderRows) target.innerHTML = renderRows();
  updateSelection();
}
function updateSelection() {
  const summary = document.querySelector('#selection-summary');
  const button = document.querySelector('#bulk-adjust');
  if (summary) summary.textContent = state.selected.length ? state.selected.length + ' selecionados' : 'Nenhum selecionado';
  if (button) button.disabled = !state.selected.length;
  const all = document.querySelector('[data-select-page]');
  if (all) {
    const visible = [...document.querySelectorAll('[data-select-member]')];
    all.indeterminate = visible.some(item => item.checked) && !visible.every(item => item.checked);
  }
}
function historyView(member) {
  return member.history.length ? member.history.map(entry => `<div class="history-entry"><small class="muted">${escapeHtml(dateLabel(entry.date, entry.time))} • ${escapeHtml(entry.responsible)}</small><p><strong>${escapeHtml(entry.result)}.</strong> ${escapeHtml(entry.note)}</p>${entry.returnDate ? `<small class="brand-color">Próxima ação: ${escapeHtml(dateLabel(entry.returnDate, entry.returnTime))}</small>` : ''}</div>`).join('') : member.id === '005038' ? '<div><small class="muted">28 set. • 14:30 • Ana Costa</small><p>Demonstrou interesse. Pediu condições para a compra de fertilizantes.</p></div>' : '<p class="muted">Nenhum contato registrado. Esta será a primeira conversa acompanhada pelo sistema.</p>';
}
function drawerBar(member) { return `<div class="drawer-bar"><p class="caption">COOPERADO #${member.id} • ${escapeHtml(member.unit.toLocaleUpperCase('pt-BR'))}</p>${button(symbol('close'), 'close-modal', 'ghost icon-button', 'aria-label="Fechar painel"')}</div>`; }
function detailView(member) {
  const followup = data.followups.find(item => item.memberId === member.id);
  const purchased = followup?.purchased;
  const purchaseList = [[purchased ? '02 out.' : '12 set.', 'Fertilizantes', purchased ? followup.amount : 8450], ['18 ago.', 'Sementes de soja', 12600], ['02 jun.', 'Defensivos agrícolas', 6280], ['16 abr.', 'Fertilizantes', 5120]];
  return `${drawerBar(member)}<div class="drawer-identification"><span class="avatar detail-avatar">${escapeHtml(member.initials)}</span><h2 id="dialog-title">${escapeHtml(member.name)}</h2><div class="badge-row">${badge(member.priority + ' prioridade', member.priority === 'Alta' ? '' : 'neutral')}${badge(purchased ? 'Compra confirmada' : member.status, purchased ? '' : statusTone(member.status))}</div></div><section class="reason">${purchased ? `<p class="small">Compra identificada após o contato</p><h3>Pedido #${attr(followup.order)} • ${followup.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3><p class="small">Confirmado em 02 out., às 09:12. Contato anterior em 28 set., às 14:30.</p>` : '<p class="small">Por que entrar em contato agora?</p><h3>Compra com frequência e apresenta histórico de compras neste período.</h3><p class="small">4 compras nos últimos 6 meses. Compras em setembro e outubro nos dois anos anteriores.</p>'}</section><div class="details-grid"><div><small class="muted">Telefone</small><p><strong>${escapeHtml(member.phone)}</strong></p></div><div><small class="muted">Responsável</small><p><strong>${escapeHtml(session.role === 'balconista' ? 'Ana Costa' : member.responsible)}</strong></p></div></div><section class="property"><h3>Propriedade</h3><div class="details-grid"><div><p><strong>${escapeHtml(member.farm)}</strong></p><p class="muted">${escapeHtml(member.unit)} / PR</p></div><div><p><strong>${escapeHtml(member.crops)} • ${member.hectares} ha</strong></p><p class="muted">Cadastro atualizado em 18 ago.</p></div></div></section><hr><section class="purchase-history"><div class="section-top"><h3>Histórico de compras</h3><small class="muted">Últimos 6 meses</small></div>${purchaseList.map(([date, product, value]) => `<div class="purchase-row"><span class="small muted">${date}</span><span>${product}</span><strong>${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</strong></div>`).join('')}</section><hr><section class="history"><h3>Contatos anteriores</h3>${historyView(member)}</section><div class="panel-actions">${button(session.role === 'gestor' ? 'Ajustar atendimento' : 'Registrar contato', session.role === 'gestor' ? 'adjust-single' : 'contact')}${button(session.role === 'gestor' ? 'Voltar à unidade' : state.screen === 'follow' ? 'Voltar' : 'Voltar à fila', 'close-modal', 'secondary')}</div><p class="caption muted">${purchased ? 'Compra confirmada por transação' : 'Recomendação baseada no histórico'} • dados demonstrativos</p>`;
}
function scheduleFields() {
  const optional = state.draft.result === 'Sem interesse agora';
  return `<h3>${optional ? 'Retorno opcional' : 'Programe a próxima ação'}</h3><div class="schedule-grid"><label class="field-label">Data do retorno<input class="field" type="date" name="returnDate" value="${attr(state.draft.returnDate)}" ${optional ? '' : 'required'}></label><label class="field-label">Horário<input class="field" type="time" name="returnTime" value="${attr(state.draft.returnTime)}" ${optional ? '' : 'required'}></label></div><p class="small" id="next-action">${optional && !state.draft.returnDate ? 'Sem retorno agendado neste registro' : 'Próxima ação: ' + escapeHtml(outcomeDefaults[state.draft.result].action.toLowerCase())}</p>`;
}
function contactView(member) {
  return `${drawerBar(member)}<h2 id="dialog-title">Registrar contato</h2><p class="muted">${escapeHtml(member.name)} • #${member.id}</p><hr><form class="contact-form" id="contact-form"><h3>Como foi a conversa?</h3><div class="result-options" role="radiogroup" aria-label="Resultado do contato">${outcomes.map(result => `<label class="result-option"><input type="radio" name="result" value="${result}" ${state.draft.result === result ? 'checked' : ''} required><img src="assets/${state.draft.result === result ? 'eff68.svg' : '1ec75.svg'}" width="18" height="18" alt=""><span>${result}</span></label>`).join('')}</div><div class="field-label"><label for="contact-note">Observação</label><textarea class="field" id="contact-note" name="note">${escapeHtml(state.draft.note)}</textarea></div><section class="schedule" id="schedule-fields">${scheduleFields()}</section><div class="confirmation-rule">${icon('info')}<p>Interesse é resultado do contato. Uma compra só será confirmada pelas transações.</p></div><div class="panel-actions"><button class="btn" id="save-contact" type="submit">Salvar contato e retorno</button>${button('Cancelar', 'cancel-contact', 'secondary')}</div></form>`;
}
function adjustView() {
  const selected = state.selected.map(memberById).filter(Boolean);
  return `<div class="modal-heading"><h2 id="dialog-title">Ajustar atendimento</h2>${button('×', 'close-modal', 'ghost', 'aria-label="Fechar ajuste"')}</div><p class="muted">Unidade ${escapeHtml(state.unit)} • <span id="selected-count">${selected.length}</span> cooperados selecionados</p><form class="adjust-form" id="adjust-form"><div class="selected-members">${selected.map(member => `<label class="selection-option"><input type="checkbox" name="members" value="${member.id}" checked><span>${escapeHtml(member.name)}</span></label>`).join('')}</div><div class="field-label"><label for="adjust-responsible">Responsável</label><select class="field" id="adjust-responsible" name="responsible" required><option value="Ana Costa">Ana Costa • Balconista</option><option value="Pedro Alves">Pedro Alves • Balconista</option></select></div><label class="field-label">Prazo do primeiro atendimento<input class="field" type="datetime-local" name="deadline" value="2026-10-02T17:00" required></label><div class="field-label"><label for="adjust-guidance">Orientação para o atendimento</label><textarea class="field" id="adjust-guidance" name="guidance">Priorizar os retornos vencidos e registrar uma próxima ação para cada cooperado.</textarea></div><div class="panel-actions"><button type="submit" class="btn">Salvar ajuste</button>${button('Cancelar', 'close-modal', 'secondary')}</div><p class="small danger" id="adjust-error" hidden>Selecione pelo menos um cooperado.</p></form>`;
}
function openModal(type, memberId = state.memberId) {
  CocamarUI.closePopover();
  clearTimeout(toastTimer); toastRoot.innerHTML = '';
  if (!state.modal) previousFocus = document.activeElement;
  state.modal = type; state.memberId = memberId;
  if (type === 'contact') state.draft = { result: 'Retornar depois', note: outcomeDefaults['Retornar depois'].note, returnDate: DEMO_DATE, returnTime: '16:00' };
  const member = memberById(memberId);
  if (type !== 'adjust' && !member) return closeModal();
  if (type === 'adjust') {
    const members = data.members.filter(item => item.unit === state.unit);
    state.selected = state.selected.filter(id => members.some(item => item.id === id));
    if (!state.selected.length) return closeModal();
  }
  app.inert = true;
  document.body.classList.add('modal-open');
  overlayRoot.innerHTML = `<div class="overlay ${type === 'adjust' ? '' : 'drawer-overlay'}"><section class="${type === 'adjust' ? 'modal' : 'drawer'}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">${type === 'adjust' ? adjustView() : type === 'contact' ? contactView(member) : detailView(member)}</section></div>`;
  CocamarUI.mount(new Map(), overlayRoot);
  overlayRoot.querySelector('[role=dialog]').focus();
}
function closeModal() {
  CocamarUI.closePopover();
  const wasOpen = Boolean(state.modal);
  state.modal = null; overlayRoot.innerHTML = ''; app.inert = false;
  document.body.classList.remove('modal-open');
  if (wasOpen && previousFocus?.isConnected) previousFocus.focus();
}
function showToast(title, text) {
  clearTimeout(toastTimer);
  toastRoot.innerHTML = `<div class="toast"><p>${escapeHtml(title)}</p><small>${escapeHtml(text)}</small></div>`;
  toastTimer = setTimeout(() => { toastRoot.innerHTML = ''; }, 6500);
}
document.addEventListener('click', event => {
  if (event.target.classList.contains('overlay')) { closeModal(); return; }
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === 'login-role' && state.loginRole !== target.dataset.role) {
    const form = document.querySelector('#login-form');
    const remember = form.elements.remember.checked;
    state.loginRole = target.dataset.role;
    render();
    document.querySelector('#login-form').elements.remember.checked = remember;
    document.querySelector(`[data-action="login-role"][data-role="${state.loginRole}"]`).focus({ preventScroll: true });
  }
  if (action === 'toggle-password') {
    const input = document.querySelector('#login-password');
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    target.setAttribute('aria-pressed', String(reveal));
    target.setAttribute('aria-label', reveal ? 'Ocultar senha' : 'Mostrar senha');
  }
  if (action === 'navigate') navigate(target.dataset.screen);
  if (action === 'logout') {
    closeModal(); clearTimeout(toastTimer); toastRoot.innerHTML = ''; try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch { /* A sessão em memória ainda é encerrada. */ } session = null; location.hash = '/login'; route();
  }
  if (action === 'filter') { state.selected = []; state.filter = target.dataset.filter; state.page = 1; render(); }
  if (action === 'page') { state.page += Number(target.dataset.direction); refreshTable(); }
  if (action === 'detail') openModal('detail', target.dataset.id);
  if (action === 'close-modal') closeModal();
  if (action === 'contact') openModal('contact');
  if (action === 'cancel-contact') openModal('detail');
  if (action === 'investigate') { state.selected = []; state.unit = target.dataset.unit || 'Maringá'; state.responsible = 'all'; navigate('operation'); }
  if (action === 'adjust' && state.selected.length) openModal('adjust');
  if (action === 'adjust-single') { state.selected = [state.memberId]; refreshTable(); openModal('adjust'); }
});
document.addEventListener('input', event => {
  if (event.target.id === 'table-search') { state.selected = []; state.query = event.target.value; state.page = 1; refreshTable(); }
  if (event.target.closest('#contact-form') && state.draft && event.target.name !== 'result') state.draft[event.target.name] = event.target.value;
});
document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('[data-select-member], [data-select-page]')) {
    const ids = target.hasAttribute('data-select-page') ? operationMembers().slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE).map(member => member.id) : [target.dataset.selectMember];
    state.selected = target.checked ? [...new Set([...state.selected, ...ids])] : state.selected.filter(id => !ids.includes(id));
    const selector = target.hasAttribute('data-select-page') ? '[data-select-page]' : `[data-select-member="${target.dataset.selectMember}"]`;
    refreshTable();
    document.querySelector(selector)?.focus({ preventScroll: true });
  }
  if (target.id === 'sort-select') { state.sort = target.value; state.page = 1; refreshTable(); }
  if (target.id === 'region-unit') { state.regionUnit = target.value; render(); }
  if (target.id === 'period-select') { state.period = target.value; render(); }
  if (target.id === 'operation-unit') { state.selected = []; state.unit = target.value; state.query = ''; state.page = 1; render(); }
  if (target.id === 'responsible-select') { state.selected = []; state.responsible = target.value; state.page = 1; render(); }
  if (target.name === 'result' && state.draft) {
    const previous = state.draft.result;
    state.draft.result = target.value;
    if (state.draft.note === outcomeDefaults[previous].note) { state.draft.note = outcomeDefaults[target.value].note; document.querySelector('[name=note]').value = state.draft.note; }
    const optional = target.value === 'Sem interesse agora';
    state.draft.returnDate = optional ? '' : state.draft.returnDate || DEMO_DATE;
    state.draft.returnTime = optional ? '' : state.draft.returnTime || '16:00';
    document.querySelector('#schedule-fields').innerHTML = scheduleFields();
    document.querySelector('#save-contact').textContent = optional ? 'Salvar contato' : 'Salvar contato e retorno';
    for (const input of document.querySelectorAll('.result-option input')) input.nextElementSibling.src = 'assets/' + (input.checked ? 'eff68.svg' : '1ec75.svg');
  }
  if (target.name === 'members') document.querySelector('#selected-count').textContent = document.querySelectorAll('[name=members]:checked').length;
  if (target.name === 'returnDate' && state.draft?.result === 'Sem interesse agora') {
    document.querySelector('[name=returnTime]').required = Boolean(target.value);
    document.querySelector('#save-contact').textContent = target.value ? 'Salvar contato e retorno' : 'Salvar contato';
    document.querySelector('#next-action').textContent = target.value ? 'Próxima ação: planejar novo contato' : 'Sem retorno agendado neste registro';
  }
});
document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  if (form.id === 'login-form') {
    // E-mail e senha servem apenas para demonstrar o formulário e não são armazenados.
    session = { role: state.loginRole };
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); (fields.has('remember') ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Navegação continua sem persistir a sessão. */ }
    navigate(session.role === 'gestor' ? 'overview' : 'queue');
  }
  if (form.id === 'contact-form') {
    const member = memberById(state.memberId);
    const result = fields.get('result');
    const returnDate = fields.get('returnDate');
    const returnTime = returnDate ? fields.get('returnTime') : '';
    member.history.unshift({ result, note: fields.get('note'), date: DEMO_DATE, time: '10:30', responsible: 'Ana Costa', returnDate, returnTime });
    member.lastContact = '02 out. 2026'; member.status = result; member.action = outcomeDefaults[result].action; member.due = returnDate; member.time = returnTime;
    const old = data.followups.find(item => item.memberId === member.id);
    const followup = { memberId: member.id, action: outcomeDefaults[result].action, responsible: 'Ana Costa', date: returnDate, time: returnTime, result, purchased: old?.purchased || false, order: old?.order, amount: old?.amount };
    if (old) Object.assign(old, followup); else data.followups.unshift(followup);
    storeData(); closeModal(); navigate('follow');
    showToast('Contato registrado', returnDate ? 'Próxima ação agendada para ' + dateLabel(returnDate, returnTime).toLowerCase().replace(' • ', ', às ') + '.' : 'Contato salvo sem retorno agendado.');
  }
  if (form.id === 'adjust-form') {
    const selected = fields.getAll('members');
    if (!selected.length) { document.querySelector('#adjust-error').hidden = false; return; }
    const [date, time] = fields.get('deadline').split('T');
    for (const id of selected) {
      const member = memberById(id);
      member.responsible = fields.get('responsible'); member.guidance = fields.get('guidance');
      if (member.status === 'Pendente') { member.action = 'Primeiro contato'; member.due = date; member.time = time; }
      const followup = data.followups.find(item => item.memberId === id);
      if (followup) followup.responsible = fields.get('responsible');
    }
    storeData(); state.selected = []; closeModal(); render();
    showToast('Atendimento atualizado', `${selected.length} cooperados atribuídos a ${fields.get('responsible')} • prazo ${dateLabel(date, time).toLowerCase().replace(' • ', ', ')}.`);
  }
});
document.addEventListener('keydown', event => {
  if (state.modal) {
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      const dialog = overlayRoot.querySelector('[role=dialog]');
      const focusable = [...dialog.querySelectorAll('button, input, select, textarea, [tabindex="0"]')].filter(element => !element.disabled && !element.hidden && element.getClientRects().length);
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    }
  } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('tr[data-action]')) { event.preventDefault(); event.target.click(); }
});
window.addEventListener('hashchange', route);
route();
