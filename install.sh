#!/bin/bash

# RFID Server Auto Installation Script
echo "🚀 Starting RFID Server Auto Installation..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# echo "🗑️ Removing old images..."
# docker-compose down --rmi all -v 2>/dev/null || true

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
timeout=300
counter=0
while ! docker exec rfid_mysql mysqladmin ping -h localhost --silent; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "❌ MySQL failed to start within $timeout seconds"
        exit 1
    fi
    echo "Waiting... ($counter/$timeout seconds)"
done

echo "✅ MySQL is ready!"

# Check service status
echo "📊 Checking service status..."
sleep 5

# Display container status
docker-compose ps

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "📱 Access your services:"
echo "   Frontend (Next.js): http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   MySQL Database: localhost:3306"
echo "   MQTT Broker: localhost:1883"
echo ""
echo "🔑 Database Credentials:"
echo "   Username: rfid"
echo "   Password: rfidpass"
echo "   Database: rfid_db"
echo ""
echo "📝 MQTT Topics:"
echo "   RFID Scans: rfid/scan"
echo "   Reader Heartbeat: rfid/heartbeat"
echo "   Reader-specific: rfid/{reader_id}/scan"
echo ""
echo "🔄 To stop all services: docker-compose down"
echo "🔄 To restart services: docker-compose restart"
echo "📋 To view logs: docker-compose logs -f [service_name]"
echo ""
echo "📖 Sample RFID scan payload:"
echo '   {"card_uid": "A1B2C3D4", "reader_id": "READER_001", "event_type": "entry"}'
