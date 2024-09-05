const redis = require("redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

module.exports = client;
