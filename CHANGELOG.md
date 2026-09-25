# Change Log

All notable changes to the "personal-kanban-md" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]
### Added

- Refactor: consolidated tag rendering into `src/webview/tags.js` with DOM-based renderers.
- Translate UI strings and internal comments from Spanish to English across webview files.
- Introduced modular webview code: `core.js`, `cards.js`, `columns.js`, `tags.js`, `modals.js`, `events.js`, `dragdrop.js`.
- Added demo GIF and embedded it in the `README.md`.
- Added placeholders for marketplace `icon.png` and README gif; added `assets/demo.gif`.

### Fixed / Improved

- Improved drag & drop behavior and persistent board state.
- Replaced browser prompts with HTML modals for better UX and CSP compatibility.

## [1.0.0] - 2026-09-25

- Initial stable release prepared for VS Code Marketplace.