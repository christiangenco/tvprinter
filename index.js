const express = require("express");
const multer = require("multer");
const convert = require("heic-convert");
const sharp = require("sharp");
const fs = require("fs");
const { execSync } = require("child_process");

const app = express();
const port = 9424;

// Configure multer for image upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  if (req.file) {
    const originalImagePath = `inbox/${req.file.originalname}`;
    const resizedImagePath = "outbox/image.resized.jpg";
    const skewedImagePath = "outbox/image.skewed.jpg";

    console.log(originalImagePath);

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

      // Resize image and output as JPEG
      // resize([width], [height], [options])
      await sharp(path)
        .resize(852, 658, {
          // cover, contain, fill, inside or outside
          fit: "contain",
          // top, right top, right, right bottom, bottom, left bottom, left, left top.
          position: "bottom",
          background: "#fff",
        })
        .toFile(resizedImagePath);

      // Resize and rotate the image by 45 degrees and output as JPEG
      // we might actually want affine here for skewing: https://sharp.pixelplumbing.com/api-operation#affine
      await sharp(path)
        .resize(500, null, {
          // cover, contain, fill, inside or outside
          fit: "contain",
          // top, right top, right, right bottom, bottom, left bottom, left, left top.
          position: "center",
          background: "#fff",
        })
        // rotating with white background
        .rotate(45, { background: "#fff" })
        // add pixels
        .extend({
          top: 500,
          bottom: 500,
          left: 500,
          right: 500,
          background: "#fff",
        })
        .toFile(skewedImagePath);

      execSync(`open outbox`);

      console.log("Image processed and saved successfully.");
      res.status(200).send("Image processed and saved successfully.");
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
