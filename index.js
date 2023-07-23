const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const recipeRoutes = require("./Routes/recipeRoutes");

require("dotenv").config();

const dbUrl = process.env.DBURL;
const PORT = process.env.PORT || 8081;

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB :", dbUrl);
  });

app.use("/recipes", recipeRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
