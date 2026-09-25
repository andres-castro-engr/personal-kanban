export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  color?: string;
  tags: string[]; // Tag IDs
  dueDate?: string; // Format YYYY-MM-DD

}

export interface Column {
  id: string;
  title: string;
  color?: string;
  cards: Card[];
}

export interface KanbanBoard {
  boardColor?: string;
  tags: Tag[];
  columns: Column[];
}