let proxy = require('./base.conf');
module.exports = Object.assign({},
  proxy("/pcops/staff-scheduler-rest", "https://pco-gateway-dev-inside.premierinc.com")
);
