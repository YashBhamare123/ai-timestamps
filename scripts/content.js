// Don't auto-generate timestamps on page load
let currentTimestamps = null;

onLocationHrefChange(() => {
    removeBar()
    currentTimestamps = null;
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.type === 'generateTimestamps') {
        console.log('Processing generateTimestamps request');
        generateTimestamps()
            .then(result => {
                console.log('generateTimestamps completed with result:', result);
                sendResponse(result);
            })
            .catch(error => {
                console.error('generateTimestamps failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.type === 'clearTimestamps') {
        console.log('Processing clearTimestamps request');
        clearTimestamps();
        sendResponse({ success: true });
    }
    
    if (request.type === 'checkTimestamps') {
        console.log('Processing checkTimestamps request');
        sendResponse({ hasTimestamps: currentTimestamps !== null });
    }
});

// Add a simple test to verify content script is loaded
console.log('AI YouTube Timestamps content script loaded');

async function generateTimestamps() {
    console.log('generateTimestamps called');
    const videoId = getVideoId();
    console.log('Video ID:', videoId);
    
    if (!videoId) {
        throw new Error('No video ID found. Please make sure you\'re on a YouTube video page.');
    }
    
    try {
        console.log('Fetching AI timestamps for video:', videoId);
        const aiTimestamps = await fetchAITimestamps(videoId);
        console.log('Received AI timestamps:', aiTimestamps);
        
        if (aiTimestamps && aiTimestamps.length > 0) {
            currentTimestamps = aiTimestamps;
            addTimeComments(aiTimestamps);
            return { success: true, count: aiTimestamps.length };
        } else {
            throw new Error('No timestamps generated. The video might not have a transcript available.');
        }
    } catch (error) {
        console.error('Error generating timestamps:', error);
        throw error;
    }
}

function clearTimestamps() {
    removeBar();
    currentTimestamps = null;
}

function getVideoId() {
    if (window.location.pathname === '/watch') {
        return parseParams(window.location.href)['v']
    } else if (window.location.pathname.startsWith('/embed/')) {
        return window.location.pathname.substring('/embed/'.length)
    } else {
        return null
    }
}

function getVideo() {
    return document.querySelector('#movie_player video')
}

function fetchTimeComments(videoId) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({type: 'fetchTimeComments', videoId}, resolve)
    })
}

async function fetchAITimestamps(videoId) {
    console.log('fetchAITimestamps called with videoId:', videoId);
    try {
        const url = `http://localhost:8000/timestamps/${videoId}`;
        console.log('Making direct request to:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Convert backend format to frontend format
        const aiTimestamps = data.ts.map(timestamp => ({
            commentId: 'ai-generated',
            authorAvatar: null,
            authorName: 'AI Generated',
            timestamp: formatTime(timestamp.time),
            time: timestamp.time,
            text: timestamp.chapter_name
        }));
        
        console.log('Converted timestamps:', aiTimestamps);
        return aiTimestamps;
    } catch (error) {
        console.error('Failed to fetch AI timestamps:', error);
        return [];
    }
}

function addTimeComments(timeComments) {
    const bar = getOrCreateBar()
    const videoDuration = getVideo().duration
    
    for (let i = 0; i < timeComments.length; i++) {
        const tc = timeComments[i]
        if (tc.time > videoDuration) {
            continue
        }
        const nextTc = timeComments[i+1]
        const nextTime = nextTc ? nextTc.time : videoDuration
        
        // Create chapter segment
        const chapter = document.createElement('div')
        chapter.classList.add('__youtube-timestamps__chapter')
        const offset = tc.time / videoDuration * 100
        chapter.style.left = `${offset}%`
        const width = (nextTime - tc.time) / videoDuration * 100
        chapter.style.width = `${width}%`
        chapter.setAttribute('data-chapter-title', tc.text)
        
        bar.appendChild(chapter)
        
        // Add hover events for chapter tooltip
        chapter.addEventListener('mouseenter', (e) => {
            showChapterTooltip(tc.text, e)
        })
        chapter.addEventListener('mouseleave', () => {
            hideChapterTooltip()
        })
        chapter.addEventListener('mousemove', (e) => {
            updateTooltipPosition(e)
        })
    }
}

function getOrCreateBar() {
    let bar = document.querySelector('.__youtube-timestamps__bar')
    if (!bar) {
        let container = document.querySelector('#movie_player .ytp-timed-markers-container')
        if (!container) {
            container = document.querySelector('#movie_player .ytp-progress-list')
        }
        bar = document.createElement('div')
        bar.classList.add('__youtube-timestamps__bar')
        container.appendChild(bar)
    }
    return bar
}

function removeBar() {
    const bar = document.querySelector('.__youtube-timestamps__bar')
    if (bar) {
        bar.remove()
    }
    const tooltip = document.querySelector('.__youtube-timestamps__tooltip')
    if (tooltip) {
        tooltip.remove()
    }
}

function getOrCreateChapterTooltip() {
    let tooltip = document.querySelector('.__youtube-timestamps__tooltip')
    if (!tooltip) {
        tooltip = document.createElement('div')
        tooltip.classList.add('__youtube-timestamps__tooltip')
        document.body.appendChild(tooltip)
    }
    return tooltip
}

function showChapterTooltip(text, event) {
    const tooltip = getOrCreateChapterTooltip()
    tooltip.textContent = text
    tooltip.style.display = 'block'
    updateTooltipPosition(event)
}

function hideChapterTooltip() {
    const tooltip = document.querySelector('.__youtube-timestamps__tooltip')
    if (tooltip) {
        tooltip.style.display = 'none'
    }
}

function updateTooltipPosition(event) {
    const tooltip = document.querySelector('.__youtube-timestamps__tooltip')
    if (tooltip && tooltip.style.display === 'block') {
        const rect = tooltip.getBoundingClientRect()
        let left = event.clientX - rect.width / 2
        let top = event.clientY - rect.height - 10
        
        // Keep tooltip within viewport
        if (left < 0) left = 0
        if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width
        if (top < 0) top = event.clientY + 10
        
        tooltip.style.left = `${left}px`
        tooltip.style.top = `${top}px`
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
}

function parseParams(href) {
    const noHash = href.split('#')[0]
    const paramString = noHash.split('?')[1]
    const params = {}
    if (paramString) {
        const paramsArray = paramString.split('&')
        for (const kv of paramsArray) {
            const tmparr = kv.split('=')
            params[tmparr[0]] = tmparr[1]
        }
    }
    return params
}

function onLocationHrefChange(callback) {
    let currentHref = document.location.href
    const observer = new MutationObserver(() => {
        if (currentHref !== document.location.href) {
            currentHref = document.location.href
            callback()
        }
    })
    observer.observe(document.querySelector("body"), {childList: true, subtree: true})
}