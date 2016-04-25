
// 获取一个字符串所占的字节数
function getStrBytes(str){
    var byteLen = 0;
    var len = str.length;
    if(str) {
        for(var i = 0; i< len; i++){
            if(str.codePointAt(i)> 0xFFFF){ // es6
                byteLen += 4;
                i += 1; // 该Unicode码占2个字符,4个字节
                continue;
            } else if(str.charCodeAt(i) > 255) {
                byteLen += 2;
                continue;
            } else {
                byteLen++;
            }
        }
    }
    return byteLen;
}

/*
console.log(getStrBytes('abc')); // 3
console.log(getStrBytes('abc哈')); // 5
console.log(getStrBytes('𠮷abc哈')); // 9
*/

exports.getStrBytes = getStrBytes;