from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from parser.csv_parser import parse_csv
from parser.attack_route import build_attack_route

app = FastAPI(title="Attack Atlas API")

# React(localhost:5173)からアクセスできるようにする
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Attack Atlas API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_log(file: UploadFile = File(...)):
    content = await file.read()

    # CSVを解析
    events = parse_csv(content)

    # Attack Routeを生成
    route = build_attack_route(events)

    # Incident Summary
    summary = {
        "filename": file.filename,
        "total_events": len(events),
        "sources": list({e["Source"] for e in events}),
    }

    return {
        "summary": summary,
        "events": events,
        "route": route,
    }
