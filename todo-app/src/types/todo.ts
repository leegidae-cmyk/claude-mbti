export type FilterType = 'all' | 'active' | 'completed'

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}
