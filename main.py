from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import hashlib
import json
import os

app = FastAPI(title="CryptoTraderAI API", version="3.3.0")

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return {"users": {}, "diary": {}, "journal": {}}

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

class LoginReq(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register(req: LoginReq):
    data = load_data()
    if req.email in data["users"]:
        raise HTTPException(400, "Email exists")
    uid = str(hash(req.email))
    data["users"][req.email] = {"id": uid, "pass": hashlib.sha256(req.password.encode()).hexdigest()}
    save_data(data)
    return {"token": uid, "email": req.email}

@app.post("/api/auth/login")
def login(req: LoginReq):
    data = load_data()
    u = data["users"].get(req.email)
    if not u or u["pass"] != hashlib.sha256(req.password.encode()).hexdigest():
        raise HTTPException(401, "Invalid")
    return {"token": u["id"], "email": req.email}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "3.3.0"}
