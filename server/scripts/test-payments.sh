#!/bin/bash

# Payment System Test Runner
# This script runs comprehensive tests for the payment system

set -e

echo "🧪 Starting Payment System Tests..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    exit 1
fi

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "❌ Redis is not running. Please start Redis first."
    echo "   On macOS: brew services start redis"
    echo "   On Ubuntu: sudo systemctl start redis"
    exit 1
fi

# Set test environment
export NODE_ENV=test
export MONGODB_URI=mongodb://localhost:27017/quiz-platform-test
export MOCK_PAYMENTS=true

# Create test database directory if it doesn't exist
mkdir -p ./test-uploads
mkdir -p ./protected-content/{intro-guides,basic-tutorials,community-resources,advanced-tutorials,project-templates,coding-challenges,best-practices,senior-guides,architecture-patterns,performance-optimization,security-best-practices,interview-preparation,exclusive-content,mentorship-sessions,early-access,premium-resources}

# Create sample test files
echo "📄 Creating sample test files..."
echo "Sample guide content" > ./protected-content/intro-guides/sample-guide.pdf
echo "Advanced tutorial content" > ./protected-content/advanced-tutorials/advanced-tutorial.pdf
echo "Senior guide content" > ./protected-content/senior-guides/senior-guide.pdf

# Run tests
echo "🚀 Running payment system tests..."
npm run test:payments

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All payment system tests passed!"
else
    echo "❌ Some tests failed. Check the output above for details."
    exit 1
fi

# Clean up test files
echo "🧹 Cleaning up test files..."
rm -rf ./test-uploads
rm -rf ./protected-content

echo "🎉 Payment system testing completed successfully!"
