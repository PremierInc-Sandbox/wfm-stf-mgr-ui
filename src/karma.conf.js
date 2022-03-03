// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
process.env.CHROME_BIN = require('puppeteer').executablePath();
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-htmlfile-reporter')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      }
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/wtf'),
      reports: ['html', 'lcovonly', 'text-summary', 'progress', 'kjhtml'],
      fixWebpackSourcePaths: true,
      thresholds: {
        statements: 61.00,
        lines: 60.00,
        branches: 39.40,
        functions: 56.04,
      }
    },
    customLaunchers: {
      Chrome_without_security: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-gpu',
          '--no-sandbox'
        ]
      }
    },
    reporters: ['progress', 'kjhtml', 'junit', 'html'],
    junitReporter: {
      outputDir: require('path').join(__dirname, '../reports'),
    },
    htmlReporter: {
      outputFile: require('path').join(__dirname, '../reports/index.html'),
      pageTitle: 'Unit Tests',
      groupSuites: true,
      useCompactStyle: true,
      // useLegacyStyle: true,
      showOnlyFailed: false
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    browserDisconnectTimeout : 300000,
    browserNoActivityTimeout : 100000
  });
};
