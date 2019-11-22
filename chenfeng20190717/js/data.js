var hosturl = "http://pad.chenfengedu.com/nursery";
//var hosturl = "http://localhost:8080/nursery";
var ctf = hosturl + "/f";

var errormap = {
    "1018": "暂无访问权限，请联系管理员开通",
    "1017": "未登录或登录超时。请重新登录，谢谢！",
    "1014": "该校区已停用",
    "1015": "该校区授权已过期",
    "1010": "用户或密码错误, 请重试.",
    "1011": "该已帐号禁止登录",
    "1012": "请联系管理员授权该设备",
    "1013": "请联系管理员分配该校区",
    "1016": "无版本信息"
};
var logoutcode = {"1017":"1", "1014":"1", "1015":"1", "1011":"1"};
$(function () {
    var interval = window.setInterval("checkMusicSta()", 1000);

})

//页面跳转
function jump(name) {
    window.location.href = name;
}

//获取机器信息
function getMacInfo() {
    var obj = window.external.getMacInfo();
    var objjson = JSON.parse(obj);
    var macaddress = objjson["mac"];
    var system = objjson["sys"];
    var info = {
        "macaddress": macaddress,
        "system": system
    };
    return info;
}

//设置参数
function getParam(id) {
    var info = window.external.getParam(id);
    return info;
}

//获取参数
function setParam(id, data) {
    window.external.setParam(id, data);
}

//下载文件
function downloadFiles1(files) {
	var list = [];
	var map = {};
	for(var i=0;i<files.length;i++) {
		var obj = files[i];
		var filepath = obj.filePath;
        var id = filepath.substring(filepath.lastIndexOf("/") + 1);
		list.push(filepath);
		map[id] = obj;
	}
    var s = window.external.downloadFiles(list);
	if(s != "") {
		list = [];
		var ss = s.split(",");
		var htmlstr = "";
		for(var i=0;i<ss.length;i++) {
			htmlstr += map[ss[i]].dirName;
			list.push(map[ss[i]]);
		}
		layer.confirm('以下文件下载失败：'+htmlstr, {
			btn: ['重新下载', '取消'],
				title: "提示"
			}, function () {
				downloadFiles1(list);
			})
	}
	
}

//获取文件
function getFile(id) {
    return window.external.getFile(id);
}

//判断是否联网
function isNetWorking() {
    return navigator.onLine;
}

//获取文件base64
function getFileDataBase64(filepath) {
    var fileid = filepath.substring(filepath.lastIndexOf("/") + 1);
    var filedata = getFile(fileid);
    var type = filedata.substring(0, filedata.indexOf("|"));
    filedata = filedata.substring(filedata.indexOf("|") + 1);
    type = typeObject[type];
    filedata = "data:" + type + ";base64," + filedata;
    return filedata;
}

function backMain() {
	window.external.stopPlayMusic();
    jump("main.html");
}

function checkMusicSta() {
    var f = window.external.getMusicState();
    if (f == "1") {
        changeMusicBtn(1);
    } else {
        changeMusicBtn(0);
    }
}

function changeMusicBtn(b) { //1播放 0无播放
    //$("#rr").append(b);
    if (b == 1) {
        $(".musicbutton").attr("src", "images/musicimg1.png");
    } else {
        $(".musicbutton").attr("src", "images/musicimg.png");
    }

}

function getNeedDownFiles(filelist) {
    var downloadfiles = [];

    for (var i = 0; i < filelist.length; i++) {
        var obj = filelist[i];
        var filepath = obj.filePath;
        var id = filepath.substring(filepath.lastIndexOf("/") + 1);
        var file = window.external.CheckFileHave(id);
        if (file == "0") {
            downloadfiles.push(obj);
        }
        file = undefined;
    }
    return downloadfiles;
}

function musicPlay(dir) {

    var musicList = window.external.getParam("musicList" + dir);
    musicList = JSON.parse(musicList);

    var f = window.external.getMusicState();

    if (f == "1") {
        window.external.showPlayForm();
    } else {
        layer.msg('没有正在播放的音乐');
    }
}

function logout() {
    layer.confirm('是否确定退出', {
        btn: ['确定', '取消'],
        title: "提示"
    }, function () {
        window.external.stopPlayMusic();
        jump("login.html");
    })
}

function toLogin(){
	window.external.stopPlayMusic();
    jump("login.html");
}

function updateDataByDir1(dir) {
    var curversion1 = getParam("version" + dir);
    var userToken1 = getParam("userToken");
    var curversion1s = "-1";
    $.ajax({
        url: ctf + "/api/dir/version",
        type: "get",
        data: "dirNode=" + dir + "&token=" + userToken1,
        dataType: "json",
        async: false,
        success: function (e) {
            var code = e.code;
            if (code == "200") {
                curversion1s = e.hashMap.version;
                setParam("version" + dir, curversion1s);
                //需要更新
                if (curversion1s != curversion1) {
                    $.ajax({
                        url: ctf + "/api/dir/dirList",
                        type: "get",
                        data: "dirNode=" + dir + "&token=" + userToken1,
                        dataType: "json",
                        async: false,
                        success: function (e) {
                            var code = e.code;
                            if (code == "200") {
                                var dataList = e.hashMap.dirMapList;
                                var dataMap = {};
                                for (var i = 0; i < dataList.length; i++) {
                                    var datatemp = dataList[i];
                                    var id = datatemp.dirParentId;
                                    var pid = datatemp.dirParentId;
                                    if (!dataMap[pid]) {
                                        dataMap[pid] = [];
                                    }
                                    dataMap[datatemp.dirParentId].push(datatemp);
                                }
                                dirList = JSON.stringify(dataMap);
                                setParam("dirList" + dir, dirList);
                            }
                        }
                    })
                }
            }
        }
    })

}

function updateData() {
    var inw1 = isNetWorking();
    if (inw1) {
        var userToken1 = getParam("userToken");
        if (userToken1 != "") {
            $.ajax({
                url: ctf + "/api/dir/getUser",
                type: "get",
                data: "token=" + userToken1,
                dataType: "json",
                async: false,
                success: function (e) {
                    var code = e.code;
                    if (code != "200") {
                        layer.alert(e.status, function () {
                            jump("login.html");
                        });
                    }
                }
            })
            updateDataByDir1("0");
            updateDataByDir1("1");
        }

    }

}

function updateDataByDir(dir) {
    var s = "200";
    var curversion1 = getParam("version" + dir);
    var userToken1 = getParam("userToken");
    var curversion1s = "-1";
    var inw1 = isNetWorking();
    if (inw1) {
        var userToken1 = getParam("userToken");
        if (userToken1 != "") {
            $.ajax({
                url: ctf + "/api/dir/getUser",
                type: "get",
                data: "token=" + userToken1,
                dataType: "json",
                async: false,
                success: function (e) {
                    var code = e.code;
                    s = code;
                    
                }
            })
			if(s != "200") {
				return s;
			}
            $.ajax({
                url: ctf + "/api/dir/version",
                type: "get",
                data: "dirNode=" + dir + "&token=" + userToken1,
                dataType: "json",
                async: false,
                success: function (e) {
                    var code = e.code;
                    s = code;
                    if (code == "200") {
                        curversion1s = e.hashMap.version;
                        setParam("version" + dir, curversion1s);
                        //需要更新
                        if (curversion1s != curversion1) {
                            $.ajax({
                                url: ctf + "/api/dir/dirList",
                                type: "get",
                                data: "dirNode=" + dir + "&token=" + userToken1,
                                dataType: "json",
                                async: false,
                                success: function (e) {
                                    var code = e.code;
                                    if (code == "200") {
                                        var dataList = e.hashMap.dirMapList;
                                        var dataMap = {};
                                        for (var i = 0; i < dataList.length; i++) {
                                            var datatemp = dataList[i];
                                            var id = datatemp.dirParentId;
                                            var pid = datatemp.dirParentId;
                                            if (!dataMap[pid]) {
                                                dataMap[pid] = [];
                                            }
                                            dataMap[datatemp.dirParentId].push(datatemp);
                                        }
                                        dirList = JSON.stringify(dataMap);
                                        setParam("dirList" + dir, dirList);
                                    }
                                }
                            })
                        }
                    }
                }
            })
        }

    }

    return s;
}

function dealupdateDataByDir(dir) {}

//文件head
var typeObject = {
    "3g2": "video/3gpp2",
    "3gp": "video/3gpp",
    "3gp2": "video/3gpp2",
    "3gpp": "video/3gpp",
    "asf": "video/x-ms-asf",
    "asr": "video/x-ms-asf",
    "asx": "video/x-ms-asf",
    "avi": "video/x-msvideo",
    "dif": "video/x-dv",
    "dv": "video/x-dv",
    "flv": "video/x-flv",
    "IVF": "video/x-ivf",
    "lsf": "video/x-la-asf",
    "lsx": "video/x-la-asf",
    "m1v": "video/mpeg",
    "m2t": "video/vnd.dlna.mpeg-tts",
    "m2ts": "video/vnd.dlna.mpeg-tts",
    "m2v": "video/mpeg",
    "m4v": "video/x-m4v",
    "mod": "video/mpeg",
    "mov": "video/quicktime",
    "movie": "video/x-sgi-movie",
    "mp2": "video/mpeg",
    "mp2v": "video/mpeg",
    "mp4": "video/mp4",
    "mp4v": "video/mp4",
    "mpa": "video/mpeg",
    "mpe": "video/mpeg",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mpv2": "video/mpeg",
    "mqv": "video/quicktime",
    "mts": "video/vnd.dlna.mpeg-tts",
    "nsc": "video/x-ms-asf",
    "qt": "video/quicktime",
    "ts": "video/vnd.dlna.mpeg-tts",
    "tts": "video/vnd.dlna.mpeg-tts",
    "vbk": "video/mpeg",
    "wm": "video/x-ms-wm",
    "wmp": "video/x-ms-wmp",
    "wmv": "video/x-ms-wmv",
    "wmx": "video/x-ms-wmx",
    "wvx": "video/x-ms-wvx",
    "art": "image/x-jg",
    "bmp": "image/bmp",
    "cmx": "image/x-cmx",
    "cod": "image/cis-cod",
    "dib": "image/bmp",
    "gif": "image/gif",
    "ico": "image/x-icon",
    "ief": "image/ief",
    "jfif": "image/pjpeg",
    "jpe": "image/jpeg",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "mac": "image/x-macpaint",
    "pbm": "image/x-portable-bitmap",
    "pct": "image/pict",
    "pgm": "image/x-portable-graymap",
    "pic": "image/pict",
    "pict": "image/pict",
    "png": "image/png",
    "pnm": "image/x-portable-anymap",
    "pnt": "image/x-macpaint",
    "pntg": "image/x-macpaint",
    "pnz": "image/png",
    "ppm": "image/x-portable-pixmap",
    "qti": "image/x-quicktime",
    "qtif": "image/x-quicktime",
    "ras": "image/x-cmu-raster",
    "rf": "image/vnd.rn-realflash",
    "rgb": "image/x-rgb",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "wbmp": "image/vnd.wap.wbmp",
    "wdp": "image/vnd.ms-photo",
    "xbm": "image/x-xbitmap",
    "xpm": "image/x-xpixmap",
    "xwd": "image/x-xwindowdump",
    "pdf": "application/pdf",
    "aa": "audio/audible",
    "AAC": "audio/aac",
    "aax": "audio/vnd.audible.aax",
    "ac3": "audio/ac3",
    "ADT": "audio/vnd.dlna.adts",
    "ADTS": "audio/aac",
    "aif": "audio/x-aiff",
    "aifc": "audio/aiff",
    "aiff": "audio/aiff",
    "au": "audio/basic",
    "caf": "audio/x-caf",
    "cdda": "audio/aiff",
    "gsm": "audio/x-gsm",
    "m3u": "audio/x-mpegurl",
    "m3u8": "audio/x-mpegurl",
    "m4a": "audio/m4a",
    "m4b": "audio/m4b",
    "m4p": "audio/m4p",
    "m4r": "audio/x-m4r",
    "mid": "audio/mid",
    "midi": "audio/mid",
    "mp3": "audio/mpeg",
    "pls": "audio/scpls",
    "ra": "audio/x-pn-realaudio",
    "ram": "audio/x-pn-realaudio",
    "rmi": "audio/mid",
    "rpm": "audio/x-pn-realaudio-plugin",
    "sd2": "audio/x-sd2",
    "smd": "audio/x-smd",
    "smx": "audio/x-smd",
    "smz": "audio/x-smd",
    "snd": "audio/basic",
    "wav": "audio/wav",
    "wave": "audio/wav",
    "wax": "audio/x-ms-wax",
    "wma": "audio/x-ms-wma"

}
