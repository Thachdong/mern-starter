require("dotenv").config();
require("./middlewares/passport");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");

const app = express();

//Connect to mongodb using mongoose package
mongoose
  .connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => console.log("Mongodb connected"))
  .catch(error => console.log(error))
//Top middlewares
app.use(
  cors(),
  express.json(),
  express.urlencoded({extended: true})
)
//Routes
app.use("/user", userRoutes);
//App listening
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`))