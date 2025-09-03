import os
from typing import List
from dotenv import load_dotenv
from google import genai
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel

from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


class TimeStamp(BaseModel):
    chapter_name : str
    time : float

class Transcript(BaseModel):
    ts : List[TimeStamp]




def get_transcripts(video_id : str) -> dict:
    ytapi = YouTubeTranscriptApi()
    transcript = ytapi.fetch(video_id= video_id)
    transcript = transcript.to_raw_data()
    return transcript

def create_timestamps(transcript : dict) -> Transcript:
    transcript = str(transcript)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(script_dir, 'prompt.txt')
    with open(prompt_path, 'r') as f:
        system_prompt = f.read()


    client = genai.Client(api_key= os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model =  'gemini-2.0-flash-lite',
        contents= f"""{system_prompt}
        \n Transcript {transcript}""",
        config={
        "response_mime_type": "application/json",
        "response_schema": Transcript,
        }
    )
    return response.parsed


# FastAPI __init__
app = FastAPI()

origins = [
    "http://localhost:3000",
    "chrome-extension://*",
    "moz-extension://*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],  # Allow all origins for development
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get("/timestamps/{video_id}", response_model = Transcript)
def main(video_id : str): 
    transcript = get_transcripts(video_id= video_id)
    timestamps = create_timestamps(transcript= transcript)
    return timestamps


if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0", port = 8000)











