import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (to allow local testing and frontend communication)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SafeDrive ESP32 Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ESP32 Sensor Data Receiver Endpoint
app.post('/api/sensor-data', (req, res) => {
  try {
    const sensorData = req.body;

    // Log the received data to the terminal console
    console.log('[ESP32 Data Received]:', JSON.stringify(sensorData, null, 2));

    // Send a success response back to the ESP32
    res.status(201).json({
      status: 'success',
      message: 'Sensor data received successfully',
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process sensor data'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`- Health Check: http://localhost:${PORT}/`);
  console.log(`- Sensor Data Endpoint: http://localhost:${PORT}/api/sensor-data (POST)`);
});
