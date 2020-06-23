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

    Server.nextReqID = 0;

    Server.port = 8888;
    Server.staticBasePath = './web';
    Server.running = false;
    Server.instance = null;

    // Implement Server Types
    GNR8.implement('Server.Master');
    GNR8.implement('Server.Static');
    GNR8.implement('Server.Cache');
    
    return Server;
};