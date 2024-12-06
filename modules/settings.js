// Create a namespace for settings management
window.settingsManager = {
    initializeToggle: async function() {
        const toggle = document.getElementById('contentToggle');
        if (!toggle) return;
        
        // Load saved state
        const enabled = await storageUtils.getFromStorage('enabled', true);
        toggle.checked = enabled;
        
        // Handle toggle changes
        toggle.addEventListener('change', async () => {
            const enabled = toggle.checked;
            await storageUtils.saveToStorage('enabled', enabled);
            
            // Notify content script only if we're on a LinkedIn tab
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('linkedin.com')) {
                try {
                    await chrome.tabs.sendMessage(currentTab.id, {
                        action: 'toggleContent',
                        enabled: enabled
                    });
                } catch (error) {
                    console.log('Error sending message to content script:', error);
                    // Handle error silently as user might not be on LinkedIn
                }
            }
        });
    },

    // Utility function to get current toggle state
    getToggleState: async function() {
        return await storageUtils.getFromStorage('enabled', true);
    },

    // Utility function to set toggle state programmatically
    setToggleState: async function(enabled) {
        const toggle = document.getElementById('contentToggle');
        if (toggle) {
            toggle.checked = enabled;
            toggle.dispatchEvent(new Event('change'));
        }
    }
};
