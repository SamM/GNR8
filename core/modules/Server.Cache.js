var fs = require('fs');

module.exports = function(){
    
    let GNR8 = this;
    let Server = GNR8.Server;

    Server.Cache = function(){
        process.on('message', Server.Cache.serve);
        GNR8.Event('server run').trigger({})();
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

    return Server.Cache;

};