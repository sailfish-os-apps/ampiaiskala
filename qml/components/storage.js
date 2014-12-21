.pragma library
.import QtQuick.LocalStorage 2.0 as LS

var identifier = "Ampiaiskala";
var description = "Ampiaiskala database";

var QUERY = {
    CREATE_SETTINGS_TABLE: 'CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);'
}

/**
  Open app's database, create it if not exists.
*/
var db = LS.LocalStorage.openDatabaseSync(identifier, "", description, 10240, function(db) {
    db.changeVersion(db.version, "1.0", function(tx) {
        // Create settings table (key, value)
        tx.executeSql(QUERY.CREATE_SETTINGS_TABLE);
    });
});

/**
  Read all settings.
*/
function readFeedSettings() {
    var res = {};
    db.readTransaction(function(tx) {
        var rs = tx.executeSql('SELECT * FROM settings;')
        for (var i=0; i<rs.rows.length; i++) {
            if (rs.rows.item(i).value === 'true') {
                res[rs.rows.item(i).key] = true;
            }
            else if (rs.rows.item(i).value === 'false') {
                res[rs.rows.item(i).key] = false;
            } else {
                res[rs.rows.item(i).key] = rs.rows.item(i).value
            }
            //console.log("key=" + rs.rows.item(i).key + "; value=" + rs.rows.item(i).value);
        }
    });
    return res;
}

/**
  Write setting to database.
*/
function writeSetting(key, value) {
    //console.debug("writeSetting(" + key + "=" + value + ")");

    if (value === true) {
        value = 'true';
    }
    else if (value === false) {
        value = 'false';
    }

    db.transaction(function(tx) {
        tx.executeSql("INSERT OR REPLACE INTO settings VALUES (?, ?);", [key, value]);
        tx.executeSql("COMMIT;");
    });

}

/**
 Read given setting from database.
*/
function readSetting(key, onSuccess) {

    var res = "";
    db.readTransaction(function(tx) {
        var rows = tx.executeSql("SELECT value AS val FROM settings WHERE key=?;", [key]);

        if (rows.rows.length !== 1) {
            res = false;
        } else {
            res = rows.rows.item(0).val;
        }
    });
    //console.debug("key=" + key + "; value=" + res);

    if (res === 'true') {
        res = true;
    }
    else if (res === 'false') {
        res = false;
    }

    onSuccess(res);
}
