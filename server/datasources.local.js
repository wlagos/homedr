module.exports = {
  mongodb: {
    "url": process.env.DB_URI,
    "name": "mongodb",
    "connector": "mongodb"
  },
  "email": {
    "name": "email",
    "connector": "mail",
    "transports": [
      {
        "type": "smtp",
        "host": process.env.SMTP_HOST,
        "secure": true,
        "port": process.env.SMTP_PORT,
        "tls": {
          "rejectUnauthorized": false
        },
        "auth": {
          "user": process.env.SMTP_USER,
          "pass": process.env.SMTP_PASS
        }
      }
    ]
  }
}