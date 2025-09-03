import * as youtubei from './youtubei.js'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchTimeComments') {
        fetchTimeComments(request.videoId)
            .then(sendResponse)
            .catch(e => {
                console.error('Error fetching time comments:', e)
                sendResponse([])
            })
        return true
    }
    if (request.type === 'fetchAITimestamps') {
        fetchAITimestamps(request.videoId)
            .then(sendResponse)
            .catch(e => {
                console.error('Error fetching AI timestamps:', e)
                sendResponse([])
            })
        return true
    }
})

async function fetchTimeComments(videoId) {
    const comments = await fetchComments(videoId)
    const timeComments = []
    for (const comment of comments) {
        const tsContexts = getTimestampContexts(comment.text)
        if (isChaptersComment(tsContexts)) {
            continue
        }
        for (const tsContext of tsContexts) {
            timeComments.push({
                commentId: comment.commentId,
                authorAvatar: comment.authorAvatar,
                authorName: comment.authorName,
                timestamp: tsContext.timestamp,
                time: tsContext.time,
                text: tsContext.text
            })
        }
    }
    return timeComments
}

async function fetchAITimestamps(videoId) {
    console.log('fetchAITimestamps called with videoId:', videoId);
    try {
        const url = `http://localhost:8000/timestamps/${videoId}`;
        console.log('Making request to:', url);
        
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

function isChaptersComment(tsContexts) {
    return tsContexts.length >= 3 && tsContexts[0].time === 0
}

async function fetchComments(videoId) {
    return await youtubei.fetchComments(videoId)
}

function getTimestampContexts(text) {
    const result = []
    const positions = findTimestamps(text)
    for (const position of positions) {
        const timestamp = text.substring(position.from, position.to)
        const time = parseTimestamp(timestamp)
        if (time === null) {
            continue
        }
        result.push({
            text,
            time,
            timestamp
        })
    }
    return result
}

function findTimestamps(text) {
    const result = []
    const timestampPattern = /(\d?\d:)?(\d?\d:)\d\d/g
    let match
    while ((match = timestampPattern.exec(text))) {
        result.push({
            from: match.index,
            to: timestampPattern.lastIndex
        })
    }
    return result
}

function parseTimestamp(ts) {
    const parts = ts.split(':').reverse()
    const secs = parseInt(parts[0])
    if (secs > 59) {
        return null
    }
    const mins = parseInt(parts[1])
    if (mins > 59) {
        return null
    }
    const hours = parseInt(parts[2]) || 0
    return secs + (60 * mins) + (60 * 60 * hours)
}
