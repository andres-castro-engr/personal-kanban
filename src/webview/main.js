const vscode = acquireVsCodeApi();
let currentBoard = { tags: [], columns: [], boardColor: '#0f172a' };
let editingColInfo = null;
let editingTagIdx = null;

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'LOAD_BOARD') {
    currentBoard = message.data || { tags: [], columns: [] };
    render();
  }
});

function editColumnTitle(colIdx) {
  const col = currentBoard.columns[colIdx];
  editingColInfo = { colIdx };
  
  const input = document.getElementById('editColTitleInput');
  input.value = col.title;
  
  document.getElementById('editColModal').classList.add('active');
  input.focus();
}

function closeEditColModal() {
  document.getElementById('editColModal').classList.remove('active');
  editingColInfo = null;
}

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
        <span class="js-col-title" data-col="${colIdx}" style="cursor: pointer;" title="Doble clic para editar nombre">
          ${escapeHtml(col.title)}
        </span>
        <div class="column-header-actions">
          <button class="icon-btn js-edit-col-title" data-col="${colIdx}" title="Editar nombre de columna">✏️</button>
          <label class="color-picker-wrapper" title="Cambiar color de columna">
            🎨
            <input type="color" class="js-column-color" data-col="${colIdx}" value="${col.color || '#f1f5f9'}">
          </label>
          <button class="icon-btn js-delete-col" data-col="${colIdx}" title="Eliminar columna">🗑️</button>
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
        <!-- Agregamos la clase js-card-title para capturar el clic/doble clic y un boton de edicion opcional -->
        <div class="card-title js-card-title" data-col="${colIdx}" data-card="${cardIdx}" title="Doble clic para editar texto">
          ${escapeHtml(card.title)}
        </div>
        <!--
		<div style="display: flex; gap: 4px;">
          <button class="icon-btn js-edit-card-title" data-col="${colIdx}" data-card="${cardIdx}" title="Editar texto">✏️</button>
          <button class="icon-btn js-delete-card" data-col="${colIdx}" data-card="${cardIdx}" title="Eliminar tarjeta">🗑️</button>
        </div>
		-->
      </div>
      
      <div class="card-footer">
	  	<!--
        <div>
          ${card.dueDate ? `<span class="due-date-badge">📅 ${card.dueDate}</span>` : ''}
        </div>
		-->
        <div class="card-controls">
		<input type="date" class="js-card-duedate" data-col="${colIdx}" data-card="${cardIdx}" value="${card.dueDate || ''}" title="Fecha límite">
		  <button class="icon-btn js-edit-card-title" data-col="${colIdx}" data-card="${cardIdx}" title="Editar texto">✏️</button>
          <label class="color-picker-wrapper" title="Cambiar color de tarjeta">
            🎨
            <input type="color" class="js-card-color" data-col="${colIdx}" data-card="${cardIdx}" value="${card.color || '#ffffff'}">
          </label>
          <button class="icon-btn js-edit-tags" data-col="${colIdx}" data-card="${cardIdx}" title="Gestionar etiquetas">🏷️</button>
		  <button class="icon-btn js-delete-card" data-col="${colIdx}" data-card="${cardIdx}" title="Eliminar tarjeta">🗑️</button>
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
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding: 4px; border-radius: 6px; background: rgba(0,0,0,0.03);">
      <span class="tag-badge" style="background:${t.color}">${escapeHtml(t.name)}</span>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="icon-btn js-edit-tag" data-tag="${idx}" title="Editar etiqueta">✏️</button>
        <label class="color-picker-wrapper" title="Cambiar color de etiqueta">
          🎨
          <input type="color" class="js-tag-color" data-tag="${idx}" value="${t.color || '#89b4fa'}">
        </label>
        <button class="icon-btn js-delete-tag" data-tag="${idx}" title="Eliminar etiqueta">🗑️</button>
      </div>
    </div>
  `
    )
    .join('');
}

function startEditTag(idx) {
  const tag = currentBoard.tags[idx];
  editingTagIdx = idx;

  document.getElementById('tagModalTitle').innerText = 'Editar Etiqueta';
  document.getElementById('newTagName').value = tag.name;
  document.getElementById('newTagColor').value = tag.color;
  document.getElementById('btnCreateTag').innerText = 'Guardar Cambios';
  document.getElementById('btnCancelEditTag').style.display = 'inline-block';
}

function resetTagForm() {
  editingTagIdx = null;
  document.getElementById('tagModalTitle').innerText = 'Crear Etiqueta';
  document.getElementById('newTagName').value = '';
  document.getElementById('newTagColor').value = '#89b4fa';
  document.getElementById('btnCreateTag').innerText = 'Agregar Etiqueta';
  document.getElementById('btnCancelEditTag').style.display = 'none';
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
  const targetBtn = e.target.closest('button');
  if (!targetBtn) return;

  // Acciones del Modal de Edición de Columna
  if (targetBtn.id === 'btnSaveEditCol') {
    const newTitle = document.getElementById('editColTitleInput').value.trim();
    if (newTitle && editingColInfo !== null) {
      const { colIdx } = editingColInfo;
      currentBoard.columns[colIdx].title = newTitle;
      save();
      render();
    }
    closeEditColModal();
    return;
  }

  if (targetBtn.id === 'btnCancelEditCol') {
    closeEditColModal();
    return;
  }

  //  Acciones del Modal de Edición de Tarjeta
  if (targetBtn.id === 'btnSaveEditCard') {
    const newTitle = document.getElementById('editCardTitleInput').value.trim();
    if (newTitle && editingCardInfo) {
      const { colIdx, cardIdx } = editingCardInfo;
      currentBoard.columns[colIdx].cards[cardIdx].title = newTitle;
      save();
      render();
    }
    closeEditCardModal();
    return;
  }

  if (targetBtn.id === 'btnCancelEditCard') {
    closeEditCardModal();
    return;
  }

  // Botón para editar título de columna ✏️
  if (targetBtn.classList.contains('js-edit-col-title')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    editColumnTitle(colIdx);
    return;
  }

  //  Acciones principales de la Toolbar
  if (targetBtn.id === 'btnAddColumn') {
    const title = prompt('Nombre de la columna:');
    if (!title) return;
    currentBoard.columns.push({ id: 'col-' + Date.now(), title, cards: [] });
    save();
    render();
    return;
  }

  if (targetBtn.id === 'btnOpenTagModal') {
    resetTagForm();
	document.getElementById('tagModal').classList.add('active');
    renderTagsList();
    return;
  }

  if (targetBtn.id === 'btnCloseTagModal') {
    document.getElementById('tagModal').classList.remove('active');
	resetTagForm();
    return;
  }

  if (targetBtn.id === 'btnCreateTag') {
    const name = document.getElementById('newTagName').value.trim();
    const color = document.getElementById('newTagColor').value;
    if (!name) return;

    if (!currentBoard.tags) currentBoard.tags = [];

    if (editingTagIdx !== null) {
      // Guardar cambios de etiqueta existente
      currentBoard.tags[editingTagIdx].name = name;
      currentBoard.tags[editingTagIdx].color = color;
    } else {
      // Crear nueva etiqueta
      currentBoard.tags.push({ id: 'tag-' + Date.now(), name, color });
    }

    resetTagForm();
    save();
    renderTagsList();
    render();
    return;
  }

  // Cancelar edición de etiqueta
  if (targetBtn.id === 'btnCancelEditTag') {
    resetTagForm();
    return;
  }

  // Botón de editar etiqueta ✏️ en la lista
  if (targetBtn.classList.contains('js-edit-tag')) {
    const tagIdx = parseInt(targetBtn.dataset.tag, 10);
    startEditTag(tagIdx);
    return;
  }

  // 3. Acciones de Tarjetas y Columnas (mediante clases dinámicas)
  if (targetBtn.classList.contains('js-edit-card-title')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const cardIdx = parseInt(targetBtn.dataset.card, 10);
    editCardTitle(colIdx, cardIdx);
  } else if (targetBtn.classList.contains('js-delete-col')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    if (confirm('¿Eliminar esta columna y sus tarjetas?')) {
      currentBoard.columns.splice(colIdx, 1);
      save();
      render();
    }
  } else if (targetBtn.classList.contains('js-add-card')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const title = prompt('Título de la tarjeta:');
    if (!title) return;
    currentBoard.columns[colIdx].cards.push({ id: 'card-' + Date.now(), title, tags: [] });
    save();
    render();
  } else if (targetBtn.classList.contains('js-delete-card')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const cardIdx = parseInt(targetBtn.dataset.card, 10);
    currentBoard.columns[colIdx].cards.splice(cardIdx, 1);
    save();
    render();
  } else if (targetBtn.classList.contains('js-delete-tag')) {
    const tagIdx = parseInt(targetBtn.dataset.tag, 10);
    currentBoard.tags.splice(tagIdx, 1);
    save();
    renderTagsList();
    render();
  } else if (targetBtn.classList.contains('js-edit-tags')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const cardIdx = parseInt(targetBtn.dataset.card, 10);
    editCardTags(colIdx, cardIdx);
  }
});

// Capturar doble clic directamente en el título de la tarjeta
document.addEventListener('dblclick', (e) => {
  // Doble clic en el título de una columna
  const targetColTitle = e.target.closest('.js-col-title');
  if (targetColTitle) {
    const colIdx = parseInt(targetColTitle.dataset.col, 10);
    editColumnTitle(colIdx);
    return;
  }

  // Doble clic en el título de una tarjeta
  const targetCardTitle = e.target.closest('.js-card-title');
  if (targetCardTitle) {
    const colIdx = parseInt(targetCardTitle.dataset.col, 10);
    const cardIdx = parseInt(targetCardTitle.dataset.card, 10);
    editCardTitle(colIdx, cardIdx);
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

let editingCardInfo = null; // Guardará { colIdx, cardIdx }

function editCardTitle(colIdx, cardIdx) {
  const card = currentBoard.columns[colIdx].cards[cardIdx];
  editingCardInfo = { colIdx, cardIdx };
  
  const input = document.getElementById('editCardTitleInput');
  input.value = card.title;
  
  document.getElementById('editCardModal').classList.add('active');
  input.focus();
}

function closeEditCardModal() {
  document.getElementById('editCardModal').classList.remove('active');
  editingCardInfo = null;
}