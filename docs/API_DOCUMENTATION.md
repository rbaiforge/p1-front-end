# Payment Processing API Documentation

## Overview
This API provides endpoints for processing and retrieving payment transactions for a given location. It is designed for serverless deployment on AWS Lambda and API Gateway.

---

## POST `/payment`

**Description:**
Create a new payment transaction for a location. Enforces location-wise concurrency (only one active transaction per location at a time). A new transaction is only allowed if the previous transaction for the location has been fetched via the GET endpoint (i.e., its `lastChecked` attribute is set).

### Request
- **Method:** POST
- **Path:** `/payment`
- **Content-Type:** `application/json`

#### Body Example
```json
{
  "uuid": "string (generated client-side)",
  "location": "string (from URL)",
  "amount": 123.45
}
```

### Responses
- **200 OK**
  ```json
  {
    "message": "Success",
    "transaction": {
      "uuid": "...",
      "location": "...",
      "amount": 123.45,
      "status": true,
      "logtime": "2024-06-01T12:00:00.000Z",
      "lastChecked": null
    }
  }
  ```
- **409 Conflict**
  ```json
  { "error": "Concurrent transaction exists for this location" }
  ```
- **400 Bad Request**
  ```json
  { "error": "Invalid input" }
  ```

---

## GET `/payment/status`

**Description:**
Retrieve the latest un-checked transaction for a location. Requires an authentication token. Once fetched, the transaction is marked as checked (the `lastChecked` attribute is set to the current time) and will not be returned again. Only transactions where `lastChecked` is not set are considered pending.

### Request
- **Method:** GET
- **Path:** `/payment/status`
- **Query Parameters:**
  - `location` (string, required): The location ID
  - `auth_token` (string, required): Authentication token (e.g., `super-secret-token`)

#### Example
```
GET /payment/status?location=store1&auth_token=super-secret-token
```

### Responses
- **200 OK**
  ```json
  {
    "uuid": "...",
    "location": "...",
    "amount": 123.45,
    "status": true,
    "logtime": "2024-06-01T12:00:00.000Z",
    "lastChecked": "2024-06-01T12:05:00.000Z"
  }
  ```
- **404 Not Found**
  ```json
  { "error": "Not found" }
  ```
- **401 Unauthorized**
  ```json
  { "error": "Unauthorized" }
  ```
- **400 Bad Request**
  ```json
  { "error": "Missing location or auth_token" }
  ```

---

## Concurrency Logic
- Only one pending transaction per location is allowed at a time.
- A new POST is only allowed if the previous transaction for the location has been fetched by GET (i.e., `lastChecked` is set).
- DynamoDB GSI is used to fetch the latest transaction for a location, sorted by `logtime` descending.
- The POST endpoint does **not** set `lastChecked` at all for new transactions; GET sets it when the transaction is fetched.

---

## Authentication
- The GET `/payment/status` endpoint requires a query parameter `auth_token`.
- The current token is: `super-secret-token` (replace with a secure value in production).

---

## DynamoDB Table Schema
- **Table Name:** PaymentTransactions
- **Partition Key:** uuid (String)
- **Attributes:**
  - uuid: String
  - location: String
  - amount: Number
  - status: Boolean
  - logtime: String (ISO 8601)
  - lastChecked: String (ISO 8601, only set after GET)
- **GSI:**
  - Name: location-logtime-index
  - Partition Key: location
  - Sort Key: logtime

---

## Error Handling
- All errors are returned as JSON with an `error` field and appropriate HTTP status code.

---

## Example cURL Requests

### Create Payment
```sh
curl -X POST https://<api-url>/payment \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "location": "store1",
    "amount": 100.0
  }'
```

### Get Payment Status
```sh
curl "https://<api-url>/payment/status?location=store1&auth_token=super-secret-token"
``` 