var os = require('os');
var cluster = require('cluster');

module.exports = function(){
    
    let GNR8 = this;
    let Server = GNR8.Server;

    Server.Master = function(){
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
        worker.on('message', Server.Master.cacheRequest.bind(Server, 'cache1', worker));
        Server.workers.cache1 = worker;
        // Create Static server workers, with remaining cores
        for(var i=1; i<cores; i++){
            worker = cluster.fork();
            worker.send({
                'cmd' : 'init',
                'type' : 'static',
                'id' : i
            });
            worker.on('message', Server.Master.staticRequest.bind(Server, 'static'+i, worker));
            Server.workers['static'+i] = worker;
        }
        GNR8.Event('server run').trigger({})();
    }

    Server.Master.staticRequest = function(name, worker, request){
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

    Server.Master.cacheRequest = function(name, worker, request){
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
}