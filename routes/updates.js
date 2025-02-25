var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/all_update', function (req, res) {
    res.sendFile(path.join(__dirname, '../private', 'update_page_list.html'));
});

router.get('/all_update/list', function (req, res) {
    req.pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            res.sendStatus(500);
            return;
        }
        var query = "SELECT u.* ,o.name FROM updates u INNER JOIN organisations o ON u.abn = o.abn WHERE isPublic = 1;";
        connection.query(query, function (err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.send(rows);
        });
    });
});

module.exports = router;