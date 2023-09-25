const mongoose = require('mongoose');
const slugify = require('slugify');

const tourScheme = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
      maxLength: [30, 'A tour name must have less or equal than 30 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is easy - medium - difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above or equal 1.0'],
      max: [5.0, 'Rating must be below or equal 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this point to new document, only work with posting new document
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price must be less than regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: () => Date.now(),
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

tourScheme.index({ price: 1, ratingsAverage: -1 });

tourScheme.index({ startLocation: '2dsphere' });

tourScheme.virtual('durationWeek').get(function () {
  if (this.duration) return this.duration / 7;
});

tourScheme.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourScheme.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourScheme.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourScheme.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

tourScheme.pre('aggregate', function (next) {
  if (!Object.keys(this.pipeline()[0])[0] === '$geoNear') {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
  }
  next();
});

const Tour = mongoose.model('Tour', tourScheme);

module.exports = Tour;
