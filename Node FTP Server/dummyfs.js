
function dummyfs() {
    this.dir = "/";     // 当前子路径名称
    this.rootDir = ""; // 要隐藏的根路径名
}

dummyfs.prototype.chdir = function (dir) {
    console.log("dir chdir to begin:", dir);
    if ((this.dir == this.rootDir) && dir == "..") {
        return "/";
    }

    if (dir.charAt(dir.length - 1) != "/") dir += "/";
    if (dir.charAt(0) != "/") {
        if (dir.substr(0, 2) == "..") {
            x = dir.split("/");
            for (i = 0; i < x.length; i++) {
                if (x[i] == "..") {
                    part = this.dir.split("/");
                    part.splice(part.length - 2, 1);
                    ret = part.join("/");
                    if (ret.charAt(ret.length - 1) != "/") ret += "/";
                    this.dir = ret;
                }
                else {
                    this.dir += x[i];
                }
            }
        }
        else {
            if (dir.substr(0, 2) == "./") {
                this.dir += dir.substr(2, dir.length);
            }
            else {
                this.dir += dir;
            }
        }
    }
    else { // 参数路径以/开头
        this.dir = dir;
    }
    if (this.dir.charAt(this.dir.length - 1) != "/") this.dir += "/";

    console.log("dir chdir to end:", this.dir);
    return this.dir;
}

dummyfs.prototype.cwd = function (all) {
    console.log('++dir++:', this.dir,'++root++',this.rootDir);
    if (all) {
        //console.log('++return dir++:', this.rootDir+this.dir);
        return (this.rootDir+this.dir);
    }
    //console.log('++return dir++:', this.dir);
    return this.dir;
}

exports.dummyfs = dummyfs;
