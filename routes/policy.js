const express = require('express'); 
const policyControllers = require('../controllers/privacy');

const router = express();



router.post('/',[  policyControllers.addPrivacy]);
router.get('/',[  policyControllers.getPrivacy]);
router.put('/:id',[ policyControllers.updatePolicy]);
router.delete('/:id',[ policyControllers.DeletePolicy])


module.exports = router;