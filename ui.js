'use strict';

// Controles compartilhados: seleções animadas e popovers fora das áreas de rolagem.
window.CocamarUI = (() => {
  const portal = document.querySelector('#popover-root');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let openPopover = null;
  let resizeObserver;
  const pillTargets = new WeakMap();
  let searchTerm = '';
  let searchTimer;

  const activePillKey = group => {
    const active = group.querySelector('[aria-pressed="true"], [aria-current="page"]');
    return active?.dataset.role || active?.dataset.screen;
  };

  function capturePills() {
    const positions = new Map();
    for (const group of document.querySelectorAll('[data-pill-group]')) {
      const pill = group.querySelector('.pill-indicator');
      if (!pill) continue;
      const bounds = group.getBoundingClientRect();
      const rect = pill.getBoundingClientRect();
      positions.set(group.dataset.pillGroup, { x: rect.left - bounds.left - group.clientLeft + group.scrollLeft, y: rect.top - bounds.top - group.clientTop + group.scrollTop, width: rect.width, height: rect.height, activeKey: activePillKey(group) });
    }
    return positions;
  }

  function positionPill(group, previous) {
    const active = group.querySelector('[aria-pressed="true"], [aria-current="page"]');
    if (!active) return;
    let pill = group.querySelector('.pill-indicator');
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'pill-indicator';
      pill.setAttribute('aria-hidden', 'true');
      group.prepend(pill);
    }
    const bounds = group.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const next = { x: rect.left - bounds.left - group.clientLeft + group.scrollLeft, y: rect.top - bounds.top - group.clientTop + group.scrollTop, width: rect.width, height: rect.height };
    const transform = value => `translate(${value.x}px, ${value.y}px)`;
    const target = pillTargets.get(pill);
    const sameTarget = target && ['x', 'y', 'width', 'height'].every(key => Math.abs(target[key] - next[key]) < .1);
    // O primeiro aviso do ResizeObserver também ocorre sem mudança de tamanho.
    // Preserve a animação em curso quando o destino continua igual.
    if (!previous && sameTarget) return;
    pill.getAnimations().forEach(animation => animation.cancel());
    pillTargets.set(pill, next);
    Object.assign(pill.style, { transform: transform(next), width: next.width + 'px', height: next.height + 'px' });
    if (previous && previous.activeKey !== activePillKey(group) && !reducedMotion.matches && (Math.abs(previous.x - next.x) > 1 || Math.abs(previous.width - next.width) > 1 || Math.abs(previous.y - next.y) > 1)) {
      pill.animate([
        { transform: transform(previous), width: previous.width + 'px', height: previous.height + 'px' },
        { transform: transform(next), width: next.width + 'px', height: next.height + 'px' }
      ], { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    }
    group.classList.add('pill-ready');
  }

  function closePopover(restoreFocus = false) {
    if (!openPopover) return;
    const trigger = openPopover.trigger;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.closest('.dropdown')?.classList.remove('is-open');
    openPopover = null;
    portal.replaceChildren();
    if (restoreFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
  }

  function positionPopover() {
    if (!openPopover) return;
    const { trigger, panel } = openPopover;
    if (!trigger.isConnected) return closePopover();
    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(Math.max(rect.width, openPopover.kind === 'profile' ? 280 : 220), innerWidth - margin * 2);
    const roomBelow = innerHeight - rect.bottom - margin - 8;
    const roomAbove = rect.top - margin - 8;
    const above = roomBelow < 180 && roomAbove > roomBelow;
    const height = Math.max(80, Math.min(320, above ? roomAbove : roomBelow));
    Object.assign(panel.style, { width: width + 'px', maxHeight: height + 'px', left: Math.max(margin, Math.min(openPopover.kind === 'profile' ? rect.right - width : rect.left, innerWidth - width - margin)) + 'px' });
    if (above) { panel.style.top = ''; panel.style.bottom = innerHeight - rect.top + 8 + 'px'; }
    else { panel.style.bottom = ''; panel.style.top = rect.bottom + 8 + 'px'; }
  }

  function focusOption(index) {
    const buttons = openPopover?.panel.querySelectorAll('[role=option]');
    if (!buttons?.length) return;
    const option = buttons[(index + buttons.length) % buttons.length];
    option.focus({ preventScroll: true });
    option.scrollIntoView({ block: 'nearest' });
  }

  function openSelect(select, trigger, focus = false, last = false) {
    if (openPopover?.trigger === trigger) return closePopover();
    closePopover();
    const panel = document.createElement('div');
    panel.className = 'dropdown-menu';
    panel.id = trigger.getAttribute('aria-controls');
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', trigger.getAttribute('aria-label'));
    const options = [...select.options];
    for (const [index, option] of options.entries()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dropdown-option';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(option.selected));
      button.tabIndex = -1;
      button.disabled = option.disabled;
      const label = document.createElement('span');
      label.textContent = option.textContent;
      const check = document.createElement('span');
      check.className = 'option-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      button.append(label, check);
      button.addEventListener('click', () => {
        select.value = option.value;
        trigger.querySelector('.dropdown-value').textContent = option.textContent;
        closePopover();
        select.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById(trigger.id)?.focus({ preventScroll: true });
      });
      panel.append(button);
      if (focus && (last ? index === options.length - 1 : option.selected)) button.dataset.initialFocus = 'true';
    }
    openPopover = { kind: 'select', trigger, panel, select };
    trigger.setAttribute('aria-expanded', 'true');
    trigger.closest('.dropdown').classList.add('is-open');
    portal.append(panel);
    positionPopover();
    if (focus) panel.querySelector('[data-initial-focus]')?.focus({ preventScroll: true });
  }

  function enhanceSelect(select) {
    if (select.dataset.enhanced) return;
    select.dataset.enhanced = 'true';
    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown ' + select.className;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dropdown-trigger';
    trigger.id = select.id + '-trigger';
    trigger.setAttribute('role', 'combobox');
    const label = select.getAttribute('aria-label') || select.labels?.[0]?.textContent.trim() || 'Selecionar opção';
    trigger.setAttribute('aria-label', label);
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', select.id + '-options');
    const value = document.createElement('span');
    value.className = 'dropdown-value';
    value.textContent = select.selectedOptions[0]?.textContent || '';
    const chevron = document.createElement('span');
    chevron.className = 'dropdown-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(value, chevron);
    for (const fieldLabel of [...(select.labels || [])]) fieldLabel.htmlFor = trigger.id;
    select.before(wrapper);
    wrapper.append(select, trigger);
    select.hidden = true;
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    trigger.addEventListener('click', () => openSelect(select, trigger));
    trigger.addEventListener('keydown', event => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (!openPopover || openPopover.trigger !== trigger) openSelect(select, trigger, true, event.key === 'End');
        else focusOption(event.key === 'End' || event.key === 'ArrowUp' ? select.options.length - 1 : 0);
      }
    });
  }

  function toggleProfile(trigger) {
    if (openPopover?.trigger === trigger) return closePopover();
    closePopover();
    const panel = document.createElement('section');
    panel.className = 'dropdown-menu profile-menu';
    panel.id = 'profile-popover';
    panel.tabIndex = -1;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Perfil de quem está logado');
    const title = document.createElement('p');
    title.className = 'profile-menu-title';
    title.textContent = trigger.dataset.name;
    panel.append(title);
    const details = document.createElement('dl');
    for (const [label, value] of [['Unidade', trigger.dataset.unit], ['Cargo', trigger.dataset.role]]) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      details.append(row);
    }
    panel.append(details);
    openPopover = { kind: 'profile', trigger, panel };
    trigger.setAttribute('aria-expanded', 'true');
    portal.append(panel);
    positionPopover();
  }

  function mount(previous = new Map(), root = document) {
    closePopover();
    for (const select of root.querySelectorAll('select:not([data-enhanced])')) enhanceSelect(select);
    root.querySelector('[data-profile-trigger]')?.addEventListener('click', event => toggleProfile(event.currentTarget));
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(entries => entries.forEach(entry => positionPill(entry.target)));
    for (const group of document.querySelectorAll('[data-pill-group]')) {
      positionPill(group, previous.get(group.dataset.pillGroup));
      resizeObserver.observe(group);
    }
  }

  document.addEventListener('pointerdown', event => {
    if (openPopover && !openPopover.panel.contains(event.target) && !openPopover.trigger.contains(event.target)) closePopover();
  });
  document.addEventListener('keydown', event => {
    if (!openPopover) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); closePopover(true); return;
    }
    if (event.key === 'Tab') { closePopover(true); return; }
    if (openPopover.kind !== 'select') return;
    const options = [...openPopover.panel.querySelectorAll('[role=option]')];
    const index = options.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); event.stopImmediatePropagation();
      focusOption(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : index + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== ' ') {
      clearTimeout(searchTimer);
      searchTerm += event.key.toLocaleLowerCase('pt-BR');
      const found = options.findIndex(option => option.textContent.trim().toLocaleLowerCase('pt-BR').startsWith(searchTerm));
      if (found >= 0) focusOption(found);
      searchTimer = setTimeout(() => { searchTerm = ''; }, 600);
    }
  }, true);
  window.addEventListener('resize', positionPopover);
  document.addEventListener('scroll', event => {
    if (openPopover && !openPopover.panel.contains(event.target)) positionPopover();
  }, true);
  document.fonts.ready.then(() => document.querySelectorAll('[data-pill-group]').forEach(group => positionPill(group)));
  return { capturePills, mount, closePopover };
})();
