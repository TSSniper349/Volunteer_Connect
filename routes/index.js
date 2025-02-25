var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');

const CLIENT_ID = '829108637006-ntg3hnof9v3nq540lu8ijasu0c5r7o4q.apps.googleusercontent.com';
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

router.post('/google_login', async function (req, res, next) {
  const ticket = await client.verifyIdToken({
    idToken: req.body.credential,
    audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  const googleEmail = payload['email'];

  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      return res.sendStatus(500);
    }
    var query = "SELECT * FROM users WHERE user_email = ?";
    connection.query(query, [googleEmail], function (err, rows, fields) {
      if (err) {
        connection.release();
        return res.sendStatus(500);
      }
      if (rows.length > 0) {
        req.session.userid = rows[0].user_id;
        res.redirect('/');
      } else {
        var insertQuery = "INSERT INTO users SET ?";
        var user = {
          user_firstname: payload['given_name'],
          user_lastname: payload['family_name'],
          user_email: googleEmail,
          user_password: 'null',
          user_phone: 0
        };
        connection.query(insertQuery, user, function (err, result) {
          connection.release();
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          req.session.userid = result.insertId;
          res.redirect('/');
        });
      }
    });
  });
});

router.get('/login_page', function (req, res) {
  if (req.session.adminid == null && req.session.userid == null && req.session.orgabn == null) {
    res.sendFile(path.join(__dirname, '../private', 'login.html'));
  }
  else res.sendStatus(403);
});

router.get('/login_admin', function (req, res) {
  if (req.session.adminid == null && req.session.userid == null && req.session.orgabn == null) {
    res.sendFile(path.join(__dirname, '../private', 'login_admin.html'));
  }
  else res.sendStatus(403);
});

router.get('/signup_page', function (req, res) {
  if (req.session.userid == null && req.session.orgabn == null && req.session.adminid == null) {
    res.sendFile(path.join(__dirname, '../private', 'signUp.html'));
  }
  else res.sendStatus(403);
});

router.get('/organisation_list', function (req, res) {
  res.sendFile(path.join(__dirname, '../public', 'organisation_list.html'));
});

router.get('/check_login_status', function (req, res, next) {
  if (req.session.userid == null) {
    if (req.session.orgabn == null) {
      if (req.session.adminid == null) { res.sendStatus(500); }
      else {
        res.sendStatus(202);
      }
    }
    else res.sendStatus(418);
  }
  else res.sendStatus(200);
});

router.post('/logout', function (req, res, next) {
  if (req.session.userid != null || req.session.orgabn != null || req.session.adminid != null)
    if (req.session) {
      req.session.destroy(function (err) {
        if (err) {
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    } else {
      res.sendStatus(403);
    }
});

router.get('/get_list_of_services', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    const query = `SELECT * FROM list_of_services`;
    connection.query(query, (err, results) => {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(results);
    });
  });
});

router.get('/get_list_of_positions', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    const query = `SELECT * FROM position_list`;
    connection.query(query, (err, results) => {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(results);
    });
  });
});

router.post('/search_organisation_list', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    const query = `SELECT DISTINCT o.abn, o.name, o.description, a.city, a.postcode FROM organisations o INNER JOIN address a ON a.address_id = o.address_id LEFT JOIN organisation_services os ON o.abn = os.abn WHERE (o.name LIKE ? OR o.description LIKE ?) AND (a.city LIKE ? OR a.postcode LIKE ?) AND (os.service_id LIKE ? OR os.service_id IS NULL);`;
    const values = [`%${req.body.keyword}%`, `%${req.body.keyword}%`, `%${req.body.location}%`, `%${req.body.location}%`, `%${req.body.serviceID}%`];
    connection.query(query, values, (err, results) => {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      else res.send(results);
    });
  });
});

module.exports = router;
