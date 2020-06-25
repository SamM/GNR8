var http = require('http');
var path = require('path');

module.exports = function(){
    
    let GNR8 = this;
    let Server = GNR8.Server;

    if(GNR8.Helpers === undefined){
        GNR8.implement('Helpers');
    }

    Server.Static = function(){
        Server.instance = http.createServer(Server.Static.serve);
        Server.instance.listen(Server.port);
        Server.running = true;
        process.on('message', Server.Static.serveMaster);
        GNR8.Event('server run').trigger({})();
    };

    Server.Static.mimeTypes = {
        "txt": 'text/plain; charset=utf-8',
        "html": "text/html; charset=utf-8",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png",
        "svg": "image/svg+xml",
        "json": "application/json; charset=utf-8",
        "js": "text/javascript; charset=utf-8",
        "css": "text/css; charset=utf-8"
      };  

    Server.Static.NotFound = '//GNR8.ART - 404 Not Found';
    Server.Static.GeneratorHTML = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"/><title>%GENERATOR% !! GNR8.ART</title><dependencies/></head>\n<body><h1>%GENERATOR%</h1></body></html>'
    Server.Static.home_greetings = ["GNR8.ART", "coming soon!", "generate art", "you rock!", "curious?", "you like?", 'ooo baby ...', ':-D', ':-P', "- _ -"];

    Server.Static.serveMaster = function(request){
        if(request.cmd === 'serve file'){
            Server.Static.serveFile(request.id, request.file, request.time);
        }else if(request.cmd === 'serve none'){
            Server.Static.serveNone(request.id, request.time);
        }else if(request.cmd === 'serve dependencies'){
            Server.Static.serveGenerator(request.id, request.dependencies, request.time);
        }else if(request.cmd === 'serve generators'){
            Server.Static.serveGeneratorList(request.id, request.generators, request.time);
        }
    };

    Server.Static.serve = function(req, res) {
        var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        var fileLoc = safeSuffix.split('?')[0];

        var REQID = Server.nextReqID++;

        GNR8.Event('server serve').trigger({
            'timestamp' : new Date(),
            'file' : fileLoc,
            'request' : req,
            'response' : res
        })(fileLoc, req, res);

        Server.requests[REQID] = [fileLoc, req, res];

        if(safeSuffix==='\\' || safeSuffix === '/'){
            process.send({
                'cmd' : 'get generators',
                'id' : ''+REQID,
                'file' : 'index.html',
                'time' : new Date().getTime()
            });
            return;
        }

        if(fileLoc.indexOf('.') === -1){
            // Generator request
            // Attempt to load dependencies from Cache worker
            process.send({
                'cmd' : 'get dependencies',
                'id' : ''+REQID,
                'file' : fileLoc+'.js',
                'time' : new Date().getTime()
            });
        }else{
            // File request
            // Attempt to load file from Cache worker
            process.send({
                'cmd' : 'get file',
                'id' : ''+REQID,
                'file' : fileLoc,
                'time' : new Date().getTime()
            });
        }
        
    };

    var template_path = path.resolve(Server.templateBasePath);
    var generator_template = path.join(template_path, 'generator.html');
    var not_found_template = path.join(template_path, 'not-found.html');

    Server.loadFile(generator_template)(function(err, file){
        if(err){
            console.log('Error: preloading generator template file');
        }else{
            file = file.toString();
            Server.Static.GeneratorHTML = file;
        }
    });

    Server.loadFile(not_found_template)(function(err, file){
        if(err){
            console.log('Error: preloading 404 template file');
        }else{
            file = file.toString();
            Server.Static.NotFound = file;
        }
    });
    
    Server.Static.serveGenerator = function(REQID, dependencies, request_time){
        if(typeof dependencies === 'string') dependencies = dependencies.split('#');
        else if(!Array.isArray(dependencies)) dependencies = [];

        let script_tags = dependencies.map((dep)=>'<script src="'+dep+'"></script>').join('\n');
        let request = Server.requests[REQID];
        let now = new Date();
        let time = now.getTime() - request_time;
        if(!request){
            console.log('Error: static worker received dependencies for unknown request id');            
        }else{
            let event = GNR8.Event('static serve generator').trigger({})(request[0], dependencies, request_time);
            let res = request[2];
            let filename = request[0];
            res.statusCode = 200;
            res.setHeader('Content-Type', Server.Static.mimeTypes['html']);
            let generator_name = filename.split(/[\\\/]/).slice(1).reverse().join(' &lt;&lt; ');
            let template = Server.Static.GeneratorHTML.replace('<dependencies/>', script_tags);
            template = template.split('%GENERATOR%').join(generator_name);
            res.write(template);
            res.end();
            delete Server.requests[REQID];
            console.log('Served Generator : '+filename);
        }
    };

    Server.Static.serveGeneratorList = function(REQID, generators, request_time){
        if(typeof generators === 'string') generators = generators.split('#');
        else if(!Array.isArray(generators)) generators = [];

        let request = Server.requests[REQID];
        if(!request){
            console.log('Error: static worker received generator list for unknown request id');            
        }else{
            let event = GNR8.Event('static serve generators').trigger({})(request[0], generators, request_time);
            let res = request[2];
            let filename = request[0];
            Server.generators = generators;
            let greetings = Server.Static.home_greetings;
            // Random Background Color
            let color = GNR8.Helpers.RandomRGB();
            // Random Generator from the list
            //let generator = generators[Math.floor(Math.random()*generators.length)];
            let generator = '/Sam/SlashWord'
            // Random Greeting from the list
            //let greeting = greetings[Math.floor(Math.random()*greetings.length)];
            let greeting = [GNR8.Helpers.NameMe(Math.ceil(2+Math.random()*6))].join(' ');
            let location = generator+'?bg='+color+'#'+greeting;
            res.writeHead(302, {
                'Location': location
            });
            res.end();
            delete Server.requests[REQID];
            console.log('Redirect to Random Generator from : '+filename);
            console.log('Redirecting to : '+location);
        }
        Server.Static.logTime(request_time);
    };

    Server.Static.logTime = function(request_time){
        let now = new Date();
        let time = now.getTime() - request_time;
        console.log('Time taken: '+time+'ms');
    };

    Server.Static.serveFile = function(REQID, data, request_time){
        let request = Server.requests[REQID];
        if(!request){
            console.log('Error: static worker received file for unknown request id');            
        }else{
            let event = GNR8.Event('static serve file').trigger({})(request[0], data, request_time);
            let res = request[2];
            let filename = request[0];
            res.statusCode = 200;
            let parts = filename.split('.');
            let ext = parts.length > 1 ? parts.slice(-1)[0] : 'txt';
            res.setHeader('Content-Type', Server.Static.mimeTypes[ext] || Server.Static.mimeTypes['txt']);
            res.write(data);
            res.end();
            delete Server.requests[REQID];
            console.log('Served File : '+filename);
        }
        Server.Static.logTime(request_time);
    }

    Server.Static.serveNone = function(REQID, request_time){
        let request = Server.requests[REQID];
        if(!request){
            console.log('Error: static worker told to serve none for unknown request id');            
        }else{
            let event = GNR8.Event('static serve none').trigger({})(request[0], request_time);
            let res = request[2];
            let filename = request[0];
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.write(Server.Static.NotFound);
            res.end();
            delete Server.requests[REQID];
            console.log('Served 404 : '+filename);
        }
        Server.Static.logTime(request_time);
    }

    return Server.Static;
};