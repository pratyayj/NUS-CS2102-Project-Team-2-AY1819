let express = require('express');
let pool = require('../pool');
let router = express.Router();

const cuisineRouter = require('./cuisine');

router.use('/cuisine', cuisineRouter);
const queries = require('../public/scripts/admin_sql_queries');

// TODO: some preprocessing to make input more user-friendly
// TODO: standardize booking and reservation

/*
  Login and Dashboard Related
 */
const renderLogin = (req, res, next) => {
    res.render('admin-login', {});
};

const renderDashboard = (req, res, next) => {
    const admin_id = req.cookies.admin;
    pool.query(queries.ADMIN_INFO_QUERY, [admin_id], (err, dbRes) => {
        if (dbRes.rows[0] !== undefined) {
            const { account_name } = dbRes.rows[0];
            res.render('admin-dashboard', {user_name: account_name});
        } else {
            res.send("error!");
        }
    })
};

// Check for admin login
router.get('/', (req, res, next) => {
    if (req.cookies.admin) {
        renderDashboard(req, res, next);
    } else {
        renderLogin(req, res, next);
    }
});

router.get('/dashboard', (req, res, next) => {
    renderDashboard(req, res, next);
});

router.get('/logout', (req, res, next) => {
    res.clearCookie('admin');
    res.redirect('/');
});

// Submit login details. Adds a cookie to store the presence of an admin
router.post('/', (req, res, next) => {
    const { account_name } = req.body;
    // console.log(account_name);
    pool.query(queries.EXISTING_ADMIN_QUERY, [account_name], (err, dbRes) => {
        if (err || dbRes.rows.length !== 1) {
            res.send("error!");
        } else {
            res.cookie('admin', dbRes.rows[0].id) ;
            res.redirect('/admin')
        }
    });
});
/*
  Render Edit User Page
 */

const renderEditUser = (req, res, next) => {
    pool.query(queries.CUSTOMER_INFO_QUERY, (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.render('admin-edit-user', {users: dbRes.rows})
        }
    });
};

/*
  Render Edit Restaurants Page
 */
const renderEditRestaurants = (req, res, next) => {
    pool.query(queries.RESTAURANT_INFO_QUERY, (err, restaurantRes) => {
        if (err) {
            res.send("error!");
        } else {
            pool.query(queries.CUISINES_INFO_QUERY, (err, cuisineRes) => {
              if (err) {
                  console.log(err);
                  res.send("error!");
              } else {
                  pool.query(queries.BRANCHES_INFO_QUERY, (err, branchesRes) => {
                      if(err) {
                          console.log(err);
                          res.send("error!");
                      } else {
                          // console.log(restaurantRes);
                          res.render('admin-edit-restaurants', {
                              restaurants: restaurantRes.rows,
                              restaurant_cuisines: cuisineRes.rows,
                              message: req.flash('info'),
                              branches: branchesRes.rows
                          });
                      }
                  })

              }
            });
        }
    });
};

/*
  Render Edit Reservations Page
 */
const renderEditReservations = (req, res, next) => {
    pool.query(RESERVATION_INFO_QUERY, (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.render('admin-edit-reservations', {reservations: dbRes.rows});
        }
    });
};

/*
  Edit/Delete Users page and form POST requests
 */
router.get('/edit-users', (req, res, next) => {
    renderEditUser(req, res, next);
});

router.post('/delete_user', (req, res, next) => {
    const { user_id } = req.body;
    pool.query(queries.DELETE_CUSTOMER_QUERY, [user_id], (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.redirect('/admin/edit-users')
        }
    });
});

router.post('/edit_user', (req, res, next) => {
    const { user_id, new_user_name } = req.body;
    pool.query(queries.UPDATE_USER_QUERY, [new_user_name, user_id], (err, dbRes) => {
        if (err) {
            console.log(err);
            res.send("error!");
        } else {
            res.redirect('/admin/edit-users')
        }
    });
});

/*
  Edit/Delete Restaurants page and form POST requests
 */
router.get('/edit-restaurants', (req, res, next) => {
    renderEditRestaurants(req, res, next);
});

// Edit Restaurant details
router.post('/edit_restaurant', (req, res, next) => {
    const { restaurant_id, new_restaurant_account_name, new_restaurant_name } = req.body;
    // console.log(req.body);
    // console.log(new_restaurant_account_name);
    // console.log(new_restaurant_name);
    if (new_restaurant_account_name === '') {
        req.flash('info', 'Successfully updated!');
        pool.query(queries.UPDATE_RESTAURANT_RESTNAME_QUERY, [new_restaurant_name, restaurant_id], (err, dbRes) => {
            if (err) {
                console.log(err);
                res.send("error!");
            } else {
                res.redirect('/admin/edit-restaurants')
            }
        });
    } else if (new_restaurant_name === '') {
        req.flash('info', 'Successfully updated!');
        pool.query(queries.UPDATE_RESTAURANT_ACCNAME_QUERY, [new_restaurant_account_name, restaurant_id], (err, dbRes) => {
            if (err) {
                console.log(err);
                res.send("error!");
            } else {
                res.redirect('/admin/edit-restaurants')
            }
        });
    } else {
        req.flash('info', 'Successfully updated!');
        pool.query(queries.UPDATE_RESTAURANT_ALL_QUERY, [new_restaurant_account_name, new_restaurant_name, restaurant_id], (err, dbRes) => {
            if (err) {
                console.log(err);
                res.send("error!");
            } else {
                res.redirect('/admin/edit-restaurants');
            }
        })
    }
});

// Delete Restaurant
router.post('/delete_restaurant', (req, res, next) => {
    const { restaurant_id } = req.body;
    req.flash('info', 'Successfully deleted!');
    pool.query(queries.DELETE_RESTAURANT_QUERY, [restaurant_id], (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.redirect('/admin/edit-restaurants')
        }
    });
});

/*
  Edit/Delete Reservations page and form POST requests
 */
router.get('/edit-bookings', (req, res, next) => {
    renderEditReservations(req, res, next);
});

router.post('/edit_reservation', (req, res, next) => {
    const { reservation_timing, reservation_id } = req.body;
    req.flash('info', 'Successfully updated!');
    pool.query(queries.UPDATE_RESERVATION_QUERY, [reservation_timing, reservation_id], (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.redirect('/admin/edit-bookings')
        }
    });
});

router.post('/delete_reservation', (req, res, next) => {
    const { reservation_id } = req.body;
    req.flash('info', 'Successfully deleted!');
    pool.query(queries.DELETE_RESERVATION_QUERY, [reservation_id], (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.redirect('/admin/edit-bookings')
        }
    });
});

// Delete Branch
router.post('/delete_branch', (req, res, next) => {
    const { branch_id } = req.body;
    req.flash('info', 'Successfully deleted!');
    pool.query(queries.BRANCH_DELETE_QUERY, [branch_id], (err, dbRes) => {
        if (err) {
            res.send("error!");
        } else {
            res.redirect('/admin/edit-restaurants')
        }
    });
});

/*
 Statistics Related Routing
 */
router.get('/statistics', (req, res, next) => {
    renderStatistics(req, res, next);
});

const renderStatistics = (req, res, next) => {
    pool.query(queries.STATS_RESTAURANT_CUISINE_COUNT, (err, cuisineCountRes) => {
        if (err) {
            res.send("error!");
        } else {
            pool.query(queries.STATS_MOST_BOOKED_RESTAURANT, (err, bookingCountRes) => {
                if (err) {
                    res.send("error!");
                } else {
                    pool.query(queries.STATS_POPULAR_BOOKING_TIME, (err, popularTimingRes) => {
                        if (err) {
                            res.send("error!");
                        } else {
                            res.render('admin-statistics', {
                                cuisineCount: cuisineCountRes.rows,
                                bookingCount: bookingCountRes.rows,
                                popularTiming: popularTimingRes.rows,
                                message: req.flash('info'),
                            });
                        }
                    });
                }
            });
        }
    })
};


module.exports = router;
