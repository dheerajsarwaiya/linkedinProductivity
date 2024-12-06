// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize tab switching
    tabManager.initializeTabSwitching();

    // Initialize settings and toggle
    await settingsManager.initializeToggle();

    // Initialize quotes management
    await quotesManager.initializeQuotes();

    // Initialize todos management
    await todosManager.initializeTodos();

    // Initialize skip words management
    await skipWordsManager.initializeSkipWords();
});
