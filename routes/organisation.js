var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
var path = require('path');

router.get('/page/:org_abn', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT abn FROM organisations WHERE abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      if(rows.length>0) {
        res.sendFile(path.join(__dirname, '../private', 'organisation_info.html'));
      }
      else res.sendStatus(404);
    });
  });
});

router.post('/:org_abn/profileChanges', function (req, res, next) {
  if (req.session.orgabn !== null && req.session.orgabn == req.params.org_abn || req.session.adminid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        return res.sendStatus(500);
      }
      let errors = [];
      let profileData = req.body.profileData;
      let orgAdress = req.body.orgAddress;
      let orgServices = req.body.orgServices;
      let query = "UPDATE organisations SET manager_firstname = ?, manager_lastname = ?, name = ?, phone_number = ?, description = ? WHERE abn = ?";
      connection.query(query, [profileData.firstname, profileData.lastname, profileData.orgName, profileData.phone, profileData.orgDescription, req.params.org_abn], function (err, rows, fields) {
        if (err) {
          errors.push(err);
        }
        query = "UPDATE address a INNER JOIN organisations o ON o.address_id = a.address_id SET a.number = ?, a.street = ?, a.city = ?, a.state = ?, a.postcode = ? WHERE o.abn = ?";
        connection.query(query, [orgAdress.number, orgAdress.street, orgAdress.city, orgAdress.state, orgAdress.postcode, req.params.org_abn], function (err, rows, fields) {
          if (err) {
            errors.push(err);
          }
          query = "SELECT l.name FROM list_of_services l INNER JOIN organisation_services o ON l.service_id = o.service_id WHERE o.abn = ?";
          connection.query(query, [req.params.org_abn], function (err, rows, fields) {
            if (err) {
              errors.push(err);
            }
            for (let item of rows) {
              if (!orgServices.includes(item.name)) {
                query = "DELETE o FROM organisation_services o INNER JOIN list_of_services l ON o.service_id = l.service_id WHERE l.name = ? AND o.abn = ?";
                connection.query(query, [item.name, req.params.org_abn], function (err, rows, fields) {
                  if (err) {
                    errors.push(err);
                  }
                });
              }
            }
            for (let service of orgServices) {
              query = "SELECT * FROM organisation_services o INNER JOIN list_of_services l ON l.service_id = o.service_id WHERE l.name = ? AND o.abn = ?";
              connection.query(query, [service, req.params.org_abn], function (err, rows, fields) {
                if (err) {
                  errors.push(err);
                }
                if (rows.length == 0) {
                  query = "INSERT INTO organisation_services SELECT service_id, ? FROM list_of_services WHERE name = ?";
                  connection.query(query, [req.params.org_abn, service], function (err, rows, fields) {
                    if (err) {
                      errors.push(err);
                    }
                  });
                }
              });
            }
            if (errors.length > 0) {
              res.status(500).json({ errors });
            } else {
              res.sendStatus(200);
            }
          });
        });
      });
      connection.release();
    });
  } else {
    res.sendStatus(403);
  }
});

router.post('/login', function (req, res, next) {
  if (req.session.userid == null && req.session.orgabn == null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM organisations WHERE email = ?";
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
              req.session.orgabn = rows[0].abn;
              res.sendStatus(200);
            } else {
              res.sendStatus(401);
            }
          });
        } else {
          res.sendStatus(401);
        }
      });
    });
});

router.post('/signup', function (req, res, next) {
  if(req.session.userid == null && req.session.orgabn == null)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    let logindata = req.body.logindata;
    let orgServices = req.body.orgServices;
    let orgAddress = req.body.orgAddress;
    var checkQuery = "SELECT * FROM organisations WHERE abn = ? OR name = ? OR email = ?";
    connection.query(checkQuery, [logindata.orgABN, logindata.orgName, logindata.email], function (err, rows, fields) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      if (rows.length > 0) {
        res.sendStatus(400);
      } else {
        bcrypt.hash(logindata.password, saltRounds, function (err, hashedPassword) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          var query = "INSERT INTO address(number,street,city,state,postcode) VALUES(?,?,?,?,?);";
          connection.query(query, [orgAddress.Number, orgAddress.Street, orgAddress.City, orgAddress.State, orgAddress.Postcode], function (err, result, fields) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
            var insertQuery = "INSERT INTO organisations VALUES(?,?,?,?,?,?,?,?,?);";
            connection.query(insertQuery, [logindata.orgABN, logindata.orgName, logindata.firstname, logindata.lastname, logindata.email, logindata.phone, hashedPassword, logindata.orgDescription, result.insertId], function (err, rows, fields) {
              if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
              }
              for (let i of orgServices) {
                var Query = "INSERT INTO organisation_services VALUES(?,?);";
                connection.query(Query, [i, logindata.orgABN], function (err, rows, fields) {
                  if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                  }
                });
              }
              req.session.orgabn = logindata.orgABN;
              res.sendStatus(200);
            });
          });
        });
      }
    });
    connection.release();
  });
});

router.get('/page/:org_abn/info', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT o.abn, o.name, o.manager_firstname, o.manager_lastname, o.email, o.phone_number, o.description, a.* FROM organisations o INNER JOIN address a ON o.address_id = a.address_id WHERE o.abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.send(rows[0]);
    });
  });
});

router.get('/page/:org_abn/event/:event_id/info', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT e.*, a.*, o.name FROM events e INNER JOIN address a ON a.address_id = e.address_id INNER JOIN organisations o ON o.abn = e.abn WHERE e.event_id = ?;";
    connection.query(query, [req.params.event_id], function (err, rows) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.get('/page/:org_abn/event/:event_id/shift', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM events_shift WHERE event_id = ? AND date >= CURRENT_DATE();";
    connection.query(query, [req.params.event_id], function(err, rows) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.get('/page/:org_abn/event/:shift_id/positions', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT pl.position_id, pl.name, sp.num_people FROM shift_positions sp INNER JOIN position_list pl ON sp.position_id = pl.position_id WHERE sp.shift_id = ?;";
    connection.query(query, [req.params.shift_id], function(err, rows) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.get('/page/:org_abn/event/:shift_id/positions/:position_id', function(req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT application_id FROM events_application WHERE position_id = ? AND shift_id = ?;";
    connection.query(query, [req.params.position_id, req.params.shift_id], function(err, rows) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.json(rows);
    });
  });
});

router.get('/page/:org_abn/services', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM organisation_services o INNER JOIN list_of_services l ON o.service_id = l.service_id WHERE o.abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.send(rows);
    });
  });
});

function fetchOrganisationUpdates(req, res, next) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT * FROM users u INNER JOIN members m ON u.user_id = m.user_id WHERE m.abn = ? AND u.user_id = ?;";
    connection.query(query, [req.params.org_abn, req.session.userid], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        var query = "SELECT u.*, o.name FROM updates u INNER JOIN organisations o ON o.abn = u.abn WHERE o.abn = ? ORDER BY ABS(DATEDIFF(update_date_posted, CURDATE()));";
        connection.query(query, [req.params.org_abn], function (err, rows, fields) {
          if (err) {
            connection.release();
            res.sendStatus(500);
            return;
          }
          res.send(rows);
        });
      }
      else {
        var query = "SELECT u.*, o.name FROM updates u INNER JOIN organisations o ON o.abn = u.abn WHERE o.abn = ? AND u.isPublic = 1 ORDER BY ABS(DATEDIFF(update_date_posted, CURDATE()));";
        connection.query(query, [req.params.org_abn], function (err, rows, fields) {
          if (err) {
            connection.release();
            res.sendStatus(500);
            return;
          }
          res.send(rows);
        });
      }
      connection.release();
    });
  });
}
router.get('/page/:org_abn/update_list/list', fetchOrganisationUpdates);
router.get('/page/:org_abn/updates', fetchOrganisationUpdates);

router.get('/page/:org_abn/update_list', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT abn FROM organisations WHERE abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      if(rows.length>0) {
        res.sendFile(path.join(__dirname, '../private', 'update_page_list.html'));
      }
      else res.sendStatus(404);
    });
  });
});

router.get('/page/:org_abn/join_status', function (req, res) {
  if(req.session.orgabn != null || req.session.adminid != null) return res.sendStatus(418);
  if (req.session.userid == null) {
    res.status(401).send("/login_page");
  } else {
    req.pool.getConnection(function (err, connection) {
      var query = "SELECT * FROM users u INNER JOIN members m ON u.user_id = m.user_id WHERE m.abn = ? AND u.user_id = ?;";
      connection.query(query, [req.params.org_abn, req.session.userid], function (err, rows, fields) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        if (rows.length > 0) {
          res.sendStatus(200);
        }
        else {
          query = "SELECT form_id FROM application_forms WHERE abn = ? AND user_id = ?;";
          connection.query(query, [req.params.org_abn, req.session.userid], function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
            if (rows.length > 0) {
              res.sendStatus(418);
            }
            else res.status(412).send("/organisation/application_form/" + req.params.org_abn);
          });
        }
      });
      connection.release();
    });
  }
});

function getUserMembership(req, res, callback) {
  req.pool.getConnection(function (err, connection) {
    var query = "SELECT * FROM users u INNER JOIN members m ON u.user_id = m.user_id WHERE m.abn = ? AND u.user_id = ?;";
    connection.query(query, [req.params.org_abn, req.session.userid], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        callback(connection, rows);
      } else {
        connection.release();
        res.status(404).send('Not found');
      }
    });
  });
}

router.get('/page/:org_abn/events', function (req, res) {
  if(req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null) {
    var Aquery = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id WHERE e.abn = ?;";
    connection.query(Aquery, [req.params.org_abn], function (err, rows, fields) {
      connection.release();
      if (err) {
        res.sendStatus(500);
        return;
      }
      if (rows.length > 0) {
        res.send(rows);
      }
    });
  } else if(req.session.userid != null) {
    getUserMembership(req, res, function(connection, rows) {
      var Aquery = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id WHERE e.abn = ?;";
      connection.query(Aquery, [req.params.org_abn], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        if (rows.length > 0) {
          res.send(rows);
        }
      });
    });
  }
  else res.sendStatus(403);
});

router.get('/page/:org_abn/leave', function (req, res) {
  if (req.session.userid == null) {
    res.sendStatus(401);
  } else {
    getUserMembership(req, res, function(connection, rows) {
      var Aquery = "DELETE FROM members WHERE user_id = ?";
      connection.query(Aquery, [req.session.userid], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      });
    });
  }
});

router.get('/page/:org_abn/event/:event_id', function (req, res) {
  if(req.session.userid != null) {
    getUserMembership(req, res, function(connection, rows) {
      connection.release();
      res.sendFile(path.join(__dirname, '../private', 'volunteering_event_page.html'));
      return;
    });
  }
  else res.sendStatus(403);
});

router.get('/:org_abn/update_page/:update_id', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT u.abn FROM updates u INNER JOIN organisations o ON o.abn = u.abn WHERE o.abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      if(rows.length>0) {
        if(req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null) {
          connection.release();
          res.sendFile(path.join(__dirname, '../private', 'update_page_info.html'));
          return;
        }
        var query = "SELECT isPublic FROM updates WHERE update_id = ?";
        connection.query(query, [req.params.update_id], function (err, rows, fields) {
          if (err) {
            connection.release();
            res.sendStatus(500);
            return;
          }
          if (rows.length > 0) {
            let isPublic = rows[0].isPublic[0] === 1;
            if (isPublic) {
              connection.release();
              res.sendFile(path.join(__dirname, '../private', 'update_page_info.html'));
            }
            else {
              getUserMembership(req, res, function(connection, rows) {
                connection.release();
                res.sendFile(path.join(__dirname, '../private', 'update_page_info.html'));
              });
            }
          } else res.sendStatus(404);
        });
      }
      else res.sendStatus(404);
    });
    connection.release();
  });
});

router.get('/:org_abn/update_page/:update_id/info', function (req, res) {
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "SELECT u.abn FROM updates u INNER JOIN organisations o ON o.abn = u.abn WHERE o.abn = ?;";
    connection.query(query, [req.params.org_abn], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      if(rows.length>0) {
        if(req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null) {
          var query = "SELECT u.*, o.name  FROM updates u INNER JOIN organisations o ON u.abn = o.abn WHERE u.abn = ? AND update_id = ?";
          connection.query(query, [req.params.org_abn, req.params.update_id], function (err, rows, fields) {
            connection.release();
            if (err) {
              res.sendStatus(500);
              return;
            }
            res.send(rows[0]);
          });
        }
        else {
          var query = "SELECT isPublic FROM updates WHERE update_id = ?";
          connection.query(query, [req.params.update_id], function (err, rows, fields) {
            if (err) {
              connection.release();
              res.sendStatus(500);
              return;
            }
            if (rows.length > 0) {
              let isPublic = rows[0].isPublic[0] === 1;
              if (isPublic) {
                var query = "SELECT u.*, o.name  FROM updates u INNER JOIN organisations o ON u.abn = o.abn WHERE u.abn = ? AND update_id = ?";
                connection.query(query, [req.params.org_abn, req.params.update_id], function (err, rows, fields) {
                  connection.release();
                  if (err) {
                    res.sendStatus(500);
                    return;
                  }
                  res.send(rows[0]);
                });
              }
              else {
                getUserMembership(req, res, function(connection, rows) {
                  var query = "SELECT u.*, o.name  FROM updates u INNER JOIN organisations o ON u.abn = o.abn WHERE u.abn = ? AND update_id = ?";
                  connection.query(query, [req.params.org_abn, req.params.update_id], function (err, rows, fields) {
                    connection.release();
                    if (err) {
                      res.sendStatus(500);
                      return;
                    }
                    res.send(rows[0]);
                  });
                });
              }
            } else res.sendStatus(404);
          });
        }
      }
      else res.sendStatus(404);
    });
    connection.release();
  });
});

router.get('/profile/:org_abn', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null) {
    res.sendFile(path.join(__dirname, '../private', 'manager_profile.html'));
  }
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/info', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = `SELECT o.abn , o.name, o.manager_firstname, o.manager_lastname, o.email, o.phone_number, o.description, a.* FROM organisations o INNER JOIN address a ON o.address_id = a.address_id WHERE o.abn = ?`;
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/upcoming_events', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id WHERE e.abn = ? AND e.event_end_date >= CURRENT_DATE();";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/past_events', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM events e INNER JOIN address a ON a.address_id = e.address_id WHERE e.abn = ? AND e.event_end_date < CURRENT_DATE();";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/events/:event_id/shifts', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT ev.shift_id, ev.date, ev.start_time, ev.end_time, ev.description FROM events_shift ev INNER JOIN events e ON e.event_id = ev.event_id WHERE e.event_id = ? AND date >= CURRENT_DATE();";
      connection.query(query, [req.params.event_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/positions/:shift_id', function (req, res) {
  if (req.session.orgabn != null || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT pl.position_id, pl.name, sp.num_people FROM shift_positions sp INNER JOIN position_list pl ON sp.position_id = pl.position_id WHERE sp.shift_id = ?;";
      connection.query(query, [req.params.shift_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/:event_id/upcoming_shifts/', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT ev.shift_id, ev.date, ev.start_time, ev.end_time FROM events_shift ev INNER JOIN events e ON e.event_id = ev.event_id WHERE e.event_id = ? AND ev.date >= CURRENT_DATE() ORDER BY ABS(DATEDIFF(ev.date, CURDATE())), ev.start_time;";
      connection.query(query, [req.params.event_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/:event_id/past_shifts/', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT ev.shift_id, ev.date, ev.start_time, ev.end_time FROM events_shift ev INNER JOIN events e ON e.event_id = ev.event_id WHERE e.event_id = ? AND ev.date < CURRENT_DATE() ORDER BY ABS(DATEDIFF(ev.date, CURDATE())), ev.start_time;";
      connection.query(query, [req.params.event_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/shifts/:shift_id', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT COUNT(application_id) FROM events_application WHERE shift_id = ?;";
      connection.query(query, [req.params.shift_id], function (err, rows, fields) {
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

router.get('/profile/:org_abn/shifts/:shift_id/total_people', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT SUM(num_people) FROM shift_positions WHERE shift_id = ?;";
      connection.query(query, [req.params.shift_id], function (err, rows, fields) {
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

router.get('/profile/:org_abn/shifts/:shift_id/positions', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT pl.position_id, pl.name, sp.num_people FROM position_list pl INNER JOIN shift_positions sp ON pl.position_id = sp.position_id WHERE sp.shift_id = ?;";
      connection.query(query, [req.params.shift_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/shifts/:shift_id/positions/:position_id', function (req, res) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT u.user_firstname, u.user_lastname, u.user_email, u.user_phone FROM users u INNER JOIN events_application e ON u.user_id = e.user_id WHERE e.position_id = ? AND e.shift_id = ?;";
      connection.query(query, [req.params.position_id, req.params.shift_id], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/updates', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM updates WHERE abn = ? ORDER BY ABS(DATEDIFF(update_date_posted, CURDATE()));";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      });
    });
  else res.sendStatus(403);
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    "1037062424227-dofa2n2l5lqpolfvj1ui7tpa2van6obn.apps.googleusercontent.com",
    "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",
    "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({
    refresh_token: "1//04w0qge7gbCl_CgYIARAAGAQSNwF-L9Ir8gus6heysFn6gE0uXk-jzQVv_kJ2Tdi-I1HZPwhub1N4DdkMI4CjFqpVuLJTQltomEw"
});

const accessToken = oauth2Client.getAccessToken();
const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "volunteerwdcgroup49@gmail.com",
        clientId: "1037062424227-dofa2n2l5lqpolfvj1ui7tpa2van6obn.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04w0qge7gbCl_CgYIARAAGAQSNwF-L9Ir8gus6heysFn6gE0uXk-jzQVv_kJ2Tdi-I1HZPwhub1N4DdkMI4CjFqpVuLJTQltomEw",
        accessToken: accessToken
    }
});

router.post('/profile/:org_abn/newUpdate', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    var query = "INSERT INTO updates (update_title, update_date_posted, update_description,isPublic, abn) VALUES (?, NOW(), ?, ?, ?)";
    connection.query(query, [req.body.title, req.body.description, req.body.isPublic, req.params.org_abn], function (err, rows, fields) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT user_email FROM users u INNER JOIN members m ON u.user_id = m.user_id INNER JOIN emailconsent e ON e.consent_id = m.consent_id WHERE m.abn = ? AND e.updatesConsent = 1;";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
        if (err) {
          connection.release();
          res.sendStatus(500);
          return;
        }
        if(rows.length>0) {
          let memberEmails = rows.map(row => row.user_email).join(',');
          var query = "SELECT email, name, manager_firstname, manager_lastname, phone_number FROM organisations WHERE abn = ?";
          connection.query(query, [req.params.org_abn], function (err, results, fields) {
            connection.release();
            if (err) {
              console.error(err);
              res.sendStatus(500);
              return;
            }
            if(results.length > 0) {
              smtpTransport.sendMail({
                  from: `"${results[0].name}" <${results[0].email}>`,
                  to: memberEmails,
                  subject: req.body.title,
                  html: `
                  <h1>${req.body.title}</h1>
                  <p>${req.body.description}</p>
                  <hr>
                  <b>${results[0].manager_firstname} ${results[0].manager_lastname} from ${results[0].name}</b>
                  <p>Email: ${results[0].email}</p>
                  <p>Phone contact: ${results[0].phone_number}</p>
                  `,
              });
            }
          });
        }
        res.sendStatus(200);
      });
    });
  });
  else res.sendStatus(403);
});

router.post('/profile/:org_abn/newEvent', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
  req.pool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      res.sendStatus(500);
      return;
    }
    let eventData = req.body.eventData;
    let eventLocation = req.body.eventLocation;
    let eventShift = req.body.shiftData;
    var query = "INSERT INTO address SET number = ?, street = ?, city = ?, state = ?, postcode = ?;";
    connection.query(query, [eventLocation.number, eventLocation.street, eventLocation.city, eventLocation.state, eventLocation.postcode], function (err, result, fields) {
      if (err) {
        res.sendStatus(500);
        connection.release();
        return;
      }
      query = "INSERT INTO events (event_title, event_start_date, event_end_date, event_description, abn, address_id) VALUES (?, ?, ?, ?, ?, ?);";
      connection.query(query, [eventData.title, eventData.start_date, eventData.end_date, eventData.description, req.params.org_abn, result.insertId], function (err, rows, fields) {
        if (err) {
          res.sendStatus(500);
          connection.release();
          return;
        }
        let eventID = rows.insertId;
        for(let shift in eventShift) {
          query = "INSERT INTO events_shift SET date = ?, start_time = ?, end_time = ?, description = ?, event_id = ?;";
          connection.query(query, [eventShift[shift].date, eventShift[shift].start_time, eventShift[shift].end_time, eventShift[shift].description, eventID], function (err, row, fields) {
            if (err) {
              res.sendStatus(500);
              connection.release();
              return;
            }
            for(let position in eventShift[shift].position_list) {
              let Query = "INSERT INTO shift_positions VALUES(?,?,?)";
              connection.query(Query, [eventShift[shift].position_list[position].id, row.insertId, eventShift[shift].position_list[position].num_people], function (err, rows, fields) {
                if (err) {
                  res.sendStatus(500);
                  connection.release();
                  return;
                }
              });
            }
          });
        }
        var query = "SELECT user_email FROM users u INNER JOIN members m ON u.user_id = m.user_id INNER JOIN emailconsent e ON e.consent_id = m.consent_id WHERE m.abn = ? AND e.eventsConsent = 1;";
        connection.query(query, [req.params.org_abn], function (err, rows, fields) {
          if (err) {
            connection.release();
            res.sendStatus(500);
            return;
          }
          if(rows.length >0) {
            let memberEmails = rows.map(row => row.user_email).join(',');
            var query = "SELECT email, name, manager_firstname, manager_lastname, phone_number FROM organisations WHERE abn = ?";
            connection.query(query, [req.params.org_abn], function (err, results, fields) {
              connection.release();
              if (err) {
                res.sendStatus(500);
                return;
              }
              if(results.length > 0) {
                smtpTransport.sendMail({
                    from: `"${results[0].name}" <${results[0].email}>`,
                    to: memberEmails,
                    subject: eventData.title,
                    html: `
                    <h1>${eventData.title}</h1>
                    <p><b>Location:</b> ${eventLocation.number} ${eventLocation.street}, ${eventLocation.city}</p>
                    <p><b>Start Date:</b> ${new Date(eventData.start_date).toDateString()} | <b>End Date:</b> ${new Date(eventData.end_date).toDateString()}</p>
                    <p>${eventData.description}</p>
                    <hr>
                    <b>${results[0].manager_firstname} ${results[0].manager_lastname} from ${results[0].name}</b>
                    <p>Email: ${results[0].email}</p>
                    <p>Phone contact: ${results[0].phone_number}</p>
                    `,
                });
              }
            });
          }
          res.sendStatus(200);
        });
      });
    });
  });
  else res.sendStatus(403);
});

router.post('/profile/:org_abn/:event_id/modifyEvent', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      let eventData = req.body.eventData;
      let eventLocation = req.body.eventLocation;
      let eventShift = req.body.shiftData;
      let query = "UPDATE events SET event_title = ?, event_start_date = ?, event_end_date = ?, event_description = ? WHERE event_id = ?;";
      connection.query(query, [eventData.title, eventData.start_date, eventData.end_date, eventData.description, req.params.event_id], function (err, rows, fields) {
        if (err) {
          connection.release();
          res.sendStatus(500);
          return;
        }
      });
      query = "UPDATE address a INNER JOIN events e ON e.address_id = a.address_id SET a.number = ?, a.street = ?, a.city = ?, a.state = ?, a.postcode = ? WHERE e.event_id = ?";
      connection.query(query, [eventLocation.number, eventLocation.street, eventLocation.city, eventLocation.state, eventLocation.postcode, req.params.event_id], function (err, rows, fields) {
        if (err) {
          connection.release();
          res.sendStatus(500);
          return;
        }
      });

      query = "SELECT shift_id, event_id FROM events_shift WHERE event_id = ?;";
      connection.query(query, [req.params.event_id], function (err, existing_shifts, fields) {
        if (err) {
          connection.release();
          return res.sendStatus(500);
        }

        for (let shift in eventShift) {
          for (let item1 in existing_shifts) {
            if (eventShift[shift].shift_id == existing_shifts[item1].shift_id) {
              query = "UPDATE events_shift SET date = ?, start_time = ?, end_time = ?, description = ? WHERE shift_id = ?;";
              connection.query(query, [eventShift[shift].date, eventShift[shift].start_time, eventShift[shift].end_time, eventShift[shift].description, existing_shifts[item1].shift_id], function (err, rows, fields) {
              });
              query = "SELECT * FROM shift_positions WHERE shift_id = ?;";
              connection.query(query, [existing_shifts[item1].shift_id], function (err, existing_positions, fields) {
                for (let position in eventShift[shift].position_list) {
                  for (let item2 in existing_positions) {
                    if (eventShift[shift].position_list[position].id == existing_positions[item2].position_id) {
                      query = "UPDATE shift_positions SET num_people = ? WHERE position_id = ? AND shift_id = ?;";
                      connection.query(query, [eventShift[shift].position_list[position].num_people, existing_positions[item2].position_id, existing_shifts[item1].shift_id], function (err, rows, fields) {
                      });
                    }
                  }
                  if (eventShift[shift].position_list[position].status == null) {
                    query = "INSERT INTO shift_positions VALUES(?,?,?)";
                    connection.query(query, [eventShift[shift].position_list[position].id, existing_shifts[item1].shift_id, eventShift[shift].position_list[position].num_people], function (err, rows, fields) {
                    });
                  }
                }
              });
            }
          }
          if (eventShift[shift].shift_id == null) {
            query = "INSERT INTO events_shift SET date = ?, start_time = ?, end_time = ?, description = ?, event_id = ?;";
            connection.query(query, [eventShift[shift].date, eventShift[shift].start_time, eventShift[shift].end_time, eventShift[shift].description, req.params.event_id], function (err, rows2, fields) {
              for (let position in eventShift[shift].position_list) {
                let Query = "INSERT INTO shift_positions VALUES(?,?,?)";
                connection.query(Query, [eventShift[shift].position_list[position].id, rows2.insertId, eventShift[shift].position_list[position].num_people], function (err, rows, fields) {
                  if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    connection.release();
                    return;
                  }
                });
              }
            });
          }
        }
      });
      connection.release();
      res.sendStatus(200);
    });
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/events/:event_id/info', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT * FROM events e INNER JOIN address a ON e.address_id = a.address_id WHERE e.event_id = ?;";
      connection.query(query, [req.params.event_id], function (err, rows, fields) {
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

router.get('/profile', function (req, res) {
  if (req.session.orgabn != null) res.redirect('/organisation/profile/' + req.session.orgabn);
  else res.sendStatus(403);
});

router.get('/profile/:org_abn/users/:user_id/num_shifts_completed', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
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

router.get('/profile/:org_abn/current_members', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn|| req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT u.user_id, u.user_firstname, u.user_lastname, u.user_email, u.user_phone, u.user_skill, u.user_experience, m.joined_date FROM users u INNER JOIN members m ON u.user_id = m.user_id WHERE m.abn = ? ORDER BY ABS(DATEDIFF(m.joined_date, CURDATE()));";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
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

router.post('/profile/:org_abn/current_members/kick_members', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "DELETE FROM members WHERE abn = ? AND user_id = ?;";
      connection.query(query, [req.params.org_abn, req.body.user_id], function (err, rows, fields) {
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

router.get('/profile/:org_abn/pending_applications', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn || req.session.adminid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "SELECT u.user_id, u.user_firstname, u.user_lastname, u.user_email, u.user_phone, u.user_skill, u.user_experience,a.answers, a.apply_date FROM users u INNER JOIN application_forms a ON u.user_id = a.user_id WHERE a.abn = ? ORDER BY ABS(DATEDIFF(a.apply_date, CURDATE()));";
      connection.query(query, [req.params.org_abn], function (err, rows, fields) {
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

router.post('/profile/:org_abn/pending_applications/delete_app', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "DELETE FROM application_forms WHERE abn = ? AND user_id = ?;";
      connection.query(query, [req.params.org_abn, req.body.app_id], function (err, rows, fields) {
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

router.post('/profile/:org_abn/pending_applications/add_to_current_members', function (req, res, next) {
  if (req.session.orgabn != null && req.session.orgabn == req.params.org_abn)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        res.sendStatus(500);
        return;
      }
      var query = "INSERT INTO `members` (`joined_date`, `user_id`, `abn`, `consent_id`) SELECT NOW(), user_id, abn, consent_id FROM application_forms WHERE user_id = ? AND abn = ?;";
      connection.query(query, [req.body.app_id, req.params.org_abn], function (err, rows, fields) {
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

router.get('/application_form/:org_abn', function (req, res) {
  if (req.session.userid != null) {
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        return res.sendStatus(500);
      }
      var query = "SELECT form_id FROM application_forms WHERE abn = ? AND user_id = ?;";
      connection.query(query, [req.params.org_abn, req.session.userid], function (err, rows, fields) {
        connection.release();
        if (err) {
          res.sendStatus(500);
          return;
        }
        if (rows.length > 0) {
          res.sendStatus(403);
        }
        else {
          res.sendFile(path.join(__dirname, '../private', 'application_form.html'));
          return;
        }
      });
    });
  }
  else res.sendStatus(403);
});

router.post('/application_form/:org_abn/submit_application', function (req, res, next) {
  if (req.session.userid != null)
    req.pool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        return res.sendStatus(500);
      }
      var query = "INSERT INTO emailconsent (updatesConsent, eventsConsent) VALUES (?, ?);";
      connection.query(query, [req.body.updatesConsent, req.body.eventsConsent], function (err, rows, fields) {
        if (err) {
          connection.release();
          console.log(err);
          return res.sendStatus(500);
        }
        var query = "INSERT INTO application_forms SET ?, apply_date = CURRENT_TIMESTAMP";
        var details = {
          answers: req.body.answer,
          user_id: req.session.userid,
          abn: req.params.org_abn,
          consent_id: rows.insertId
        };
        connection.query(query, details, function (err, rows, fields) {
          connection.release();
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          else {
            res.sendStatus(200);
          }
        });
      });
    });
  else res.sendStatus(403);
});

module.exports = router;