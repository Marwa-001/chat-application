const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  sendMessage, getMessages, editMessage, deleteMessage,
  togglePin, addReaction, removeReaction, getMyMentions, searchMessages,
} = require("../controllers/message.controller");

router.use(auth);

router.get("/mentions/me", getMyMentions);
router.get("/search", searchMessages);

router.post("/", sendMessage);
router.get("/:channelId", getMessages);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/:messageId/pin", togglePin);
router.post("/:messageId/reactions", addReaction);
router.delete("/:messageId/reactions", removeReaction);

module.exports = router;