from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api.v1.api import api_router
from seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chargeroute")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ChargeRoute AI database tables & seed data...")
    try:
        await seed_database()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error during database startup seed: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Risk-Aware EV Trip Planner API for Gujarat & India corridors.",
    lifespan=lifespan,
)

# CORS configuration: allow any origin regex to support local development across devices (LAN IP, localhost, custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )
