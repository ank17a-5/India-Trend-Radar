import requests

API_BASE_URL = "http://127.0.0.1:8000"


def get_rising_trends():
    response = requests.get(
        f"{API_BASE_URL}/trends/rising",
        timeout=10
    )
    response.raise_for_status()
    return response.json()


def get_top_niches():
    response = requests.get(
        f"{API_BASE_URL}/niches/top",
        timeout=10
    )
    response.raise_for_status()
    return response.json()


def get_forecast(topic):
    response = requests.get(
        f"{API_BASE_URL}/trends/forecast/{topic}",
        timeout=10
    )
    response.raise_for_status()
    return response.json()


def get_anomalies(limit=20):
    response = requests.get(
        f"{API_BASE_URL}/anomalies",
        params={"limit": limit},
        timeout=10
    )
    response.raise_for_status()
    return response.json()


def get_evaluation():
    response = requests.get(
        f"{API_BASE_URL}/evaluation",
        timeout=10
    )
    response.raise_for_status()
    return response.json()