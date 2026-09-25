// Event delegation: input, change, click, dblclick
(function () {
  // input (tag search)
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'tagSearchInput') {
      if (typeof renderCardTagsSelectionList === 'function') {
        renderCardTagsSelectionList(e.target.value);
      }
    }
  });

  // change (color pickers, due date, tag-checkbox)
  document.addEventListener('change', (e) => {
    const target = e.target;
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;

    if (!board) return;

    if (target.id === 'boardColorPicker') {
      board.boardColor = target.value;
      window.Core.save();
      window.Core.render();
    } else if (target.classList.contains('js-column-color')) {
      const colIdx = parseInt(target.dataset.col, 10);
      board.columns[colIdx].color = target.value;
      window.Core.save();
      window.Core.render();
    } else if (target.classList.contains('js-card-color')) {
      const colIdx = parseInt(target.dataset.col, 10);
      const cardIdx = parseInt(target.dataset.card, 10);
      board.columns[colIdx].cards[cardIdx].color = target.value;
      window.Core.save();
      window.Core.render();
    } else if (target.classList.contains('js-tag-color')) {
      const tagIdx = parseInt(target.dataset.tag, 10);
      board.tags[tagIdx].color = target.value;
      window.Core.save();
      if (window.Kanban && typeof window.Kanban.renderTagsList === 'function') {
        window.Kanban.renderTagsList(document.getElementById('tagsList'), board.tags);
      }
      window.Core.render();
    } else if (target.classList.contains('js-card-duedate')) {
      const colIdx = parseInt(target.dataset.col, 10);
      const cardIdx = parseInt(target.dataset.card, 10);
      board.columns[colIdx].cards[cardIdx].dueDate = target.value;
      window.Core.save();
      window.Core.render();
    } else if (e.target && e.target.classList.contains('js-card-tag-checkbox')) {
      const tagId = e.target.dataset.tagid;
      if (e.target.checked) {
        selectedTagIds.add(tagId);
      } else {
        selectedTagIds.delete(tagId);
      }
    }
  });

  // click (buttons and modals)
  document.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('button');
    if (!targetBtn) return;
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;

    // --- ASSIGN TAGS TO CARD MODAL ---
    if (targetBtn.classList.contains('js-edit-tags')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      const cardIdx = parseInt(targetBtn.dataset.card, 10);
      openCardTagsModal(colIdx, cardIdx);
      return;
    }

    if (targetBtn.id === 'btnSaveCardTags') {
      if (assigningCardTagsInfo && board) {
        const { colIdx, cardIdx } = assigningCardTagsInfo;
        board.columns[colIdx].cards[cardIdx].tags = Array.from(selectedTagIds);
        window.Core.save();
        window.Core.render();
      }
      closeCardTagsModal();
      return;
    }

    if (targetBtn.id === 'btnCancelCardTags') {
      closeCardTagsModal();
      return;
    }

    // --- DELETE CARD MODAL ---
    if (targetBtn.classList.contains('js-delete-card')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      const cardIdx = parseInt(targetBtn.dataset.card, 10);
      openDeleteCardModal(colIdx, cardIdx);
      return;
    }

    if (targetBtn.id === 'btnConfirmDeleteCard') {
      if (deletingCardInfo && board) {
        const { colIdx, cardIdx } = deletingCardInfo;
        board.columns[colIdx].cards.splice(cardIdx, 1);
        window.Core.save();
        window.Core.render();
      }
      closeDeleteCardModal();
      return;
    }

    if (targetBtn.id === 'btnCancelDeleteCard') {
      closeDeleteCardModal();
      return;
    }

    // --- DELETE COLUMN MODAL ---
    if (targetBtn.classList.contains('js-delete-col')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      openDeleteColModal(colIdx);
      return;
    }

    if (targetBtn.id === 'btnConfirmDeleteCol') {
      if (deletingColIdx !== null && board) {
        board.columns.splice(deletingColIdx, 1);
        window.Core.save();
        window.Core.render();
      }
      closeDeleteColModal();
      return;
    }

    if (targetBtn.id === 'btnCancelDeleteCol') {
      closeDeleteColModal();
      return;
    }

    // Edit Column Modal actions
    if (targetBtn.id === 'btnSaveEditCol') {
      const newTitle = document.getElementById('editColTitleInput').value.trim();
      if (newTitle && editingColInfo !== null && board) {
        const { colIdx } = editingColInfo;
        board.columns[colIdx].title = newTitle;
        window.Core.save();
        window.Core.render();
      }
      closeEditColModal();
      return;
    }

    if (targetBtn.id === 'btnCancelEditCol') {
      closeEditColModal();
      return;
    }

    // Edit Card Modal actions
    if (targetBtn.id === 'btnSaveEditCard') {
      const newTitle = document.getElementById('editCardTitleInput').value.trim();
      if (newTitle && editingCardInfo && board) {
        const { colIdx, cardIdx } = editingCardInfo;
        board.columns[colIdx].cards[cardIdx].title = newTitle;
        window.Core.save();
        window.Core.render();
      }
      closeEditCardModal();
      return;
    }

    if (targetBtn.id === 'btnCancelEditCard') {
      closeEditCardModal();
      return;
    }

    // Button to edit column title ✏️
    if (targetBtn.classList.contains('js-edit-col-title')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      editColumnTitle(colIdx);
      return;
    }

    // Toolbar main actions
    if (targetBtn.id === 'btnAddColumn') {
      openAddColModal();
      return;
    }

    if (targetBtn.id === 'btnSaveAddCol') {
      const title = document.getElementById('addColTitleInput').value.trim();
      if (title && board) {
        board.columns.push({ id: 'col-' + Date.now(), title, cards: [] });
        window.Core.save();
        window.Core.render();
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
      openModal('tagModal');
      if (window.Kanban && typeof window.Kanban.renderTagsList === 'function' && board) {
        window.Kanban.renderTagsList(document.getElementById('tagsList'), board.tags);
      }
      return;
    }

    if (targetBtn.id === 'btnCloseTagModal') {
      closeTagModal();
      return;
    }

    if (targetBtn.id === 'btnCreateTag') {
      const name = document.getElementById('newTagName').value.trim();
      const color = document.getElementById('newTagColor').value;
      if (!name) return;

      if (board) {
        if (!board.tags) board.tags = [];

        if (editingTagIdx !== null) {
          board.tags[editingTagIdx].name = name;
          board.tags[editingTagIdx].color = color;
        } else {
          board.tags.push({ id: 'tag-' + Date.now(), name, color });
        }

        resetTagForm();
        window.Core.save();
        if (window.Kanban && typeof window.Kanban.renderTagsList === 'function') {
          window.Kanban.renderTagsList(document.getElementById('tagsList'), board.tags);
        }
        window.Core.render();
      }
      return;
    }

    // Cancel tag edit
    if (targetBtn.id === 'btnCancelEditTag') {
      resetTagForm();
      return;
    }

    // Edit tag button ✏️ in the list
    if (targetBtn.classList.contains('js-edit-tag')) {
      const tagIdx = parseInt(targetBtn.dataset.tag, 10);
      startEditTag(tagIdx);
      return;
    }

    // 3. Card and Column actions (via dynamic classes)
    if (targetBtn.classList.contains('js-edit-card-title')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      const cardIdx = parseInt(targetBtn.dataset.card, 10);
      editCardTitle(colIdx, cardIdx);
    } else if (targetBtn.classList.contains('js-delete-col')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      if (confirm('Are you sure you want to delete this column and all its cards?') && board) {
        board.columns.splice(colIdx, 1);
        window.Core.save();
        window.Core.render();
      }
    } else if (targetBtn.classList.contains('js-add-card')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      openAddCardModal(colIdx);
      return;
    } else if (targetBtn.id === 'btnSaveAddCard') {
      const title = document.getElementById('addCardTitleInput').value.trim();
      if (title && addingCardColIdx !== null && board) {
        board.columns[addingCardColIdx].cards.push({
          id: 'card-' + Date.now(),
          title,
          tags: []
        });
        window.Core.save();
        window.Core.render();
      }
      closeAddCardModal();
      return;
    } else if (targetBtn.id === 'btnCancelAddCard') {
      closeAddCardModal();
      return;
    } else if (targetBtn.classList.contains('js-delete-card')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      const cardIdx = parseInt(targetBtn.dataset.card, 10);
      if (board) {
        board.columns[colIdx].cards.splice(cardIdx, 1);
        window.Core.save();
        window.Core.render();
      }
    } else if (targetBtn.classList.contains('js-delete-tag')) {
      const tagIdx = parseInt(targetBtn.dataset.tag, 10);
      if (board) {
        board.tags.splice(tagIdx, 1);
        window.Core.save();
        if (window.Kanban && typeof window.Kanban.renderTagsList === 'function') {
          window.Kanban.renderTagsList(document.getElementById('tagsList'), board.tags);
        }
        window.Core.render();
      }
    } else if (targetBtn.classList.contains('js-edit-tags')) {
      const colIdx = parseInt(targetBtn.dataset.col, 10);
      const cardIdx = parseInt(targetBtn.dataset.card, 10);
      editCardTags(colIdx, cardIdx);
    }
  });

  // dblclick
  document.addEventListener('dblclick', (e) => {
    const targetColTitle = e.target.closest('.js-col-title');
    if (targetColTitle) {
      const colIdx = parseInt(targetColTitle.dataset.col, 10);
      editColumnTitle(colIdx);
      return;
    }

    const targetCardTitle = e.target.closest('.js-card-title');
    if (targetCardTitle) {
      const colIdx = parseInt(targetCardTitle.dataset.col, 10);
      const cardIdx = parseInt(targetCardTitle.dataset.card, 10);
      editCardTitle(colIdx, cardIdx);
    }
  });

})();
