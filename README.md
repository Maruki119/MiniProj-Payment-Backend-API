# Secure Payment Backend Demo API

A backend demo project that simulates a secure payment workflow using Node.js, Express.js, MySQL, and Stripe Test Mode.

This project was built to demonstrate backend development skills for payment-related systems, including order creation, payment creation, Stripe PaymentIntent integration, webhook handling, idempotency, database transactions, structured logging, and payment event tracking.

## Project Overview

This system allows users to create an order, create a payment request, confirm payment through a simple frontend using Stripe Payment Element, and update local order/payment status through Stripe webhooks.

The project supports both:

* Mock payment gateway flow
* Stripe Test Mode integration

The mock gateway is useful for local/offline testing, while Stripe Test Mode demonstrates integration with a real payment gateway sandbox.

## Key Features

* Create order API
* Create mock payment API
* Create Stripe PaymentIntent API
* Simple frontend checkout page using Stripe Payment Element
* Stripe webhook handling with signature verification
* Idempotency key logic to prevent duplicate payment creation
* MySQL database transaction for payment status updates
* Payment event logging for audit trail
* Structured application logging using Pino
* Centralized error handling
* Request validation using Zod
* Environment-based configuration using dotenv

## Tech Stack

* Node.js
* Express.js
* MySQL
* Stripe API
* Stripe CLI
* Stripe.js
* Pino Logger
* Zod
* HTML / CSS / JavaScript

## System Flow

### Stripe Payment Flow

1. User opens the frontend checkout page.
2. User creates an order.
3. Backend creates a Stripe PaymentIntent.
4. Frontend renders Stripe Payment Element using the PaymentIntent client secret.
5. User confirms payment using Stripe test card.
6. Stripe sends webhook event to the local backend through Stripe CLI.
7. Backend verifies the Stripe webhook signature.
8. Backend updates payment and order status using a database transaction.
9. Backend stores the webhook event in the `payment_events` table.

## API Endpoints

### Health Check

```http
GET /health
```

### Config

```http
GET /api/config
```

Returns the Stripe publishable key for frontend use.

### Orders

```http
POST /api/orders
GET /api/orders/:id
```

Example request:

```json
{
  "customerName": "Amp",
  "amount": 100
}
```

### Mock Payment

```http
POST /api/payments/create
GET /api/payments/:id
POST /api/payments/webhook
```

### Stripe Payment

```http
POST /api/payments/stripe/create
POST /api/payments/stripe/webhook
```

Example request:

```json
{
  "orderId": 1,
  "idempotencyKey": "order-1-stripe-pay-001"
}
```

## Database Tables

### orders

Stores customer orders and local order status.

Main statuses:

* `created`
* `pending_payment`
* `paid`
* `cancelled`

### payments

Stores payment records from mock gateway or Stripe.

Main statuses:

* `pending`
* `processing`
* `paid`
* `failed`
* `cancelled`
* `refunded`

### payment_events

Stores webhook events for payment tracking and audit purposes.

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=payment_demo

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CURRENCY=thb

WEBHOOK_SECRET=your_mock_webhook_secret
```

Do not commit `.env` to GitHub.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup MySQL database

Run the SQL script:

```bash
mysql -u root -p < sql/schema.sql
```

If the `payments` table does not have `provider_status`, run:

```sql
ALTER TABLE payments
ADD COLUMN provider_status VARCHAR(100) NULL;
```

### 3. Run backend server

```bash
npm run dev
```

Server will run at:

```text
http://localhost:3000
```

### 4. Open frontend

```text
http://localhost:3000
```

## Stripe CLI Webhook Testing

Open another terminal and run:

```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

Copy the webhook signing secret from Stripe CLI:

```text
whsec_xxxxxxxxx
```

Then update `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

Restart the backend after changing `.env`.

## Stripe Test Card

Use Stripe test card:

```text
Card number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
Country: Thailand
```

## Logging

This project uses two types of logging:

### Application Logging

Application logs are handled by Pino. Logs can be printed in the terminal or written to:

```text
logs/app.log
```

The `logs/` folder should not be committed to GitHub.

### Payment Event Logging

Important payment events from mock gateway and Stripe webhook are stored in the `payment_events` table.

This provides a simple audit trail for payment status updates.

## Security Considerations

* This project uses Stripe Test Mode only.
* No real cardholder data is stored in the local database.
* Stripe.js is used on the frontend to collect payment details securely.
* Stripe webhook signature verification is required.
* Secrets are stored in environment variables.
* Sensitive data such as card numbers, CVC, passwords, and secret keys should never be logged.
* Idempotency keys are used to prevent duplicate payment creation.
* Database transactions are used when updating payment and order status.

## What I Learned

* How payment backend systems handle order and payment status
* How to create Stripe PaymentIntents from a backend API
* How to confirm payment using Stripe Payment Element
* How to receive and verify Stripe webhook events
* How to prevent duplicate payment creation using idempotency keys
* How to update related database records safely using transactions
* How to store payment event logs for tracking and auditability
* How to design backend services with reliability and security awareness

## Future Improvements

* Add user authentication
* Add refund flow
* Add failed payment retry flow
* Add unit tests and integration tests
* Add Docker Compose for MySQL
* Add rate limiting
* Add OpenAPI / Swagger documentation
* Add admin page for viewing orders, payments, and events
* Deploy backend to a cloud platform
