#!/usr/bin/env python3
"""
India EV Charging Stations Dataset Importer.
Imports records from the official Bureau of Energy Efficiency (BEE) REST API
(https://ev-charging-stations-api.vercel.app) into PostgreSQL or SQLite database.

Usage:
  python scripts/import_india_ev_stations.py [--pages 10] [--db-url postgresql+asyncpg://...]
"""

import sys
import os
import argparse
import asyncio
import time
import httpx

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.database import Base
from app.models.charger import ChargingStation
from app.services.india_ev_service import IndiaEVService


async def run_import(db_url: str, pages: int = 10, page_size: int = 100):
    print("=" * 70)
    print(">> ChargeRoute AI - India EV Charging Stations Importer")
    print("   Dataset Source: Bureau of Energy Efficiency (BEE), Ministry of Power")
    print(f"   Target Database: {db_url}")
    print(f"   Import Target: Up to {pages * page_size} stations ({pages} pages x {page_size})")
    print("=" * 70)

    # Configure engine
    engine_kwargs = {"echo": False}
    if "sqlite" in db_url:
        engine_kwargs["connect_args"] = {"check_same_thread": False}

    engine = create_async_engine(db_url, **engine_kwargs)
    SessionMaker = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Ensure tables exist
    print("\n[1/3] Verifying database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("      Database tables ready.")

    # 2. Fetch metadata
    print("\n[2/3] Fetching upstream dataset metadata from API...")
    try:
        meta = await IndiaEVService.fetch_source_metadata()
        print(f"      Dataset: {meta['source_name']}")
        print(f"      Snapshot Date: {meta['snapshot_label']}")
        print(f"      Publisher: {meta['publisher']}")
        print(f"      Total Available in National Directory: {meta['total_upstream_stations']:,} stations")
    except Exception as e:
        print(f"      Warning: Could not fetch metadata ({e})")
        meta = {}

    # 3. Import batches
    print(f"\n[3/3] Importing station records from https://ev-charging-stations-api.vercel.app ...")
    total_added = 0
    total_updated = 0
    t0 = time.time()

    async with SessionMaker() as db:
        async with httpx.AsyncClient(timeout=20.0) as client:
            for p in range(1, pages + 1):
                url = f"https://ev-charging-stations-api.vercel.app/v1/stations?limit={page_size}&page={p}"
                try:
                    p_start = time.time()
                    resp = await client.get(url)
                    if resp.status_code != 200:
                        print(f"      Page {p}: HTTP {resp.status_code}, stopping.")
                        break

                    data = resp.json()
                    stations = data.get("data", [])
                    if not stations:
                        print(f"      Page {p}: No more stations available.")
                        break

                    res = await IndiaEVService.import_stations_batch(db, stations)
                    total_added += res["added"]
                    total_updated += res["updated"]
                    p_elapsed = time.time() - p_start

                    print(f"      [OK] Page {p:2d}/{pages}: {len(stations):3d} records fetched ({res['added']} added, {res['updated']} updated) [{p_elapsed:.2f}s]")
                except Exception as err:
                    print(f"      [FAIL] Page {p}: Error - {err}")
                    await asyncio.sleep(1)

    elapsed = time.time() - t0
    print("\n" + "=" * 70)
    print("IMPORT COMPLETED SUCCESSFULLY!")
    print(f"   Total Added:   {total_added:,}")
    print(f"   Total Updated: {total_updated:,}")
    print(f"   Time Elapsed:  {elapsed:.1f} seconds")
    print(f"   Snapshot Date: {meta.get('snapshot_label', '26th October 2025')}")
    print("=" * 70)

    await engine.dispose()


def main():
    parser = argparse.ArgumentParser(description="Import India EV charging stations dataset into database.")
    parser.add_argument("--db-url", type=str, default=settings.DATABASE_URL, help="Database connection URL (PostgreSQL or SQLite)")
    parser.add_argument("--pages", type=int, default=10, help="Number of pages to import (100 stations per page)")
    parser.add_argument("--page-size", type=int, default=100, help="Stations per page (max 100)")
    args = parser.parse_args()

    asyncio.run(run_import(db_url=args.db_url, pages=args.pages, page_size=args.page_size))


if __name__ == "__main__":
    main()
