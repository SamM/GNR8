const cluster = require('cluster');

const GNR8 = require('./core/GNR8.js');
GNR8.implement('Event');
GNR8.implement('Server');

if(cluster.isMaster){
    GNR8.Event('server run')(()=>{
        [
            '',
            '//////',
            '//  //',
            '//////////',
            '    //  //',
            '    //////',
            '',
            '. GNR8 . ART',
            '. Generative Art',
            '. version ' + GNR8.version,
            '',
            'Server running on port '+GNR8.Server.port
        ].forEach((msg)=>{console.log(msg)});
    });
    GNR8.Server('master', 1);
}else{
    process.on('message', function(request){
        if(request.cmd === 'init'){
            GNR8.Server(request.type, request.id);
        }
    });
}
