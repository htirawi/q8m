#!/bin/bash

# MongoDB Quick Start Script for Integration Tests
# This script attempts to start MongoDB using various methods

echo "🔍 Checking for MongoDB..."

# Check if MongoDB is already running
if pgrep -q mongod; then
    echo "✅ MongoDB is already running!"
    echo ""
    echo "Connection string: mongodb://localhost:27017"
    echo "Test database: quiz-platform-test"
    exit 0
fi

echo "📦 MongoDB not running. Attempting to start..."
echo ""

# Method 1: Try brew services (macOS with Homebrew)
if command -v brew &> /dev/null; then
    echo "Trying: brew services start mongodb-community..."
    if brew services start mongodb-community 2>/dev/null; then
        echo "✅ Started MongoDB via Homebrew"
        sleep 2
        exit 0
    fi
fi

# Method 2: Try Docker
if command -v docker &> /dev/null; then
    echo "Trying: Docker container..."

    # Check if container exists
    if docker ps -a | grep -q mongodb-test; then
        echo "Starting existing MongoDB container..."
        docker start mongodb-test
    else
        echo "Creating new MongoDB container..."
        docker run -d \
            --name mongodb-test \
            -p 27017:27017 \
            mongo:latest
    fi

    if [ $? -eq 0 ]; then
        echo "✅ Started MongoDB via Docker"
        echo ""
        echo "Container name: mongodb-test"
        echo "To stop: docker stop mongodb-test"
        echo "To remove: docker rm mongodb-test"
        sleep 2
        exit 0
    fi
fi

# Method 3: Try direct mongod command
if command -v mongod &> /dev/null; then
    echo "Trying: Direct mongod command..."

    # Create data directory
    DATA_DIR="$HOME/.mongodb-test-data"
    mkdir -p "$DATA_DIR"

    echo "Starting MongoDB with data directory: $DATA_DIR"
    mongod --dbpath "$DATA_DIR" --logpath "$DATA_DIR/mongod.log" --fork

    if [ $? -eq 0 ]; then
        echo "✅ Started MongoDB directly"
        echo ""
        echo "Data directory: $DATA_DIR"
        echo "Log file: $DATA_DIR/mongod.log"
        echo "To stop: mongod --shutdown --dbpath $DATA_DIR"
        sleep 2
        exit 0
    fi
fi

# If we get here, nothing worked
echo ""
echo "❌ Could not start MongoDB automatically"
echo ""
echo "Please install and start MongoDB manually:"
echo ""
echo "Option 1 - Homebrew (macOS):"
echo "  brew install mongodb-community"
echo "  brew services start mongodb-community"
echo ""
echo "Option 2 - Docker:"
echo "  docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "Option 3 - Download from mongodb.com:"
echo "  https://www.mongodb.com/try/download/community"
echo ""
exit 1
