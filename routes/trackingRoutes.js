const express = require('express');
const router = express.Router();
const { getTrackingInfo } = require('../controllers/trackingController');

router.get('/:trackingId', getTrackingInfo);

module.exports = router;

