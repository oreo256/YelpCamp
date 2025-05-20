const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(users.register);

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)


// async/awaitの非同期処理の書き方にreq.logout()が対応しなくなったためしたのコールバックので動かします
// router.get('/logout', async (req,res) => {
//     await req.logout();
//     req.flash('success', 'ログアウトしました')
//     res.redirect('/campgrounds')
// })

router.get('/logout', users.logout);

module.exports = router;