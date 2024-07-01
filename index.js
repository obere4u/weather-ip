const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// Middleware to get client IP
app.set("trust proxy", true);

const weatherKey = process.env.WEATHER_API_KEY;

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";

  const clientIp = req.ip;

  console.log("client IP is *********************" + clientIp);

  try {
    // Get location info based on IP
    const locationResponse = await axios.get(
      `http://ip-api.com/json/${clientIp}`
    );
    if (
      locationResponse.status !== 200 ||
      locationResponse.data.status === "fail"
    ) {
      throw new Error("Failed to get location information");
    }
    const location = locationResponse.data;

    // Get weather info
    const weatherResponse = await axios.get(
      `http://api.weatherapi.com/v1/current.json`,
      {
        params: {
          key: weatherKey,
          q: location.city,
        },
      }
    );
    if (weatherResponse.status !== 200) {
      throw new Error("Failed to get weather information");
    }
    const weather = weatherResponse.data;

    res.json({
      client_ip: clientIp,
      location: location.city,
      greeting: `Hello, ${visitorName}!, the temperature is ${weather.current.temp_c} degrees Celsius in ${location.city}`,
    });
  } catch (error) {
    console.error(error.message); // Log the error message for debugging
    res
      .status(500)
      .json({ error: "An error occurred", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
