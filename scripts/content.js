main()

onLocationHrefChange(() => {
    removeBar()
    main()
})

function main() {
    const videoId = getVideoId()
    if (!videoId) {
        return
    }
    fetchTimeComments(videoId)
        .then(timeComments => {
            if (videoId !== getVideoId()) {
                return
            }
            addTimeComments(timeComments)
        })
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