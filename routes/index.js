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
  console.log(books.length);
  res.render('index', {books});
}));

/* Create New Book route */
router.get('/books/new', (req, res) => {
  res.render('new-book');
});

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    if (!req.body.title || !req.body.author) {
      res.redirect('/books/new', {
        missingTitle: (req.body.title.length > 0),
        missingAuthor: (req.body.author.length > 0),
      })
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      // book = await Book.build(req.body);
      res.render('error', {error});
    } else {
      throw error;
    }  
  }
}));

/* GET book detail form */
router.get('/books/:id', asyncHandler(async (req,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('update-book', {book});
  } else {
    res.sendStatus(404);
  }
}));

/* POST book updated details */
router.post('/book/:id', asyncHandler(async (req,res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect('/book/' + book.id); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('/book/:id', { book })
    } else {
      throw error;
    }
  }
}));

/* Delete book */
router.post('/book/:id', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
