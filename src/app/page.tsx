'use client';

import { useState, useEffect, type KeyboardEvent } from 'react';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Загрузка todos при старте
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const res = await fetch('/api/todos');
    const data = await res.json();
    setTodos(data);
  }

  async function addTodo(e: KeyboardEvent) {
    if (e.key === 'Enter' && newTodo.trim()) {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo.trim() }),
      });
      const createdTodo = await res.json();
      setTodos([...todos, createdTodo]);
      setNewTodo('');
    }
  }

  async function toggleTodo(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done }),
    });
    const updatedTodo = await res.json();
    setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
  }

  async function deleteTodo(id: number) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter((t) => t.id !== id));
  }

  async function clearCompleted() {
    await fetch('/api/todos/clear-completed', { method: 'DELETE' });
    setTodos(todos.filter((t) => !t.done));
  }

  async function saveEdit(id: number) {
    const trimmed = editText.trim();
    if (!trimmed) {
      deleteTodo(id);
    } else {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      const updatedTodo = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    }
    setEditingId(null);
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEditKeyDown(e: KeyboardEvent) {
    if (editingId === null) return;
    if (e.key === 'Enter') saveEdit(editingId);
    if (e.key === 'Escape') cancelEdit();
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.length - activeCount;

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={addTodo}
          autoFocus
        />
      </header>
      {todos.length > 0 && (
        <main className="main">
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`${todo.done ? 'completed' : ''} ${editingId === todo.id ? 'editing' : ''}`}
              >
                <div className="view">
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <label onDoubleClick={() => startEdit(todo)}>{todo.title}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
                </div>
                <input
                  className="edit"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => editingId && saveEdit(editingId)}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                />
              </li>
            ))}
          </ul>
        </main>
      )}
      {todos.length > 0 && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{activeCount}</strong> {activeCount === 1 ? 'item' : 'items'} left
          </span>
          <ul className="filters">
            <li>
              <a
                href="#"
                className={filter === 'all' ? 'selected' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setFilter('all');
                }}
              >
                All
              </a>
            </li>
            <li>
              <a
                href="#"
                className={filter === 'active' ? 'selected' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setFilter('active');
                }}
              >
                Active
              </a>
            </li>
            <li>
              <a
                href="#"
                className={filter === 'completed' ? 'selected' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setFilter('completed');
                }}
              >
                Completed
              </a>
            </li>
          </ul>
          {completedCount > 0 && (
            <button className="clear-completed" onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
