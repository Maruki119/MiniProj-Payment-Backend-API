# Secure Payment Backend Demo API

A backend demo project that simulates a payment system using Node.js, Express.js, and MySQL.

## Key Features

- Order creation API
- Payment creation API
- Mock payment gateway flow
- Webhook handler with HMAC signature verification
- Idempotency key to prevent duplicate payment creation
- MySQL transaction for payment status updates
- Payment event logging
- Centralized error handling
- Structured application logging

## Tech Stack

- Node.js
- Express.js
- MySQL
- mysql2
- Zod
- Pino Logger

## Payment Flow

1. Create an order
2. Create a payment using an idempotency key
3. Mock gateway sends webhook
4. Backend verifies webhook signature
5. Backend updates payment and order status using a database transaction

## Security Considerations

- This project does not store real cardholder data.
- Webhook requests are verified using HMAC signature.
- Sensitive configuration is stored in environment variables.
- Structured logs should not include sensitive data.
- Idempotency keys help prevent duplicate payment creation.

## How to Run

```bash
npm install
npm run dev