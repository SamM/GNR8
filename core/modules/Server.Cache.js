var fs = require('fs');
var path = require('path');
module.exports = function(){
    
    let GNR8 = this;
    let Server = GNR8.Server;

    Server.Cache = function(){
        process.on('message', Server.Cache.serve);
        GNR8.Event('server run').trigger({})();
    };

    Server.Cache.files = {};
    Server.Cache.dependencies = {};
    Server.Cache.no_cache = true;

    Server.generators = null;

    Server.Cache.generatorExists = function(name){

    }

    Server.Cache.serve = function(request){
        function LoadDependencyFile(filename){
            var depBase = path.resolve(Server.dependencyBasePath);
            var dep_file = path.join(depBase, filename+'.txt');
            Server.loadFile(dep_file)(function(err, file){
                if(err){
                    console.log('Error: loading dependencies file `'+dep_file+'`');
                    console.error(err);
                    NoDependencies();
                }else{
                    file = file.toString();
                    file = file.split(/[\n\r]+/g).filter((line)=>line!=='');
                    file.push(filename.split(/[\/\\]/g).join('/'));
                    file = file.join('#');
                    
                    let msg = {
                        'for' : request.for,
                        'id' : request.id,
                        'time' : request.time,
                        'dependencies' : file
                    };

                    if(!Server.Cache.no_cache) Server.Cache.dependencies[filename] = file;

                    Server.send('serve dependencies', msg);
                }
            });
        }

        function GeneratorExists(filename, done){
            var depBase = path.resolve(Server.dependencyBasePath);
            var dep_file = path.join(depBase, filename+'.txt');
            var fileBase = path.resolve(Server.staticBasePath);
            var real_file = path.join(fileBase, filename);
            Server.fileExists(real_file)(function(exists){
                if(!exists){
                    done(-1);
                }else{
                    Server.fileExists(dep_file)(function(exists){
                        if(!exists){
                            done(0);
                        }else{
                            done(1)
                        }
                    });
                }
            });
        }
        function NoFile(){
            let msg = {
                'for' : request.for,
                'id' : request.id,
                'time' : request.time
            };
            Server.send('serve none', msg);
        }
        if(request.cmd === 'get file'){
            // Check if file is in cache
            let filename = request.file;
            let file = Server.Cache.files[filename];
            if(file !== undefined){
                let msg = {
                    'for' : request.for,
                    'id' : request.id,
                    'file' : file,
                    'time' : request.time
                };
                Server.send('serve file', msg);
            }else{
                // Not in cache
                // Check to see if file exists
                // If so, load into cache
                var resolvedBase = path.resolve(Server.staticBasePath);
                var local_file = path.join(resolvedBase, filename);
                Server.fileExists(local_file)(function(exists){
                    if(!exists){
                        NoFile();
                    }else{
                        Server.loadFile(local_file)(function(err, file){
                            if(err){
                                NoFile();
                            }else{
                                file = file.toString();
                                let msg = {
                                    'for' : request.for,
                                    'id' : request.id,
                                    'time' : request.time,
                                    'file' : file
                                };

                                if(!Server.Cache.no_cache) Server.Cache.files[filename] = file;

                                Server.send('serve file', msg);
                            }
                        });
                    }
                })
               
            }
        }else if(request.cmd === 'get dependencies'){
            function NoDependencies(){ 
                let msg = {
                    'for' : request.for,
                    'id' : request.id,
                    'dependencies' : '',
                    'time' : request.time
                }
                Server.send('serve dependencies', msg);
            }
            let filename = request.file;
            let dependencies = Server.Cache.dependencies[filename];
            if(dependencies !== undefined){
                let msg = {
                    'for' : request.for,
                    'id' : request.id,
                    'time' : request.time,
                    'dependencies' : dependencies
                };
                Server.send('serve dependencies', msg);
            }else{
                GeneratorExists(filename, function(exit_code){
                    if(exit_code === -1) NoFile();
                    else if(exit_code === 0) NoDependencies();
                    else if(exit_code === 1) LoadDependencyFile(filename);
                });
            }
        }else if(request.cmd === 'get generators'){
            var resolvedBase = path.resolve('.');
            var local_file = path.join(resolvedBase, 'generators');
            if(Server.generators !== null){
                let msg = {
                    'for' : request.for,
                    'id' : request.id,
                    'time' : request.time,
                    'generators' : Server.generators
                };

                Server.send('serve generators', msg);
            }else{
                Server.loadFile(local_file)(function(err, file){
                    if(err){
                        console.log('Error: loading generator list `'+local_file+'`');
                        console.error(err);
                        let msg = {
                            'for' : request.for,
                            'id' : request.id,
                            'time' : request.time,
                            'generators' : ''
                        }
                        Server.send('serve generators', msg);
                    }else{
                        file = file.toString();
                        file = file.split(/[\n\r]+/g).filter((line)=>line!=='');
                        file = file.join('#');
                        
                        let msg = {
                            'for' : request.for,
                            'id' : request.id,
                            'time' : request.time,
                            'generators' : file
                        };
    
                        Server.send('serve generators', msg);
    
                        if(!Server.Cache.no_cache) Server.generators = file;
    
                        Server.send('serve dependencies', msg);
                    }
                });
            }
        }
    };

    return Server.Cache;

};