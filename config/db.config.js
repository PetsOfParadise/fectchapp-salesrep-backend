require('dotenv').config();
const db = require('knex')({
    // mysql2, not mysql: the legacy driver cannot authenticate against MySQL 8+/9
    // caching_sha2_password and fails every connection with ER_NOT_SUPPORTED_AUTH_MODE.
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        // mysql2 auto-parses JSON columns into objects; the legacy driver returned raw
        // strings, and the codebase JSON.parse()s them (e.g. cartItems.attribute/options).
        // Hand JSON back as strings so that existing code keeps working.
        typeCast: function (field, next) {
            if (field.type === 'JSON') {
                return field.string()
            }
            return next()
        },
    },
    // Without a pool block knex defaults to max 10 and never retires idle
    // connections. MySQL closes them itself at wait_timeout, knex keeps handing
    // out the dead sockets, and queries hang rather than error - which is why the
    // API "kept loading" with nothing in the logs until the process was restarted.
    // Retiring idle connections well inside wait_timeout keeps stale sockets out
    // of the pool; acquireConnectionTimeout turns any future exhaustion into a
    // fast, logged failure instead of an invisible hang.
    pool: {
        min: 2,
        max: 20,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 10000,
    },
    acquireConnectionTimeout: 10000,
    debug: false
})


export default { db };
