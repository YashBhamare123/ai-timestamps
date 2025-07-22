document.addEventListener('DOMContentLoaded', async () => {
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const btnText = document.getElementById('btn-text');

    // Check if we're on a YouTube page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('youtube.com/watch')) {
        updateStatus('Please navigate to a YouTube video page', 'error');
        generateBtn.disabled = true;
        return;
    }

    // Check if timestamps are already generated
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'checkTimestamps' });
    if (result && result.hasTimestamps) {
        updateStatus('Timestamps already generated', 'success');
        btnText.textContent = 'Regenerate Timestamps';
    }

    generateBtn.addEventListener('click', async () => {
        try {
            console.log('Generate button clicked');
            generateBtn.disabled = true;
            updateStatus('Generating AI timestamps...', 'loading');
            btnText.innerHTML = '<span class="loading-spinner"></span>Generating...';

            console.log('Sending message to content script, tab ID:', tab.id);
            // Send message to content script to generate timestamps
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'generateTimestamps' });
            console.log('Response from content script:', response);
            
            if (response && response.success) {
                updateStatus(`Generated ${response.count} timestamps successfully!`, 'success');
                btnText.textContent = 'Regenerate Timestamps';
            } else {
                throw new Error(response?.error || 'Failed to generate timestamps');
            }
        } catch (error) {
            console.error('Error generating timestamps:', error);
            updateStatus(`Error: ${error.message}`, 'error');
            btnText.textContent = 'Generate Timestamps';
        } finally {
            generateBtn.disabled = false;
        }
    });

    clearBtn.addEventListener('click', async () => {
        try {
            await chrome.tabs.sendMessage(tab.id, { type: 'clearTimestamps' });
            updateStatus('Timestamps cleared', 'success');
            btnText.textContent = 'Generate Timestamps';
        } catch (error) {
            console.error('Error clearing timestamps:', error);
            updateStatus('Error clearing timestamps', 'error');
        }
    });

    function updateStatus(message, type) {
        statusText.textContent = message;
        statusDiv.className = `status ${type}`;
    }
});