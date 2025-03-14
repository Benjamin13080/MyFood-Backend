var express = require('express');
var router = express.Router();

const { body, param, validationResult } = require('express-validator');

const Bookmark = require('../models/bookmarks');
const User = require('../models/users');

const validateTokenRecipe = [
    body('token')
        .notEmpty(),
    body('recipe_id')
        .notEmpty(),
];

const validateTokenParamRecipe = [
    param('token')
        .notEmpty(),
];

// ROUTE POST /BOOKMARKS/
// Add new bookmark
router.post('/', validateTokenRecipe, (req, res) => {
    // check validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.json({ result: false, error: result.array()[0].msg });;
    }

    // find user with token
    User.findOne({ token: req.body.token })
        .then(data => {
            if (data) {
                // create new bookmark and save it
                const newBookmark = new Bookmark({ id_user: data._id, id_recipe: req.body.recipe_id });
                newBookmark.save()
                    .then(() => res.json({ result: true }))
            } else {
                res.json({ result: false, error: 'User not found.' });
            }
        })
        .catch(error => res.json({ result: false, error }))
});


// ROUTE GET /BOOKMARKS/:TOKEN
// Get bookmarks of user with given token
router.get('/:token', validateTokenParamRecipe, (req, res) => {
    // check validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.json({ result: false, error: result.array()[0].msg });;
    }

    // find user with token
    User.findOne({ token: req.params.token })
        .then(data => {
            if (data) {
                // get all bookmarks of user
                Bookmark.find({ id_user: data._id })
                    .then(data => {
                        res.json({ result: true, bookmarks: data })
                    });
            } else {
                res.json({ result: false, error: 'User not found.' });
            }
        })
        .catch(error => res.json({ result: false, error }))
});


// ROUTE GET /BOOKMARKS/INFOS/:TOKEN
// Get bookmarks, with additional informations, of user with given token
router.get('/infos/:token', validateTokenParamRecipe, (req, res) => {
    // check validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.json({ result: false, error: result.array()[0].msg });;
    }

    // find user with token
    User.findOne({ token: req.params.token })
        .then(data => {
            if (data) {
                // get all bookmarks of user
                Bookmark.find({ id_user: data._id })
                    .populate('id_recipe')
                    .then(data => {
                        data = data.map(bk => ({
                            _id: bk._id, id_user: bk.id_user, id_recipe: bk.id_recipe._id, recipe_name: bk.id_recipe.name, recipe_picture: bk.id_recipe.picture,
                            pregnant: bk.id_recipe.pregnant, healthy: bk.id_recipe.healthy, muscleGain: bk.id_recipe.muscleGain,
                            glutenFree: bk.id_recipe.glutenFree, vegetarian: bk.id_recipe.vegetarian
                        }))
                        res.json({ result: true, bookmarks: data })
                    });
            } else {
                res.json({ result: false, error: 'User not found.' });
            }
        })
        .catch(error => res.json({ result: false, error }))
});


// ROUTE DELETE /BOOKMARKS/
// Delete bookmark of user with given token
router.delete('/', validateTokenRecipe, (req, res) => {
    // check validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.json({ result: false, error: result.array()[0].msg });;
    }

    // find user with token
    User.findOne({ token: req.body.token })
        .then(data => {
            if (data) {
                // delete bookmark
                Bookmark.deleteOne({ id_user: data._id, id_recipe: req.body.recipe_id })
                    .then(() => {
                        res.json({ result: true })
                    });
            } else {
                res.json({ result: false, error: 'User not found.' });
            }
        })
        .catch(error => res.json({ result: false, error }))
});


module.exports = router;
