from google import genai
from youtube_transcript_api import YouTubeTranscriptApi
from typing import List
from pydantic import BaseModel
import pprint
import json
from dotenv import load_dotenv
import os
import fastapi

load_dotenv()

video_id = "AVO1vDk8a9A"
ytt_api = YouTubeTranscriptApi()
transcript = ytt_api.fetch(video_id)
transcript = transcript.to_raw_data()
pprint.pp(transcript)

# Configure Gemini API - replace with your actual API key
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))


class Output(BaseModel):
    time : float
    chapter_name : str


class Fin(BaseModel):
    output : List[Output]


messages = [
    {
        'role' : 'system',
        'content' : 'You are an ai bot that generates meaninful chapters for a youtube video when provided with its transcript. Use the exact time given in the transcript to generate the time and the chapter name'
    },
    {
        'role' : 'user',
        'content' : str(transcript)
    }

]
with open("./prompt.txt", 'r') as f:
        system_prompt = f.read()

chat = client.models.generate_content(
    model = 'gemini-2.0-flash-lite',
    contents = f"""{system_prompt}
\n Transcript {str(transcript)}"""

,
    config={
        "response_mime_type": "application/json",
        "response_schema": Fin,
    }
)

print(type(chat.parsed))
