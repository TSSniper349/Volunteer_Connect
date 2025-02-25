var express = require('express');
var path = require('path');
const bcrypt = require('bcrypt');
var router = express.Router();
const saltRounds = 10;

router.post('/login', function (req, res, next) {
  if (req.session.adminid == null && req.session.orgabn == null && req.session.userid == null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM admins WHERE email = ?";
      connection.query(query, [req.body.email], function (err, rows, fields) {
        connection.release();
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        if (rows.length > 0) {
          bcrypt.compare(req.body.password, rows[0].password, function (err, result) {
            if (result) {
              req.session.adminid = rows[0].admin_id;
              res.sendStatus(200);
            } else {
              res.sendStatus(401);
            }
          });
        } else {
          res.sendStatus(403);
        }
      });
    });
  else res.sendStatus(403);
});

router.post('/profileChanges', function (req, res, next) {
  if (req.session.adminid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "UPDATE admins SET name = ?, email = ?, phone_number = ?";
      connection.query(query, [req.body.name, req.body.email, req.body.phone_number], function (err, rows, fields) {
        connection.release();
        if (err) {
          console.error(err);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  } else res.sendStatus(403);
});

router.post('/newAdminCreate', function (req, res, next) {
  if (req.session.adminid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      const checkEmailQuery = "SELECT email FROM admins WHERE email = ?";
      connection.query(checkEmailQuery, [req.body.email], function (err, existingEmailResults) {
        if (err) {
          console.error(err);
          connection.release();
          return res.sendStatus(500);
        }
        if (existingEmailResults.length > 0) {
          connection.release();
          return res.status(409).send({ message: "Email already exists!" });
        } else {
          bcrypt.hash(req.body.password, saltRounds, function (err, hashedPassword) {
            if (err) {
              connection.release();
              res.sendStatus(500);
              return;
            }
            const query = "INSERT INTO admins (name, email, phone_number, password) VALUES (?, ?, ?, ?)";
            connection.query(query, [req.body.name, req.body.email, req.body.phone_number, hashedPassword], function (err, rows, fields) {
              connection.release();
              if (err) {
                console.error(err);
                return res.sendStatus(500);
              }
              res.sendStatus(200);
            });
          });
        }
      });
    });
  } else {
    res.sendStatus(403);
  }
});

router.get('/profile', function (req, res) {
  res.redirect('/admins/profile/' + req.session.adminid);
});

router.get('/profile/:admin_id', function (req, res) {
  if (req.session.adminid != null && req.session.adminid == req.params.admin_id) {
    res.sendFile(path.join(__dirname, '../private', 'admin_profile.html'));
  }
  else {
    res.sendStatus(403);
  }
});

router.get('/profile/:admin_id/info', function (req, res, next) {
  if (req.session.adminid != null && req.session.adminid == req.params.admin_id)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * from admins WHERE admin_id = ?";
      connection.query(query, [req.session.adminid], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows[0]);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:admin_id/admin_board', function(req, res) {
  if (req.session.adminid != null && req.session.adminid == req.params.admin_id)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT name, email, phone_number FROM admins";
      connection.query(query, [req.session.adminid], function (err, rows) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.json(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:admin_id/all_users', function (req, res, next) {
  if (req.session.adminid != null && req.session.adminid == req.params.admin_id) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT user_id, user_firstname, user_lastname, user_email, user_phone FROM users;";
      connection.query(query, function (err, rows, fields) {
        connection.release();
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.json(rows);
      });
    });
  } else res.sendStatus(403);
});

router.get('/profile/:admin_id/all_organisations', function (req, res, next) {
  if (req.session.adminid != null && req.session.adminid == req.params.admin_id) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT o.abn, o.name, o.email, o.phone_number, a.city, a.postcode, e.event_id, (SELECT s.shift_id FROM events_shift s INNER JOIN events e ON s.event_id = e.event_id WHERE e.abn = o.abn LIMIT 1) AS shift_id FROM organisations o INNER JOIN address a ON o.address_id = a.address_id LEFT JOIN events e ON e.abn = o.abn;";
      connection.query(query, function (err, rows, fields) {
        connection.release();
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.json(rows);
      });
    });
  } else res.sendStatus(403);
});

router.post('/delete/user', function (req, res, next) {
  if (req.session.adminid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "DELETE FROM users WHERE user_id = ?;";
      connection.query(query, [req.body.user_id], function (err, result) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  } else res.sendStatus(403);
});

router.post('/delete/organisation', function (req, res, next) {
  if (req.session.adminid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "DELETE FROM organisations WHERE abn = ?;";
      connection.query(query, [req.body.abn], function (err, result) {
        connection.release();
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;