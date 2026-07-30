const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { getMyChannels, createDM, createGroup, markAsRead } = require("../controllers/channel.controller");

router.use(auth); // all channel routes require login

router.get("/", getMyChannels);
router.post("/dm", createDM);
router.post("/group", createGroup);
router.post("/:channelId/read", markAsRead);

module.exports = router;