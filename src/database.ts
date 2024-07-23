// Define the Reading type
type Reading = {
  timestamp: number;
  name: string;
  value: number;
};

// In-memory storage for readings
const readings: Reading[] = [];

// Function to add a reading to the in-memory storage
export const addReading = (reading: Reading) => {
  readings.push(reading);
};

// Function to get readings within a specified date range
export const getReadings = (from: Date, to: Date): Reading[] => {
  return readings.filter(
    (reading) =>
      new Date(reading.timestamp * 1000) >= from &&
      new Date(reading.timestamp * 1000) <= to
  );
};

// Function to calculate daily power based on readings
export const calculateDailyPower = (readings: Reading[]): { [date: string]: number } => {
  const dailyReadings: { [date: string]: { current: number[]; voltage: number[] } } = {};

  // Group readings by date and type (current or voltage)
  readings.forEach((reading) => {
    const date = new Date(reading.timestamp * 1000).toISOString().split('T')[0];
    if (!dailyReadings[date]) {
      dailyReadings[date] = { current: [], voltage: [] };
    }
    if (reading.name === 'Current') {
      dailyReadings[date].current.push(reading.value);
    } else if (reading.name === 'Voltage') {
      dailyReadings[date].voltage.push(reading.value);
    }
  });

  // Calculate average power for each day
  const dailyPower: { [date: string]: number } = {};
  for (const date in dailyReadings) {
    const currents = dailyReadings[date].current;
    const voltages = dailyReadings[date].voltage;
    const avgCurrent = currents.reduce((a, b) => a + b, 0) / currents.length;
    const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
    dailyPower[date] = avgCurrent * avgVoltage;
  }

  return dailyPower;
};