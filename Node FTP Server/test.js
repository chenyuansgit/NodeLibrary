var utils = require('./utils.js').utils;
var ftpConfig = require('./serverConfig.js').ftpConfig;

utils.printLog('Server listening on:', 'ip =',ftpConfig.host,'port =',ftpConfig.port);