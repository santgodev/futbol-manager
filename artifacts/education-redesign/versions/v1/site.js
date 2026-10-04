(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  function closeMenu() { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('open'); }
  toggle?.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter; let count = 0;
    document.querySelectorAll('[data-filter]').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelectorAll('.card').forEach(c => { c.hidden = filter !== 'all' && c.dataset.category !== filter; if (!c.hidden) count++; });
    const status = document.querySelector('.result-status'); if (status) status.textContent = `${count} propuestas`;
  }));
  document.querySelector('#archive-search')?.addEventListener('input', e => {
    const query = norm(e.target.value); let count = 0;
    document.querySelectorAll('.archive-item').forEach(item => { item.hidden = !norm(item.dataset.search).includes(query); if (!item.hidden) count++; });
    document.querySelector('#archive-count').textContent = `${count} materiales`;
    document.querySelector('.empty-state').hidden = count > 0;
  });
  const current = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
  document.querySelectorAll('.main-nav a').forEach(a => { const target = new URL(a.href).pathname.replace(/\/$/, ''); if (target === current) a.setAttribute('aria-current', 'page'); });
  document.documentElement.classList.add('js-ready');
})();
