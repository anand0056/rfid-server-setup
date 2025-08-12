# RFID Cards API Tests

This document describes the comprehensive test suite for the RFID Cards API functionality.

## Test Structure

### 1. Service Unit Tests (`src/services/rfid-cards.service.spec.ts`)
Tests all service layer functionality including:
- Tenant overview retrieval
- Cards, readers, staff, and vehicles data retrieval
- Filtering and statistics
- CRUD operations

### 2. Controller Unit Tests (`src/controllers/rfid-card.controllers.spec.ts`)
Tests all controller endpoints including:
- Parameter handling and validation
- Data transformation
- Error handling
- Response formatting

### 3. End-to-End Tests (`test/rfid-cards.e2e-spec.ts`)
Tests complete API functionality with database integration:
- All API endpoints
- Database operations
- Request/response validation
- Error scenarios

## Available Test Scripts

### Individual Test Suites
```bash
# Run service unit tests only
npm run test:rfid-cards

# Run controller unit tests only
npm run test:rfid-cards:controller

# Run end-to-end tests only (requires database)
npm run test:rfid-cards:e2e

# Run all RFID cards unit tests (service + controller)
npm run test:rfid-cards:all
```

### Development & Monitoring
```bash
# Watch mode for continuous testing during development
npm run test:rfid-cards:watch

# Generate coverage report for RFID cards tests
npm run test:rfid-cards:coverage
```

### Standard Jest Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run all end-to-end tests
npm run test:e2e
```

## Test Coverage

### API Endpoints Tested
- `GET /api/rfid/cards` - Get all cards with filters
- `GET /api/rfid/cards/tenant/:tenantId/overview` - Complete tenant overview
- `GET /api/rfid/cards/tenant/:tenantId/type/:type` - Cards by type (staff/vehicle)
- `GET /api/rfid/cards/tenant/:tenantId/unassigned` - Unassigned cards
- `GET /api/rfid/cards/tenant/:tenantId/stats` - Tenant statistics
- `GET /api/rfid/cards/reader/:readerId` - Reader with associated cards
- `GET /api/rfid/cards/:uid` - Get card by UID
- `POST /api/rfid/cards` - Create new card
- `PUT /api/rfid/cards/:uid` - Update card
- `DELETE /api/rfid/cards/:uid` - Delete card

### Test Scenarios
- ✅ Valid inputs and responses
- ✅ Invalid parameters and error handling
- ✅ Database operations and data integrity
- ✅ Query parameter filtering
- ✅ Data transformation and mapping
- ✅ Async operations and promises
- ✅ Mock repository interactions
- ✅ Edge cases and null handling

## Prerequisites for E2E Tests

The end-to-end tests require a database connection. Make sure to:

1. Have MySQL running
2. Set up environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=rfid_test_db
   ```
3. The test database will be automatically set up and cleaned up during tests

## Test Data

Tests use comprehensive mock data including:
- Test tenants, staff, vehicles, cards, and readers
- Various card types (staff, vehicle, unassigned)
- Different reader states (online/offline)
- Edge cases and boundary conditions

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies (except database for E2E)
- Deterministic results
- Proper cleanup and isolation
- Fast execution times
