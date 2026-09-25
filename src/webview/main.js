// Core state lives in src/webview/core.js (window.Core)
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
    if (window.Core && typeof window.Core.setBoard === 'function') {
      window.Core.setBoard(message.data || { tags: [], columns: [] });
      window.Core.render();
    }
  }
});

// Modal/UI utilities moved to src/webview/modals.js

// save/render are provided by window.Core
// Tags rendering is handled by src/webview/tags.js (window.Kanban.renderTagsList)

function startEditTag(idx) {
  const tag = (window.Core && window.Core.getBoard && window.Core.getBoard().tags) ? window.Core.getBoard().tags[idx] : null;
  editingTagIdx = idx;

  document.getElementById('tagModalTitle').innerText = 'Edit Tag';
  document.getElementById('newTagName').value = tag.name;
  document.getElementById('newTagColor').value = tag.color;
  document.getElementById('btnCreateTag').innerText = 'Save Changes';
  document.getElementById('btnCancelEditTag').style.display = 'inline-block';
}

function resetTagForm() {
  editingTagIdx = null;
  document.getElementById('tagModalTitle').innerText = 'Create Tag';
  document.getElementById('newTagName').value = '';
  document.getElementById('newTagColor').value = '#89b4fa';
  document.getElementById('btnCreateTag').innerText = 'Add Tag';
  document.getElementById('btnCancelEditTag').style.display = 'none';
}

function closeTagModal() {
  closeModal('tagModal');
  resetTagForm();
}

// Event handlers (input/change/click/dblclick) moved to src/webview/events.js

function editCardTags(colIdx, cardIdx) {
  const board = window.Core.getBoard();
  const card = board.columns[colIdx].cards[cardIdx];
  const tagNames = (board.tags || []).map((t) => t.name).join(', ');
  const selected = prompt(`Available tags: ${tagNames}\nType names separated by commas:`);
  if (selected === null) return;

  const tagArray = selected.split(',').map((s) => s.trim()).filter(Boolean);
  const tagIds = [];
  tagArray.forEach((name) => {
    const found = (board.tags || []).find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (found) tagIds.push(found.id);
  });

  card.tags = tagIds;
  if (window.Core && typeof window.Core.save === 'function') window.Core.save();
  if (window.Core && typeof window.Core.render === 'function') window.Core.render();
}


function editCardTitle(colIdx, cardIdx) {
  const board = window.Core.getBoard();
  const card = board.columns[colIdx].cards[cardIdx];
  editingCardInfo = { colIdx, cardIdx };

  const input = document.getElementById('editCardTitleInput');
  input.value = card.title;

  openModal('editCardModal');
  input.focus();
}

// Modal-specific helpers moved to src/webview/modals.js

// renderCardTagsSelectionList moved to src/webview/tags.js

// Drag & drop handlers moved to src/webview/dragdrop.js