#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    local type=$1
    local message=$2
    case $type in
        "info")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "warn")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "error")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to check if a process is running on a specific port
check_port() {
    local port=$1
    lsof -i :$port >/dev/null 2>&1
    return $?
}

# Function to validate environment variables
validate_env() {
    log "info" "Validating environment variables..."
    
    # Run the verify-env script if it exists
    if [ -f "scripts/verify-env.js" ]; then
        if ! node scripts/verify-env.js; then
            log "error" "Environment validation failed"
            exit 1
        fi
    else
        log "warn" "verify-env.js script not found, skipping detailed validation"
        
        # Basic validation of critical variables
        if [ -z "$NODE_ENV" ] || [ -z "$PORT" ] || [ -z "$MONGODB_URI" ]; then
            log "error" "Missing required environment variables"
            exit 1
        fi
    fi
    
    log "info" "Environment validation passed"
}

# Parse command line arguments
UPLOAD_SOURCEMAPS=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --with-sourcemaps) UPLOAD_SOURCEMAPS=true ;;
        *) log "error" "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Main deployment process
main() {
    # Validate environment
    validate_env
    
    # Check if a process is running on port 3000
    if check_port 3000; then
        log "warn" "Found process running on port 3000. Killing it..."
        lsof -ti :3000 | xargs kill -9
        log "info" "Process killed"
    else
        log "info" "No process found running on port 3000"
    fi

    # Build the application
    log "info" "Building the application..."
    if [ "$UPLOAD_SOURCEMAPS" = true ]; then
        log "info" "Building with Sentry source maps..."
        npm run build && npm run sentry:sourcemaps
    else
        log "info" "Building without Sentry source maps..."
        SENTRY_SKIP_SOURCE_MAPS=true npm run build
    fi

    # Start the application in production mode
    log "info" "Starting the application in production mode..."
    NODE_ENV=production node -r dotenv/config --require dotenv/config dist/main.js dotenv_config_path=.env.production
}

# Run main function with error handling
if ! main; then
    log "error" "Deployment failed"
    exit 1
fi

# Note: This script will remain running. Stop it with Ctrl+C or by killing the process. 