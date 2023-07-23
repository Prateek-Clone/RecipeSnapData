const express = require("express");
const Recipes = require("../Models/recipeModel");

const router = express.Router();

// Get Recipe by querry
router.get("/", async (req, res) => {
  try {
    const {
      title,
      category,
      time,
      include,
      exclude,
      sort,
      limit = 10,
      page = 1,
    } = req.query;

    let query = {};

    // Search by title
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    // Filter by time
    if (time) {
      query.time = { $lte: time };
    }

    // Filter by ingredients inclusion
    if (include) {
      query["ingredients.ingredient"] = {
        $in: Array.isArray(include) ? include : [include],
      };
    }

    // Filter by ingredients exclusion
    if (exclude) {
      query["ingredients.ingredient"] = {
        $nin: Array.isArray(exclude) ? exclude : [exclude],
      };
    }

    let sortOptions = {};

    // Sorting options
    if (sort === "asc") {
      sortOptions.title = 1;
    } else if (sort === "desc") {
      sortOptions.title = -1;
    } else if (sort === "rec") {
      sortOptions["totalLength"] = 1;
    }

    const totalRecipes = await Recipes.countDocuments(query);
    const totalPages = Math.ceil(totalRecipes / limit);
    const skipRecipes = (page - 1) * limit;

    // Aggregation to calculate totalLength and sort based on it
    const recipes = await Recipes.aggregate([
      { $match: Object.keys(query).length === 0 ? {} : query },
      {
        $addFields: {
          totalLength: {
            $add: [{ $strLenCP: "$title" }, { $strLenCP: "$description" }],
          },
        },
      },
      {
        $sort: Object.keys(sortOptions).length === 0 ? { _id: 1 } : sortOptions,
      },
      { $skip: skipRecipes },
      { $limit: parseInt(limit) },
    ]);

    res.json({ recipes, totalPages, currentPage: page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Data By Id
router.get("/single/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipes.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Post Route For Comment
router.post("/comment/:recipeId", async (req, res) => {
  try {
    const { name, email, content, rating } = req.body;
    const recipeId = req.params.recipeId;

    // Validate request body fields
    if (!name || !email || !content || rating === undefined) {
      return res.status(400).json({
        error: "Name, email, content, and rating are required fields.",
      });
    }

    // Check if the recipe exists in the database
    const recipe = await Recipes.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    // Add the new comment and rating to the recipe
    const newComment = {
      name: name,
      email: email,
      content: content,
      rating: rating,
    };

    recipe.comments.push(newComment);
    await recipe.save();

    res.json({
      message: "Comment and rating added successfully.",
      recipe: recipe,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while adding the comment and rating.",
    });
  }
});

module.exports = router;
