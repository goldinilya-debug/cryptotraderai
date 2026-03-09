from fastapi import APIRouter
from datetime import datetime
from typing import List
from pydantic import BaseModel

router = APIRouter()

class KillZone(BaseModel):
    name: str
    start_hour: int
    end_hour: int
    volatility: str
    description: str
    is_active: bool

KILL_ZONES = [
    {
        "name": "Asian Kill Zone",
        "start_hour": 20,
        "end_hour": 22,
        "volatility": "medium",
        "description": "Range-bound activity expected"
    },
    {
        "name": "London Kill Zone",
        "start_hour": 2,
        "end_hour": 5,
        "volatility": "high",
        "description": "High probability setups"
    },
    {
        "name": "New York Kill Zone",
        "start_hour": 7,
        "end_hour": 10,
        "volatility": "high",
        "description": "High probability setups"
    },
    {
        "name": "London Close",
        "start_hour": 10,
        "end_hour": 12,
        "volatility": "medium",
        "description": "Range-bound activity expected"
    }
]

@router.get("/", response_model=List[KillZone])
async def get_kill_zones():
    """Get all Kill Zones with current status"""
    current_hour = datetime.utcnow().hour - 5  # EST
    
    zones = []
    for zone in KILL_ZONES:
        is_active = zone["start_hour"] <= current_hour < zone["end_hour"]
        zones.append({**zone, "is_active": is_active})
    
    return zones

@router.get("/active")
async def get_active_kill_zone():
    """Get currently active Kill Zone"""
    current_hour = datetime.utcnow().hour - 5
    
    for zone in KILL_ZONES:
        if zone["start_hour"] <= current_hour < zone["end_hour"]:
            return {**zone, "is_active": True}
    
    return {"name": "None", "is_active": False}
