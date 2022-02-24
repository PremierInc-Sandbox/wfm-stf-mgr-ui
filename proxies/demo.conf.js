let proxy = require('./base.conf');
module.exports = Object.assign({},
  proxy("/pcops/staff-scheduler-rest", "https://pco-gateway-uat-inside.premierinc.com"),
);
