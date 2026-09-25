// Tags rendering utilities
(function () {
  window.Kanban = window.Kanban || {};

  window.Kanban.renderTagsList = function (listEl, tags) {
    if (!listEl) return;
    listEl.innerHTML = '';
    (tags || []).forEach((t, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.marginBottom = '8px';
      row.style.padding = '4px';
      row.style.borderRadius = '6px';
      row.style.background = 'rgba(0,0,0,0.03)';

      const name = document.createElement('span');
      name.className = 'tag-badge';
      name.style.background = t.color;
      name.textContent = t.name;

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.alignItems = 'center';
      actions.style.gap = '6px';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn js-edit-tag';
      editBtn.dataset.tag = idx;
      editBtn.title = 'Edit tag';
      editBtn.textContent = '✏️';

      const colorLabel = document.createElement('label');
      colorLabel.className = 'color-picker-wrapper';
      colorLabel.title = 'Change tag color';
      colorLabel.textContent = '🎨';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'js-tag-color';
      colorInput.dataset.tag = idx;
      colorInput.value = t.color || '#89b4fa';
      colorLabel.appendChild(colorInput);

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn js-delete-tag';
      delBtn.dataset.tag = idx;
      delBtn.title = 'Delete tag';
      delBtn.textContent = '🗑️';

      actions.appendChild(editBtn);
      actions.appendChild(colorLabel);
      actions.appendChild(delBtn);

      row.appendChild(name);
      row.appendChild(actions);
      listEl.appendChild(row);
    });
  };
  
  // Escape helper local to this module
  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Render tags selection list inside card tags modal as DOM nodes
  window.Kanban.renderCardTagsSelectionList = function (filterText) {
    const container = document.getElementById('cardTagsListContainer');
    if (!container) return;
    const query = (filterText || '').toLowerCase().trim();
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;
    const allTags = (board && board.tags) ? board.tags : [];
    const filteredTags = allTags.filter((tag) => tag.name.toLowerCase().includes(query));

    // clear container
    container.innerHTML = '';

    if (filteredTags.length === 0) {
      const msg = document.createElement('div');
      msg.style.opacity = '0.6';
      msg.style.textAlign = 'center';
      msg.style.padding = '8px';
      msg.textContent = 'No tags found';
      container.appendChild(msg);
      return;
    }

    filteredTags.forEach((tag) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.justifyContent = 'space-between';
      label.style.padding = '6px';
      label.style.cursor = 'pointer';
      label.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '8px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'js-card-tag-checkbox';
      checkbox.dataset.tagid = tag.id;
      checkbox.checked = (typeof selectedTagIds !== 'undefined') ? selectedTagIds.has(tag.id) : false;

      const span = document.createElement('span');
      span.className = 'tag-badge';
      span.style.background = tag.color;
      span.textContent = tag.name;

      left.appendChild(checkbox);
      left.appendChild(span);
      label.appendChild(left);

      container.appendChild(label);
    });
  };

  // Expose a global name for backward compatibility
  window.renderCardTagsSelectionList = function (filterText) {
    return window.Kanban.renderCardTagsSelectionList(filterText);
  };
})();
