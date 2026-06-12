require("dotenv").config();

const { createSignature } = require("./signature");

const payload = {
  eventId: "evt_001",
  eventType: "payment.succeeded",
  providerPaymentId: "mock_pay_64f6056b-da7f-4c9d-a748-dc9bfb40005d",
  status: "paid",
};

const signature = createSignature(payload, process.env.WEBHOOK_SECRET);

console.log("Payload:");
console.log(JSON.stringify(payload, null, 2));
console.log("\nSignature:");
console.log(signature);