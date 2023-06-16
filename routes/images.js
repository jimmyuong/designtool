const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesPath = '/volumes/JeminiPod/Documents/aboutworks/jimmy/src/assets/statics/';
const outputFolderPath = path.join(__dirname, '../statics/');


router.get('/', function(req, res, next) {
  res.render('images', { title: 'Images' });
});

router.get('/list', function(req, res, next) {
  fs.readdir(imagesPath, function(err, files) {
    if (err) {
      console.error('Error reading directory:', err);
      next(err);
      return;
    }

    const imageFiles = files.filter(function(file) {
      return /\.(jpg|png|webp)$/i.test(path.extname(file));
    });

    const imageInfo = [];

    imageFiles.forEach(function(file) {
      const imagePath = path.join(imagesPath, file);
      const imageStats = fs.statSync(imagePath);
      const imageBuffer = fs.readFileSync(imagePath);

      const imageMetadata = sharp(imageBuffer).metadata();
      const imageSize = imageStats.size;
      const imageDimensions = `${imageMetadata.width}x${imageMetadata.height}`;

      // 创建不同尺寸的图片
      const resizedImages = [
        { width: 640, suffix: 'x640' },
        { width: 1280, suffix: 'x1280' },
        { width: 1920, suffix: 'x1920' },
        { width: null, suffix: 'xOriginal' } // 原始尺寸
      ];

      resizedImages.forEach(function(resizedImage) {
        const { width, suffix } = resizedImage;
        const outputFolder = path.join(outputFolderPath, suffix);
        const outputName = path.basename(file, path.extname(file)) + suffix + '.webp';
        const outputPath = path.join(outputFolder, outputName);

        // 调整图片尺寸并保存为 WebP 格式
        sharp(imageBuffer)
          .resize(width)
          .toFormat('webp')
          .toFile(outputPath, function(err) {
            if (err) {
              console.error('Error converting image:', err);
            }
          });

        imageInfo.push({
          name: outputName,
          size: imageSize,
          suffix: suffix,
          dimensions: imageDimensions
        });
      });
    });

    res.render('images', { images: imageInfo });
  });
});



module.exports = router;
