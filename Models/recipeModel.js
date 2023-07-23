const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
    description: {
      type: String,
    },
    comments: {
      type: [
        {
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          content: {
            type: String,
          },
          rating: {
            type: mongoose.Schema.Types.Mixed,
          },
        },
      ],
    },
    images: {
      type: [String],
    },
    ingredients: {
      type: [
        {
          ingredient: {
            type: String,
          },
          unit: {
            type: String,
          },
          quantity: {
            type: mongoose.Schema.Types.Mixed,
          },
        },
      ],
    },
    directions: {
      type: [String],
    },
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Recipe", recipeSchema);
