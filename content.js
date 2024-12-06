// Default content and skip words
const defaultQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Stay hungry, stay foolish. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
];

const defaultSkipWords = ["hiring", "starting"];

// State management
let availableQuotes = [...defaultQuotes];
let todos = [];
let skipWords = [...defaultSkipWords];
let contentCounter = 0;
let enabled = true; // Track enabled state

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Storage management
function loadContent() {
  try {
    chrome.storage.sync.get(
      ["userQuotes", "todos", "skipWords", "enabled"],
      (result) => {
        if (chrome.runtime.lastError) {
          console.log("Error loading content:", chrome.runtime.lastError);
          return;
        }
        availableQuotes = result.userQuotes || defaultQuotes;
        todos = result.todos || [];
        skipWords = result.skipWords || defaultSkipWords;
        enabled = result.enabled === undefined ? true : result.enabled;

        // Initial content processing based on enabled state
        if (enabled) {
          processUnwantedContent();
        } else {
          restoreOriginalContent();
        }
      }
    );
  } catch (error) {
    console.log("Error in loadContent:", error);
    // Use default values if storage access fails
    availableQuotes = defaultQuotes;
    todos = [];
    skipWords = defaultSkipWords;
    enabled = true;
  }
}

loadContent();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  try {
    if (namespace === "sync") {
      if (changes.userQuotes)
        availableQuotes = changes.userQuotes.newValue || defaultQuotes;
      if (changes.todos) todos = changes.todos.newValue || [];
      if (changes.skipWords)
        skipWords = changes.skipWords.newValue || defaultSkipWords;
      if (changes.enabled !== undefined) {
        enabled = changes.enabled.newValue;
        if (enabled) {
          processUnwantedContent();
        } else {
          restoreOriginalContent();
        }
      }
    }
  } catch (error) {
    console.log("Error in storage change listener:", error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "toggleContent") {
      enabled = request.enabled;
      if (enabled) {
        processUnwantedContent();
      } else {
        restoreOriginalContent();
      }
      // Always send a response
      sendResponse({ success: true });
    }
  } catch (error) {
    console.log("Error in message listener:", error);
    sendResponse({ success: false, error: error.message });
  }
  // Return true to indicate we'll send a response asynchronously
  return true;
});

// UI Update Functions
function updateTodoContainer(container, todos) {
  const todoList = container.querySelector('div[data-todo-list="true"]');
  if (!todoList) return;

  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    const todoItem = document.createElement("div");
    todoItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: ${todo.completed ? "#f8f8f8" : "white"};
            border-radius: 4px;
            margin-bottom: 4px;
        `;

    todoItem.innerHTML = `
            <span style="min-width: 24px; font-weight: bold;">#${
              index + 1
            }</span>
            <input type="checkbox" ${todo.completed ? "checked" : ""} 
                   style="width: 20px !important; 
                          height: 20px !important; 
                          cursor: pointer !important;
                          margin: 0 !important;
                          opacity: 1 !important;
                          visibility: visible !important;
                          pointer-events: auto !important;
                          position: static !important;
                          appearance: auto !important;
                          -webkit-appearance: checkbox !important;
                          display: inline-block !important;">
            <span style="${
              todo.completed
                ? "text-decoration: line-through; color: #888;"
                : ""
            }">${todo.text}</span>
            <button class="delete-btn" style="
                margin-left: auto;
                background: #ff4444;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                opacity: 0.8;
                transition: opacity 0.2s;
            ">Delete</button>
        `;

    const checkbox = todoItem.querySelector("input");
    checkbox.addEventListener("change", () =>
      handleTodoClick(todo.id, checkbox)
    );

    const deleteBtn = todoItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => handleTodoDelete(todo.id));

    // Hover effect for delete button
    deleteBtn.addEventListener("mouseenter", () => {
      deleteBtn.style.opacity = "1";
    });
    deleteBtn.addEventListener("mouseleave", () => {
      deleteBtn.style.opacity = "0.8";
    });

    todoList.appendChild(todoItem);
  });
}

function updateAllTodoContainers() {
  document
    .querySelectorAll('[data-content-type="todo"]')
    .forEach((container) => {
      updateTodoContainer(container, todos);
    });
}

// Todo Management Functions
function handleNewTodo(text, inputContainer) {
  if (text.trim()) {
    const newTodo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = [newTodo, ...todos];

    // Save and update all todo containers
    try {
      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        if (chrome.runtime.lastError) {
          console.log("Error saving todo:", chrome.runtime.lastError);
          return;
        }
        todos = updatedTodos;
        updateAllTodoContainers();
      });
    } catch (error) {
      console.log("Error in handleNewTodo:", error);
    }

    inputContainer.style.display = "none";
    inputContainer.querySelector("input").value = "";
  }
}

function handleTodoClick(todoId, checkbox) {
  try {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === todoId) {
        return { ...todo, completed: checkbox.checked };
      }
      return todo;
    });

    // Save and update all todo containers
    chrome.storage.sync.set({ todos: updatedTodos }, () => {
      if (chrome.runtime.lastError) {
        console.log("Error updating todo:", chrome.runtime.lastError);
        return;
      }
      todos = updatedTodos;
      updateAllTodoContainers();
    });
  } catch (error) {
    console.log("Error in handleTodoClick:", error);
  }
}

function handleTodoDelete(todoId) {
  try {
    const updatedTodos = todos.filter((todo) => todo.id !== todoId);

    // Save and update all todo containers
    chrome.storage.sync.set({ todos: updatedTodos }, () => {
      if (chrome.runtime.lastError) {
        console.log("Error deleting todo:", chrome.runtime.lastError);
        return;
      }
      todos = updatedTodos;
      updateAllTodoContainers();
    });
  } catch (error) {
    console.log("Error in handleTodoDelete:", error);
  }
}

function createTodoInput() {
  const container = document.createElement("div");
  container.style.cssText = `
        display: none;
        padding: 8px;
        background: white;
        border-radius: 4px;
        margin: 8px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter new task...";
  input.style.cssText = `
        width: calc(100% - 16px);
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 8px;
    `;

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    `;

  const addButton = document.createElement("button");
  addButton.textContent = "Add";
  addButton.style.cssText = `
        background: #0a66c2;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
    `;

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.cssText = `
        background: #666;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
    `;

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(addButton);
  container.appendChild(input);
  container.appendChild(buttonContainer);

  addButton.addEventListener("click", () =>
    handleNewTodo(input.value, container)
  );
  cancelButton.addEventListener("click", () => {
    container.style.display = "none";
    input.value = "";
  });
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleNewTodo(input.value, container);
  });

  return container;
}

function getRandomQuote() {
  return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
}

// Content Management Functions
function shouldSkipContent(text) {
  const lowerText = text.toLowerCase();
  return skipWords.some((word) => lowerText.includes(word.toLowerCase()));
}

function shouldReplaceContent(text) {
  const unwantedWords = ["suggested", "funny", "commented"];
  const lowerText = text.toLowerCase();

  if (shouldSkipContent(text)) {
    return false;
  }

  return unwantedWords.some((word) => lowerText.includes(word));
}

// Store original content for restoration
const originalContent = new WeakMap();

function storeOriginalContent(element, replacement) {
  const clone = element.cloneNode(true);
  originalContent.set(replacement, clone);
}

function restoreOriginalContent() {
  document.querySelectorAll('[data-cleaned="true"]').forEach((element) => {
    const original = originalContent.get(element);
    if (original) {
      element.parentNode.replaceChild(original, element);
    }
  });
}

function createContentElement() {
  const element = document.createElement("div");
  element.style.cssText = `
        padding: 15px;
        margin: 8px 0;
        background-color: #f3f6f8;
        border-radius: 8px;
        color: #444;
        font-size: 14px;
        box-sizing: border-box;
        position: relative;
        min-height: 96px;
        max-height: 400px;
    `;

  const contentContainer = document.createElement("div");
  contentContainer.style.cssText = `
        padding-right: 8px;
    `;

  if (contentCounter === 0 && todos.length > 0) {
    // First content element is todo container
    element.setAttribute("data-content-type", "todo");
    element.style.backgroundColor = "#e8f3ff";

    // Add Task button only for todo containers
    const addButton = document.createElement("button");
    addButton.textContent = "+ Add Task";
    addButton.style.cssText = `
            position: absolute;
            top: 4px;
            right: 24px;
            background: #0a66c2;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            z-index: 1;
        `;

    const todoInput = createTodoInput();

    const todoList = document.createElement("div");
    todoList.setAttribute("data-todo-list", "true");
    todoList.style.cssText = `
            padding-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

    todos.forEach((todo, index) => {
      const todoItem = document.createElement("div");
      todoItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: ${todo.completed ? "#f8f8f8" : "white"};
                border-radius: 4px;
                margin-bottom: 4px;
            `;

      todoItem.innerHTML = `
                <span style="min-width: 24px; font-weight: bold;">#${
                  index + 1
                }</span>
                <input type="checkbox" ${todo.completed ? "checked" : ""} 
                       style="width: 20px !important; 
                              height: 20px !important; 
                              cursor: pointer !important;
                              margin: 0 !important;
                              opacity: 1 !important;
                              visibility: visible !important;
                              pointer-events: auto !important;
                              position: static !important;
                              appearance: auto !important;
                              -webkit-appearance: checkbox !important;
                              display: inline-block !important;">
                <span style="${
                  todo.completed
                    ? "text-decoration: line-through; color: #888;"
                    : ""
                }">${todo.text}</span>
                <button class="delete-btn" style="
                    margin-left: auto;
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                ">Delete</button>
            `;

      const checkbox = todoItem.querySelector("input");
      checkbox.addEventListener("change", () =>
        handleTodoClick(todo.id, checkbox)
      );

      const deleteBtn = todoItem.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => handleTodoDelete(todo.id));

      // Hover effect for delete button
      deleteBtn.addEventListener("mouseenter", () => {
        deleteBtn.style.opacity = "1";
      });
      deleteBtn.addEventListener("mouseleave", () => {
        deleteBtn.style.opacity = "0.8";
      });

      todoList.appendChild(todoItem);
    });

    contentContainer.appendChild(todoList);

    // Add button and input only for todo containers
    addButton.addEventListener("click", () => {
      todoInput.style.display =
        todoInput.style.display === "none" ? "block" : "none";
    });

    element.appendChild(addButton);
    element.appendChild(todoInput);
  } else {
    // Quote container for all other elements
    element.setAttribute("data-content-type", "quote");
    element.style.height = "96px";
    contentContainer.style.cssText += `
            display: flex;
            align-items: center;
            justify-content: center;
            font-style: italic;
            text-align: center;
            height: 100%;
        `;
    contentContainer.textContent = getRandomQuote();
  }

  element.appendChild(contentContainer);
  contentCounter++;
  return element;
}

function processUnwantedContent() {
  if (!enabled) return;

  try {
    const selectors = [
      ".feed-shared-update-v2",
      ".feed-follows-module",
      "[data-ad-banner]",
      ".ad-banner-container",
      ".news-module",
      ".feed-shared-update-v2__description-wrapper",
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (element.getAttribute("data-cleaned") === "true") return;

        const textContent = element.textContent || "";

        if (shouldReplaceContent(textContent)) {
          const contentElement = createContentElement();
          storeOriginalContent(element, contentElement);
          element.parentNode.insertBefore(contentElement, element);
          element.remove();
          contentElement.setAttribute("data-cleaned", "true");
        }
      });
    });
  } catch (error) {
    console.log("LinkedIn Content Replacer: Error processing content", error);
  }
}

function initializeContentProcessor() {
  try {
    // Reset content counter when initializing
    contentCounter = 0;
    
    // Load initial state and process content accordingly
    chrome.storage.sync.get(["enabled"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("Error loading enabled state:", chrome.runtime.lastError);
        return;
      }
      enabled = result.enabled === undefined ? true : result.enabled;
      if (enabled) {
        setTimeout(processUnwantedContent, 1000);
      }
    });

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
        setTimeout(processUnwantedContent, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(processUnwantedContent, 200);
      },
      { passive: true }
    );
  } catch (error) {
    console.log("LinkedIn Content Replacer: Error initializing", error);
  }
}

// Start the extension
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentProcessor);
} else {
  initializeContentProcessor();
}
