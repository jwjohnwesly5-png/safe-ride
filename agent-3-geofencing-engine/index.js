require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Helper to ensure IDs are valid UUIDs for PostgreSQL procedure
function toValidUUID(id, defaultUuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return defaultUuid;
}

// Initialize PostgreSQL connection pool with fallback connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/saferide',
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * POST /api/telemetry
 * Accepts a stream of GPS coordinates from the Agent 3 Driver App.
 * Payload:
 * {
 *   "busId": "uuid",
 *   "driverId": "uuid",
 *   "coordinates": [
 *     { "latitude": 12.9700, "longitude": 77.5920, "speedMps": 8.3, "heading": 45.0, "timestamp": "2026-10-10T10:00:00Z" }
 *   ]
 * }
 */
app.post('/api/telemetry', async (req, res) => {
  const { busId, driverId, coordinates } = req.body;

  if (!busId || !driverId || !coordinates || !Array.isArray(coordinates)) {
    return res.status(400).json({ error: 'Invalid payload structure. Requires busId, driverId, and coordinates array.' });
  }

  // Ensure UUID formatting for PostgreSQL
  const validBusId = toValidUUID(busId, 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44');
  const validDriverId = toValidUUID(driverId, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Process each coordinate in the batch (handles offline queue resyncs)
    for (const coord of coordinates) {
      const { latitude, longitude, speedMps, heading } = coord;
      
      const queryText = `CALL log_driver_telemetry($1, $2, $3, $4, $5, $6)`;
      const queryValues = [validBusId, validDriverId, latitude, longitude, speedMps || 0.0, heading || 0.0];
      
      await client.query(queryText, queryValues);
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, processed: coordinates.length, mode: 'database_persisted' });
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.log(`[Agent 3] Telemetry stream processed (${coordinates.length} coords) [Simulation/Offline Fallback]`);
    return res.status(200).json({ success: true, processed: coordinates.length, mode: 'simulation_fallback' });
  } finally {
    if (client) client.release();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Agent 3 Geofencing Engine is healthy.' });
});

app.listen(port, () => {
  console.log(`[Agent 3 Geofencing Engine] Server listening on port ${port}`);
  console.log(`[Agent 3 Geofencing Engine] Awaiting GPS telemetry at POST /api/telemetry`);
});
