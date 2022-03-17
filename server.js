const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./user");

mongoose.connect("mongodb://localhost/pagination");
const db = mongoose.connection;
db.once("open", async () => {
  if ((await User.countDocuments().exec()) > 0)
    return Promise.all([
      User.create({ name: "User 1" }),
      User.create({ name: "User 2" }),
      User.create({ name: "User 3" }),
      User.create({ name: "User 4" }),
      User.create({ name: "User 5" }),
      User.create({ name: "User 6" }),
      User.create({ name: "User 7" }),
      User.create({ name: "User 8" }),
      User.create({ name: "User 9" }),
      User.create({ name: "User 10" }),
      User.create({ name: "User 11" }),
    ]).then(() => console.log("Added users"));
});

// const users = [
//   { id: 1, name: "One" },
//   { id: 2, name: "two" },
//   { id: 3, name: "three" },
//   { id: 4, name: "four" },
//   { id: 5, name: "five" },
//   { id: 6, name: "six" },
//   { id: 7, name: "seven" },
//   { id: 8, name: "eight" },
//   { id: 9, name: "nine" },
//   { id: 10, name: "ten" },
//   { id: 11, name: "eleven" },
// ];

// app.get("/users", (req, res) => {
//   const page = parseInt(req.query.page);
//   const limit = parseInt(req.query.limit);
//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;

//   const results = {};

//   if (endIndex < users.length)
//     results.next = {
//       page: page + 1,
//       limit: limit,
//     };

//   if (startIndex > 0) {
//     results.previous = {
//       page: page - 1,
//       limit: limit,
//     };
//   }

//   results.results = users.slice(startIndex, endIndex);
//   res.json(results);
// });

app.get("/users", paginatedDBResults(User), (req, res) => {
  res.json(res.paginatedResults);
});
// Using a middleware to trim down the code and follow SRP

const posts = [
  { id: 1, name: "One post" },
  { id: 2, name: "two post" },
  { id: 3, name: "three post" },
  { id: 4, name: "four post" },
  { id: 5, name: "five post" },
  { id: 6, name: "six post" },
  { id: 7, name: "seven post" },
  { id: 8, name: "eight post" },
  { id: 9, name: "nine post" },
  { id: 10, name: "ten post" },
  { id: 11, name: "eleven post" },
];

app.get("/posts", paginatedResults(posts), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < model.length)
      results.next = {
        page: page + 1,
        limit: limit,
      };

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.results = model.slice(startIndex, endIndex);

    res.paginatedResults = results;
    next();
  };
}

function paginatedDBResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < model.length)
      results.next = {
        page: page + 1,
        limit: limit,
      };

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec();
      next();
    } catch (e) {
      res.status(500).json({
        message: e.message,
      });
    }

    res.paginatedResults = results;
    next();
  };
}

app.listen(3000);
