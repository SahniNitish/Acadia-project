from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Acadia Safe Dashboard API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Alert Models
class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    studentName: str
    studentEmail: Optional[str] = None
    studentPhone: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "new"  # new, in_progress, resolved
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None

class AlertCreate(BaseModel):
    studentName: str
    studentEmail: Optional[str] = None
    studentPhone: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Incident Models
class Incident(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    location: str
    description: Optional[str] = None
    reporterName: Optional[str] = None
    anonymous: bool = False
    status: str = "new"
    priority: str = "medium"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class IncidentCreate(BaseModel):
    type: str
    location: str
    description: Optional[str] = None
    reporterName: Optional[str] = None
    anonymous: bool = False
    priority: str = "medium"

# Escort Models
class Escort(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    studentName: str
    studentPhone: Optional[str] = None
    pickup: str
    destination: str
    notes: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, cancelled
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None

class EscortCreate(BaseModel):
    studentName: str
    studentPhone: Optional[str] = None
    pickup: str
    destination: str
    notes: Optional[str] = None

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    verified: bool = False
    status: str = "active"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Staff Models
class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "officer"  # officer, supervisor, admin
    status: str = "active"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Broadcast Models
class Broadcast(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    title: str
    message: str
    targetAudience: str = "all"
    status: str = "sent"
    sentBy: Optional[str] = None
    sentByName: Optional[str] = None
    recipientCount: str = "0"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Routes
@api_router.get("/")
async def root():
    return {"message": "Acadia Safe Dashboard API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Status routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Alert routes
@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts():
    alerts = await db.alerts.find({}, {"_id": 0}).to_list(1000)
    return alerts

@api_router.post("/alerts", response_model=Alert)
async def create_alert(input: AlertCreate):
    alert = Alert(**input.model_dump())
    await db.alerts.insert_one(alert.model_dump())
    return alert

@api_router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, status: str):
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert updated"}

# Incident routes
@api_router.get("/incidents", response_model=List[Incident])
async def get_incidents():
    incidents = await db.incidents.find({}, {"_id": 0}).to_list(1000)
    return incidents

@api_router.post("/incidents", response_model=Incident)
async def create_incident(input: IncidentCreate):
    incident = Incident(**input.model_dump())
    await db.incidents.insert_one(incident.model_dump())
    return incident

# Escort routes
@api_router.get("/escorts", response_model=List[Escort])
async def get_escorts():
    escorts = await db.escorts.find({}, {"_id": 0}).to_list(1000)
    return escorts

@api_router.post("/escorts", response_model=Escort)
async def create_escort(input: EscortCreate):
    escort = Escort(**input.model_dump())
    await db.escorts.insert_one(escort.model_dump())
    return escort

@api_router.put("/escorts/{escort_id}")
async def update_escort(escort_id: str, status: str):
    result = await db.escorts.update_one(
        {"id": escort_id},
        {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Escort not found")
    return {"message": "Escort updated"}

# User routes
@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

# Staff routes
@api_router.get("/staff", response_model=List[Staff])
async def get_staff():
    staff = await db.staff.find({}, {"_id": 0}).to_list(1000)
    return staff

# Broadcast routes
@api_router.get("/broadcasts", response_model=List[Broadcast])
async def get_broadcasts():
    broadcasts = await db.broadcasts.find({}, {"_id": 0}).to_list(1000)
    return broadcasts

@api_router.post("/broadcasts", response_model=Broadcast)
async def create_broadcast(input: dict):
    broadcast = Broadcast(**input)
    await db.broadcasts.insert_one(broadcast.model_dump())
    return broadcast

# Seed demo data endpoint
@api_router.post("/seed-demo-data")
async def seed_demo_data():
    """Seed demo data for testing purposes"""
    
    # Clear existing data
    await db.alerts.delete_many({})
    await db.incidents.delete_many({})
    await db.escorts.delete_many({})
    await db.users.delete_many({})
    await db.broadcasts.delete_many({})
    
    # Demo Alerts
    demo_alerts = [
        {
            "id": str(uuid.uuid4()),
            "studentName": "Sarah Johnson",
            "studentEmail": "sarah.johnson@acadiau.ca",
            "studentPhone": "+1 (902) 555-0123",
            "location": "Main Library, 2nd Floor",
            "latitude": 45.0870,
            "longitude": -64.3660,
            "status": "new",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "studentName": "Michael Chen",
            "studentEmail": "michael.chen@acadiau.ca",
            "studentPhone": "+1 (902) 555-0456",
            "location": "Parking Lot B",
            "latitude": 45.0855,
            "longitude": -64.3675,
            "status": "in_progress",
            "assignedToName": "Officer Williams",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Demo Incidents
    demo_incidents = [
        {
            "id": str(uuid.uuid4()),
            "type": "suspicious_activity",
            "location": "Student Center",
            "description": "Unknown individual asking students for personal information",
            "reporterName": "Anonymous",
            "anonymous": True,
            "status": "new",
            "priority": "high",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "theft",
            "location": "Bicycle Rack - BAC",
            "description": "Bicycle reported stolen from rack outside athletics center",
            "reporterName": "John Smith",
            "anonymous": False,
            "status": "under_review",
            "priority": "medium",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "type": "vandalism",
            "location": "Residence Hall C",
            "description": "Graffiti found on building exterior",
            "reporterName": "Residence Advisor",
            "anonymous": False,
            "status": "resolved",
            "priority": "low",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Demo Escorts
    demo_escorts = [
        {
            "id": str(uuid.uuid4()),
            "studentName": "Emily Davis",
            "studentPhone": "+1 (902) 555-0789",
            "pickup": "Library",
            "destination": "Residence Hall A",
            "notes": "Has heavy backpack, may need extra time",
            "status": "pending",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "studentName": "James Wilson",
            "studentPhone": "+1 (902) 555-0321",
            "pickup": "Science Building",
            "destination": "Off-campus (Main Street)",
            "status": "in_progress",
            "assignedToName": "Officer Brown",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "studentName": "Lisa Anderson",
            "studentPhone": "+1 (902) 555-0654",
            "pickup": "Athletics Center",
            "destination": "Residence Hall B",
            "status": "completed",
            "assignedToName": "Officer Davis",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Demo Users
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sarah Johnson",
            "email": "sarah.johnson@acadiau.ca",
            "phone": "+1 (902) 555-0123",
            "verified": True,
            "status": "active",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Michael Chen",
            "email": "michael.chen@acadiau.ca",
            "phone": "+1 (902) 555-0456",
            "verified": True,
            "status": "active",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Emily Davis",
            "email": "emily.davis@acadiau.ca",
            "phone": "+1 (902) 555-0789",
            "verified": False,
            "status": "active",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Demo Broadcasts
    demo_broadcasts = [
        {
            "id": str(uuid.uuid4()),
            "type": "advisory",
            "title": "Weather Advisory",
            "message": "Heavy snow expected this evening. Please use caution when traveling on campus.",
            "targetAudience": "all",
            "status": "sent",
            "sentByName": "Security Operations",
            "recipientCount": "2,456",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert demo data
    if demo_alerts:
        await db.alerts.insert_many(demo_alerts)
    if demo_incidents:
        await db.incidents.insert_many(demo_incidents)
    if demo_escorts:
        await db.escorts.insert_many(demo_escorts)
    if demo_users:
        await db.users.insert_many(demo_users)
    if demo_broadcasts:
        await db.broadcasts.insert_many(demo_broadcasts)
    
    return {
        "message": "Demo data seeded successfully",
        "counts": {
            "alerts": len(demo_alerts),
            "incidents": len(demo_incidents),
            "escorts": len(demo_escorts),
            "users": len(demo_users),
            "broadcasts": len(demo_broadcasts)
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
