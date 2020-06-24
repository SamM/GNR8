let fs = require('fs');

module.exports = function(){

    let GNR8 = this;

    if(GNR8.Event === undefined) GNR8.implement('Event');

    function Server(type, id){
        if(Server.running) return;
        Server.type = type;
        Server.id = id;
        if(type === 'master'){
            Server.Master();
        }else if(type === 'static'){
            Server.Static();
        }else if(type === 'cache'){
            Server.Cache();
        }else{
            console.log('Error: Unknown server type used as argument in Server(...)')
        }
    }

    this.Server = Server;

    Server.workers = {};
    Server.requests = {};
    Server.generators = [];

    Server.nextReqID = 0;

    Server.port = 8888;
    Server.staticBasePath = './web';
    Server.dependencyBasePath = './dependencies';
    Server.templateBasePath = './templates';

    Server.running = false;
    Server.instance = null;

    Server.send = function(command, msg){
        
        msg = typeof msg === 'object' ? msg : {};
        msg.cmd = command;

        let event = GNR8.Event('server '+command);
        event.trigger({})(msg);
        Object.assign(msg, event.context);

        process.send(msg);

        return event;
    };

    Server.fileExists = function(file){
        let callback = GNR8.Event.callback();
        fs.access(file, fs.F_OK, (err) => {
            if (err) {
                callback.return(false);
            }else callback.return(true);
        });
        return callback;
    };
    Server.loadFile = function(file){
        let callback = GNR8.Event.callback();
        fs.readFile(file, callback.return);
        return callback;
    }

    // Implement Server Types
    GNR8.implement('Server.Master');
    GNR8.implement('Server.Static');
    GNR8.implement('Server.Cache');
    
    return Server;
};