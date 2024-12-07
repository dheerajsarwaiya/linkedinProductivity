// Create a namespace for skip words management
window.skipWordsManager = {
    skipWords: [],

    async initializeSkipWords() {
        await this.loadSkipWords();
        this.setupSkipWordListeners();
    },

    async loadSkipWords() {
        this.skipWords = await storageUtils.getFromStorage('skipWords', storageUtils.defaultSkipWords);
        this.renderSkipWords();
    },

    async saveSkipWords() {
        await storageUtils.saveToStorage('skipWords', this.skipWords);
        this.renderSkipWords();
    },

    renderSkipWords() {
        const skipWordsList = document.getElementById('skip-words-list');
        if (!skipWordsList) return;

        skipWordsList.innerHTML = '';
        
        this.skipWords.forEach((word) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'skip-word';
            
            wordItem.innerHTML = `
                <span>${word}</span>
                <button class="delete-btn">×</button>
            `;
            
            // Delete skip word
            const deleteBtn = wordItem.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.skipWords = this.skipWords.filter(w => w !== word);
                    this.saveSkipWords();
                });
            }
            
            skipWordsList.appendChild(wordItem);
        });
    },

    setupSkipWordListeners() {
        const newSkipWordInput = document.getElementById('new-skip-word');
        if (!newSkipWordInput) return;

        // Add new skip word
        document.getElementById('add-skip-word')?.addEventListener('click', () => {
            this.addNewSkipWord(newSkipWordInput.value);
        });
        
        // Add skip word on Enter
        newSkipWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewSkipWord(newSkipWordInput.value);
            }
        });
    },

    async addNewSkipWord(word) {
        const trimmedWord = word.trim().toLowerCase();
        if (trimmedWord && !this.skipWords.includes(trimmedWord)) {
            this.skipWords.push(trimmedWord);
            await this.saveSkipWords();
            
            const input = document.getElementById('new-skip-word');
            if (input) {
                input.value = '';
            }
        }
    },

    // Utility functions for external use
    async getCurrentSkipWords() {
        return await storageUtils.getFromStorage('skipWords', storageUtils.defaultSkipWords);
    },

    async addSkipWord(word) {
        const trimmedWord = word.trim().toLowerCase();
        if (!trimmedWord || this.skipWords.includes(trimmedWord)) {
            return false;
        }

        this.skipWords.push(trimmedWord);
        await this.saveSkipWords();
        return true;
    },

    async removeSkipWord(word) {
        const initialLength = this.skipWords.length;
        this.skipWords = this.skipWords.filter(w => w !== word);
        
        if (this.skipWords.length !== initialLength) {
            await this.saveSkipWords();
            return true;
        }
        return false;
    },

    async isSkipWord(word) {
        const currentSkipWords = await this.getCurrentSkipWords();
        return currentSkipWords.includes(word.toLowerCase());
    }
};
