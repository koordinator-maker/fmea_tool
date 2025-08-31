from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import flows

app = FastAPI(title="PFMEA Flow API")

# CORS – sağlam (localhost/127.0.0.1 vs.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

app.include_router(flows.router, prefix="/api")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
