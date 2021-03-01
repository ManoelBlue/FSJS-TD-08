var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");
let limit = 5;
let books = [];
let booksPg = [];

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
    books = books.length > 0 ? books : await Book.findAll({});
    const page = (req.query.page) ? req.query.page : 1;
    const pages = Math.ceil(books.length / limit);
    console.log('BooksPg: ', booksPg);
    booksPg = page
        ? books.slice(limit * (page - 1), limit * page)
        : books.slice(0, 5);
    console.log('BooksPg: ', booksPg);
    res.render('index', {booksPg, pages});
}));

/* POST books search route */
router.post('/books', asyncHandler(async (req, res) => {
    const query = req.body.query.toLowerCase();
    books = await Book.findAll({
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
    booksPg = books.slice(0, 5);
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
            console.log(error.errors.length);
            res.render('new-book', {
                errors: error.errors
            });
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
router.post('/books/:id', asyncHandler(async (req,res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if(book) {
            await book.update(req.body);
            res.redirect('/books/'); 
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        if(error.name === "SequelizeValidationError") {
            console.log(error);
            res.render('update-book', {
                book,
                error: error.errors
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
