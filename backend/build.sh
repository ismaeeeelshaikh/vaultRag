#!/bin/bash
# Build script for Render deployment
set -e

echo "Installing dependencies..."
pip install -r requirements-min.txt

echo "Running database migrations..."
alembic upgrade head

echo "Build complete!"
