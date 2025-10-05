const express = require('express');
var router = express.Router();
const api_line_configurations = require('../controllers/api_line_configurations');

router.post('/', api_line_configurations.createLine);
router.get('/', api_line_configurations.getLines);
router.get('/:id', api_line_configurations.getLine);
router.patch('/:id', api_line_configurations.updateLine);
router.delete('/:id', api_line_configurations.deleteLine);

module.exports = router;