"use strict";

var tcp = require('net');
var cp = require('child_process');
var fs = require('fs');

var utils = require('./utils.js').utils;
var dummyfs = require('./dummyfs.js');
var ftpConfig = require('./serverConfig.js').ftpConfig;

//  去除字符串左右空格符
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

function createServer(host){
	// 创建tcp服务器接收数据
	var server = tcp.createServer();
	// 监听客户端连接
	server.on('connection',function(socket){
		// 为socket添加属性
		socket.passive = true; // 默认为被动模式
		socket.pasvhost = host; 
		socket.pasvport = 0;

		socket.mode = "ascii";
		socket.filefrom = "";
		socket.totsize = 0;
        socket.filename = ""; // 下载文件

		socket.username = ""; // 用户名／密码
        socket.password = "";

        socket.datatransfer = null; // 功能函数
        socket.fs = new dummyfs.dummyfs();

        // 通知FTP客户端server准备完毕
        socket.write("220 FTP server (nodeftpd) ready\r\n");

		/*
            214-The following commands are recognized:
            USER   PASS   QUIT   CWD    PWD    PORT   PASV   TYPE
            LIST   REST   CDUP   RETR   STOR   SIZE   DELE   RMD
            MKD    RNFR   RNTO   ABOR   SYST   NOOP   APPE   NLST
            MDTM   XPWD   XCUP   XMKD   XRMD   NOP    EPSV   EPRT
            AUTH   ADAT   PBSZ   PROT   FEAT   MODE   OPTS   HELP
            ALLO   MLST   MLSD   SITE   P@SW   STRU   CLNT   MFMT
            214 Have a nice day.
        */
        // socket接收到客户端消息
        socket.on("data",function(data){
        	// 解析接收到的数据
        	utils.printLog('data:',data);
        	var data = data.toString();
        	data = data.replace(' ','|');//将第一个空格符转换成｜
        	var command = data.split('|');//将数据拆分到数组
        	utils.printLog('command:',command);
        	// 对客户端发出的命令进行响应
        	switch (command[0].trim().toUpperCase()) {
        		case "USER": // 用户名
                    // 获取用户名
                    socket.username = command[1].trim();
                    // 用户名不能为空
                    if (!socket.username) {
                        socket.write("332 input username! \r\n");
                        return;
                    }
                    // 设置要显示的路径
                    utils.printLog('config dir:',ftpConfig.displayDir);
                    socket.fs.displayDir = ftpConfig.displayDir;
                    socket.fs.dir = ftpConfig.displayDir;
                    // 通知客户端输入密码
                    socket.write("331 password required for " + socket.username + "\r\n");
                    break;
                case "PASS": // 验证登录密码
                	socket.password = command[1].trim();
                    if (ftpConfig.password === socket.password) {
                        socket.write("230 Logged on\r\n");
                    } else {
                        socket.write("331 password is error \r\n");
                    }
                    break;


        		case 'CDUP': // 切换到父路径
        			socket.write("250 Directory changed to " + socket.fs.chdir("..") + "\r\n");
                    break;
                case "CWD": // 切换工作路径
                    var chDir = command[1].trim();
                    socket.write("250 CWD successful." + socket.fs.chdir(chDir) + "is current directory\r\n");
                    break;

                case "PWD": // 打印当前路径
                    socket.write("257 " + socket.fs.cwd() + " is current directory\r\n");
                    break;

                case "SYST": // 查询系统类型
                    socket.write("215 UNIX emulated by NodeFTPd\r\n");
                    break;

                case "FEAT": // 获取性能列表
                	socket.write("211-Features\r\n");
                    //socket.write(" SIZE\r\n");
                    socket.write("211 end\r\n");
                    break;

                case "TYPE": // 设置传输类型
                    if (command[1].trim() == "A") {
                        socket.mode = "ascii";
                        socket.write("200 Type set to A\r\n");
                    }
                    else {
                        socket.mode = "binary";
                        socket.write("200 Type set to I\r\n");
                    }
                    break;
                case "PORT": // 指明服务器连接的ip和端口
                    socket.passive = false; // 主动模式
                    var addr = command[1].split(",");
                    socket.pasvhost = addr[0] + "." + addr[1] + "." + addr[2] + "." + addr[3];
                    socket.pasvport = (parseInt(addr[4]) * 256) + parseInt(addr[5]);
                    utils.printLog('host:',socket.pasvhost,'port:',socket.pasvport);
                    socket.write("200 PORT command successful.\r\n");
                    break;

                case "LIST": // 列出服务器路径下的文件
                	socket.datatransfer = function (pasvconn) {
                        socket.write("150 Connection Accepted\r\n");
                        utils.printLog('full path:', socket.fs.cwd(true));

                        var ls = cp.execFile('ls',['-al',socket.fs.cwd(true)], function(error, result) {
                        	if(error) {
                        		socket.write("502 list the directory faild \r\n");
                        		return ;
                        	}
                            pasvconn.write(result);
                            pasvconn.end();
                            socket.write("226 Transfer OK\r\n");
                        });
                        
                    };
                	if (!socket.passive) { // 主动模式下创建端口传输数据
                        socket.datatransfer(tcp.createConnection(socket.pasvport, socket.pasvhost));
                    }
                    break;
        	}
        });

        // socket发生错误
        socket.on('error',function(error){
        	utils.printLog('socket error:',error);
        });
        // socket关闭
        socket.on('close',function(){
        	utils.printLog('socket closed');
        });
         // 客户端与服务器断开
        socket.on('end',function(){
        	utils.printLog('socket end');
        });


	});
	return server;
}

exports.createServer = createServer;