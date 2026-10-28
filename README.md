# Walnut Folks — Full Stack Developer Assessment

## Overview

A REST API for managing accounts and financial transactions using Node.js, Express, TypeScript, PostgreSQL, and Prisma.

The API supports account creation and retrieval, deposits, withdrawals, transaction history, pagination, and validation.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod validation

## Prerequisites

- Node.js and npm
- Docker Desktop
- PostgreSQL database configured using the environment variables

## Setup Instructions

1. Clone or download the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and configure `DATABASE_URL` with your PostgreSQL connection string.
4. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```

5. Generate the Prisma Client:

   ```bash
   npx prisma generate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:4000` by default.

## Build

```bash
npm run build
```

## API Documentation

### Health Check

`GET /health`

Checks API and database connectivity.

### Create Account

`POST /accounts`

Request body:

```json
{
  "name": "Test Account",
  "initialBalance": 1000
}
```

### Retrieve Account

`GET /accounts/:id`

Returns account details and the current balance.

### Create Transaction

`POST /transactions/:accountId`

Request body:

```json
{
  "type": "DEPOSIT",
  "amount": 200,
  "description": "Initial deposit",
  "referenceId": "deposit-001"
}
```

Use `WITHDRAWAL` for a withdrawal. Each reference ID must be unique for its account.

### Transaction History

`GET /transactions/:accountId?page=1&limit=10`

Returns transactions in latest-first order, with pagination metadata.

## Data Integrity and Error Handling

- Account balances are updated with transaction creation in a database transaction.
- Withdrawals exceeding the available balance are rejected.
- Duplicate reference IDs are rejected for the same account.
- Request data and pagination parameters are validated.
- Errors use appropriate HTTP status codes.

## Assumptions

- Account balances are represented as decimal monetary values.
- Amounts must be positive.
- Reference IDs are unique per account.
- Transaction history is ordered by creation time, newest first.
- Money transfers are an optional bonus feature.

## Limitations

The API is backend-only and does not include a frontend interface. Money transfer support must be confirmed separately.
