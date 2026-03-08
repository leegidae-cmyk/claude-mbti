import type { FilterType } from '../types/todo'

type TodoFilterProps = {
  filter: FilterType
  activeCount: number
  totalCount: number
  onFilterChange: (filter: FilterType) => void
  onClearCompleted: () => void
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: '전체',
  active: '진행 중',
  completed: '완료',
}

export function TodoFilter({
  filter,
  activeCount,
  totalCount,
  onFilterChange,
  onClearCompleted,
}: TodoFilterProps) {
  const completedCount = totalCount - activeCount

  return (
    <div className="todo-footer">
      <span className="todo-count">{activeCount}개 남음</span>
      <div className="todo-filters">
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => onFilterChange(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>
      {completedCount > 0 && (
        <button className="clear-btn" onClick={onClearCompleted}>
          완료 항목 삭제
        </button>
      )}
    </div>
  )
}
