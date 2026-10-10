require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
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

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Process each coordinate in the batch (handles offline queue resyncs)
    for (const coord of coordinates) {
      const { latitude, longitude, speedMps, heading } = coord;
      
      // Execute the PostGIS stored procedure defined in spatial_queries.sql
      // This procedure updates the bus location and handles ST_DWithin geofence intersection 
      // logic, automatically emitting 'GEOFENCE_ARRIVAL' to transit_events.
      const queryText = `CALL log_driver_telemetry($1, $2, $3, $4, $5, $6)`;
      const queryValues = [busId, driverId, latitude, longitude, speedMps || 0.0, heading || 0.0];
      
      await client.query(queryText, queryValues);
    }

    await client.query('COMMIT');
    return res.status(200).json({ success: true, processed: coordinates.length });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Agent 3] Error processing telemetry:', error);
    return res.status(500).json({ error: 'Internal Server Error processing telemetry.' });
  } finally {
    client.release();
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
