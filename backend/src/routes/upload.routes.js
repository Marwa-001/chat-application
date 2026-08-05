const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadFiles } = require("../controllers/upload.controller");

router.use(auth);
router.post("/", upload.array("files", 10), uploadFiles);

module.exports = router;