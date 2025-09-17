const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'data', 'events.json');

// Utility: read events
async function readEvents() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    throw err;
  }
}

// Utility: write events
async function writeEvents(events) {
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2));
}

// ✅ Root route (health check)
app.get('/', (req, res) => {
  res.send('Event API is running ✅');
});

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await readEvents();
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to read events' });
  }
});

// POST new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description = '', date, location, maxAttendees } = req.body;

    if (!title || !date || !location || !maxAttendees) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (isNaN(maxAttendees) || maxAttendees <= 0) {
      return res.status(400).json({ error: 'maxAttendees must be a positive integer' });
    }

    const events = await readEvents();

    const newEvent = {
      eventId: `EVT-${Date.now()}`,
      title,
      description,
      date,
      location,
      maxAttendees: Number(maxAttendees),
      currentAttendees: 0,
      status: 'upcoming'
    };

    events.push(newEvent);
    await writeEvents(events);

    res.status(201).json(newEvent);
  } catch {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));