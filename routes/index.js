const fs = require('fs');
var express = require('express');
var router = express.Router();
const { createCanvas, loadImage } = require('canvas');
const admZip = require('adm-zip');
const filepix = require('filepix');

var deleteDirectory = __dirname + '/public/images/test';
var rimraf = require('rimraf');
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* FOR UPLOADING THE FILE */

/* FOR DOWNLOAD OF THE CERTIFICATES WHICH STORE FILES IN SERVER */
router.post('/downloads', (req, res) => {
  updateCanvas(req.body).then((buffer) => {
    var uploadDir = fs.readdirSync('./public/images/test');
    filepix.img2PDF(
      (pages = './public/images/test'),
      (output = './public/merge/output.pdf')
    );
    uploadDir.forEach((file) => {
      try {
        fs.unlinkSync('./public/images/test/' + file);
      } catch (err) {
        console.log(err);
      }
    });
    const zip = new admZip();
    var uploadDir = fs.readdirSync('./public/merge');
    uploadDir.forEach((file) => {
      zip.addLocalFile('./public/merge/' + file);
    });
    var downloadName = 'MergedCertificate-' + Date.now() + '.zip';
    const data = zip.toBuffer();
    zip.writeZip('./' + downloadName);
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${downloadName}`);
    res.set('Content-Length', data.length);
    res.send(data);
    try {
      fs.unlinkSync(`./${downloadName}`);

      console.log('Delete File successfully.');
    } catch (error) {
      console.log(error);
    }
  });
});

/* FOR MERGING AND DOWNLOADIND THE FILES */
router.post('/cert', function (req, res, next) {
  updateCanvas(req.body).then((buffer) => {
    var uploadDir = fs.readdirSync('./public/images/test');
    const zip = new admZip();
    uploadDir.forEach((file) => {
      zip.addLocalFile('./public/images/test/' + file);
    });
    var downloadName = 'Certiificates-' + Date.now() + '.zip';
    const data = zip.toBuffer();
    zip.writeZip('./' + downloadName);
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename=${downloadName}`);
    res.set('Content-Length', data.length);
    res.send(data);
    filepix.img2PDF(
      (pages = './public/images/test'),
      (output = './public/merge/output.pdf')
    );
    uploadDir.forEach((file) => {
      try {
        fs.unlinkSync('./public/images/test/' + file);
      } catch (err) {
        console.log(err);
      }
    });
    try {
      fs.unlinkSync(`./${downloadName}`);
      console.log('Delete File successfully.');
    } catch (error) {
      console.log(error);
    }
  });
});

var folderName = `./public/images/test`;

// DOWNLOAD FILE
async function updateCanvas(certificates) {
  const { template, textProps, csv } = certificates;
  const image = await loadImage(`public/templates/${template}`);
  var canvas = createCanvas(image.width, image.height);
  ctx = canvas.getContext('2d');
  createFolder();
  csv.map(async (certificate, index) => {
    ctx.drawImage(image, 0, 0);
    textProps.map((drawProperties, i) => {
      const { x, y, size } = drawProperties;
      console.log(drawProperties);
      const { title } = certificate[i];
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${size}pt Montserrat`;
      ctx.fillText(title, x, y);
    });
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`public/images/test/imi${index}.png`, buffer);
  });
}
function createFolder() {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = router;
