const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { searchUsers, getUserById } = require("../controllers/user.controller");

router.use(auth);

router.get("/", searchUsers);
router.get("/:userId", getUserById);

module.exports = router;