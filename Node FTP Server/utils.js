var fs = require('fs');

var utils = {
	// 打印日志
	printLog: function(){
		//console.log(arguments);
		var log = '';
		for(var key in  arguments) {
			log += arguments[key];
			log += ' ';
		}
		console.log(log);
	},
	// 删除目录
	deleteFolder : function(path) {
        try{
            if( fs.existsSync(path) ) {
                fs.readdirSync(path).forEach(function(file) {
                    var curPath = path.join(path, file);
                    if(fs.statSync(curPath).isDirectory()) { // recurse
                        arguments.callee(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
            	});
                fs.rmdirSync(path);
            }
            return true;
        } catch(e) {
            return false;
        }
    }
}

exports.utils = utils;