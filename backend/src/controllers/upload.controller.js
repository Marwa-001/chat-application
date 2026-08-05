async function uploadFiles(req, res, next) {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "No files provided" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const attachments = files.map((f) => {
      let type = "file";
      if (f.mimetype.startsWith("image/")) type = "image";
      else if (f.mimetype.startsWith("video/")) type = "video"; // NEW

      return {
        url: `${baseUrl}/uploads/${f.filename}`,
        name: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
        type,
      };
    });

    res.status(201).json({ attachments });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFiles };