#!/bin/bash
# Run the API integration tests

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install dependencies if needed
pip install -r requirements.txt

# Run the tests
pytest tests/test_api_integration.py -v

# Run with coverage (if you want to add coverage)
# pytest --cov=app tests/ -v 