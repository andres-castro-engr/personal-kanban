// Modal and UI utilities
(function () {
  // open/close generic modal
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  window.openDeleteCardModal = function (colIdx, cardIdx) {
    deletingCardInfo = { colIdx, cardIdx };
    openModal('deleteCardModal');
  };

  window.closeDeleteCardModal = function () {
    closeModal('deleteCardModal');
    deletingCardInfo = null;
  };

  window.openDeleteColModal = function (colIdx) {
    deletingColIdx = colIdx;
    openModal('deleteColModal');
  };

  window.closeDeleteColModal = function () {
    closeModal('deleteColModal');
    deletingColIdx = null;
  };

  window.editColumnTitle = function (colIdx) {
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;
    const col = board ? board.columns[colIdx] : null;
    editingColInfo = { colIdx };
    const input = document.getElementById('editColTitleInput');
    input.value = col.title;
    openModal('editColModal');
    input.focus();
  };

  window.closeEditColModal = function () {
    closeModal('editColModal');
    editingColInfo = null;
  };

  window.closeEditCardModal = function () {
    closeModal('editCardModal');
    editingCardInfo = null;
  };

  window.openAddColModal = function () {
    const input = document.getElementById('addColTitleInput');
    input.value = '';
    openModal('addColModal');
    input.focus();
  };

  window.closeAddColModal = function () {
    closeModal('addColModal');
  };

  window.openAddCardModal = function (colIdx) {
    addingCardColIdx = colIdx;
    const input = document.getElementById('addCardTitleInput');
    input.value = '';
    openModal('addCardModal');
    input.focus();
  };

  window.closeAddCardModal = function () {
    closeModal('addCardModal');
    addingCardColIdx = null;
  };

  window.openCardTagsModal = function (colIdx, cardIdx) {
    assigningCardTagsInfo = { colIdx, cardIdx };
    const board = window.Core && window.Core.getBoard ? window.Core.getBoard() : null;
    const card = board ? board.columns[colIdx].cards[cardIdx] : null;
    selectedTagIds = new Set((card && card.tags) ? card.tags : []);
    const searchInput = document.getElementById('tagSearchInput');
    if (searchInput) searchInput.value = '';
    if (typeof renderCardTagsSelectionList === 'function') renderCardTagsSelectionList('');
    openModal('cardTagsModal');
    if (searchInput) searchInput.focus();
  };

  window.closeCardTagsModal = function () {
    closeModal('cardTagsModal');
    assigningCardTagsInfo = null;
    selectedTagIds.clear();
  };

  window.closeTagModal = function () {
    closeModal('tagModal');
    resetTagForm();
  };

})();
