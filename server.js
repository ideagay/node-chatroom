
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatServer=require('./lib/chat_server');

var cache={};

var server=http.createServer(function (req,res) {
   var filePath=false;
    if(req.url=='/'){
        filePath='public/index.html'
    }else{
        filePath=req.url;
    }
    var absPath='./'+filePath;
    serverStatic(res,cache,absPath);
});

server.listen(9000,function () {
    console.log('Server listening on port 9000')
});


chatServer.listen(server);


function send404(res){
    res.writeHead('404',{'Content-Type':'text/plain'});
    res.write('404!page not found');
    res.end();
}

function sendFile(res,filePath,fileContents) {
    res.writeHead('200',{'content-type':mime.lookup(path.basename(filePath))});
    res.end(fileContents);
}

function serverStatic(res,cache,absPath) {
    if(cache[absPath]){
        sendFile(res,absPath,cache[absPath])
    }else{
        fs.exists(absPath,function (exists) {
            if(exists){
                fs.readFile(absPath,function (err,data) {
                    if(err) {
                        return send404(res);
                    }else{
                        cache[absPath]=data;
                        sendFile(res,absPath,data);
                    }
                })
            }else{
                return send404(res);
            }
        })
    }
}

