import express, { Express } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { addReading, getReadings, calculateDailyPower } from './database';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// POST /data endpoint to receive and store readings
app.post('/data', async (req, res) => {
  const data = req.body;
  const lines = data.split('\n');
  const readings = [];

  // Parse each line and validate the format
  for (const line of lines) {
    const parts = line.split(' ');
    if (parts.length !== 3) {
      return res.json({ success: false });
    }
    const [timestamp, name, value] = parts;
    if (isNaN(Number(timestamp)) || isNaN(Number(value))) {
      return res.json({ success: false });
    }
    readings.push({ timestamp: Number(timestamp), name, value: Number(value) });
  }

  // Add valid readings to the database
  readings.forEach(addReading);
  return res.json({ success: true });
});

// GET /data endpoint to retrieve readings within a date range
app.get('/data', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.json({ success: false });
  }

  const fromDate = new Date(from as string);
  const toDate = new Date(to as string);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.json({ success: false });
  }

  // Retrieve readings and calculate daily power
  const readings = getReadings(fromDate, toDate);
  const dailyPower = calculateDailyPower(readings);

  // Format the result
  const result = readings.map((reading) => ({
    time: new Date(reading.timestamp * 1000).toISOString(),
    name: reading.name,
    value: reading.value,
  }));

  // Add daily power readings to the result
  for (const date in dailyPower) {
    result.push({
      time: new Date(date).toISOString(),
      name: 'Power',
      value: dailyPower[date],
    });
  }

  return res.json(result);
});

// Start the server
app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));