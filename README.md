# 🎬 AI YouTube Timestamps

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-009688.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)

*Transform your YouTube viewing experience with AI-powered chapter generation*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

AI YouTube Timestamps is a powerful browser extension that automatically generates intelligent chapter markers for YouTube videos using advanced AI technology. Say goodbye to manually scrubbing through long videos - let AI create meaningful timestamps that help you navigate content efficiently.

### ✨ What Makes It Special?

- 🤖 **AI-Powered**: Uses Google's Gemini AI to analyze video transcripts
- 🎯 **Smart Chapters**: Generates 5-10 meaningful chapters with perfect spacing
- 🚀 **One-Click Generation**: Simple popup interface for instant results
- 🎨 **Beautiful UI**: Elegant progress bar overlay with hover tooltips
- ⚡ **Fast & Reliable**: Optimized for performance and accuracy

---

## 🚀 Features

### Core Functionality
- **🎥 Intelligent Chapter Detection**: AI analyzes video transcripts to identify natural topic transitions
- **📍 Precise Timestamps**: Uses exact transcript timings for perfect accuracy
- **🎨 Visual Progress Bar**: Beautiful chapter segments overlaid on YouTube's progress bar
- **💡 Smart Tooltips**: Hover over chapters to see descriptive titles
- **🔄 Dynamic Updates**: Chapters adapt to video length and content complexity

### User Experience
- **🖱️ Click-to-Generate**: No automatic processing - you control when to generate
- **🎛️ Easy Controls**: Simple popup with generate and clear options
- **📱 Responsive Design**: Works seamlessly across different screen sizes
- **🔍 Debug-Friendly**: Comprehensive logging for troubleshooting

---

## 📁 Project Structure

```
ai-youtube-timestamps/
├── 📁 backend/                 # FastAPI backend server
│   ├── generate_timestamps.py  # Main API server
│   ├── timestamps.py          # Core timestamp logic
│   └── prompt.txt             # AI prompt template
├── 📁 background/             # Extension background scripts
│   ├── background.js          # Service worker
│   ├── background.html        # Background page
│   └── youtubei.js           # YouTube API integration
├── 📁 scripts/               # Content scripts
│   ├── content.js            # Main content script
│   └── content.css           # Styling for timestamps
├── 📁 popup/                 # Extension popup
│   ├── popup.html            # Popup interface
│   └── popup.js              # Popup logic
├── 📁 icons/                 # Extension icons
├── manifest.json             # Extension manifest
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

---

## 🛠️ Installation

### Prerequisites

- **Python 3.8+** with pip
- **Google Chrome** or **Chromium-based browser**
- **Gemini API Key** ([Get one here](https://ai.google.dev/))

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-youtube-timestamps.git
   cd ai-youtube-timestamps
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in the backend directory
   echo "GEMINI_API_KEY=your_api_key_here" > backend/.env
   ```

4. **Start the backend server**
   ```bash
   cd backend
   python generate_timestamps.py
   ```
   
   ✅ Server should start at `http://localhost:8000`

### Browser Extension Setup

1. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load the extension**
   - Click "Load unpacked"
   - Select the project root directory
   - Extension should appear in your toolbar

3. **Verify installation**
   - Navigate to any YouTube video
   - Click the extension icon
   - You should see the popup interface

---

## 🎯 Usage

### Quick Start

1. **🎬 Open a YouTube video** with available captions/transcript
2. **🔌 Click the extension icon** in your browser toolbar
3. **⚡ Click "Generate Timestamps"** in the popup
4. **🎉 Watch the magic happen!** Chapters appear on the progress bar

### Advanced Usage

#### Supported Video Types
- ✅ Videos with auto-generated captions
- ✅ Videos with manual captions
- ✅ Videos in multiple languages
- ❌ Videos without any transcript data

#### Chapter Generation Logic
- **Short videos (< 10 min)**: 3-5 chapters, 2+ minutes apart
- **Medium videos (10-30 min)**: 5-7 chapters, 3+ minutes apart  
- **Long videos (30+ min)**: 7-10 chapters, 5+ minutes apart

#### Customization Options
```javascript
// Modify these in scripts/content.js for custom behavior
const CHAPTER_SETTINGS = {
    minChapters: 3,
    maxChapters: 10,
    minSpacing: 120, // seconds
    hoverDelay: 500  // milliseconds
};
```

---

## 🔧 API Documentation

### Backend Endpoints

#### Generate Timestamps
```http
GET /timestamps/{video_id}
```

**Parameters:**
- `video_id` (string): YouTube video ID

**Response:**
```json
{
  "ts": [
    {
      "chapter_name": "Introduction and Overview",
      "time": 0.0
    },
    {
      "chapter_name": "Main Content Discussion", 
      "time": 180.5
    }
  ]
}
```

**Error Responses:**
```json
{
  "detail": "Video transcript not available"
}
```

### Frontend API

#### Message Types
```javascript
// Content Script Messages
chrome.runtime.sendMessage({
  type: 'generateTimestamps'
});

chrome.runtime.sendMessage({
  type: 'clearTimestamps'
});

chrome.runtime.sendMessage({
  type: 'checkTimestamps'
});
```

---

## 🎨 Customization

### Styling the Progress Bar

Modify `scripts/content.css` to customize the appearance:

```css
.__youtube-timestamps__chapter {
    background: linear-gradient(90deg, #your-color-1, #your-color-2);
    height: 6px; /* Adjust thickness */
    border-radius: 3px; /* Adjust roundness */
}

.__youtube-timestamps__tooltip {
    background-color: rgba(28, 28, 28, 0.95);
    font-size: 14px; /* Adjust text size */
    max-width: 400px; /* Adjust width */
}
```

### AI Prompt Customization

Edit `backend/prompt.txt` to modify how the AI generates chapters:

```text
You are an AI that generates meaningful chapters for YouTube videos.

Custom instructions:
- Focus on technical content
- Use specific terminology
- Generate more granular chapters
- Prioritize code examples and demos
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "No requests to backend"
**Symptoms:** Extension popup works but no API calls are made

**Solutions:**
1. Check if backend is running: `curl http://localhost:8000/timestamps/dQw4w9WgXcQ`
2. Open browser console and look for CORS errors
3. Verify extension permissions in `chrome://extensions/`
4. Check content script loading in DevTools

#### ❌ "Video transcript not available"
**Symptoms:** API returns error about missing transcript

**Solutions:**
1. Verify the video has captions (CC button on YouTube)
2. Try a different video with known captions
3. Check if video is age-restricted or private

#### ❌ "Extension not loading"
**Symptoms:** Extension icon doesn't appear or is grayed out

**Solutions:**
1. Reload the extension in `chrome://extensions/`
2. Check manifest.json for syntax errors
3. Verify all file paths in manifest are correct
4. Enable Developer mode

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing
- **YouTube Transcript API** for reliable transcript access
- **FastAPI** for the robust backend framework
- **Chrome Extensions API** for seamless browser integration

---

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/ai-youtube-timestamps/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/ai-youtube-timestamps/discussions)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by Yash Bhamare

[🔝 Back to top](#-ai-youtube-timestamps)

</div>