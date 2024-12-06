// Create a namespace for todos management
window.todosManager = {
    todos: [],

    async initializeTodos() {
        await this.loadTodos();
        this.setupTodoListeners();
    },

    async loadTodos() {
        this.todos = await storageUtils.getFromStorage('todos', storageUtils.defaultTasks);
        this.renderTodos();
    },

    async saveTodos() {
        await storageUtils.saveToStorage('todos', this.todos);
        this.renderTodos();
    },

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;

        todoList.innerHTML = '';
        
        this.todos.forEach((todo, index) => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.style.display = 'flex';
            todoItem.style.alignItems = 'center';
            todoItem.style.padding = '8px';
            todoItem.style.borderBottom = '1px solid #eee';
            
            todoItem.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%; gap: 10px;">
                    <span style="min-width: 30px; font-weight: bold;">#${index + 1}</span>
                    <input 
                        type="checkbox" 
                        ${todo.completed ? 'checked' : ''} 
                        style="margin: 0; cursor: pointer; width: 18px; height: 18px;"
                    >
                    <span style="flex-grow: 1; ${todo.completed ? 'text-decoration: line-through; color: #888;' : ''}">${todo.text}</span>
                    <button 
                        class="delete-btn" 
                        style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                    >Delete</button>
                </div>
            `;
            
            // Toggle completion
            const checkbox = todoItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async (e) => {
                todo.completed = e.target.checked;
                await this.saveTodos();
            });
            
            // Delete todo
            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                await this.deleteTodo(todo.id);
            });
            
            todoList.appendChild(todoItem);
        });
    },

    setupTodoListeners() {
        // Add new todo
        const newTodoInput = document.getElementById('new-todo');
        if (!newTodoInput) return;

        document.getElementById('add-todo')?.addEventListener('click', () => {
            this.addNewTodo(newTodoInput.value);
        });
        
        // Add todo on Enter
        newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewTodo(newTodoInput.value);
            }
        });
    },

    async addNewTodo(text) {
        if (!text.trim()) return;

        const newTodo = {
            id: storageUtils.generateId(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos = [newTodo, ...this.todos];
        await this.saveTodos();
        
        const input = document.getElementById('new-todo');
        if (input) {
            input.value = '';
        }
    },

    async handleTodoClick(todoId, checkbox) {
        this.todos = this.todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, completed: checkbox.checked };
            }
            return todo;
        });

        await this.saveTodos();
    },

    // Utility functions for external use
    async getCurrentTodos() {
        return await storageUtils.getFromStorage('todos', storageUtils.defaultTasks);
    },

    async addTodo(text) {
        if (!text.trim()) return null;

        const newTodo = {
            id: storageUtils.generateId(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos = [newTodo, ...this.todos];
        await this.saveTodos();
        return newTodo;
    },

    async toggleTodo(todoId) {
        this.todos = this.todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });

        await this.saveTodos();
        return this.todos.find(todo => todo.id === todoId);
    },

    async deleteTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
        await this.saveTodos();
    },

    async updateTodo(todoId, updates) {
        this.todos = this.todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, ...updates };
            }
            return todo;
        });

        await this.saveTodos();
        return this.todos.find(todo => todo.id === todoId);
    }
};
