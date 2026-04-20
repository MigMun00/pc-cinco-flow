from fastapi import FastAPI
from app.routers import test
from app.routers import clients, products, projects, services, project_expenses
from app.core.middleware import setup_middleware

app = FastAPI()
setup_middleware(app)
app.include_router(test.router)
app.include_router(clients.router)
app.include_router(products.router)
app.include_router(projects.router)
app.include_router(services.router)
app.include_router(project_expenses.router)

@app.get("/")
def root():
    return {"status": "ok"}