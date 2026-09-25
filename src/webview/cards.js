// Cards rendering utilities
(function () {
  window.Kanban = window.Kanban || {};

  window.Kanban.createCardElement = function (card, colIdx, cardIdx, tags) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card js-card';
    cardEl.draggable = true;
    cardEl.dataset.col = colIdx;
    cardEl.dataset.card = cardIdx;
    if (card.color) cardEl.style.backgroundColor = card.color;

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-tags';
    (card.tags || []).forEach((tagId) => {
      const tag = (tags || []).find((t) => t.id === tagId);
      if (!tag) return;
      const span = document.createElement('span');
      span.className = 'tag-badge';
      span.style.background = tag.color;
      span.textContent = tag.name;
      tagsDiv.appendChild(span);
    });

    const header = document.createElement('div');
    header.className = 'card-header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title js-card-title';
    titleDiv.dataset.col = colIdx;
    titleDiv.dataset.card = cardIdx;
    titleDiv.title = 'Double click to edit text';
    titleDiv.textContent = card.title;

    header.appendChild(titleDiv);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const controls = document.createElement('div');
    controls.className = 'card-controls';

    const dueInput = document.createElement('input');
    dueInput.type = 'date';
    dueInput.className = 'js-card-duedate';
    dueInput.dataset.col = colIdx;
    dueInput.dataset.card = cardIdx;
    dueInput.value = card.dueDate || '';
    dueInput.title = 'Due date';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn js-edit-card-title';
    editBtn.dataset.col = colIdx;
    editBtn.dataset.card = cardIdx;
    editBtn.title = 'Edit text';
    editBtn.textContent = '✏️';

    const tagsBtn = document.createElement('button');
    tagsBtn.className = 'icon-btn js-edit-tags';
    tagsBtn.dataset.col = colIdx;
    tagsBtn.dataset.card = cardIdx;
    tagsBtn.title = 'Manage tags';
    tagsBtn.textContent = '🏷️';

    const colorLabel = document.createElement('label');
    colorLabel.className = 'color-picker-wrapper';
    colorLabel.title = 'Change card color';
    colorLabel.textContent = '🎨';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'js-card-color';
    colorInput.dataset.col = colIdx;
    colorInput.dataset.card = cardIdx;
    colorInput.value = card.color || '#ffffff';
    colorLabel.appendChild(colorInput);

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn js-delete-card';
    delBtn.dataset.col = colIdx;
    delBtn.dataset.card = cardIdx;
    delBtn.title = 'Delete card';
    delBtn.textContent = '🗑️';

    controls.appendChild(dueInput);
    controls.appendChild(editBtn);
    controls.appendChild(tagsBtn);
    controls.appendChild(colorLabel);
    controls.appendChild(delBtn);

    footer.appendChild(controls);

    cardEl.appendChild(tagsDiv);
    cardEl.appendChild(header);
    cardEl.appendChild(footer);

    return cardEl;
  };
})();
