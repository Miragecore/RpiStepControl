import os
import logging
import uvicorn
import time
import asyncio
import pigpio

from enum import Enum
from fastapi import FastAPI, Request, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from fastapi import WebSocket

from fastapi.logger import logger

logger.setLevel(logging.INFO)

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
templates = Jinja2Templates(directory="static")

FRONT_END_PATH = "static/public"
#여기 설정되는 "/frontend"는 app.mount에 의해 설정되는 URL이다.
#templates.env.globals["FRONT_URL"] = "/frontend" 

class Item(BaseModel):
    controlType: Optional[str] = None
    gearA1: float
    gearB: float
    PR: float

send_data = { '0' : {
                    'name': '김군',
                    'status' : 0,
                    'IP': '192.168.0.1',
                    },
            }
'''
              '1':  {
                    'name': '이군',
                    'status' : 1,
                    'IP' : '192.168.0.2',
                    },
            }
'''

mpin = 21
pi = pigpio.pi()
pi.set_mode(21, pigpio.INPUT)

global outp
outp = 1

def TestIO():
    global outp
    if outp == 1:
        outp = 0
    else: 
        outp = 1

    yield outp

def getIO():
    yield pi.read(mpin)
    #pass


app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/public", StaticFiles(directory=os.path.join(BASE_DIR, FRONT_END_PATH)), name="public")

api_router = APIRouter()

item = Item(controlType="rotary", gearA1=11.1, gearB=12.2, PR=54.3)

@app.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@api_router.get("/post/{pk}")
def index(pk: int):
    return {"data": pk+1}

@api_router.get("/getCurrentConfig")
def getCurrentConfig():
    return item

#@api_router.put("/ppp/{pk}")
#def setCurrentConfig(pk: Item):
#    item = im


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        await asyncio.sleep(3)
        send_data['0']['status'] = next(getIO())
        #send_data['0']['status'] = next(TestIO())
        await websocket.send_json(send_data)

        #await websocket.send_text(str(count))
        #data = await websocket.receive_text()
        #await websocket.send_text(f"Message text was: {data}")

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
