const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  sendMessage, getMessages, editMessage, deleteMessage,
  togglePin, addReaction, removeReaction,
} = require("../controllers/message.controller");

router.use(auth);

router.post("/", sendMessage);
router.get("/:channelId", getMessages);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/:messageId/pin", togglePin);
router.post("/:messageId/reactions", addReaction);
router.delete("/:messageId/reactions", removeReaction);

module.exports = router;