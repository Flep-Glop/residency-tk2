import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
import pytest_asyncio
from app.main import app

# Basic API tests
def test_root_endpoint(test_client: TestClient):
    """Test that the root endpoint returns a 200 status code."""
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Medical Physics Toolkit API is running"}

# Fusion API tests
@pytest.mark.asyncio
async def test_fusion_endpoints():
    """Test the fusion API endpoints."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test GET /api/fusion/ endpoint (with trailing slash)
        response = await ac.get("/api/fusion/")
        assert response.status_code == 200
        assert "name" in response.json()
        assert "endpoints" in response.json()
        
        # Test redirection behavior
        response = await ac.get("/api/fusion", follow_redirects=True)
        assert response.status_code == 200
        
        # Additional tests can be added here as the endpoints are implemented

# Error handling tests
def test_not_found_error(test_client: TestClient):
    """Test that a 404 error is returned for a non-existent endpoint."""
    response = test_client.get("/non-existent-endpoint")
    assert response.status_code == 404
    assert "detail" in response.json()

# Health check endpoint test
def test_health_check(test_client: TestClient):
    """Test that the health check endpoint returns a 200 status code."""
    # Add a health check endpoint if it doesn't exist yet
    response = test_client.get("/health")
    # This will fail initially, but serves as a reminder to implement the endpoint
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"} 