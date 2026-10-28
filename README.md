# ChargeRoute AI — Risk-Aware EV Trip Planner

> **"Plan Your EV Journey. Prepare for the Unexpected."**  
> *Find charging stops, understand your true battery range, and plan backup options before you hit the road.*

[![Tests](https://img.shields.io/badge/tests-13%20passed-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)]()
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-black.svg)]()
[![Initial Market](https://img.shields.io/badge/region-Gujarat%2C%20India-blue.svg)]()

---

## 1. Product Vision

Most electric vehicle route planners answer: **"Where is the nearest charger?"**

ChargeRoute AI answers a far more critical question for highway road trips:
**"Can I complete this journey safely and practically if one of my planned charging stops is unavailable?"**

Standard navigators leave drivers stranded when a roadside charger is suffering a grid blackout, occupied by queues, or disabled by a broken connector latch. ChargeRoute AI introduces:
- **Deterministic Battery Physics:** Calculations based on net usable battery capacity, highway speed drag (100+ km/h), and Indian summer cabin AC loads.
- **Explainable 0–100 Reliability Scoring:** A transparent rule-based risk engine that evaluates data staleness, recent community outage reports, connector redundancy, and reserve buffers.
- **Automatic Backup Station Allocation:** Every recommended charging stop is paired with viable fallback alternatives within practical detour reach.
- **Interactive Multi-Route Comparison:** Direct comparison between Fastest Route, Lowest Risk Route, and Eco Strategies.
- **Initial High-Density Corridor Deployment:** High-speed Gujarat corridors including NE-1 (Ahmedabad–Vadodara Expressway), NH-48 (Vadodara–Bharuch–Surat), and NH-27 (Ahmedabad–Rajkot).

---

## 2. System Architecture

ChargeRoute AI is built using a decoupled **Provider Adapter Architecture**:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Next.js 14 Frontend                   │
 │   App Router • TypeScript • Tailwind CSS • Leaflet Map  │
 └────────────────────────────┬────────────────────────────┘
                              │ HTTP / JSON (/api/v1)
 ┌────────────────────────────▼────────────────────────────┐
 │                     FastAPI Backend                     │
 │   Pydantic v2 • SQLAlchemy 2.0 Async • Security Engine  │
 ├─────────────────────────────────────────────────────────┤
 │                   Core Algorithmic Engines              │
 │  • EnergyCalculator: Deterministic SoC & CC-CV taper    │
 │  • RiskEngine: Rule-Based Explainable 0-100 Scorer      │
 │  • BackupFinder: Detour evaluation & SoC reachability   │
 │  • TripPlanner: Multi-factor corridor route planner     │
 ├─────────────────────────────────────────────────────────┤
 │                   Provider Adapters                     │
 │  • RoutingProvider (OSRM + Geometric Highway Fallback)  │
 │  • ChargerDataProvider (OpenChargeMap + Verified Seed)  │
 └────────────────────────────┬────────────────────────────┘
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                   Database Layer                        │
 │  PostgreSQL 16 + PostGIS (Production / Docker)          │
 │  SQLite + aiosqlite (Zero-config local development)     │
 │  Alembic Database Migrations Engine                     │
 └─────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical & Algorithmic Formulations

### A. Deterministic Segment Energy & Arrival Battery SoC

$$\text{Segment Energy (kWh)} = \frac{\text{Distance (km)} \times \text{Base Consumption (kWh/100km)} \times f_{\text{highway}} \times f_{\text{ac}}}{100}$$

$$\text{Arrival Battery SoC (\%)} = \text{Starting SoC (\%)} - \left( \frac{\text{Segment Energy (kWh)}}{\text{Usable Battery Capacity (kWh)}} \times 100 \right)$$

- **Usable Battery Denominator:** Gross battery packs are separated from net usable kWh (e.g., Tata Nexon EV: 40.5 gross vs 38.0 usable).
- **Highway Speed Multiplier ($f_{\text{highway}}$):** Configurable factor (typically 1.15x for 100+ km/h expressway cruising).
- **Cabin Climate Multiplier ($f_{\text{ac}}$):** Configurable factor (typically 1.10x for Indian summer temperatures).

### B. CC-CV Charging Curve Tapering

Lithium-ion batteries charge in Constant Current (CC) up to ~80% SoC, after which power drops significantly in Constant Voltage (CV) mode:
- **Phase 1 ($<80\%$ SoC):** $\text{Power} = \min(P_{\text{station}}, P_{\text{vehicle}}) \times 90\%$ efficiency.
- **Phase 2 ($>80\%$ SoC):** Power tapers to $45\%$ of maximum deliverable rate.
- Trip planning algorithms target an **80%–82% departure SoC** for rapid turnaround unless longer legs require additional buffer.

### C. Rule-Based Explainable Risk Scoring ($0 \to 100$)

Risk scoring is explainable with explicit categorical classifications:
- **0–29:** Lower indicated risk (Green — safe stop with multi-stall redundancy and verified backups)
- **30–59:** Moderate indicated risk (Amber — stale data or single stall; check primary backup)
- **60–100:** Elevated indicated risk (Red — reported outage or no reachable fallback stations)

---

## 4. Quickstart: Running Locally

### Prerequisites
- Python 3.11+ (Python 3.12 or 3.14 supported)
- Node.js 18+ & npm 9+

### Step 1: Start Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed realistic EV profiles and Gujarat chargers
python seed.py

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- API Swagger Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Step 2: Start Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Open `http://localhost:3000` in your browser.

---

## 5. Running with Docker Compose

To start the full production stack (PostgreSQL with PostGIS, FastAPI backend, and Next.js frontend):

```bash
docker compose up --build
```
- Web Application: `http://localhost:3000`
- REST API: `http://localhost:8000`
- Database: `localhost:5432`

---

## 6. Automated Test Suite

Run unit and integration tests covering energy math, risk boundaries, backup reachability, and API routes:

```bash
cd backend
pytest -v
```

All 13 test suites validate:
- `tests/test_energy.py`: Segment energy, arrival SoC, CC-CV charging taper, and INR tariff calculations.
- `tests/test_risk.py`: 0–100 score bounds, categorical classification, and staleness penalties.
- `tests/test_backups.py`: Haversine distance, detour calculation, and remaining battery reachability.
- `tests/test_trip_planner.py`: End-to-end trip simulation with multi-route alternatives.
- `tests/test_api.py`: FastAPI endpoints for health, vehicles, chargers, and trip planning.

---

## 7. Supported Routes & Gujarat EV Corridors

| Corridor | Key Highway | Typical Density | Notable Stations |
| :--- | :--- | :--- | :--- |
| **Ahmedabad — Vadodara** | NE-1 Expressway | High Density | Tata Power Anand, Jio-bp Nadiad, ChargeZone Kheda |
| **Vadodara — Surat** | NH-48 | Ultra-Fast 120kW | Relux Kim, Statiq Chhani, Tata Power Bharuch |
| **Ahmedabad — Rajkot** | NH-27 | Highway Oasis | Tata Power Limbdi, ChargeZone Sayla, Jio-bp Chotila |
| **Ahmedabad — Mehsana** | NH-41 | Commercial Hubs | Tata Power Gandhinagar, Statiq Toran Mehsana |
| **Rajkot — Somnath** | NH-151 / Coastal | Coastal Route | Tata Power Junagadh, Statiq Somnath Plaza |

---

## 8. License

Open source under the [MIT License](LICENSE).
