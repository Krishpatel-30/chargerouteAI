"""
Geocoding Provider Adapters for Pan-India EV Route Planning.

Supports:
1. Google Maps Geocoding API (primary when GOOGLE_MAPS_API_KEY is configured).
2. OpenStreetMap / Nominatim API (open live geocoder bounded to India).
3. Comprehensive Offline Pan-India Directory (instant zero-latency fallback covering all states & national corridors).
"""

import httpx
import re
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.providers.base import GeocodingProvider, LocationResult


# Built-in Directory of Indian Cities, Metros, Expressway Hubs, Towns & EV Tourism Destinations
INDIA_LOCATIONS_DIRECTORY: List[Dict[str, Any]] = [
    # Top Metros & Major State Capitals
    {"name": "New Delhi", "category": "capital", "district": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"name": "Delhi", "category": "metro", "district": "Delhi", "state": "Delhi", "lat": 28.7041, "lng": 77.1025},
    {"name": "Mumbai", "category": "metro", "district": "Mumbai City", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"name": "Bengaluru", "category": "metro", "district": "Bengaluru Urban", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"name": "Chennai", "category": "metro", "district": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"name": "Hyderabad", "category": "metro", "district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"name": "Kolkata", "category": "metro", "district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"name": "Ahmedabad", "category": "city", "district": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"name": "Pune", "category": "city", "district": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"name": "Jaipur", "category": "capital_city", "district": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"name": "Lucknow", "category": "capital_city", "district": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"name": "Chandigarh", "category": "capital_city", "district": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
    {"name": "Bhopal", "category": "capital_city", "district": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126},
    {"name": "Patna", "category": "capital_city", "district": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376},
    {"name": "Thiruvananthapuram", "category": "capital_city", "district": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lng": 76.9366},
    {"name": "Kochi", "category": "port_city", "district": "Ernakulam", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    {"name": "Bhubaneswar", "category": "capital_city", "district": "Khordha", "state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    {"name": "Dehradun", "category": "capital_city", "district": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lng": 78.0322},
    {"name": "Shimla", "category": "hill_station", "district": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lng": 77.1734},
    {"name": "Raipur", "category": "capital_city", "district": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lng": 81.6296},
    {"name": "Ranchi", "category": "capital_city", "district": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lng": 85.3096},
    {"name": "Guwahati", "category": "gateway_city", "district": "Kamrup", "state": "Assam", "lat": 26.1445, "lng": 91.7362},

    # North Corridor: Delhi - Agra - Lucknow - Varanasi
    {"name": "Noida", "category": "industrial_city", "district": "Gautam Buddha Nagar", "state": "Uttar Pradesh", "lat": 28.5355, "lng": 77.3910},
    {"name": "Greater Noida", "category": "smart_city", "district": "Gautam Buddha Nagar", "state": "Uttar Pradesh", "lat": 28.4744, "lng": 77.5040},
    {"name": "Jewar", "category": "airport_hub", "district": "Gautam Buddha Nagar", "state": "Uttar Pradesh", "lat": 28.1288, "lng": 77.5564},
    {"name": "Mathura", "category": "pilgrimage_city", "district": "Mathura", "state": "Uttar Pradesh", "lat": 27.4924, "lng": 77.6737},
    {"name": "Vrindavan", "category": "pilgrimage_town", "district": "Mathura", "state": "Uttar Pradesh", "lat": 27.5806, "lng": 77.7006},
    {"name": "Agra", "category": "heritage_city", "district": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lng": 78.0081},
    {"name": "Firozabad", "category": "town", "district": "Firozabad", "state": "Uttar Pradesh", "lat": 27.1593, "lng": 78.3957},
    {"name": "Etawah", "category": "expressway_hub", "district": "Etawah", "state": "Uttar Pradesh", "lat": 26.7855, "lng": 79.0154},
    {"name": "Kannauj", "category": "town", "district": "Kannauj", "state": "Uttar Pradesh", "lat": 27.0543, "lng": 79.9142},
    {"name": "Kanpur", "category": "industrial_city", "district": "Kanpur Nagar", "state": "Uttar Pradesh", "lat": 26.4499, "lng": 80.3319},
    {"name": "Ayodhya", "category": "pilgrimage_city", "district": "Ayodhya", "state": "Uttar Pradesh", "lat": 26.7922, "lng": 82.1998},
    {"name": "Varanasi", "category": "pilgrimage_city", "district": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    {"name": "Prayagraj (Allahabad)", "category": "pilgrimage_city", "district": "Prayagraj", "state": "Uttar Pradesh", "lat": 25.4358, "lng": 81.8463},

    # North Corridor: Delhi - Haryana - Punjab - HP
    {"name": "Gurugram", "category": "corporate_hub", "district": "Gurugram", "state": "Haryana", "lat": 28.4595, "lng": 77.0266},
    {"name": "Manesar", "category": "auto_hub", "district": "Gurugram", "state": "Haryana", "lat": 28.3516, "lng": 76.9426},
    {"name": "Dharuhera", "category": "industrial_town", "district": "Rewari", "state": "Haryana", "lat": 28.2056, "lng": 76.7933},
    {"name": "Murthal", "category": "highway_food_hub", "district": "Sonipat", "state": "Haryana", "lat": 28.9892, "lng": 77.0722},
    {"name": "Panipat", "category": "historic_city", "district": "Panipat", "state": "Haryana", "lat": 29.3909, "lng": 76.9635},
    {"name": "Karnal", "category": "highway_city", "district": "Karnal", "state": "Haryana", "lat": 29.6857, "lng": 76.9905},
    {"name": "Kurukshetra", "category": "heritage_city", "district": "Kurukshetra", "state": "Haryana", "lat": 29.9695, "lng": 76.8783},
    {"name": "Ambala", "category": "railway_hub", "district": "Ambala", "state": "Haryana", "lat": 30.3782, "lng": 76.7767},
    {"name": "Ludhiana", "category": "industrial_city", "district": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lng": 75.8573},
    {"name": "Jalandhar", "category": "city", "district": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lng": 75.5762},
    {"name": "Amritsar", "category": "pilgrimage_city", "district": "Amritsar", "state": "Punjab", "lat": 31.6340, "lng": 74.8723},
    {"name": "Rishikesh", "category": "pilgrimage_adventure", "district": "Dehradun", "state": "Uttarakhand", "lat": 30.0869, "lng": 78.2676},
    {"name": "Haridwar", "category": "pilgrimage_city", "district": "Haridwar", "state": "Uttarakhand", "lat": 29.9457, "lng": 78.1642},
    {"name": "Manali", "category": "hill_station", "district": "Kullu", "state": "Himachal Pradesh", "lat": 32.2432, "lng": 77.1892},

    # Rajasthan Corridors: Delhi - Jaipur - Udaipur
    {"name": "Neemrana", "category": "heritage_industrial", "district": "Kotputli-Behror", "state": "Rajasthan", "lat": 27.9888, "lng": 76.3883},
    {"name": "Behror", "category": "highway_town", "district": "Kotputli-Behror", "state": "Rajasthan", "lat": 27.8931, "lng": 76.2818},
    {"name": "Shahpura (Jaipur)", "category": "highway_town", "district": "Jaipur", "state": "Rajasthan", "lat": 27.3878, "lng": 75.9610},
    {"name": "Ajmer", "category": "pilgrimage_city", "district": "Ajmer", "state": "Rajasthan", "lat": 26.4499, "lng": 74.6399},
    {"name": "Pushkar", "category": "pilgrimage_town", "district": "Ajmer", "state": "Rajasthan", "lat": 26.4897, "lng": 74.5511},
    {"name": "Kishangarh", "category": "industrial_town", "district": "Ajmer", "state": "Rajasthan", "lat": 26.5744, "lng": 74.8633},
    {"name": "Jodhpur", "category": "heritage_city", "district": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lng": 73.0243},
    {"name": "Udaipur", "category": "heritage_city", "district": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lng": 73.7125},
    {"name": "Mount Abu", "category": "hill_station", "district": "Sirohi", "state": "Rajasthan", "lat": 24.5925, "lng": 72.7156},

    # West Corridor: Mumbai - Pune - Goa - Nashik
    {"name": "Navi Mumbai", "category": "city", "district": "Thane", "state": "Maharashtra", "lat": 19.0330, "lng": 73.0297},
    {"name": "Thane", "category": "city", "district": "Thane", "state": "Maharashtra", "lat": 19.2183, "lng": 72.9781},
    {"name": "Lonavala", "category": "hill_station", "district": "Pune", "state": "Maharashtra", "lat": 18.7557, "lng": 73.4091},
    {"name": "Khandala", "category": "hill_station", "district": "Pune", "state": "Maharashtra", "lat": 18.7614, "lng": 73.3752},
    {"name": "Khalapur", "category": "expressway_stop", "district": "Raigad", "state": "Maharashtra", "lat": 18.8286, "lng": 73.2872},
    {"name": "Talegaon", "category": "industrial_town", "district": "Pune", "state": "Maharashtra", "lat": 18.7354, "lng": 73.6756},
    {"name": "Mahabaleshwar", "category": "hill_station", "district": "Satara", "state": "Maharashtra", "lat": 17.9237, "lng": 73.6586},
    {"name": "Alibaug", "category": "beach_town", "district": "Raigad", "state": "Maharashtra", "lat": 18.6414, "lng": 72.8722},
    {"name": "Igatpuri", "category": "hill_station", "district": "Nashik", "state": "Maharashtra", "lat": 19.6967, "lng": 73.5594},
    {"name": "Nashik", "category": "pilgrimage_city", "district": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lng": 73.7898},
    {"name": "Shirdi", "category": "pilgrimage_town", "district": "Ahmednagar", "state": "Maharashtra", "lat": 19.7645, "lng": 74.4762},
    {"name": "Chhatrapati Sambhajinagar (Aurangabad)", "category": "heritage_city", "district": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lng": 75.3433},
    {"name": "Satara", "category": "highway_city", "district": "Satara", "state": "Maharashtra", "lat": 17.6805, "lng": 74.0183},
    {"name": "Karad", "category": "town", "district": "Satara", "state": "Maharashtra", "lat": 17.2885, "lng": 74.1844},
    {"name": "Kolhapur", "category": "historic_city", "district": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lng": 74.2433},
    {"name": "Nagpur", "category": "metro", "district": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lng": 79.0882},
    {"name": "Panaji", "category": "capital_city", "district": "North Goa", "state": "Goa", "lat": 15.4909, "lng": 73.8278},
    {"name": "Margao", "category": "city", "district": "South Goa", "state": "Goa", "lat": 15.2832, "lng": 73.9862},
    {"name": "Mapusa", "category": "town", "district": "North Goa", "state": "Goa", "lat": 15.5937, "lng": 73.8142},
    {"name": "Calangute", "category": "beach_resort", "district": "North Goa", "state": "Goa", "lat": 15.5449, "lng": 73.7553},

    # South Corridor: Bengaluru - Mysuru - Ooty - Chennai - Hyderabad
    {"name": "Mysuru", "category": "heritage_city", "district": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394},
    {"name": "Bidadi", "category": "industrial_expressway", "district": "Ramanagara", "state": "Karnataka", "lat": 12.7967, "lng": 77.3854},
    {"name": "Ramanagara", "category": "town", "district": "Ramanagara", "state": "Karnataka", "lat": 12.7209, "lng": 77.2799},
    {"name": "Channapatna", "category": "craft_town", "district": "Ramanagara", "state": "Karnataka", "lat": 12.6518, "lng": 77.2089},
    {"name": "Maddur", "category": "highway_food_hub", "district": "Mandya", "state": "Karnataka", "lat": 12.5844, "lng": 77.0456},
    {"name": "Mandya", "category": "town", "district": "Mandya", "state": "Karnataka", "lat": 12.5244, "lng": 76.8958},
    {"name": "Coorg (Madikeri)", "category": "hill_station", "district": "Kodagu", "state": "Karnataka", "lat": 12.4244, "lng": 75.7382},
    {"name": "Ooty", "category": "hill_station", "district": "Nilgiris", "state": "Tamil Nadu", "lat": 11.4102, "lng": 76.6950},
    {"name": "Hosur", "category": "industrial_hub", "district": "Krishnagiri", "state": "Tamil Nadu", "lat": 12.7409, "lng": 77.8253},
    {"name": "Krishnagiri", "category": "highway_junction", "district": "Krishnagiri", "state": "Tamil Nadu", "lat": 12.5186, "lng": 78.2137},
    {"name": "Vellore", "category": "heritage_city", "district": "Vellore", "state": "Tamil Nadu", "lat": 12.9165, "lng": 79.1325},
    {"name": "Ambur", "category": "highway_food_hub", "district": "Tirupathur", "state": "Tamil Nadu", "lat": 12.7903, "lng": 78.7166},
    {"name": "Kanchipuram", "category": "pilgrimage_city", "district": "Kanchipuram", "state": "Tamil Nadu", "lat": 12.8342, "lng": 79.7036},
    {"name": "Sriperumbudur", "category": "industrial_hub", "district": "Kanchipuram", "state": "Tamil Nadu", "lat": 12.9675, "lng": 79.9442},
    {"name": "Mahabalipuram", "category": "heritage_beach", "district": "Chengalpattu", "state": "Tamil Nadu", "lat": 12.6269, "lng": 80.1927},
    {"name": "Puducherry", "category": "coastal_heritage", "district": "Puducherry", "state": "Puducherry", "lat": 11.9416, "lng": 79.8083},
    {"name": "Salem", "category": "industrial_city", "district": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lng": 78.1460},
    {"name": "Coimbatore", "category": "industrial_city", "district": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lng": 76.9558},
    {"name": "Madurai", "category": "pilgrimage_city", "district": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lng": 78.1198},
    {"name": "Kanyakumari", "category": "coastal_destination", "district": "Kanyakumari", "state": "Tamil Nadu", "lat": 8.0883, "lng": 77.5385},
    {"name": "Thrissur", "category": "cultural_city", "district": "Thrissur", "state": "Kerala", "lat": 10.5276, "lng": 76.2144},
    {"name": "Munnar", "category": "hill_station", "district": "Idukki", "state": "Kerala", "lat": 10.0889, "lng": 77.0595},
    {"name": "Kozhikode", "category": "port_city", "district": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lng": 75.7804},
    {"name": "Alappuzha", "category": "backwaters", "district": "Alappuzha", "state": "Kerala", "lat": 9.4981, "lng": 76.3388},
    {"name": "Chikkaballapur", "category": "highway_town", "district": "Chikkaballapur", "state": "Karnataka", "lat": 13.4355, "lng": 77.7315},
    {"name": "Anantapur", "category": "highway_city", "district": "Anantapur", "state": "Andhra Pradesh", "lat": 14.6819, "lng": 77.6006},
    {"name": "Kurnool", "category": "city", "district": "Kurnool", "state": "Andhra Pradesh", "lat": 15.8281, "lng": 78.0373},
    {"name": "Suryapet", "category": "expressway_stop", "district": "Suryapet", "state": "Telangana", "lat": 17.1439, "lng": 79.6239},
    {"name": "Kodad", "category": "highway_town", "district": "Suryapet", "state": "Telangana", "lat": 16.9972, "lng": 79.9675},
    {"name": "Vijayawada", "category": "commercial_city", "district": "NTR", "state": "Andhra Pradesh", "lat": 16.5062, "lng": 80.6480},
    {"name": "Visakhapatnam", "category": "port_city", "district": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
    {"name": "Tirupati", "category": "pilgrimage_city", "district": "Tirupati", "state": "Andhra Pradesh", "lat": 13.6288, "lng": 79.4192},

    # East & Central India: Kolkata - Durgapur - Indore - Bhopal
    {"name": "Dankuni", "category": "highway_junction", "district": "Hooghly", "state": "West Bengal", "lat": 22.6844, "lng": 88.2982},
    {"name": "Shaktigarh", "category": "highway_food_hub", "district": "Purba Bardhaman", "state": "West Bengal", "lat": 23.2155, "lng": 87.9705},
    {"name": "Bardhaman", "category": "city", "district": "Purba Bardhaman", "state": "West Bengal", "lat": 23.2324, "lng": 87.8615},
    {"name": "Durgapur", "category": "industrial_city", "district": "Paschim Bardhaman", "state": "West Bengal", "lat": 23.5204, "lng": 87.3119},
    {"name": "Asansol", "category": "city", "district": "Paschim Bardhaman", "state": "West Bengal", "lat": 23.6739, "lng": 86.9524},
    {"name": "Puri", "category": "pilgrimage_coastal", "district": "Puri", "state": "Odisha", "lat": 19.8135, "lng": 85.8312},
    {"name": "Jamshedpur", "category": "steel_city", "district": "East Singhbhum", "state": "Jharkhand", "lat": 22.8046, "lng": 86.2029},
    {"name": "Indore", "category": "cleanest_city", "district": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lng": 75.8577},
    {"name": "Ujjain", "category": "pilgrimage_city", "district": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lng": 75.7885},
    {"name": "Dewas", "category": "industrial_town", "district": "Dewas", "state": "Madhya Pradesh", "lat": 22.9676, "lng": 76.0534},
    {"name": "Gwalior", "category": "heritage_city", "district": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lng": 78.1828},
    {"name": "Jabalpur", "category": "city", "district": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lng": 79.9864},

    # Gujarat Corridors & Rural Locations
    {"name": "Vadodara", "category": "city", "district": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lng": 73.1812},
    {"name": "Surat", "category": "diamond_city", "district": "Surat", "state": "Gujarat", "lat": 21.1702, "lng": 72.8311},
    {"name": "Rajkot", "category": "city", "district": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lng": 70.8022},
    {"name": "Gandhinagar", "category": "capital_city", "district": "Gandhinagar", "state": "Gujarat", "lat": 23.2156, "lng": 72.6369},
    {"name": "Kevadia (Statue of Unity)", "category": "tourism_wonder", "district": "Narmada", "state": "Gujarat", "lat": 21.8380, "lng": 73.7191},
    {"name": "Somnath", "category": "pilgrimage_city", "district": "Gir Somnath", "state": "Gujarat", "lat": 20.8880, "lng": 70.4012},
    {"name": "Dwarka", "category": "pilgrimage_city", "district": "Devbhumi Dwarka", "state": "Gujarat", "lat": 22.2442, "lng": 68.9685},
    {"name": "Sasan Gir", "category": "wildlife_ecotourism", "district": "Gir Somnath", "state": "Gujarat", "lat": 21.1644, "lng": 70.5986},
    {"name": "Dholera", "category": "smart_city_village", "district": "Ahmedabad", "state": "Gujarat", "lat": 22.2472, "lng": 72.1956},
    {"name": "Modasa", "category": "town", "district": "Aravalli", "state": "Gujarat", "lat": 23.4633, "lng": 73.2983},
    {"name": "Sanand", "category": "auto_hub_town", "district": "Ahmedabad", "state": "Gujarat", "lat": 22.9867, "lng": 72.3814},
    {"name": "Kadi", "category": "village", "district": "Mehsana", "state": "Gujarat", "lat": 23.2982, "lng": 72.3323},
    {"name": "Unjha", "category": "town", "district": "Mehsana", "state": "Gujarat", "lat": 23.8039, "lng": 72.3925},
    {"name": "Anand", "category": "milk_city", "district": "Anand", "state": "Gujarat", "lat": 22.5645, "lng": 72.9289},
    {"name": "Nadiad", "category": "city", "district": "Kheda", "state": "Gujarat", "lat": 22.6916, "lng": 72.8634},
    {"name": "Bharuch", "category": "chemical_hub", "district": "Bharuch", "state": "Gujarat", "lat": 21.7051, "lng": 72.9959},
    {"name": "Navsari", "category": "twin_city", "district": "Navsari", "state": "Gujarat", "lat": 20.9500, "lng": 72.9333},
    {"name": "Vapi", "category": "industrial_city", "district": "Valsad", "state": "Gujarat", "lat": 20.3700, "lng": 72.9100},
    {"name": "Ambaji", "category": "pilgrimage_town", "district": "Banaskantha", "state": "Gujarat", "lat": 24.3314, "lng": 72.8486},
    {"name": "Bardoli", "category": "historic_town", "district": "Surat", "state": "Gujarat", "lat": 21.1189, "lng": 73.1114},
]

# Aliased for backward compatibility
GUJARAT_RURAL_DIRECTORY = INDIA_LOCATIONS_DIRECTORY


class OfflineIndiaDirectoryProvider(GeocodingProvider):
    """
    Zero-latency instant offline directory for prominent Indian cities, expressways, towns, and hubs.
    """
    def __init__(self, directory: Optional[List[Dict[str, Any]]] = None):
        self.directory = directory or INDIA_LOCATIONS_DIRECTORY

    async def search(self, query: str, limit: int = 8) -> List[LocationResult]:
        q_norm = query.strip().lower()
        if not q_norm:
            return []

        scored_matches = []
        for entry in self.directory:
            name = entry["name"]
            district = entry.get("district", "")
            state = entry.get("state", "India")
            full_searchable = f"{name} {district} {state}".lower()

            score = 0
            if name.lower() == q_norm:
                score += 100
            elif name.lower().startswith(q_norm):
                score += 80
            elif q_norm in name.lower():
                score += 60
            elif q_norm in full_searchable:
                score += 40

            if score > 0:
                scored_matches.append((score, entry))

        scored_matches.sort(key=lambda x: x[0], reverse=True)
        results: List[LocationResult] = []

        for _, item in scored_matches[:limit]:
            display = f"{item['name']}, {item.get('district', '')}, {item.get('state', 'India')}".replace(", ,", ",")
            results.append(
                LocationResult(
                    id=f"dir_{item['name'].replace(' ', '_').lower()}_{round(item['lat'], 2)}",
                    name=f"{item['name']}, {item.get('district', item.get('state', 'India'))}",
                    display_name=display,
                    category=item.get("category", "location"),
                    village=item["name"],
                    district=item.get("district"),
                    state=item.get("state", "India"),
                    country="India",
                    latitude=item["lat"],
                    longitude=item["lng"],
                    provider="india_directory",
                )
            )

        return results

    async def reverse(self, lat: float, lng: float) -> Optional[LocationResult]:
        best_entry = None
        min_dist_sq = 0.05 ** 2

        for item in self.directory:
            d2 = (item["lat"] - lat) ** 2 + (item["lng"] - lng) ** 2
            if d2 < min_dist_sq:
                min_dist_sq = d2
                best_entry = item

        if not best_entry:
            return None

        return LocationResult(
            id=f"dir_rev_{best_entry['name'].replace(' ', '_').lower()}",
            name=f"{best_entry['name']}, {best_entry.get('district', '')}",
            display_name=f"{best_entry['name']}, {best_entry.get('district', '')}, {best_entry.get('state', 'India')}",
            category=best_entry.get("category", "location"),
            village=best_entry["name"],
            district=best_entry.get("district"),
            state=best_entry.get("state", "India"),
            country="India",
            latitude=best_entry["lat"],
            longitude=best_entry["lng"],
            provider="india_directory",
        )


OfflineGujaratDirectoryProvider = OfflineIndiaDirectoryProvider


class GoogleGeocodingProvider(GeocodingProvider):
    """
    Google Maps Platform Geocoding Provider.
    Queries Google Maps Geocoding API with India-wide component bias.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api/geocode/json"

    async def search(self, query: str, limit: int = 8) -> List[LocationResult]:
        if not self.api_key:
            return []

        search_query = query.strip()
        address_param = search_query if "india" in search_query.lower() else f"{search_query}, India"

        params = {
            "address": address_param,
            "components": "country:IN",
            "region": "in",
            "key": self.api_key,
        }

        async with httpx.AsyncClient(timeout=6.0) as client:
            try:
                res = await client.get(self.base_url, params=params)
                if res.status_code != 200:
                    return []
                data = res.json()
            except Exception:
                return []

        if data.get("status") != "OK" or not data.get("results"):
            return []

        results: List[LocationResult] = []
        for item in data.get("results", [])[:limit]:
            geom = item.get("geometry", {}).get("location", {})
            lat = geom.get("lat")
            lng = geom.get("lng")
            if lat is None or lng is None:
                continue

            village = None
            taluka = None
            district = None
            state = "India"

            for comp in item.get("address_components", []):
                types = comp.get("types", [])
                long_name = comp.get("long_name", "")
                if "sublocality" in types or "locality" in types:
                    if not village:
                        village = long_name
                elif "administrative_area_level_3" in types:
                    taluka = long_name
                elif "administrative_area_level_2" in types:
                    district = long_name
                elif "administrative_area_level_1" in types:
                    state = long_name

            category = "village" if "sublocality" in item.get("types", []) or "locality" in item.get("types", []) else "location"
            place_id = item.get("place_id")
            fmt_address = item.get("formatted_address", "")
            short_name = village or fmt_address.split(",")[0]

            results.append(
                LocationResult(
                    id=f"gmap_{place_id or abs(hash(fmt_address))}",
                    name=f"{short_name}, {district or state}",
                    display_name=fmt_address,
                    category=category,
                    village=village,
                    taluka=taluka,
                    district=district,
                    state=state,
                    country="India",
                    latitude=float(lat),
                    longitude=float(lng),
                    provider="google_maps",
                    place_id=place_id,
                )
            )

        return results

    async def reverse(self, lat: float, lng: float) -> Optional[LocationResult]:
        if not self.api_key:
            return None

        params = {
            "latlng": f"{lat},{lng}",
            "region": "in",
            "key": self.api_key,
        }

        async with httpx.AsyncClient(timeout=6.0) as client:
            try:
                res = await client.get(self.base_url, params=params)
                if res.status_code != 200:
                    return None
                data = res.json()
            except Exception:
                return None

        if data.get("status") != "OK" or not data.get("results"):
            return None

        first = data["results"][0]
        fmt_address = first.get("formatted_address", f"{lat:.4f}, {lng:.4f}")
        return LocationResult(
            id=f"gmap_rev_{first.get('place_id', 'rev')}",
            name=fmt_address.split(",")[0],
            display_name=fmt_address,
            category="location",
            latitude=lat,
            longitude=lng,
            provider="google_maps",
            place_id=first.get("place_id"),
        )


class NominatimGeocodingProvider(GeocodingProvider):
    """
    OpenStreetMap / Nominatim live geocoding adapter bounded to all of India.
    """
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.reverse_url = "https://nominatim.openstreetmap.org/reverse"

    async def search(self, query: str, limit: int = 8) -> List[LocationResult]:
        search_query = query.strip()
        q_param = search_query if "india" in search_query.lower() else f"{search_query}, India"

        params = {
            "q": q_param,
            "format": "jsonv2",
            "addressdetails": 1,
            "countrycodes": "in",
            "limit": limit,
        }
        headers = {
            "User-Agent": "ChargeRouteAI-India-EV/1.0 (contact@chargeroute.ai)",
            "Accept-Language": "en,hi",
        }

        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                res = await client.get(self.base_url, params=params, headers=headers)
                if res.status_code != 200:
                    return []
                items = res.json()
            except Exception:
                return []

        results: List[LocationResult] = []
        for item in items:
            lat = item.get("lat")
            lng = item.get("lon")
            if not lat or not lng:
                continue

            address = item.get("address", {})
            village = (
                address.get("village")
                or address.get("hamlet")
                or address.get("town")
                or address.get("suburb")
                or address.get("city")
                or item.get("name")
            )
            taluka = address.get("county") or address.get("taluk")
            district = address.get("state_district") or address.get("county")
            state = address.get("state", "India")

            display_name = item.get("display_name", "")
            short_name = f"{village or item.get('name')}, {district or state}"

            results.append(
                LocationResult(
                    id=f"osm_{item.get('place_id')}",
                    name=short_name,
                    display_name=display_name,
                    category=item.get("type", "location"),
                    village=village,
                    taluka=taluka,
                    district=district,
                    state=state,
                    country="India",
                    latitude=float(lat),
                    longitude=float(lng),
                    provider="nominatim",
                    place_id=str(item.get("place_id")),
                )
            )

        return results

    async def reverse(self, lat: float, lng: float) -> Optional[LocationResult]:
        params = {
            "lat": lat,
            "lon": lng,
            "format": "jsonv2",
            "addressdetails": 1,
        }
        headers = {
            "User-Agent": "ChargeRouteAI-India-EV/1.0",
        }

        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                res = await client.get(self.reverse_url, params=params, headers=headers)
                if res.status_code != 200:
                    return None
                item = res.json()
            except Exception:
                return None

        display_name = item.get("display_name", f"{lat:.4f}, {lng:.4f}")
        address = item.get("address", {})
        village = address.get("village") or address.get("town") or address.get("city")

        return LocationResult(
            id=f"osm_rev_{item.get('place_id', 'rev')}",
            name=village or display_name.split(",")[0],
            display_name=display_name,
            category=item.get("type", "location"),
            village=village,
            district=address.get("state_district"),
            state=address.get("state", "India"),
            latitude=lat,
            longitude=lng,
            provider="nominatim",
            place_id=str(item.get("place_id")),
        )


class CompositeGeocodingService:
    """
    Unified Pan-India Geocoding Service orchestrating:
    1. Google Maps Platform (if GOOGLE_MAPS_API_KEY is configured)
    2. Comprehensive Pan-India Directory (instant local fallback)
    3. Nominatim OpenStreetMap (live geocoding for all of India)
    """
    def __init__(self):
        self.google_provider = GoogleGeocodingProvider()
        self.directory_provider = OfflineIndiaDirectoryProvider()
        self.nominatim_provider = NominatimGeocodingProvider()

    def has_google_maps_configured(self) -> bool:
        return bool(settings.GOOGLE_MAPS_API_KEY)

    async def search(self, query: str, limit: int = 8) -> List[LocationResult]:
        query = query.strip()
        if not query:
            return []

        # 1. Try Google Maps Platform if key is set
        if self.has_google_maps_configured():
            try:
                google_results = await self.google_provider.search(query, limit=limit)
                if google_results:
                    return google_results
            except Exception:
                pass

        # 2. Match in local Pan-India directory (fast, high-precision for all regions)
        directory_matches = await self.directory_provider.search(query, limit=limit)
        if len(directory_matches) >= 3:
            return directory_matches[:limit]

        # 3. Query Nominatim for live granular village resolution across India
        osm_results: List[LocationResult] = []
        try:
            osm_results = await self.nominatim_provider.search(query, limit=limit)
        except Exception:
            pass

        # Merge directory matches with OSM
        combined: List[LocationResult] = []
        seen_names = set()

        for res in directory_matches + osm_results:
            key = (res.name.lower(), round(res.latitude, 2), round(res.longitude, 2))
            if key not in seen_names:
                seen_names.add(key)
                combined.append(res)

        return combined[:limit]

    async def reverse(self, lat: float, lng: float) -> Optional[LocationResult]:
        if self.has_google_maps_configured():
            try:
                res = await self.google_provider.reverse(lat, lng)
                if res:
                    return res
            except Exception:
                pass

        try:
            res = await self.nominatim_provider.reverse(lat, lng)
            if res:
                return res
        except Exception:
            pass

        return await self.directory_provider.reverse(lat, lng)


# Singleton instance
geocoding_service = CompositeGeocodingService()
