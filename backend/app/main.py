from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from parser.csv_parser import parse_csv


app = FastAPI(title="Attack Atlas API")

# React(localhost:5173)からのアクセスを許可する設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Attack Atlas API is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.post("/upload")
async def upload_log(file: UploadFile = File(...)):
    # Reactから送られてきたファイルを読み込む
    content = await file.read()

    # CSVを解析
    events = parse_csv(content)

    return {
        "filename": file.filename,
        "events": events
    }
