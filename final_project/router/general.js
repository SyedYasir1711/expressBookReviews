const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Take the username and password from the request body
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  // Reject the registration if the username is already taken
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "User already exists!"});
  }

  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send the full book list, formatted with 4-space indentation
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters and look up the book
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Obtain all the keys for the 'books' object and collect books by the requested author
  const author = req.params.author;
  const matchingBooks = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === author) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Obtain all the keys for the 'books' object and collect books with the requested title
  const title = req.params.title;
  const matchingBooks = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === title) {
      matchingBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  }
  return res.status(404).json({message: "No books found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters and return that book's reviews
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});

// Get the book list available in the shop using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error fetching book list", error: error.message});
  }
});

// Get book details based on ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${encodeURIComponent(isbn)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({message: "Error fetching book details", error: error.message});
  }
});

// Get book details based on author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found for this author"});
    }
    return res.status(500).json({message: "Error fetching books by author", error: error.message});
  }
});

// Get book details based on title using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found with this title"});
    }
    return res.status(500).json({message: "Error fetching books by title", error: error.message});
  }
});

module.exports.general = public_users;
