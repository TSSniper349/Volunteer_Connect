var express = require('express');
var router = express.Router();
var path = require('path');
const bcrypt = require('bcrypt');
const { Console } = require('console');
const saltRounds = 10;

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/profile', function(req, res) {
  res.redirect('/users/profile/' + req.session.userid);
});

router.get('/profile/:user_id', function (req, res) {
  if (req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null) {
    res.sendFile(path.join(__dirname, '../private', 'user_profile.html'));
  }
  else {
    res.sendStatus(403);
  }
});

router.get('/profile/:user_id/info', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * from users WHERE user_id = ?;";
    connection.query(query, [req.params.user_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows[0]);
    });
  });
  else res.sendStatus(403);
});

router.post('/apply_for_event', function (req, res, next) {
  if(req.session.userid != null)
    req.pool.getConnection(function (err, connection) {
      let data = req.body.event_application_data;
      var query = "SELECT (SELECT num_people FROM shift_positions WHERE position_id = ? AND shift_id = ?) - (SELECT COUNT(application_id) FROM events_application WHERE position_id = ? AND shift_id = ?) AS remaining_positions;";
      connection.query(query, [data.position_id, data.shift_id, data.position_id, data.shift_id], function (err, rows1, fields) {
        if (err) {
          connection.release();
          console.log(err);
          res.sendStatus(500);
          return;
        }
        if (rows1[0].remaining_positions > 0) {
          var Aquery = "SELECT application_id FROM events_application WHERE user_id = ? AND shift_id = ?;";
          connection.query(Aquery, [req.session.userid, data.shift_id], function (err, rows2, fields) {
            if (err) {
              connection.release();
              console.log(err);
              res.sendStatus(500);
              return;
            }
            if (rows2.length < 1) {
              var Bquery = "INSERT INTO events_application SET user_id = ?, position_id = ?, shift_id = ?;";
              connection.query(Bquery, [req.session.userid, data.position_id, data.shift_id], function (err, rows, fields) {
                connection.release();
                if (err) {
                  console.error(err);
                  console.log(err);
                  res.sendStatus(500);
                  return;
                }
                res.sendStatus(200);
              });
            }
            else res.sendStatus(405);
          });
        } else res.sendStatus(406);
      });
    });
  else res.sendStatus(403);
});


router.get('/profile/:user_id/upcoming_enrolled_events', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id INNER JOIN organisations o ON e.abn = o.abn WHERE e.event_end_date >= CURRENT_DATE() AND e.event_id IN (SELECT event_id FROM events_shift WHERE shift_id IN (SELECT shift_id FROM events_application WHERE user_id = ?)) ORDER BY ABS(DATEDIFF(e.event_start_date, CURDATE()));";
    connection.query(query,[req.params.user_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
  else res.sendStatus(403);
});

router.get('/profile/:user_id/past_enrolled_events', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id INNER JOIN organisations o ON e.abn = o.abn WHERE e.event_end_date < CURRENT_DATE() AND e.event_id IN (SELECT event_id FROM events_shift WHERE shift_id IN (SELECT shift_id FROM events_application WHERE user_id = ?)) ORDER BY ABS(DATEDIFF(e.event_start_date, CURDATE()));";
    connection.query(query,[req.params.user_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
  else res.sendStatus(403);
});

router.get('/profile/:user_id/upcoming_shifts/:event_id', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT pl.name, es.shift_id, es.date, es.start_time, es.end_time, es.description FROM position_list pl INNER JOIN events_shift es INNER JOIN events_application ea ON ea.position_id = pl.position_id AND ea.shift_id = es.shift_id WHERE es.date >= CURRENT_DATE() AND ea.user_id = ? AND es.event_id = ? ORDER BY ABS(DATEDIFF(es.date, CURDATE())), es.start_time;";
    connection.query(query,[req.params.user_id, req.params.event_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
  else res.sendStatus(403);
});

router.get('/profile/:user_id/past_shifts/:event_id', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT pl.name, es.shift_id, es.date, es.start_time, es.end_time, es.description FROM position_list pl INNER JOIN events_shift es INNER JOIN events_application ea ON ea.position_id = pl.position_id AND ea.shift_id = es.shift_id WHERE es.date < CURRENT_DATE() AND ea.user_id = ? AND es.event_id = ? ORDER BY ABS(DATEDIFF(es.date, CURDATE())), es.start_time;";
    connection.query(query,[req.params.user_id, req.params.event_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
  else res.sendStatus(403);
});

router.post('/profile/:user_id/drop_shifts', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "DELETE FROM events_application WHERE user_id = ? AND shift_id = ?;";
      connection.query(query, [req.params.user_id, req.body.shift_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:user_id/joined_organisations', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT m.joined_date, o.name, o.abn FROM members m INNER JOIN organisations o ON m.abn = o.abn WHERE m.user_id = ?;"
    connection.query(query,[req.params.user_id], function (err, rows, fields) {
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

router.get('/profile/:user_id/joined_organisations/:org_abn/num_events_completed', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT COUNT(ea.application_id) FROM events_application ea INNER JOIN events_shift es ON ea.shift_id = es.shift_id INNER JOIN events e ON es.event_id = e.event_id WHERE es.date < CURDATE() AND e.abn = ? AND ea.user_id = ?;";
      connection.query(query, [req.params.org_abn, req.params.user_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.json(rows[0]);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:user_id/updates', function (req, res, next) {
  if(req.session.userid != null && req.session.userid == req.params.user_id|| req.session.adminid != null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT u.*, o.name FROM updates u INNER JOIN organisations o ON u.abn = o.abn WHERE o.abn IN (SELECT abn FROM members WHERE user_id = ?);"
    connection.query(query,[req.params.user_id], function (err, rows, fields) {
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

router.post('/:user_id/profileChanges', function(req, res, next) {
  if(req.session.userid != null || req.session.adminid != null) 
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "UPDATE users SET user_firstname = ?, user_lastname = ?, user_phone = ?, user_skill = ?, user_experience = ? WHERE user_id = ?";
    connection.query(query, [req.body.firstname, req.body.lastname, req.body.phone, req.body.skill, req.body.experience, req.params.user_id], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.error(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
  else res.sendStatus(403);
});

router.post('/login', function (req, res, next) {
  if (req.session.userid == null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM users WHERE user_email = ?";
    connection.query(query, [req.body.email], function (err, rows, fields) {
      connection.release();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        bcrypt.compare(req.body.password, rows[0].user_password, function (err, result) {
          if (result) {
            req.session.userid = rows[0].user_id;
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

router.post('/signup', function (req, res, next) {
  if (req.session.userid == null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var checkQuery = "SELECT * FROM users WHERE user_email = ?";
    connection.query(checkQuery, [req.body.email], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        res.sendStatus(400);
      } else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hashedPassword) {
          if (err) {
            connection.release();
            res.sendStatus(500);
            return;
          }
          var insertQuery = "INSERT INTO users SET ?";
          var user = {
            user_firstname: req.body.firstname,
            user_lastname: req.body.lastname,
            user_password: hashedPassword,
            user_email: req.body.email,
            user_phone: req.body.phone
          };
          connection.query(insertQuery, user, function (err, result) {
            connection.release();
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
            req.session.userid = result.insertId;
            res.sendStatus(200);
          });
        });
      }
    });
  });
  else res.sendStatus(403);
});

module.exports = router;

