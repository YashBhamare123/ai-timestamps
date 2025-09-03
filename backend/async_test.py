from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pydantic import BaseModel

class String(BaseModel):
    greet : str


app = FastAPI()

origins = [
    "http://localhost:3000",
    "chrome-extension://*",
    "moz-extension://*",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],  # Allow all origins for development
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

async def greet():
    print('HI')
    await asyncio.sleep(5)
    return String(greet = 'hi')

@app.get("/greet", response_model = String)
async def main():
    response = await greet()
    return response

if __name__ == "__main__":
    uvicorn.run(app, host = "0.0.0.0", port = 8000)