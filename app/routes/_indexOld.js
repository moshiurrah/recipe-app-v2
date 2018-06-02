'use strict';

// var path = process.cwd();
// var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var Users = require('../models/users.js');
var userRoutes = require('./userRoutes');
var listUsers = require('../controllers/user.controller');
//var Recipes=require(path + '/app/models/recipes.js');
var express = require('express');


module.exports = function (passport) {

  const router = express.Router();
  router.use('/users', userRoutes);
  // router.get('/getUsers', listUsers);
  return router;
}
/* 
module.exports = function (app, passport) {

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      console.log(req.url);
      //res.redirect('/login');
      //res.json({message:'Not logged in'});
      res.redirect('/');
    }
  }

  //this needs work :`(
  function parseMongooseErr(errMsg) {

    console.log(errMsg.errors);
    for (var error in errMsg.errors) {
      var errToReport = errMsg.errors[error].message;
      if (errMsg.errors[error].message.includes('Cast')) {
        errToReport = "Please provide a number.";
      }
    }
    return { errors: errToReport };
  }

  app.route('/')
    .get(function (req, res) {
      //.get(isLoggedIn, function (req, res) {
      //res.sendFile(path + '/public/index.html');
      if (process.env.NODE_ENV === 'production') {
        //console.log('production url');
        res.sendFile(path + '/client/build/index.html');
      } else {
        res.redirect(process.env.APP_URL.substring(0, process.env.APP_URL.length - 1) + ":" + process.env.REACT_PORT);
      }
    });



  app.route('/login')
    .get(function (req, res) {
      //res.sendFile(path + '/public/login.html');
      res.redirect('/');
    });

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
      //res.redirect('https://fccwebapps-mtanzim.c9users.io:8081');
    });

  //passport docs, local sign up/login
  app.post('/signup', function (req, res, next) {
    //console.log(req.auth);
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        //return res.send('Incorrect password!'); 
        return res.send(403, { error: "Invalid password!" });
      }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        return res.redirect('/');
        //console.log(req.user);
        //res.send(JSON.stringify({isError:false, content:req.user._id}));
      });
    })(req, res, next);
  });

  app.route('/api/:id/changePass')
    .post(isLoggedIn, function (req, res) {
      console.log('Changing Password');
      console.log(req.params.id);
      console.log(req.user.id);
      console.log(req.body);
      //not using the params id yet, makes more sense to use the user of the session
      Users.findById(req.user.id, function (err, user) {
        if (err) {
          res.json({ isError: true });
        } else {
          console.log(user);
          if (!user.validPassword(req.body.curPass)) {
            //res.status(200).json({isError:true, content:"Password check current password!"});
            return res.send(403, { error: "Invalid password!" });
          } else {
            //user.setPassword(req.body.newPass, function(){
            //user.save();
            user.changePassword(req.body.newPass);
            user.save(function (err) {
              if (err) {
                res.json({ isError: true, content: parseMongooseErr(err) });
              } else {
                //res.json({ message: 'All recipes deleted'});
                res.json({ isError: false, content: "Password Changed!" });
              }
            });

            //res.status(200).json({message: 'password reset successful'});
            //});
          }

          //res.json({isError:false, content:user.toJSON({ virtuals: true })});
        }
      });

    });

  app.route('/api/:id/deleteAccount')
    .post(isLoggedIn, function (req, res) {
      Users.findById(req.user.id, function (err, user) {
        if (err) {
          return res.send(403, { error: "User not removed!" });
        } else {
          console.log(user);
          user.remove(function (err, user) {
            if (err) {
              return res.send(403, { error: "User not removed!" });
            } else {
              Users.findById(user._id, function (err, user) {
                console.log(user) // null
              });
              res.redirect('/logout');
            }
          })

        }
      });
    });

  //connected accounts
  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));


  //facebook login routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/getCurUser')
    .get(isLoggedIn, function (req, res) {
      res.json(req.user.toJSON({ virtuals: true }));
    });

  //get userNames
  //uses virtual getters
  app.route('/getUsers')
    // .get(isLoggedIn, function (req, res) {
    .get(listUsers);

  //get user information for specific userID
  app.route('/api/:id')
    .get(isLoggedIn, function (req, res) {
      console.log(req.url);
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true });
        } else {
          console.log(user);
          res.json({ isError: false, content: user.toJSON({ virtuals: true }) });
        }
      });
    })

  //add recipe for specified user
  app.route('/api/:id/recipe')
    .post(function (req, res) {
      //console.log(req.params.recipeID);
      console.log(req.body);
      //console.log(req.params.id);
      Users.findById(req.params.id, function (err, user) {
        //Users.findOne({ 'facebook.id': req.user.facebook.id }, function (err, user) {
        console.log(user);
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          user.recipes.unshift(req.body);
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('New recipe added successfully!');
              res.json({ isError: false, content: user.recipes });
            }
          });
        }
      });
    })
  //delete all recipes
  app.route('/api/:id/recipeDelAll')
    .delete(function (req, res) {
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          console.log(user);
          var recipeL = user.recipes.length - 1;
          for (let i = recipeL; i > -1; i--) {
            user.recipes.id(user.recipes[i]._id).remove();
          };
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              res.json({ isError: false, content: 'All recipes deleted' });
            }
          });
        }

      });
    });

  //delete one ingredient; edit ingredient name
  app.route('/api/:id/recipe/:recipeID/:ingID')
    //edit ingredient name
    .put(function (req, res) {
      console.log(req.body);
      Users.findById(req.user.id, function (err, user) {
        //Users.findOne({ 'facebook.id': req.user.facebook.id }, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          //console.log(recipe);
          editRecipe.ingredients.id(req.params.ingID).set(req.body);
          //console.log(recipe);
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('Ingredient edited successfully!');
              //res.json(req.body);
              res.json({ isError: false, content: req.body });
            }
          });
        }

      });
    })
    //delete ingredient
    .delete(function (req, res) {
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          editRecipe.ingredients.id(req.params.ingID).remove();
          console.log(editRecipe);
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('Ingredient removed successfully!');
              res.json({ isError: false, content: editRecipe });
            }
          });
        }
      });
    });
  //delete all ingredients
  app.route('/api/:id/recipeDelAllIng/:recipeID')
    .delete(function (req, res) {
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          var ingredientL = editRecipe.ingredients.length - 1;
          for (let i = ingredientL; i > -1; i--) {
            editRecipe.ingredients.id(editRecipe.ingredients[i]._id).remove();
          };
          //console.log('New Recipe:');
          //console.log(editRecipe);
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('All ingredients removed successfully!');
              res.json({ isError: false, content: editRecipe });
            }
          });
        }
      });
    });

  //add new ingredients, edit recipe name, or delete recipe
  app.route('/api/:id/recipe/:recipeID')
    .put(function (req, res) {
      console.log(req.params.recipeID);
      console.log(req.body);
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          editRecipe.title = req.body.title;
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('Recipe Edited');
              res.json({ isError: false, content: editRecipe });
            }
          });
        }
      })
      //res.json({ message: 'Added ingredient to '+req.params.recipeID});
    })
    .post(function (req, res) {
      console.log(req.params.recipeID);
      console.log(req.body);
      Users.findById(req.params.id, function (err, user) {
        //Users.findOne({ 'facebook.id': req.user.facebook.id }, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          console.log(editRecipe);
          editRecipe.ingredients.unshift(req.body);
          user.save(function (err) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              console.log('New ingredient added successfully!');
              res.json({ isError: false, content: editRecipe });
            }
          });
        }
      })
      //res.json({ message: 'Added ingredient to '+req.params.recipeID});
    })
    .delete(function (req, res) {
      Users.findById(req.params.id, function (err, user) {
        if (err) {
          res.json({ isError: true, content: parseMongooseErr(err) });
        } else {
          var editRecipe = user.recipes.id(req.params.recipeID);
          console.log(editRecipe);
          editRecipe.remove({ _id: req.params.recipeID }, function (err, recipe) {
            if (err) {
              res.json({ isError: true, content: parseMongooseErr(err) });
            } else {
              user.save(function (err) {
                if (err) {
                  res.json({ isError: true, content: parseMongooseErr(err) });
                } else {
                  res.json({ isError: false, content: 'Recipe ' + req.params.recipeID + ' has been deleted' });
                }
              });
            }

          });
        }
      });
    });

};
 */