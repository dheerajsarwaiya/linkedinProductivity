// Create a namespace for storage utilities
window.storageUtils = {
    // Default content
    defaultQuotes: [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Stay hungry, stay foolish. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
    ],

    defaultSkipWords: ['hiring', 'starting'],

    defaultTasks: [
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
    ],

    // Storage utilities
    saveToStorage: function(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                resolve();
            });
        });
    },

    getFromStorage: function(key, defaultValue = null) {
        return new Promise((resolve) => {
            chrome.storage.sync.get([key], (result) => {
                resolve(result[key] !== undefined ? result[key] : defaultValue);
            });
        });
    },

    // Generate unique ID utility
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
