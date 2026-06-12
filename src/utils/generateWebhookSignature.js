require("dotenv").config();

const { createSignature } = require("./signature");

const payload = {
  eventId: "evt_002",
  eventType: "payment.succeeded",
  providerPaymentId: "mock_pay_41d368c1-938d-4ac9-baa2-06f859da1e3c",
  status: "paid",
};

const signature = createSignature(payload, process.env.WEBHOOK_SECRET);

console.log("Payload:");
console.log(JSON.stringify(payload, null, 2));
console.log("\nSignature:");
console.log(signature);