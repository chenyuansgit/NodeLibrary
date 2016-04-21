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
                    utils.printLog('config root dir:',ftpConfig.rootDir);
                    socket.fs.rootDir = ftpConfig.rootDir;
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
                    var toPath = socket.fs.chdir("..");
                    utils.printLog('cdup:', toPath);
        			socket.write("250 Directory changed to " + toPath + "\r\n");
                    break;
                case "CWD": // 切换工作路径
                    var chDir = command[1].trim();
                    utils.printLog('ftp cwd path:',chDir);
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

                case "PASV": // 切换到被动模式
                    break;


                case "LIST": // 列出服务器路径下的文件
                	socket.datatransfer = function (pasvconn) {
                        socket.write("150 Connection Accepted\r\n");
                        utils.printLog('full path:', socket.fs.cwd(true),'part:', socket.fs.cwd());

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

                case "STOR": // 上传文件
                    socket.datatransfer = function (pasvconn) {
                        pasvconn.setEncoding(socket.mode);
                        socket.write("150 Connection Accepted\r\n");
                        // 将文件上传至FTP服务器
                        var ftpPath = socket.fs.cwd(true) + command[1].trim();
                        utils.printLog('ftp stor path:',ftpPath);
                        pasvconn.pipe(fs.createWriteStream(ftpPath, {encoding: socket.mode}));
                        pasvconn.on("end", function () {
                            //utils.printLog('transfer data over:',ftpPath);
                            socket.write("226 Closing data connection\r\n");
                        });

                        pasvconn.on("error", function (had_error) {
                            //utils.printLog('transfer data error:',ftpPath, had_error);
                            socket.write("226 store faild! \r\n");
                        });
                    };
                    if (!socket.passive) {
                        utils.printLog('调用主动模式');
                        socket.datatransfer(tcp.createConnection(socket.pasvport, socket.pasvhost));
                    }
                    break;
                case "RETR": // 下载文件
                    socket.datatransfer = function (pasvconn) {
                        // 设置pasvconn的编码
                        pasvconn.setEncoding(socket.mode);
                        socket.write("150 Connection Accepted\r\n");

                        if (socket.fs.cwd(true) + command[1].trim() != socket.filename) {
                            socket.totsize = 0;
                        }
                        socket.filename = socket.fs.cwd(true) + command[1].trim();
                        // 读取文件
                        utils.printLog('ftp retr filename:',socket.filename);
                        fs.readFile(socket.filename, socket.mode, function(error, data){
                            if (pasvconn.readyState == "open") {
                                pasvconn.write(data, socket.mode);
                            }
                             pasvconn.end();
                         });
                        pasvconn.on("end", function () {
                            socket.write("226 Closing data connection, sent " + socket.totsize + " bytes\r\n");
                        });
                        pasvconn.on("error", function (had_error) {
                            utils.printLog("RETR error: ",had_error);
                        });
                    };
                    if (!socket.passive) {
                        socket.datatransfer(tcp.createConnection(socket.pasvport, socket.pasvhost));
                    }
                    break;

                case "DELE": // 删除文件
                    var filepath = socket.fs.cwd(true) + command[1].trim();
                    utils.printLog('ftp delete filename:',filepath);
                    try{
                        fs.unlink(filepath, function(error, result){
                            if(error) {
                                socket.write("250 file deleted faild\r\n");
                                return;
                            } 
                            socket.write("226 delete the file \r\n");
                        });
                    }catch (e){
                        socket.write("250 file deleted faild\r\n");
                    }
                    break;
                case "RMD": //删除目录
                    // 获取要删除的文件的路径
                    var filepath = socket.fs.cwd(true) + command[1].trim();
                    utils.printLog('ftp rm dir:',filepath);
                    try{
                        fs.rmdir(filepath, function(error, result){
                            if(error) {
                                socket.write("451 deleted the Directory faild\r\n");
                                return;
                            }
                            socket.write("226 deleted the Directory success \r\n");
                        });
                    } catch(e) {
                        socket.write("451 deleted the Directory faild\r\n");
                    }       
                    break;
                case "MKD": //创建目录
                    // 获取要新建的目录名称
                    var dirPath = socket.fs.cwd(true) + command[1].trim();
                    // 新建目录
                    try{
                        fs.mkdir(dirPath,function(error, result){
                            if(error){
                                socket.write("451 mkdir failure \r\n");
                                return;
                            }
                            socket.write("226 create the Directory \r\n");
                        });
                    } catch(e){
                        socket.write("451 mkdir failure \r\n");
                    } 
                    break;
                case "RNFR": // 重命名开始
                    socket.filefrom = socket.fs.cwd(true) + command[1].trim();
                    socket.write("350 File exists, ready for destination name.\r\n");
                    break;
                case "RNTO": // 重命名
                    var fileto = socket.fs.cwd(true) + command[1].trim();
                    console.log(socket.filefrom, '=>', fileto);
                    try{
                         fs.rename(socket.filefrom, fileto, function(error, result){
                            if(error){
                                socket.write("451 file renamed faild\r\n");
                                return;
                            }
                            socket.write("250 file renamed successfully\r\n");
                         });
                    } catch(e){
                        socket.write("451 file renamed faild\r\n");
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