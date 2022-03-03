let proxy = require('./base.conf');
module.exports = Object.assign({},
  proxy("/pcops/staff-scheduler-rest", "http://localhost:9090"),
  proxy("/pcops/datamanagement-rest", "https://pco-gateway-dev.premierinc.com")
);






