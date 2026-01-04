const express = require('express');
const FreeVideo = require('../models/FreeVideo');
const router = express.Router();

// Get free videos for homepage
router.get('/free-videos', async (req, res) => {
    try {
        const freeVideos = await FreeVideo.find().sort({ createdAt: -1 }).limit(10);
        res.json(freeVideos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
