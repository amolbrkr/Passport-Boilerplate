const express = require ('express');
const session = require ('express-session');
const bodyParser = require ('body-parser');
const cookieParser = require ('cookie-parser');
const mongoose = require ('mongoose');
const passport = require ('passport');
const LocalAuth = require('./LocalAuth');


const dbUrl = require('./Config').dbUrl;
const port = process.env.PORT || 9000;
const app = express ();

app.use (bodyParser.json ());
app.use (bodyParser.urlencoded ({extended: true}));
app.use (cookieParser ());
app.use (
  session ({secret: 'borkar.amol', saveUninitialized: false, resave: false})
);

app.use (passport.initialize ());
app.use (passport.session ());

mongoose.connect (dbUrl, {useNewUrlParser: true}, () => {
  console.log ('Successfully connected to hosted database.');
});
//mongoose.set('debug', true);

LocalAuth(passport);

//Routes --->

app.get ('/user', (req, res, next) => {
  if (req.isAuthenticated ()) {
    res.json ({user: req.user});
    return next ();
  }

  res.status (400).json ({message: 'Request is not authenticated.'});
});

app.post (
  '/signup',
  passport.authenticate ('signup', {
    successRedirect: '/user',
    failureMessage: true,
    successMessage: true,
  })
);

app.post (
  '/login',
  passport.authenticate ('login', {
    successRedirect: '/user',
    failWithError: true
  }),
  (err, req, res, next) => {
    return res.status(403).json({message: 'Invalid Email or Password.'});
  }
);

app.post ('/logout', (req, res) => {
  if (req.user) {
    req.session.destroy ();
    req.logout ();
    res.clearCookie ('connect.sid');
    return res.json ({message: 'User is now logged out.'});
  } else {
    return res.json ({message: 'Error: No user to log out.'});
  }
});

app.listen (port, () => {
  console.log (`Started listening on PORT: ${port}`);
});
