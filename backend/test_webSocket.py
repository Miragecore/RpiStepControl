import uvicorn
import json

from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket


app = FastAPI()


send_data = { '0' : {
                    'name': '김군',
                    'status' : 0,
                    'IP': '192.168.0.1',
                    },
              '1':  {
                    'name': '이군',
                    'status' : 1,
                    'IP' : '192.168.0.2',
                    },
            }
print(send_data['0']['status'])
send_data['0']['status'] = 0 
print(send_data['0']['status'])

#print(json.dumps(send_data))
#print(send_data)

@app.get("/")
async def read_main():
    return {"msg": "Hello World"}


@app.websocket_route("/ws")
async def websocket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json(send_data)
    await websocket.close()


def test_read_main():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello World"}


def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        data = websocket.receive_json()
        assert data == {"msg": "Hello WebSocket"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
