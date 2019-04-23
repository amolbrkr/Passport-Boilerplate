const LocalStrategy = require ('passport-local').Strategy;
const User = require ('./UserModel');


module.exports = passport => {
  passport.serializeUser ((User, done) => {
    //console.log ('SERIALIZEUSER: ', User._id);
    done (null, User._id);
  });

  passport.deserializeUser ((id, done) => {
    User.findById (id, (err, User) => {
      //console.log ('DESERIALIZEUSER: ', User);
      done (err, User);
    });
  });

  passport.use (
    'signup',
    new LocalStrategy (
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        process.nextTick (() => {
          User.findOne ({email: email}, (err, foundUser) => {
            if (err) return done (err);

            if (foundUser) {
              return done (null, false, {
                message: 'The email is already registered.',
              });
            } else {
              let newUser = new User ();
              newUser.username = req.body.username;
              newUser.email = email;
              newUser.password = newUser.hashPassword (password);

              newUser.save (err => {
                if (err) console.error ('Error when writing to database', err);
              });

              return done (null, newUser, {
                message: 'User has been registered successfully.',
              });
            }
          });
        });
      }
    )
  );

  passport.use (
    'login',
    new LocalStrategy (
      {
        usernameField: 'email',
      },
      (email, password, done) => {
        User.findOne ({email: email}, (err, foundUser) => {
          if (err) return done (err);

          if (!foundUser) {
            return done (null, false, {
              message: 'Invalid Username or Password.',
            });
          }

          if (!foundUser.comparePassword (password)) {
            return done (null, false, {
              message: 'Invalid Username or Password.',
            });
          }

          return done (null, foundUser);
        });
      }
    )
  );
};