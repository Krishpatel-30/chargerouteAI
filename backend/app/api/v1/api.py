from fastapi import APIRouter
from app.api.v1.endpoints import auth, vehicles, chargers, trips, reports, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(chargers.router, prefix="/chargers", tags=["Charging Stations"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trip Planning"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration & Data Quality"])
