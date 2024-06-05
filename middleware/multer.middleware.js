import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

// import multer from "multer";

// const storage = multer.memoryStorage();

// export const singleUpload = multer({ storage }).single("file");
