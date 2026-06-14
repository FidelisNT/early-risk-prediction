from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Early Risk Prediction API is running"}