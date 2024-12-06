// Create a namespace for tab management
window.tabManager = {
    initializeTabSwitching: function() {
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
    },

    // Utility function to switch to a specific tab programmatically
    switchToTab: function(tabName) {
        const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (tab) {
            tab.click();
        }
    },

    // Utility function to get the current active tab
    getActiveTab: function() {
        const activeTab = document.querySelector('.tab.active');
        return activeTab ? activeTab.dataset.tab : null;
    }
};
