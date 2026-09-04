from fastapi import FastAPI

app = FastAPI(title="Attack Atlas API")

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
