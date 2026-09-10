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
async def upload_log(files: list[UploadFile] = File(...)):
    """
    複数CSVファイルを受け取り、1つのイベント一覧にまとめる
    """

    all_events = []
    uploaded_files = []

    # アップロードされたCSVを順番に読み込む
    for file in files:
        content = await file.read()

        # auth.log はCSVではない
        if file.filename.endswith(".log"):
            from parser.authlog_parser import parse_authlog
            events = parse_authlog(content)
        else:
            events = parse_csv(content)

        # どのCSVから来たイベントか分かるようにする
        for event in events:
            event["LogFile"] = file.filename

        all_events.extend(events)
        uploaded_files.append(file.filename)

    # 時系列順に並べ替え（Time列がある前提）
    all_events.sort(key=lambda x: x.get("Time", ""))

    # Attack Route生成
    route = build_attack_route(all_events)

    # Incident Summary
    summary = {
        "filenames": uploaded_files,
        "total_files": len(uploaded_files),
        "total_events": len(all_events),
        "sources": sorted(list({e.get("LogType", e.get("Source", "Unknown")) for e in all_events})),
    }

    return {
        "summary": summary,
        "events": all_events,
        "route": route,
    }
