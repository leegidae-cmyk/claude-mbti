import { useTodoList } from './hooks/useTodoList'
import { TodoInput } from './components/TodoInput'
import { TodoItem } from './components/TodoItem'
import { TodoFilter } from './components/TodoFilter'
import './App.css'

export default function App() {
  const {
    todos,
    filter,
    activeCount,
    totalCount,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    setFilter,
  } = useTodoList()

  return (
    <div className="app">
      <div className="todo-container">
        <h1 className="todo-title">투두리스트</h1>
        <TodoInput onAdd={addTodo} />
        {totalCount > 0 ? (
          <>
            <ul className="todo-list">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
            <TodoFilter
              filter={filter}
              activeCount={activeCount}
              totalCount={totalCount}
              onFilterChange={setFilter}
              onClearCompleted={clearCompleted}
            />
          </>
        ) : (
          <p className="todo-empty">할 일을 추가해보세요!</p>
        )}
      </div>
    </div>
  )
}
