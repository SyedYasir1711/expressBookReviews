const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // A username is valid if it is not already registered
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check that a registered user has this exact username and password
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }

  // Sign a JWT with the same secret the /customer/auth/* middleware verifies with
  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });

  // Save the token and username in the session
  req.session.authorization = { accessToken, username };
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!review) {
    return res.status(400).json({message: "Review is required as a query parameter"});
  }

  const isUpdate = Object.hasOwn(books[isbn].reviews, username);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  // Only the session user's own review can be deleted
  if (!Object.hasOwn(books[isbn].reviews, username)) {
    return res.status(404).json({message: "You have no review for this book"});
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
