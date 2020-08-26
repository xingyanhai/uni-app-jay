
// 1. 建立与改文件平行的文件夹’歌曲‘
// 2. node 执行改文件；会输出与改文件平行的 output.json
// 3. 打开musicList数据库 导入 output.json

//获取项目工程里的图片
var fs = require('fs');//引用文件系统模块

function readFileList(path, filesList) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        var stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            //递归读取文件
            readFileList(path + itm + "/", filesList)
        } else {

            var obj = {};//定义一个对象存放文件的路径和名字
            obj.path = path;//路径
            obj.filename = itm//名字
            filesList.push(obj);
        }

    })

}
var getFiles = {
    //获取文件夹下的所有文件
    getFileList: function (path) {
        var filesList = [];
        readFileList(path, filesList);
        return filesList;
    },
};
//获取文件夹下的所有歌曲文件名
let musicList = getFiles.getFileList("./歌曲/").map(e => {
    return {
        name: e.filename,
        fileID: e.filename
    }
})
let str = ''
musicList.forEach(e => {
    str += JSON.stringify(e)
})
fs.writeFile('./output.json', str, function(err){
    if(err) {
        console.log(err)
    } else {
        console.log('写入成功！！！')
    }
});
