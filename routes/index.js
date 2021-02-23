var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('/books')
});

/* Books route */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  console.log(books);
  res.render('index', {books});
}));

/* Create New Book route */
router.get('/books/new', (req, res) => {
  res.render('new-book');
});

module.exports = router;
