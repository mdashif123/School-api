const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

/* -------- ADD SCHOOL API -------- */
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || latitude == null || longitude == null) {
        return res.status(400).json({ message: "All fields required" });
    }

    const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

    db.query(query, [name, address, latitude, longitude], (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "School added successfully" });
    });
});

/* -------- DISTANCE FUNCTION -------- */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* -------- LIST SCHOOL API -------- */
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude & Longitude required" });
    }

    db.query("SELECT * FROM schools", (err, results) => {
        if (err) return res.status(500).json(err);

        const sorted = results.map(s => {
            const distance = getDistance(latitude, longitude, s.latitude, s.longitude);
            return { ...s, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sorted);
    });
});

/* -------- TEST ROUTE -------- */
app.get('/', (req, res) => {
    res.send("API is running");
});

/* -------- SERVER START -------- */
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});