// Create a namespace for quotes management
window.quotesManager = {
    async initializeQuotes() {
        const textarea = document.getElementById('quotes');
        if (!textarea) return;
        
        // Load saved quotes
        const quotes = await storageUtils.getFromStorage('userQuotes', storageUtils.defaultQuotes);
        textarea.value = quotes.join('\n');
        
        // Save quotes
        document.getElementById('save-quotes')?.addEventListener('click', async () => {
            const quotes = textarea.value
                .split('\n')
                .map(quote => quote.trim())
                .filter(quote => quote.length > 0);
                
            await storageUtils.saveToStorage('userQuotes', quotes);
            
            const button = document.getElementById('save-quotes');
            if (button) {
                button.textContent = 'Saved!';
                setTimeout(() => {
                    button.textContent = 'Save Quotes';
                }, 1500);
            }
        });
    },

    // Utility function to get current quotes
    async getCurrentQuotes() {
        return await storageUtils.getFromStorage('userQuotes', storageUtils.defaultQuotes);
    },

    // Utility function to add a new quote
    async addQuote(quote) {
        const quotes = await this.getCurrentQuotes();
        quotes.push(quote);
        await storageUtils.saveToStorage('userQuotes', quotes);
        return quotes;
    },

    // Utility function to remove a quote
    async removeQuote(quoteToRemove) {
        const quotes = await this.getCurrentQuotes();
        const updatedQuotes = quotes.filter(quote => quote !== quoteToRemove);
        await storageUtils.saveToStorage('userQuotes', updatedQuotes);
        return updatedQuotes;
    },

    // Utility function to update quotes textarea
    updateQuotesTextarea(quotes) {
        const textarea = document.getElementById('quotes');
        if (textarea) {
            textarea.value = quotes.join('\n');
        }
    }
};
