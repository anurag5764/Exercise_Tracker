const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { get } = require("express/lib/response");
mongoose.connect(
  "mongodb+srv://anurag-123:cfR7D33ge*DZnkM@cluster0.wmkkjfp.mongodb.net/Exercise-Data?retryWrites=true&w=majority&appName=Cluster0"
);
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String },
});
const exerciseSchema = new Schema({
  user_id: { type: String, require: true },
  description: String,
  duration: Number,
  date: Date,
});
const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async function (req, res) {
  const userObj = await new User({
    username: req.body.username,
  });
  const user = await userObj.save();
  res.json({
    username: user.username,
    _id: user._id,
  });
});

app.post("/api/users/:_id/exercises", async function (req, res) {
  let id = req.params._id;
  const { description, duration, date } = req.body;
  const user = await User.findById(id);
  let exerciseObj = await new Exercise({
    user_id: user._id,
    description: description,
    duration: duration,
    date: date ? new Date(date) : new Date(),
  });
  const exercise = await exerciseObj.save();
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString(),
  });
});
app.get("/api/users", async function (req, res) {
  const users = await User.find({});
  res.json(users);
});
app.get("/api/users/:_id/exercises", async function (req, res) {
  let id = req.params._id;
  const user = await User.findById(id);
  let exercise = await Exercise.findOne({ user_id: id });
  //console.log(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: exercise.user_id,
  });
});
app.get("/api/users/:_id/logs", async function (req, res) {
  const { from, to, limit } = req.query;
  let id = req.params._id;
  const user = await User.findById(id);
  let exercise = await Exercise.findOne({ user_id: id });
  let dataObj = {};
  if (from) {
    dataObj["$gte"] = new Date(from);
  }
  if (to) {
    dataObj["$lte"] = new Date(to);
  }
  let filter = {
    user_id: id,
  };
  if (from || to) {
    filter.date = dataObj;
  }
  const data = await Exercise.find(filter).limit(+limit);
  const log = await data.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString(),
  }));
  res.json({
    username: user.username,
    count: data.length,
    _id: exercise.user_id,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
