var utils = {
	printLog: function(){
		//console.log(arguments);
		var log = '';
		for(var key in  arguments) {
			log += arguments[key];
			log += ' ';
		}
		console.log(log);
	}
}

exports.utils = utils;