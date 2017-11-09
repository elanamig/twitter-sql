const { Client } = require ("pg");
const postgresUrl = 'postgres://localhost/twitter';
const client = new Client (postgresUrl);

client.connect (err => {
    if (err) console.log (err);
    else {
        console.log("connected");
    }
});

module.exports = client;