const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = process.cwd() + "/public/assets/";
    const foldersToCreate = [destinationFolder + "profiles/", destinationFolder + "img/", destinationFolder + "documents/"];
    for (const folder of foldersToCreate) {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    }
    if (file.fieldname === "profileImage") {
      destinationFolder += "profiles/";
    } else if (file.fieldname === "productImage") {
      destinationFolder += "img/";
    } else if (file.fieldname === "identification" || file.fieldname === "proofOfAddress" || file.fieldname === "bankStatement") {
      destinationFolder += "documents/";
    } else {
      return cb(new Error("Tipo de archivo no válido"));
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const uploader = multer({ storage });

module.exports = uploader;
