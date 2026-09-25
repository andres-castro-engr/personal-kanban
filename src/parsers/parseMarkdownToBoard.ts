import * as matterImport from 'gray-matter';
const matter = (matterImport as any).default || matterImport;
import { KanbanBoard, Column, Card, Tag } from '../types/kanban';

export function parseMarkdownToBoard(text: string): KanbanBoard {
  const parsedMatter = matter(text);
  const data = parsedMatter.data;

  const boardColor: string | undefined = data.boardColor || undefined;
  const tags: Tag[] = Array.isArray(data.tags) ? data.tags : [];

  const columns: Column[] = [];
  const lines = parsedMatter.content.split('\n');

  let currentColumn: Column | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract column title and color
    if (trimmed.startsWith('## ')) {
      const headerText = trimmed.replace(/^##\s+/, '');
      
      const colorMatch = headerText.match(/%%\s*color:\s*(#[a-fA-F0-9]{3,8})\s*%%/);
      const title = headerText.replace(/%%\s*color:\s*#[a-fA-F0-9]{3,8}\s*%%/, '').trim();
      const color = colorMatch ? colorMatch[1] : undefined;

      currentColumn = {
        id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        color,
        cards: []
      };
      columns.push(currentColumn);
    } 
    else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      if (!currentColumn) continue;

      const cardText = trimmed.replace(/^- \[[ x]\]\s*/, '');
      const metaMatch = cardText.match(/%%\s*(.*?)\s*%%/);
      let title = cardText;
      let id = `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let color: string | undefined = undefined;
      let cardTags: string[] = [];
      let dueDate: string | undefined = undefined;

      if (metaMatch) {
        title = cardText.replace(/%%\s*.*?\s*%%/, '').trim();
        const metaStr = metaMatch[1];

        const idMatch = metaStr.match(/id:\s*([^\s,]+)/);
        const colorMatch = metaStr.match(/color:\s*["']?(#[a-fA-F0-9]{3,8})["']?/);
        const tagsMatch = metaStr.match(/tags:\s*\[(.*?)\]/);
        const dueDateMatch = metaStr.match(/dueDate:\s*["']?([\d{4}-\d{2}-\d{2}]+)["']?/);

        if (idMatch) id = idMatch[1];
        if (colorMatch) color = colorMatch[1];
        if (dueDateMatch) dueDate = dueDateMatch[1];
        if (tagsMatch && tagsMatch[1]) {
          cardTags = tagsMatch[1].split(',').map((t: string) => t.trim().replace(/["']/g, ''));
        }
      }

      currentColumn.cards.push({
        id,
        title,
        color,
        tags: cardTags,
        dueDate
      });
    }
  }

  return { boardColor, tags, columns };
}