const express = require('express');
const notify = require('../controllers/notification')


const router = express();



router.post('/', notify.AddNotification);
router.get('/:driverId', notify.GetAllNotification);
router.get('/userNotification/:userId', notify.GetAllNotificationForUser);
router.get('/get/:id', notify.GetBYNotifyID);
router.delete('/delete/:id', notify.deleteNotification);



module.exports = router;