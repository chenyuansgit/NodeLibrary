var ftpd = require('./ftpServer.js');
var ftpConfig = require('./serverConfig.js').ftpConfig;
var utils = require('./utils.js').utils;

// 创建ftp服务器
ftpd.createServer(ftpConfig.host).listen(ftpConfig.port, function(){
	utils.printLog('Server listening on:', 'ip =',ftpConfig.host,'port =',ftpConfig.port);
});