// Drag & drop handlers
(function () {
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('input, button, label')) {
      e.preventDefault();
      return;
    }

    const cardEl = e.target.closest('.js-card');
    if (cardEl) {
      draggedCardInfo = {
        sourceColIdx: parseInt(cardEl.dataset.col, 10),
        sourceCardIdx: parseInt(cardEl.dataset.card, 10)
      };
      cardEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.stopPropagation();
      return;
    }

    const colEl = e.target.closest('.js-column');
    if (colEl) {
      draggedColIdx = parseInt(colEl.dataset.col, 10);
      colEl.classList.add('column-dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  document.addEventListener('dragend', (e) => {
    const cardEl = e.target.closest('.js-card');
    if (cardEl) {
      cardEl.classList.remove('dragging');
    }

    const colEl = e.target.closest('.js-column');
    if (colEl) {
      colEl.classList.remove('column-dragging');
    }

    document.querySelectorAll('.js-cards-container').forEach((c) => c.classList.remove('drag-over'));
    document.querySelectorAll('.js-column').forEach((col) => col.classList.remove('col-drag-over'));

    draggedCardInfo = null;
    draggedColIdx = null;
  });

  document.addEventListener('dragover', (e) => {
    if (draggedCardInfo) {
      const container = e.target.closest('.js-cards-container');
      if (!container) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      container.classList.add('drag-over');
      return;
    }

    if (draggedColIdx !== null) {
      const colEl = e.target.closest('.js-column');
      if (!colEl) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      colEl.classList.add('col-drag-over');
    }
  });

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

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;

    if (draggedCardInfo && board) {
      const container = e.target.closest('.js-cards-container');
      if (!container) return;

      container.classList.remove('drag-over');
      const targetColIdx = parseInt(container.dataset.col, 10);
      const { sourceColIdx, sourceCardIdx } = draggedCardInfo;

      const sourceColumn = board.columns[sourceColIdx];
      const [movedCard] = sourceColumn.cards.splice(sourceCardIdx, 1);

      const targetCards = Array.from(container.querySelectorAll('.js-card:not(.dragging)'));
      let inserted = false;

      for (let i = 0; i < targetCards.length; i++) {
        const cardRect = targetCards[i].getBoundingClientRect();
        const cardMidY = cardRect.top + cardRect.height / 2;

        if (e.clientY < cardMidY) {
          board.columns[targetColIdx].cards.splice(i, 0, movedCard);
          inserted = true;
          break;
        }
      }

      if (!inserted) {
        board.columns[targetColIdx].cards.push(movedCard);
      }

      if (window.Core && typeof window.Core.save === 'function') window.Core.save();
      if (window.Core && typeof window.Core.render === 'function') window.Core.render();
      return;
    }

    if (draggedColIdx !== null && board) {
      const targetColEl = e.target.closest('.js-column');
      if (!targetColEl) return;

      targetColEl.classList.remove('col-drag-over');
      const targetColIdx = parseInt(targetColEl.dataset.col, 10);

      if (draggedColIdx === targetColIdx) return;

      const [movedCol] = board.columns.splice(draggedColIdx, 1);
      board.columns.splice(targetColIdx, 0, movedCol);

      if (window.Core && typeof window.Core.save === 'function') window.Core.save();
      if (window.Core && typeof window.Core.render === 'function') window.Core.render();
    }
  });

})();
