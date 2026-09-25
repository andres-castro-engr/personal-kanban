// Core state and render/save logic
(function () {
  const vscode = acquireVsCodeApi();

  let board = { tags: [], columns: [], boardColor: '#0f172a' };

  function setBoard(data) {
    board = data || { tags: [], columns: [] };
    window.Core.currentBoard = board;
  }

  function getBoard() {
    return board;
  }

  function save() {
    vscode.postMessage({ type: 'SAVE_BOARD', data: board });
  }

  function render() {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;

    if (board.boardColor) {
      document.body.style.background = board.boardColor;
      const boardPicker = document.getElementById('boardColorPicker');
      if (boardPicker) boardPicker.value = board.boardColor;
    }

    boardEl.innerHTML = '';

    (board.columns || []).forEach((col, colIdx) => {
      if (window.Kanban && typeof window.Kanban.createColumnElement === 'function') {
        boardEl.appendChild(window.Kanban.createColumnElement(col, colIdx, board.tags));
      }
    });
  }

  window.Core = window.Core || {};
  window.Core.setBoard = setBoard;
  window.Core.getBoard = getBoard;
  window.Core.save = save;
  window.Core.render = render;
  window.Core.currentBoard = board;

})();
