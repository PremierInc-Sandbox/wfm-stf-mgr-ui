function proxy(pattern, target, options = {}) {
  return {
    [pattern]: Object.assign({
      target,
      "secure": false,
      "logLevel": "debug",
      "changeOrigin": true,
      bypass(req) {
        if (!req.headers["HTTP_USER"]) {
          req.headers["HTTP_USER"] = ["sfarmer"]
        }
      }
    }, options)
  };
}

module.exports = proxy;
