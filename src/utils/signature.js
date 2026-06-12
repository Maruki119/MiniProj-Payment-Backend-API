const crypto = require("crypto");

function createSignature(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

function verifySignature(payload, signature, secret) {
  const expectedSignature = createSignature(payload, secret);

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

module.exports = {
  createSignature,
  verifySignature,
};