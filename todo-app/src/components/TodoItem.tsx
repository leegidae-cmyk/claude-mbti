import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <button
        className="todo-toggle"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
      >
        <span className="todo-checkbox">{todo.completed ? '✓' : ''}</span>
      </button>
      <span className="todo-text">{todo.text}</span>
      <button
        className="todo-delete"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
      >
        ×
      </button>
    </li>
  )
}
