# NNA Registry Service Testing

This directory contains tools and scripts for testing the NNA Registry Service API.

## Automated Test Script

The `api-tests.sh` script automates API testing by running a series of HTTP requests against the service and validating the responses.

### Prerequisites

- Bash shell
- `curl` command-line tool
- Running instance of the NNA Registry Service on `http://localhost:3000`

### Usage

1. Make the script executable:

```bash
chmod +x api-tests.sh
```

2. Run the script:

```bash
./api-tests.sh
```

The script will:
- Register test users
- Test authentication flows
- Create, retrieve, update, and delete assets
- Test taxonomy validation
- Verify storage functionality
- Check Swagger documentation

### Test Results

The script provides a summary of passed and failed tests at the end of execution.

## Postman Collection

For more interactive testing, a Postman collection is provided.

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed
- Running instance of the NNA Registry Service

### Import Instructions

1. Open Postman
2. Click "Import" in the upper left corner
3. Select the file `nna-registry-service.postman_collection.json`
4. Also import the environment: `nna-registry-service.postman_environment.json`
5. Select the "NNA Registry Service" environment from the dropdown in the upper right

### Running Tests

You can run individual requests or use the Collection Runner to execute all tests:

1. Click the "Runner" button in Postman
2. Select the "NNA Registry Service API" collection
3. Configure the run settings (iterations, delay, etc.)
4. Click "Run"

The tests are designed to be run in sequence, as later tests depend on data created in earlier tests.

## Adding New Tests

To add a new test to the automated script:

1. Add your test case to the `api-tests.sh` file
2. Follow the existing pattern using the `run_test` function
3. Update the Postman collection as needed

## E2E Testing

For full end-to-end testing, refer to the Jest E2E tests in `app.e2e-spec.ts` and related files. Run them with:

```bash
npm run test:e2e
```