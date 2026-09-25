const vscode = acquireVsCodeApi();
let currentBoard = { tags: [], columns: [], boardColor: '#0f172a' };

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'LOAD_BOARD') {
    currentBoard = message.data || { tags: [], columns: [] };
    render();
  }
});

function save() {
  vscode.postMessage({ type: 'SAVE_BOARD', data: currentBoard });
}

function render() {
  const boardEl = document.getElementById('board');
  
  if (currentBoard.boardColor) {
    document.body.style.background = currentBoard.boardColor;
    const boardPicker = document.getElementById('boardColorPicker');
    if (boardPicker) boardPicker.value = currentBoard.boardColor;
  }

  boardEl.innerHTML = '';

  (currentBoard.columns || []).forEach((col, colIdx) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';

    if (col.color) {
      colEl.style.backgroundColor = col.color;
    }

    colEl.innerHTML = `
      <div class="column-header">
        <span>${escapeHtml(col.title)}</span>
        <div class="column-header-actions">
          <label class="color-picker-wrapper" title="Cambiar color de columna">
            🎨
            <input type="color" class="js-column-color" data-col="${colIdx}" value="${col.color || '#f1f5f9'}">
          </label>
          <button class="icon-btn js-delete-col" data-col="${colIdx}" title="Eliminar columna">✕</button>
        </div>
      </div>
      <div class="cards-container">
        ${(col.cards || []).map((card, cardIdx) => renderCard(card, colIdx, cardIdx)).join('')}
      </div>
      <button class="add-card-btn js-add-card" data-col="${colIdx}">+ Añadir una tarjeta</button>
    `;
    boardEl.appendChild(colEl);
  });
}

function renderCard(card, colIdx, cardIdx) {
  const tagsHtml = (card.tags || [])
    .map((tagId) => {
      const tag = (currentBoard.tags || []).find((t) => t.id === tagId);
      if (!tag) return '';
      return `<span class="tag-badge" style="background:${tag.color}">${escapeHtml(tag.name)}</span>`;
    })
    .join('');

  const cardStyle = card.color ? `background-color: ${card.color};` : '';

  return `
    <div class="card" style="${cardStyle}">
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-header">
        <div class="card-title">${escapeHtml(card.title)}</div>
        <button class="icon-btn js-delete-card" data-col="${colIdx}" data-card="${cardIdx}" title="Eliminar tarjeta">✕</button>
      </div>
      
      <div class="card-footer">
        <div>
          ${card.dueDate ? `<span class="due-date-badge">📅 ${card.dueDate}</span>` : ''}
        </div>
        <div class="card-controls">
          <label class="color-picker-wrapper" title="Cambiar color de tarjeta">
            🎨
            <input type="color" class="js-card-color" data-col="${colIdx}" data-card="${cardIdx}" value="${card.color || '#ffffff'}">
          </label>
          <button class="icon-btn js-edit-tags" data-col="${colIdx}" data-card="${cardIdx}" title="Gestionar etiquetas">🏷️</button>
          <input type="date" class="js-card-duedate" data-col="${colIdx}" data-card="${cardIdx}" value="${card.dueDate || ''}" title="Fecha límite">
        </div>
      </div>
    </div>
  `;
}

function renderTagsList() {
  const list = document.getElementById('tagsList');
  list.innerHTML = (currentBoard.tags || [])
    .map(
      (t, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span class="tag-badge" style="background:${t.color}">${escapeHtml(t.name)}</span>
      <div style="display:flex; align-items:center; gap:6px;">
        <label class="color-picker-wrapper" title="Cambiar color de etiqueta">
          🎨
          <input type="color" class="js-tag-color" data-tag="${idx}" value="${t.color || '#89b4fa'}">
        </label>
        <button class="icon-btn js-delete-tag" data-tag="${idx}">✕</button>
      </div>
    </div>
  `
    )
    .join('');
}

// --- DELEGACIÓN DE EVENTOS EN LÍNEA PARA CUMPLIR CON CSP ---

// Eventos 'change' para los Color Pickers e Inputs de fecha
document.addEventListener('change', (e) => {
  const target = e.target;

  if (target.id === 'boardColorPicker') {
    currentBoard.boardColor = target.value;
    save();
    render();
  } else if (target.classList.contains('js-column-color')) {
    const colIdx = parseInt(target.dataset.col, 10);
    currentBoard.columns[colIdx].color = target.value;
    save();
    render();
  } else if (target.classList.contains('js-card-color')) {
    const colIdx = parseInt(target.dataset.col, 10);
    const cardIdx = parseInt(target.dataset.card, 10);
    currentBoard.columns[colIdx].cards[cardIdx].color = target.value;
    save();
    render();
  } else if (target.classList.contains('js-tag-color')) {
    const tagIdx = parseInt(target.dataset.tag, 10);
    currentBoard.tags[tagIdx].color = target.value;
    save();
    renderTagsList();
    render();
  } else if (target.classList.contains('js-card-duedate')) {
    const colIdx = parseInt(target.dataset.col, 10);
    const cardIdx = parseInt(target.dataset.card, 10);
    currentBoard.columns[colIdx].cards[cardIdx].dueDate = target.value;
    save();
    render();
  }
});

// Eventos 'click' para Botones generales y Modal
document.addEventListener('click', (e) => {
  const target = e.target.closest('button');
  if (!target) return;

  if (target.id === 'btnAddColumn') {
    const title = prompt('Nombre de la columna:');
    if (!title) return;
    currentBoard.columns.push({ id: 'col-' + Date.now(), title, cards: [] });
    save();
    render();
  } else if (target.id === 'btnOpenTagModal') {
    document.getElementById('tagModal').classList.add('active');
    renderTagsList();
  } else if (target.id === 'btnCloseTagModal') {
    document.getElementById('tagModal').classList.remove('active');
  } else if (target.id === 'btnCreateTag') {
    const name = document.getElementById('newTagName').value;
    const color = document.getElementById('newTagColor').value;
    if (!name) return;
    if (!currentBoard.tags) currentBoard.tags = [];
    currentBoard.tags.push({ id: 'tag-' + Date.now(), name, color });
    document.getElementById('newTagName').value = '';
    save();
    renderTagsList();
    render();
  } else if (target.classList.contains('js-delete-col')) {
    const colIdx = parseInt(target.dataset.col, 10);
    if (confirm('¿Eliminar esta columna y sus tarjetas?')) {
      currentBoard.columns.splice(colIdx, 1);
      save();
      render();
    }
  } else if (target.classList.contains('js-add-card')) {
    const colIdx = parseInt(target.dataset.col, 10);
    const title = prompt('Título de la tarjeta:');
    if (!title) return;
    currentBoard.columns[colIdx].cards.push({ id: 'card-' + Date.now(), title, tags: [] });
    save();
    render();
  } else if (target.classList.contains('js-delete-card')) {
    const colIdx = parseInt(target.dataset.col, 10);
    const cardIdx = parseInt(target.dataset.card, 10);
    currentBoard.columns[colIdx].cards.splice(cardIdx, 1);
    save();
    render();
  } else if (target.classList.contains('js-delete-tag')) {
    const tagIdx = parseInt(target.dataset.tag, 10);
    currentBoard.tags.splice(tagIdx, 1);
    save();
    renderTagsList();
    render();
  } else if (target.classList.contains('js-edit-tags')) {
    const colIdx = parseInt(target.dataset.col, 10);
    const cardIdx = parseInt(target.dataset.card, 10);
    editCardTags(colIdx, cardIdx);
  }
});

function editCardTags(colIdx, cardIdx) {
  const card = currentBoard.columns[colIdx].cards[cardIdx];
  const tagNames = (currentBoard.tags || []).map((t) => t.name).join(', ');
  const selected = prompt(`Etiquetas disponibles: ${tagNames}\nEscribe los nombres separados por coma:`);
  if (selected === null) return;

  const tagArray = selected.split(',').map((s) => s.trim()).filter(Boolean);
  const tagIds = [];
  tagArray.forEach((name) => {
    const found = currentBoard.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (found) tagIds.push(found.id);
  });

  card.tags = tagIds;
  save();
  render();
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}