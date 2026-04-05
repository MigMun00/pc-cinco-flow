from fastapi import FastAPI
from app.routers import test
from app.core.middleware import setup_middleware

app = FastAPI()
setup_middleware(app)
app.include_router(test.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "ok"}