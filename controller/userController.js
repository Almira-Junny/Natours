const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const fileSize = Number(req.headers['content-length']);
  if (file.mimetype.startsWith('image') && fileSize <= 5000000) {
    cb(null, true);
  } else if (fileSize > 5000000) {
    cb(new AppError('File size is too big', 400), false);
  } else {
    cb(new AppError('Please use correct image format', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const deletePhotoFromServer = catchAsync(async (photo) => {
  if (photo.startsWith('default')) return;
  const path = `${__dirname}/../public/img/users/${photo}`;
  await fs.unlink(path, (err) => {
    if (err) return console.log(err);
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  let photo;
  //Check if user try to change password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Can't update password with this route. Please use /updatePassword",
        400,
      ),
    );
  }

  const { name, email } = req.body;

  if (req.file) {
    photo = req.file.filename;
    await deletePhotoFromServer(req.user.photo);
  }

  //Check if input data is empty
  if (!(name || email || photo)) {
    return next(new AppError("There's nothing to update", 400));
  }

  //Update data
  const user = await User.findById(req.user.id);
  if (name) user.name = name;
  if (email) user.email = email;
  if (photo) user.photo = photo;

  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
  });
});

exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
};
