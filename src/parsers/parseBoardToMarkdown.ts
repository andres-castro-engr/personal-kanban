import * as matterImport from 'gray-matter';
const matter = (matterImport as any).default || matterImport;
import { KanbanBoard } from '../types/kanban';

export function parseBoardToMarkdown(board: KanbanBoard): string {
  const frontmatterData: Record<string, any> = {
    'kanban-plugin': 'board'
  };

  if (board.boardColor) {
    frontmatterData.boardColor = board.boardColor;
  }

  if (board.tags && board.tags.length > 0) {
    frontmatterData.tags = board.tags;
  }

  let content = '';

  for (const column of board.columns) {
    // Persist the column color in the title line ##
    const columnColorMeta = column.color ? ` %% color: ${column.color} %%` : '';
    content += `\n## ${column.title}${columnColorMeta}\n`;

    for (const card of column.cards) {
      const metaParts: string[] = [`id: ${card.id}`];

      if (card.color) {
        metaParts.push(`color: "${card.color}"`);
      }

      if (card.tags && card.tags.length > 0) {
        const formattedTags = card.tags.map(t => `"${t}"`).join(', ');
        metaParts.push(`tags: [${formattedTags}]`);
      }

      if (card.dueDate) {
        metaParts.push(`dueDate: "${card.dueDate}"`);
      }

      const metaString = ` %% ${metaParts.join(', ')} %%`;
      content += `- [ ] ${card.title}${metaString}\n`;
    }
  }

  return matter.stringify(content, frontmatterData);
}