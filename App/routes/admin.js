let express = require('express');
let pool = require('../pool');
let router = express.Router();

// queries
const EXISTING_ADMIN_QUERY = `
SELECT id
FROM admins
WHERE account_name = $1;
`;

const ADMIN_INFO_QUERY = `
SELECT account_name
FROM admins
WHERE id = $1;
`;

const USERS_INFO_QUERY = `
SELECT id, name
FROM customer
`;

const renderLogin = (req, res, next) => {
  res.render('admin-login', {});
};

const renderDashboard = (req, res, next) => {
  const admin_id = req.cookies.admin;
  pool.query(ADMIN_INFO_QUERY, [admin_id], (err, dbRes) => {
    if (err) {
      res.send("error!");
    } else {
      const { account_name } = dbRes.rows[0];
      res.render('admin-dashboard', {user_name: account_name});
    }
  })
};

const renderEditUsers = (req, res, next) => {
  pool.query(USERS_INFO_QUERY, (err, dbRes) => {
    if (err) {
      res.send("error!");
    } else {
      // TODO: do stuff
      res.render('admin_edit_users')
    }
  });
};

const renderEditRestaurents = (req, res, next) => {
  // TODO: generate list of all restaurents & feed into page
  // have simple UI for "edit restaurent", "delete restaurent" & more?
  res.render('admin-edit-restaurents')
};

const renderEditReservations = (req, res, next) => {
  // TODO: ???
  res.render('admin-edit-reservations')
};

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
  res.redirect('/admin');
});

// login
router.post('/', (req, res, next) => {
  const { account_name } = req.body;
  console.log(account_name);
  pool.query(EXISTING_ADMIN_QUERY, [account_name], (err, dbRes) => {
    console.log(err);
    if (err || dbRes.rows.length !== 1) {
      res.send("error!");
    } else {
      res.cookie('admin', dbRes.rows[0].id) ;
      res.redirect('/admin')
    }
  });
});

router.get('/edit_users', (req, res, next) => {
  renderEditUsers(req, res, next);
});

router.post('/delete_user', (req, res, next) => {
  const { user_id } = req.body;
  // TODO: do relevant sql
});

router.post('/edit_user', (req, res, next) => {
  const { user_id, new_name } = req.body;
  // TODO: do relevant sql
});

module.exports = router;
