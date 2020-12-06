const express = require('express');
const router = express.Router(); 

router.get('/', (request, response) => {
	response.render('AddOpenSource');
})

module.exports = router;