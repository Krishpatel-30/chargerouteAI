import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.providers.geocoding import (
    OfflineGujaratDirectoryProvider,
    CompositeGeocodingService,
    GoogleGeocodingProvider,
    GUJARAT_RURAL_DIRECTORY,
)


@pytest.mark.asyncio
async def test_offline_gujarat_directory_search():
    provider = OfflineGujaratDirectoryProvider()
    
    # Test searching for Kadi village/taluka in Mehsana
    results = await provider.search("Kadi")
    assert len(results) > 0
    kadi = results[0]
    assert kadi.village == "Kadi"
    assert kadi.district == "Mehsana"
    assert abs(kadi.latitude - 23.2982) < 0.01
    assert abs(kadi.longitude - 72.3323) < 0.01

    # Test searching for Sasan Gir
    gir_results = await provider.search("Sasan Gir")
    assert len(gir_results) > 0
    assert gir_results[0].district == "Gir Somnath"

    # Test searching for Dholera
    dholera_results = await provider.search("Dholera")
    assert len(dholera_results) > 0
    assert dholera_results[0].district == "Ahmedabad"

    # Test searching for Bardoli
    bardoli_results = await provider.search("Bardoli")
    assert len(bardoli_results) > 0
    assert bardoli_results[0].district == "Surat"


@pytest.mark.asyncio
async def test_composite_geocoding_service():
    service = CompositeGeocodingService()
    
    # Verify search finds rural Gujarat locations
    res = await service.search("Modasa")
    assert len(res) > 0
    assert any("Modasa" in r.name for r in res)

    # Reverse geocoding test near Kadi
    rev = await service.reverse(23.2982, 72.3323)
    assert rev is not None
    assert "Kadi" in rev.name


@pytest.mark.asyncio
async def test_locations_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Config check
        config_res = await client.get("/api/v1/locations/config")
        assert config_res.status_code == 200
        config_data = config_res.json()
        assert "primary_provider" in config_data
        assert config_data["total_rural_locations_indexed"] >= len(GUJARAT_RURAL_DIRECTORY)

        # Search for rural village "Unjha"
        search_res = await client.get("/api/v1/locations/search?q=Unjha")
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert len(search_data) > 0
        assert search_data[0]["village"] == "Unjha"
        assert search_data[0]["district"] == "Mehsana"

        # Popular villages list
        pop_res = await client.get("/api/v1/locations/popular-villages")
        assert pop_res.status_code == 200
        pop_data = pop_res.json()
        assert len(pop_data) >= 5
        names = [p["village"] for p in pop_data]
        assert "Sasan Gir" in names
        assert "Dholera" in names
