const vscode = acquireVsCodeApi();
let currentBoard = { tags: [], columns: [], boardColor: '#0f172a' };
let editingColInfo = null;
let editingTagIdx = null;
let addingCardColIdx = null;
let editingCardInfo = null; 
let deletingColIdx = null;
let deletingCardInfo = null;
let assigningCardTagsInfo = null; 
let selectedTagIds = new Set();
let draggedCardInfo = null;
let draggedColIdx = null;

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'LOAD_BOARD') {
    currentBoard = message.data || { tags: [], columns: [] };
    render();
  }
});

function openDeleteCardModal(colIdx, cardIdx) {
  deletingCardInfo = { colIdx, cardIdx };
  const modal = document.getElementById('deleteCardModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeDeleteCardModal() {
  const modal = document.getElementById('deleteCardModal');
  if (modal) {
    modal.classList.remove('active');
  }
  deletingCardInfo = null;
}

function openDeleteColModal(colIdx) {
  deletingColIdx = colIdx;
  const modal = document.getElementById('deleteColModal');
  if (modal) {
    modal.classList.add('active');
  } else {
    console.error('El modal deleteColModal no se encuentra en el DOM');
  }
}

function closeDeleteColModal() {
  const modal = document.getElementById('deleteColModal');
  if (modal) {
    modal.classList.remove('active');
  }
  deletingColIdx = null;
}

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
    colEl.className = 'column js-column';
    colEl.draggable = true;
    colEl.dataset.col = colIdx;

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
      <div class="cards-container js-cards-container" data-col="${colIdx}">
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
    <!-- Agregar draggable="true" y dataset de identificadores -->
    <div class="card js-card" draggable="true" data-col="${colIdx}" data-card="${cardIdx}" style="${cardStyle}">
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-header">
        <div class="card-title js-card-title" data-col="${colIdx}" data-card="${cardIdx}" title="Doble clic para editar texto">
          ${escapeHtml(card.title)}
        </div>
      </div>
      
      <div class="card-footer">
     <div class="card-controls">   
	  	  <input type="date" class="js-card-duedate" data-col="${colIdx}" data-card="${cardIdx}" value="${card.dueDate || ''}" title="Fecha límite">  
		  <button class="icon-btn js-edit-card-title" data-col="${colIdx}" data-card="${cardIdx}" title="Editar texto">✏️</button>
          <button class="icon-btn js-edit-tags" data-col="${colIdx}" data-card="${cardIdx}" title="Gestionar etiquetas">🏷️</button>
		  <label class="color-picker-wrapper" title="Cambiar color de tarjeta">
            🎨
            <input type="color" class="js-card-color" data-col="${colIdx}" data-card="${cardIdx}" value="${card.color || '#ffffff'}">
          </label>
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
// Filtrar etiquetas según lo que escribe el usuario
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'tagSearchInput') {
    renderCardTagsSelectionList(e.target.value);
  }
});

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
  } else if (e.target && e.target.classList.contains('js-card-tag-checkbox')) {
    const tagId = e.target.dataset.tagid;
    if (e.target.checked) {
      selectedTagIds.add(tagId);
    } else {
      selectedTagIds.delete(tagId);
    }
  }
});

// Eventos 'click' para Botones generales y Modal
document.addEventListener('click', (e) => {
  const targetBtn = e.target.closest('button');
  if (!targetBtn) return;

  // --- MODAL ASIGNAR ETIQUETAS A TARJETA ---
  if (targetBtn.classList.contains('js-edit-tags')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const cardIdx = parseInt(targetBtn.dataset.card, 10);
    openCardTagsModal(colIdx, cardIdx);
    return;
  }

  if (targetBtn.id === 'btnSaveCardTags') {
    if (assigningCardTagsInfo) {
      const { colIdx, cardIdx } = assigningCardTagsInfo;
      // Asignar el nuevo array de IDs de etiquetas
      currentBoard.columns[colIdx].cards[cardIdx].tags = Array.from(selectedTagIds);
      save();
      render();
    }
    closeCardTagsModal();
    return;
  }

  if (targetBtn.id === 'btnCancelCardTags') {
    closeCardTagsModal();
    return;
  }

  // --- MODAL ELIMINAR TARJETA ---
  if (targetBtn.classList.contains('js-delete-card')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    const cardIdx = parseInt(targetBtn.dataset.card, 10);
    openDeleteCardModal(colIdx, cardIdx);
    return;
  }

  if (targetBtn.id === 'btnConfirmDeleteCard') {
    if (deletingCardInfo) {
      const { colIdx, cardIdx } = deletingCardInfo;
      currentBoard.columns[colIdx].cards.splice(cardIdx, 1);
      save();
      render();
    }
    closeDeleteCardModal();
    return;
  }

  if (targetBtn.id === 'btnCancelDeleteCard') {
    closeDeleteCardModal();
    return;
  }

  // --- MODAL ELIMINAR COLUMNA ---
  if (targetBtn.classList.contains('js-delete-col')) {
    const colIdx = parseInt(targetBtn.dataset.col, 10);
    openDeleteColModal(colIdx);
    return;
  }

  if (targetBtn.id === 'btnConfirmDeleteCol') {
    if (deletingColIdx !== null) {
      currentBoard.columns.splice(deletingColIdx, 1);
      save();
      render();
    }
    closeDeleteColModal();
    return;
  }

  if (targetBtn.id === 'btnCancelDeleteCol') {
    closeDeleteColModal();
    return;
  }

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
    openAddColModal();
    return;
  }

  if (targetBtn.id === 'btnSaveAddCol') {
    const title = document.getElementById('addColTitleInput').value.trim();
    if (title) {
      currentBoard.columns.push({ id: 'col-' + Date.now(), title, cards: [] });
      save();
      render();
    }
    closeAddColModal();
    return;
  }

  if (targetBtn.id === 'btnCancelAddCol') {
    closeAddColModal();
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
    openAddCardModal(colIdx);
    return;
  } else if (targetBtn.id === 'btnSaveAddCard') {
    const title = document.getElementById('addCardTitleInput').value.trim();
    if (title && addingCardColIdx !== null) {
      currentBoard.columns[addingCardColIdx].cards.push({
        id: 'card-' + Date.now(),
        title,
        tags: []
      });
      save();
      render();
    }
    closeAddCardModal();
    return;
  } else if (targetBtn.id === 'btnCancelAddCard') {
    closeAddCardModal();
    return;
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

// --- FUNCIONES PARA MODAL AGREGAR COLUMNA ---
function openAddColModal() {
  const input = document.getElementById('addColTitleInput');
  input.value = '';
  document.getElementById('addColModal').classList.add('active');
  input.focus();
}

function closeAddColModal() {
  document.getElementById('addColModal').classList.remove('active');
}

// --- FUNCIONES PARA MODAL AGREGAR TARJETA ---
function openAddCardModal(colIdx) {
  addingCardColIdx = colIdx;
  const input = document.getElementById('addCardTitleInput');
  input.value = '';
  document.getElementById('addCardModal').classList.add('active');
  input.focus();
}

function closeAddCardModal() {
  document.getElementById('addCardModal').classList.remove('active');
  addingCardColIdx = null;
}

function openCardTagsModal(colIdx, cardIdx) {
  assigningCardTagsInfo = { colIdx, cardIdx };
  const card = currentBoard.columns[colIdx].cards[cardIdx];
  
  // Inicializar el Set con los IDs de las etiquetas asignadas actualmente
  selectedTagIds = new Set(card.tags || []);

  const searchInput = document.getElementById('tagSearchInput');
  searchInput.value = '';

  renderCardTagsSelectionList('');
  
  const modal = document.getElementById('cardTagsModal');
  if (modal) {
    modal.classList.add('active');
    searchInput.focus();
  }
}

function closeCardTagsModal() {
  const modal = document.getElementById('cardTagsModal');
  if (modal) {
    modal.classList.remove('active');
  }
  assigningCardTagsInfo = null;
  selectedTagIds.clear();
}

function renderCardTagsSelectionList(filterText) {
  const container = document.getElementById('cardTagsListContainer');
  const query = filterText.toLowerCase().trim();

  const allTags = currentBoard.tags || [];
  const filteredTags = allTags.filter((tag) => tag.name.toLowerCase().includes(query));

  if (filteredTags.length === 0) {
    container.innerHTML = `<div style="opacity: 0.6; text-align: center; padding: 8px;">No se encontraron etiquetas</div>`;
    return;
  }

  container.innerHTML = filteredTags
    .map((tag) => {
      const isChecked = selectedTagIds.has(tag.id) ? 'checked' : '';
      return `
      <label style="display: flex; align-items: center; justify-content: space-between; padding: 6px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="js-card-tag-checkbox" data-tagid="${tag.id}" ${isChecked}>
          <span class="tag-badge" style="background:${tag.color}">${escapeHtml(tag.name)}</span>
        </div>
      </label>
    `;
    })
    .join('');
}

// 1. Inicio del arrastre (dragstart)
document.addEventListener('dragstart', (e) => {
  // Evitar arrastrar la columna si el usuario intenta seleccionar texto o interactuar con un botón
  if (e.target.closest('input, button, label')) {
    e.preventDefault();
    return;
  }

  // A) Arrastre de TARJETA
  const cardEl = e.target.closest('.js-card');
  if (cardEl) {
    draggedCardInfo = {
      sourceColIdx: parseInt(cardEl.dataset.col, 10),
      sourceCardIdx: parseInt(cardEl.dataset.card, 10)
    };
    cardEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation(); // Evitar que la columna padre capture el drag
    return;
  }

  // B) Arrastre de COLUMNA
  const colEl = e.target.closest('.js-column');
  if (colEl) {
    draggedColIdx = parseInt(colEl.dataset.col, 10);
    colEl.classList.add('column-dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
});

// 2. Fin del arrastre (dragend)
document.addEventListener('dragend', (e) => {
  // Limpiar estados de tarjeta
  const cardEl = e.target.closest('.js-card');
  if (cardEl) {
    cardEl.classList.remove('dragging');
  }

  // Limpiar estados de columna
  const colEl = e.target.closest('.js-column');
  if (colEl) {
    colEl.classList.remove('column-dragging');
  }

  // Limpiar clases CSS visuales
  document.querySelectorAll('.js-cards-container').forEach((c) => c.classList.remove('drag-over'));
  document.querySelectorAll('.js-column').forEach((col) => col.classList.remove('col-drag-over'));

  draggedCardInfo = null;
  draggedColIdx = null;
});

// 3. Permitir soltar sobre áreas válidas (dragover)
document.addEventListener('dragover', (e) => {
  // A) Si estamos arrastrando una TARJETA
  if (draggedCardInfo) {
    const container = e.target.closest('.js-cards-container');
    if (!container) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    container.classList.add('drag-over');
    return;
  }

  // B) Si estamos arrastrando una COLUMNA
  if (draggedColIdx !== null) {
    const colEl = e.target.closest('.js-column');
    if (!colEl) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    colEl.classList.add('col-drag-over');
  }
});

// 4. Salir de la zona de soltar (dragleave)
document.addEventListener('dragleave', (e) => {
  if (draggedCardInfo) {
    const container = e.target.closest('.js-cards-container');
    if (container && !container.contains(e.relatedTarget)) {
      container.classList.remove('drag-over');
    }
  }

  if (draggedColIdx !== null) {
    const colEl = e.target.closest('.js-column');
    if (colEl && !colEl.contains(e.relatedTarget)) {
      colEl.classList.remove('col-drag-over');
    }
  }
});

// 5. Soltar en el destino (drop)
document.addEventListener('drop', (e) => {
  e.preventDefault();

  // A) DROP DE TARJETA
  if (draggedCardInfo) {
    const container = e.target.closest('.js-cards-container');
    if (!container) return;

    container.classList.remove('drag-over');
    const targetColIdx = parseInt(container.dataset.col, 10);
    const { sourceColIdx, sourceCardIdx } = draggedCardInfo;

    const sourceColumn = currentBoard.columns[sourceColIdx];
    const [movedCard] = sourceColumn.cards.splice(sourceCardIdx, 1);

    const targetCards = Array.from(container.querySelectorAll('.js-card:not(.dragging)'));
    let inserted = false;

    for (let i = 0; i < targetCards.length; i++) {
      const cardRect = targetCards[i].getBoundingClientRect();
      const cardMidY = cardRect.top + cardRect.height / 2;

      if (e.clientY < cardMidY) {
        currentBoard.columns[targetColIdx].cards.splice(i, 0, movedCard);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      currentBoard.columns[targetColIdx].cards.push(movedCard);
    }

    save();
    render();
    return;
  }

  // B) DROP DE COLUMNA
  if (draggedColIdx !== null) {
    const targetColEl = e.target.closest('.js-column');
    if (!targetColEl) return;

    targetColEl.classList.remove('col-drag-over');
    const targetColIdx = parseInt(targetColEl.dataset.col, 10);

    if (draggedColIdx === targetColIdx) return; // Se soltó en el mismo lugar

    // Reordenar las columnas en el arreglo
    const [movedCol] = currentBoard.columns.splice(draggedColIdx, 1);
    currentBoard.columns.splice(targetColIdx, 0, movedCol);

    save();
    render();
  }
});