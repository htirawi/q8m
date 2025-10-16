#!/bin/bash

# Vue 3 Quiz Platform - Production Deployment Script
# This script handles the complete deployment process for the quiz platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="quiz-platform"
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.${ENVIRONMENT}"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Check if environment file exists
check_environment() {
    log_info "Checking environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found!"
        log_info "Please create $ENV_FILE with the following variables:"
        cat << EOF
# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_DATABASE=quiz_platform

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# API Configuration
API_PORT=3001
CLIENT_PORT=3000
CLIENT_URL=https://your-domain.com
SERVER_URL=https://api.your-domain.com

# Payment Gateways
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
APS_MERCHANT_ID=your_aps_merchant_id
APS_ACCESS_CODE=your_aps_access_code
APS_MERCHANT_ACCESS_CODE=your_aps_merchant_access_code
APS_SHA_REQUEST_PHRASE=your_aps_sha_request_phrase
APS_SHA_RESPONSE_PHRASE=your_aps_sha_response_phrase
HYPERPAY_ENTITY_ID=your_hyperpay_entity_id
HYPERPAY_ACCESS_TOKEN=your_hyperpay_access_token

# External Services
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Security
SIGNED_URL_SECRET=your_signed_url_secret

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id

# Security
TURNSTILE_SITE_KEY=your_turnstile_site_key

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
EOF
        exit 1
    fi
    
    log_success "Environment file found"
}

# Run pre-deployment tests
run_tests() {
    log_info "Running pre-deployment tests..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:unit
    
    # Run integration tests
    log_info "Running integration tests..."
    npm run test:integration
    
    # Run E2E tests
    log_info "Running E2E tests..."
    npm run test:e2e
    
    # Run security tests
    log_info "Running security tests..."
    npm run test:security
    
    # Run performance tests
    log_info "Running performance tests..."
    npm run test:performance
    
    log_success "All tests passed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t ${PROJECT_NAME}-api:latest ./server
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -t ${PROJECT_NAME}-frontend:latest ./client
    
    log_success "Docker images built successfully"
}

# Deploy with Docker Compose
deploy() {
    log_info "Deploying application..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Remove old images
    log_info "Removing old images..."
    docker image prune -f
    
    # Start services
    log_info "Starting services..."
    docker-compose -f $DOCKER_COMPOSE_FILE --env-file $ENV_FILE up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Application deployed successfully"
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    # Check MongoDB
    if ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log_error "MongoDB is not healthy"
        exit 1
    fi
    log_success "MongoDB is healthy"
    
    # Check Redis
    if ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_error "Redis is not healthy"
        exit 1
    fi
    log_success "Redis is healthy"
    
    # Check API
    if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_error "API is not healthy"
        exit 1
    fi
    log_success "API is healthy"
    
    # Check Frontend
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_error "Frontend is not healthy"
        exit 1
    fi
    log_success "Frontend is healthy"
}

# Run post-deployment checks
post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    # Check if all services are running
    if ! docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        log_error "Some services are not running"
        exit 1
    fi
    
    # Check API endpoints
    log_info "Checking API endpoints..."
    
    # Health check
    if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_error "Health check endpoint failed"
        exit 1
    fi
    
    # Check if frontend loads
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_error "Frontend is not accessible"
        exit 1
    fi
    
    # Check if database is accessible
    if ! docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
        log_error "Database is not accessible"
        exit 1
    fi
    
    log_success "Post-deployment checks passed"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ ! -d "ssl" ]; then
        mkdir -p ssl
    fi
    
    # Check if SSL certificates exist
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_warning "SSL certificates not found. Please add them to the ssl/ directory:"
        log_info "  - ssl/cert.pem (SSL certificate)"
        log_info "  - ssl/key.pem (SSL private key)"
        log_info "  - ssl/ca.pem (Certificate Authority, optional)"
        
        # Create self-signed certificates for development
        if [ "$ENVIRONMENT" = "development" ]; then
            log_info "Creating self-signed certificates for development..."
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            log_success "Self-signed certificates created"
        else
            log_error "SSL certificates are required for production deployment"
            exit 1
        fi
    else
        log_success "SSL certificates found"
    fi
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    # Copy monitoring configuration files
    if [ ! -f "monitoring/prometheus.yml" ]; then
        log_info "Creating Prometheus configuration..."
        cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'quiz-platform-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'quiz-platform-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF
    fi
    
    if [ ! -f "monitoring/grafana/datasources/prometheus.yml" ]; then
        log_info "Creating Grafana datasource configuration..."
        cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    fi
    
    log_success "Monitoring setup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    
    # Check dependencies
    check_dependencies
    
    # Check environment
    check_environment
    
    # Setup SSL certificates
    setup_ssl
    
    # Setup monitoring
    setup_monitoring
    
    # Run tests
    run_tests
    
    # Build images
    build_images
    
    # Deploy application
    deploy
    
    # Run post-deployment checks
    post_deployment_checks
    
    log_success "Deployment completed successfully!"
    log_info "Application is now running at:"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - API: http://localhost:3001"
    log_info "  - Grafana: http://localhost:3001"
    log_info "  - Prometheus: http://localhost:9090"
    
    # Show logs
    log_info "To view logs, run: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    
    # Show status
    log_info "To check status, run: docker-compose -f $DOCKER_COMPOSE_FILE ps"
}

# Handle script arguments
case "${1:-}" in
    "test")
        log_info "Running tests only..."
        check_dependencies
        run_tests
        ;;
    "build")
        log_info "Building images only..."
        check_dependencies
        build_images
        ;;
    "deploy")
        log_info "Deploying application..."
        check_dependencies
        check_environment
        deploy
        post_deployment_checks
        ;;
    "health")
        log_info "Checking service health..."
        check_service_health
        ;;
    "logs")
        log_info "Showing application logs..."
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
        ;;
    "stop")
        log_info "Stopping application..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        ;;
    "clean")
        log_info "Cleaning up..."
        docker-compose -f $DOCKER_COMPOSE_FILE down -v
        docker system prune -f
        ;;
    *)
        main
        ;;
esac
