# API Documentation — Walnut Folks Assessment

Base URL: `http://localhost:4000`

## 1. Health Check

**GET** `/health`

Checks whether the API and database are running.

Success: `200 OK`

## 2. Create Account

**POST** `/accounts`

Request body:

```json
{
  "name": "Test Account",
  "initialBalance": 1000
}
```

Success: `201 Created`

Errors: `400 Bad Request`, `500 Internal Server Error`

## 3. Retrieve Account

**GET** `/accounts/:id`

Example: `/accounts/dce91269-d6af-456d-acf0-d41cd33416bb`

Success: `200 OK`

Error: `404 Not Found` if the account does not exist.

## 4. Create Transaction

**POST** `/transactions/:accountId`

Request body for a deposit:

```json
{
  "type": "DEPOSIT",
  "amount": 200,
  "description": "Test deposit",
  "referenceId": "deposit-001"
}
```

For a withdrawal, use `"type": "WITHDRAWAL"`.

Success: `201 Created`

Possible errors:
- `400 Bad Request` — invalid request or insufficient funds
- `404 Not Found` — account not found
- `409 Conflict` — duplicate reference ID

## 5. Get Transaction History

**GET** `/transactions/:accountId?page=1&limit=10`

Returns transactions newest first, with pagination information.

Success: `200 OK`

Response includes:
- `transactions`
- `pagination.page`
- `pagination.limit`
- `pagination.total`
- `pagination.totalPages`

## Transaction Integrity

- Balance updates and transaction creation are performed atomically.
- Withdrawals cannot exceed the available balance.
- Duplicate reference IDs are rejected for the same account.
- Existing transactions should not be modified or deleted through the API.

## Assumptions

- Amounts must be positive.
- Account names are required.
- Reference IDs are unique per account.
- Transaction history is sorted by creation time, newest first.
- The API uses `DEPOSIT` and `WITHDRAWAL` as transaction types.
- Money transfer is an optional bonus feature and is not documented as implemented.
