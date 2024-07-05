const express = require("express");
const multer = require("multer");
const convert = require("heic-convert");
const sharp = require("sharp");
const fs = require("fs");
const app = express();
const port = 3000;

// Configure multer for image upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req);
  if (req.file) {
    console.log(req.file);
    const originalImagePath = `inbox/${req.file.originalname}`;
    const resizedImagePath = "image.resized.jpg";
    const skewedImagePath = "image.skewed.jpg";

    try {
      // Save original image

      let path = originalImagePath;
      if (originalImagePath.endsWith(".heic")) {
        await convert({
          buffer: req.file.buffer, // the HEIC file buffer
          format: "JPEG", // output format
          quality: 1, // the jpeg output quality, optional, default is 1
        }).then((jpgBuffer) => {
          path = originalImagePath.replace(".heic", ".jpg");
          fs.writeFileSync(path, jpgBuffer);
        });
      } else {
        fs.writeFileSync(originalImagePath, req.file.buffer);
      }

      // console.log("buffer", req.file.buffer);
      // await sharp(req.file.buffer).toFile(originalImagePath);

      // Resize the image to 100x100 pixels and output as JPEG
      await sharp(path).resize(100, 100).toFile(resizedImagePath);

      // Skew the image by 45 degrees and output as JPEG
      await sharp(path)
        .rotate(45, { background: "#fff" }) // rotating by 45 degrees with white background
        .toFile(skewedImagePath);

      res.status(200).send("Images processed and saved successfully.");
    } catch (error) {
      console.error("Error processing images:", error);
      res.status(500).send("Error processing images");
    }
  } else {
    res.status(400).send("No image uploaded.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
