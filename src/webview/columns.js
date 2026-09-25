// Columns rendering utilities
(function () {
  window.Kanban = window.Kanban || {};

  window.Kanban.createColumnElement = function (col, colIdx, tags) {
    const colEl = document.createElement('div');
    colEl.className = 'column js-column';
    colEl.draggable = true;
    colEl.dataset.col = colIdx;

    if (col.color) colEl.style.backgroundColor = col.color;

    // Header
    const header = document.createElement('div');
    header.className = 'column-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'js-col-title';
    titleSpan.dataset.col = colIdx;
    titleSpan.style.cursor = 'pointer';
    titleSpan.title = 'Double click to edit name';
    titleSpan.textContent = col.title;

    const headerActions = document.createElement('div');
    headerActions.className = 'column-header-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn js-edit-col-title';
    editBtn.dataset.col = colIdx;
    editBtn.title = 'Edit column name';
    editBtn.textContent = '✏️';

    const colorLabel = document.createElement('label');
    colorLabel.className = 'color-picker-wrapper';
    colorLabel.title = 'Change column color';
    colorLabel.textContent = '🎨';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'js-column-color';
    colorInput.dataset.col = colIdx;
    colorInput.value = col.color || '#f1f5f9';
    colorLabel.appendChild(colorInput);

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn js-delete-col';
    delBtn.dataset.col = colIdx;
    delBtn.title = 'Delete column';
    delBtn.textContent = '🗑️';

    headerActions.appendChild(editBtn);
    headerActions.appendChild(colorLabel);
    headerActions.appendChild(delBtn);

    header.appendChild(titleSpan);
    header.appendChild(headerActions);

    colEl.appendChild(header);

    // Cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container js-cards-container';
    cardsContainer.dataset.col = colIdx;

    (col.cards || []).forEach((card, cardIdx) => {
      if (window.Kanban && typeof window.Kanban.createCardElement === 'function') {
        cardsContainer.appendChild(window.Kanban.createCardElement(card, colIdx, cardIdx, tags));
      }
    });

    colEl.appendChild(cardsContainer);

    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn js-add-card';
    addCardBtn.dataset.col = colIdx;
    addCardBtn.textContent = '+ Add a card';

    colEl.appendChild(addCardBtn);

    return colEl;
  };
})();
