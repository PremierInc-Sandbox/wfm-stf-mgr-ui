let proxy = require('./base.conf');
module.exports = Object.assign({},
  proxy("/pcops/staff-scheduler-rest", "https://c3pupcops1:8443"),
  proxy("/mstr-rest", "https://pco-gateway-prod-inside.premierinc.com"),
  proxy("/pcops/datamanagement-rest", "https://pcops-inside.premierinc.com")
);
