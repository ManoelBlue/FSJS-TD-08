var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
let limit = 5;

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

/* GET Books route */
router.get('/books', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    console.log(books);
    const page = (req.query.page) ? req.query.page : 1;
    const pages = Math.ceil(books.length / limit);
    const booksPg = page
        ? books.slice(limit * (page - 1), limit * page)
        : books.slice(0, 5);
    res.render('index', {booksPg, pages});
}));

/* POST books search route */
router.post('/books', asyncHandler(async (req, res) => {
    const query = req.body.query.toLowerCase();
    const books = await Book.findAll({
        where: {
            [Op.or]: [
                {title: {[Op.like]: `%${query}%`}},
                {author: {[Op.like]: `%${query}%`}},
                {genre: {[Op.like]: `%${query}%`}},
                {year: {[Op.like]: `%${query}%`}},
            ]
        }
    });
    const pages = Math.ceil(books.length / limit);
    const booksPg = books.slice(0, 5);
    res.render('index', {booksPg, pages});
}));

/* GET create New Book route */
router.get('/books/new', (req, res) => {
    res.render('new-book');
});

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect('/books');
    } catch (error) {
        if(error.name === "SequelizeValidationError") {
            res.render('new-book', {
                errors: error.errors
            });
        } else {
            throw error;
        }  
    }
}));

/* GET book detail form */
router.get('/books/:id', asyncHandler(async (req,res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render('update-book', {book});
    } else {
        next();
    }
}));

/* POST book updated details */
router.post('/books/:id', asyncHandler(async (req,res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if(book) {
            await book.update(req.body);
            res.redirect('/books'); 
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        if(error.name === "SequelizeValidationError") {
            res.render('update-book', {
                book,
                errors: error.errors
            })
        } else {
            throw error;
        }
    }
}));

/* Delete book */
router.post('/books/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    await book.destroy();
    res.redirect('/books');
}));

module.exports = router;
