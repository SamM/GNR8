var http = require('http');
var path = require('path');
var cluster = require('cluster');
var fs = require('fs');
var os = require('os');

module.exports = function(){
    let GNR8 = this;

    if(GNR8.Event === undefined) GNR8.implement('Event');

    function Server(type, id){
        if(Server.running) return;
        Server.type = type;
        Server.id = id;
        if(type === 'master'){
            let cores = os.cpus().length;
            if(cores < 2){
                console.log('Fatal Error: Not enough cores to start the server.');
                return;
            }
            // Create Cache worker
            let worker = cluster.fork();
            worker.send({
                'cmd' : 'init',
                'type' : 'cache',
                'id' : 1
            });
            worker.on('message', Server.cacheRequest.bind(Server, 'cache1', worker));
            Server.workers.cache1 = worker;
            // Create Static server workers, with remaining cores
            for(var i=1; i<cores; i++){
                worker = cluster.fork();
                worker.send({
                    'cmd' : 'init',
                    'type' : 'static',
                    'id' : i
                });
                worker.on('message', Server.staticRequest.bind(Server, 'static'+i, worker));
                Server.workers['static'+i] = worker;
            }
            GNR8.Event('server run').trigger({})();
        }else if(type === 'static'){
            Server.Static();
        }else if(type === 'cache'){
            Server.Cache();
        }else{
            console.log('Error: Unknown server type used as argument in Server(...)')
        }
    }

    Server.workers = {};
    Server.requests = {};

    Server.nextReqID = 0;

    Server.port = 8888;
    Server.staticBasePath = './web';
    Server.running = false;
    Server.instance = null;

    

    Server.Static = function(){
        Server.instance = http.createServer(Server.Static.serve);
        Server.instance.listen(Server.port);
        Server.running = true;
        process.on('message', Server.Static.serveMaster);
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

        if(safeSuffix==='\\'){
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

    Server.Cache = function(){
        process.on('message', Server.Cache.serve);
    };

    Server.Cache.files = {};
    Server.Cache.fileExists = function(file){
        let callback = GNR8.Event.callback();
        fs.access(file, fs.F_OK, (err) => {
            if (err) {
                callback.return(false);
            }else callback.return(true);
        })
        return callback;
    };
    Server.Cache.loadFile = function(file){
        let callback = GNR8.Event.callback();
        fs.readFile(file, callback.return);
        return callback;
    }
    Server.Cache.serve = function(request){
        if(request.cmd === 'get file'){
            // Check if file is in cache
            let filename = request.file;
            let file = Server.Cache.files[filename];
            if(file !== undefined){
                let msg = {
                    'cmd' : 'serve file',
                    'for' : request.for,
                    'id' : request.id,
                    'file' : file,
                    'time' : request.time
                };

                let event = GNR8.Event('server serve file');
                
                event.trigger({})(msg);
                Object.assign(msg, event.context);

                process.send(msg);
            }else{
                // Not in cache
                // Check to see if file exists
                // If so, load into cache
                Server.Cache.fileExists(filename)(function(exists){
                    if(exists){
                        Server.Cache.loadFile(filename)(function(err, file){
                            if(err){
                                let msg = {
                                    'cmd' : 'serve none',
                                    'for' : request.for,
                                    'id' : request.id,
                                    'time' : request.time
                                };
                
                                let event = GNR8.Event('server serve none');
                                
                                event.trigger({})(msg);
                                Object.assign(msg, event.context);
                
                                process.send(msg);
                            }else{
                                file = file.toString();
                                let msg = {
                                    'cmd' : 'serve file',
                                    'for' : request.for,
                                    'id' : request.id,
                                    'time' : request.time,
                                    'file' : file
                                };
                                Server.Cache.files[filename] = file;

                                let event = GNR8.Event('server serve file');
                                
                                event.trigger({})(msg);
                                Object.assign(msg, event.context);
                
                                process.send(msg);
                            }
                        });
                    }else{
                        let msg = {
                            'cmd' : 'serve none',
                            'for' : request.for,
                            'id' : request.id,
                            'time' : request.time
                        };
        
                        let event = GNR8.Event('server serve none');
                        
                        event.trigger({})(msg);
                        Object.assign(msg, event.context);
        
                        process.send(msg);
                    }
                })
               
            }
        }
    };

    Server.staticRequest = function(name, worker, request){
        if(request.cmd === 'get file'){
            let msg = {
                'cmd' : 'get file',
                'for' : name,
                'id' : request.id,
                'file' : request.file,
                'time' : request.time
            };

            let event = GNR8.Event('server static get file');

            event.trigger({})(msg);

            Object.assign(msg, event.context);

            Server.workers.cache1.send(msg);
        }
    };

    Server.cacheRequest = function(name, worker, request){
        if(request.cmd === 'serve file'){
            let worker = Server.workers[request.for];
            if(worker===undefined){
                console.log('Error: cache request -> send file -> for unknown worker');
                return;
            };

            let msg = {
                'cmd' : 'serve file',
                'id' : request.id,
                'file' : request.file,
                'time' : request.time
            };

            let event = GNR8.Event('server cache serve file');
            event.trigger({})(msg);

            Object.assign(msg, event.context);
            
            worker.send(msg);
        }else if(request.cmd === 'serve none'){
            let worker = Server.workers[request.for];
            if(worker===undefined){
                console.log('Error: cache request -> send none -> for unknown worker');
                return;
            };

            let msg = {
                'cmd' : 'serve none',
                'id' : request.id,
                'time' : request.time
            };

            let event = GNR8.Event('server cache serve none');
            event.trigger({})(msg);

            Object.assign(msg, event.context);
            
            worker.send(msg);
        }
    };

    this.Server = Server;
    
    return Server;
};