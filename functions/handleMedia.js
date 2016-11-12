var mysql = require('mysql');
var config = require('./../config.json');

module.exports = {

    saveMedia: function (req, res, next) {
        req.file_path = path.join(config.storage.path, req.body.media_type);
        var timestamp = new Date();

        var time = timestamp.toISOString().slice(0, 19).replace('T', ' ');
        req.file_name = path.join(req.file_path, timestamp.getTime() + '_' + req.files[0].originalname);

        if (req.body.name === "") {
            var name = 'unnamed';
        } else {
            var name = mysql.escape(req.body.name);
        }

        connection = req.app.get("connection");

        connection.query({
            sql: "INSERT INTO " + config.mysql.prefix + "media " +
            "(media_type, name, active, demo, owner, manifest, origin_file, created_at, updated_at)" +
            " VALUES " +
            "(?, ?, 1, 1, ?, '', ?, ?, ?)",
            values: [req.body.media_type, name, req.decoded.sub, req.file_name, time, time]
        }, function (err, results) {
            if (err) {
                res.send(JSON.stringify({success: false, message: err.message}));
                //res.json({success: false, message: err.message});
                return;
            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.json({success: false, message: err.message});
                    }
                });
                console.log('media in database success!');
                req.media_id = results.insertId;
                next();
            }


        });
    },
    searchMedia: function (req, res, next) {

        connection = req.app.get("connection");

        connection.query({
            sql: "SELECT origin_file FROM " + config.mysql.prefix + "media WHERE media_id=?",
            values: [req.params.id]
        }, function (err, results) {
            if (err) {
                res.send(JSON.stringify({success: false, message: err.message}));

                return;
            } else {
                connection.commit(function (err) {

                    if (err) {
                        res.send(JSON.stringify({success: false, message: err.message}));

                        return;
                    }
                });
                req.media_path = results[0].origin_file;
                next();
            }


        });
    }

};
