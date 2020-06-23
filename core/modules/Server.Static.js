var http = require('http');
var path = require('path');

module.exports = function(){
    
    let GNR8 = this;
    let Server = GNR8.Server;

    Server.Static = function(){
        Server.instance = http.createServer(Server.Static.serve);
        Server.instance.listen(Server.port);
        Server.running = true;
        process.on('message', Server.Static.serveMaster);
        GNR8.Event('server run').trigger({})();
    };

    Server.Static.NotFound = '//GNR8.ART - 404 Not Found';

    Server.Static.serveMaster = function(request){
        if(request.cmd === 'serve file'){
            Server.Static.serveFile(request.id, request.file, request.time);
        }else if(request.cmd === 'serve none'){
            Server.Static.serveNone(request.id, request.time);
        }
    };

    Server.Static.serve = function(req, res) {
        var resolvedBase = path.resolve(Server.staticBasePath);
        var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        var fileLoc = path.join(resolvedBase, safeSuffix);

        var REQID = Server.nextReqID++;

        Server.requests[REQID] = [fileLoc, req, res];

        GNR8.Event('server serve').trigger({
            'timestamp' : new Date(),
            'file' : fileLoc,
            'request' : req,
            'response' : res
        })(fileLoc, req, res);

        if(safeSuffix==='\\' || safeSuffix === '/'){
            fileLoc = path.join(resolvedBase, 'index.html');
        }

        // Attempt to load file from Cache worker
        process.send({
            'cmd' : 'get file',
            'id' : ''+REQID,
            'file' : fileLoc,
            'time' : new Date().getTime()
        });
    };

    Server.Static.serveFile = function(REQID, data, request_time){
        let request = Server.requests[REQID];
        let now = new Date();
        let time = now.getTime() - request_time;
        if(!request){
            console.log('Error: static worker received file for unknown request id');            
        }else{
            let event = GNR8.Event('static serve file').trigger({})(request[0], data, request_time, now);
            let res = request[2];
            let filename = request[0];
            res.statusCode = 200;
            res.write(data);
            res.end();
            delete Server.requests[REQID];
            console.log('Served File : '+filename);
        }
        
        console.log('Time taken: '+time+'ms');
    }

    Server.Static.serveNone = function(REQID, request_time){
        let request = Server.requests[REQID];
        let now = new Date();
        let time = now.getTime() - request_time;

        if(!request){
            console.log('Error: static worker told to serve none for unknown request id');            
        }else{
            let event = GNR8.Event('static serve none').trigger({})(request[0], request_time, now);
            let res = request[2];
            let filename = request[0];
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.write(Server.Static.NotFound);
            res.end();
            delete Server.requests[REQID];
            console.log('Served 404 : '+filename);
        }
        
        console.log('Time taken: '+time+'ms');
    }

    return Server.Static;
};