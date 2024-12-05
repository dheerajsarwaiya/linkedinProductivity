// Default content
const defaultQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Stay hungry, stay foolish. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
];

const defaultSkipWords = ['hiring', 'starting'];

// Default tasks to help users get started
const defaultTasks = [
    {
        id: 'default-1',
        text: 'Remove distracting content on LinkedIn',
        completed: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'default-2',
        text: 'Customize your LinkedIn experience',
        completed: false,
        createdAt: new Date().toISOString()
    }
];

// Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
});

// Quotes Management
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('quotes');
    
    // Load saved quotes
    chrome.storage.sync.get(['userQuotes'], (result) => {
        const quotes = result.userQuotes || defaultQuotes;
        textarea.value = quotes.join('\n');
    });
    
    // Save quotes
    document.getElementById('save-quotes').addEventListener('click', () => {
        const quotes = textarea.value
            .split('\n')
            .map(quote => quote.trim())
            .filter(quote => quote.length > 0);
            
        chrome.storage.sync.set({ userQuotes: quotes }, () => {
            const button = document.getElementById('save-quotes');
            button.textContent = 'Saved!';
            setTimeout(() => {
                button.textContent = 'Save Quotes';
            }, 1500);
        });
    });
});

// Todo Management
let todos = [];

// Generate unique ID for todos
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Load todos
function loadTodos() {
    chrome.storage.sync.get(['todos'], (result) => {
        // If no todos exist yet, use default tasks
        todos = result.todos || defaultTasks;
        renderTodos();
    });
}

// Save todos
function saveTodos() {
    chrome.storage.sync.set({ todos }, () => {
        renderTodos();
    });
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoItem.innerHTML = `
            <div style="display: flex; align-items: center; width: 100%;">
                <span style="min-width: 30px; font-weight: bold;">#${index + 1}</span>
                <input type="checkbox" ${todo.completed ? 'checked' : ''} style="margin-right: 8px;">
                <span style="${todo.completed ? 'text-decoration: line-through; color: #888;' : ''}">${todo.text}</span>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Toggle completion
        todoItem.querySelector('input').addEventListener('change', (e) => {
            todos[index].completed = e.target.checked;
            saveTodos();
        });
        
        // Delete todo
        todoItem.querySelector('.delete-btn').addEventListener('click', () => {
            todos.splice(index, 1);
            saveTodos();
        });
        
        todoList.appendChild(todoItem);
    });
}

// Skip Words Management
let skipWords = [];

// Load skip words
function loadSkipWords() {
    chrome.storage.sync.get(['skipWords'], (result) => {
        skipWords = result.skipWords || defaultSkipWords;
        renderSkipWords();
    });
}

// Save skip words
function saveSkipWords() {
    chrome.storage.sync.set({ skipWords }, () => {
        renderSkipWords();
    });
}

// Render skip words
function renderSkipWords() {
    const skipWordsList = document.getElementById('skip-words-list');
    skipWordsList.innerHTML = '';
    
    skipWords.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'skip-word';
        
        wordItem.innerHTML = `
            <span>${word}</span>
            ${!defaultSkipWords.includes(word) ? '<button class="delete-btn">Delete</button>' : ''}
        `;
        
        // Delete skip word (only for non-default words)
        const deleteBtn = wordItem.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                skipWords = skipWords.filter(w => w !== word);
                saveSkipWords();
            });
        }
        
        skipWordsList.appendChild(wordItem);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    loadSkipWords();
    
    // Add new todo
    const newTodoInput = document.getElementById('new-todo');
    document.getElementById('add-todo').addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (text) {
            todos.push({
                id: generateId(),
                text,
                completed: false,
                createdAt: new Date().toISOString()
            });
            saveTodos();
            newTodoInput.value = '';
        }
    });
    
    // Add todo on Enter
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-todo').click();
        }
    });

    // Add new skip word
    const newSkipWordInput = document.getElementById('new-skip-word');
    document.getElementById('add-skip-word').addEventListener('click', () => {
        const word = newSkipWordInput.value.trim().toLowerCase();
        if (word && !skipWords.includes(word)) {
            skipWords.push(word);
            saveSkipWords();
            newSkipWordInput.value = '';
        }
    });
    
    // Add skip word on Enter
    newSkipWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('add-skip-word').click();
        }
    });
});
