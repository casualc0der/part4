const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    likes: 1,
    title: 1,
    author: 1,
    url: 1,
  });
  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  if (!req.body.username || !req.body.name) {
    return res.status(401).json({
      error: "missing username or password",
    });
  }

  if (req.body.password.length < 3) {
    return res.status(401).json({
      error: "password must be 3 or more characters",
    });
  }

  const body = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

module.exports = usersRouter;
