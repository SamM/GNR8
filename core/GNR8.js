/////
// //     GNR8.ART  
////////  Generative Art
   // //  System Design by Sam Mulqueen
   /////
   
let GNR8 = {};

GNR8.name = 'GNR8'
GNR8.version = '0.0.1';

GNR8.toString = ()=> [GNR8.name, GNR8.version].join(' v');

let State = {};

GNR8.set = function(id, value){
    if(typeof id !== 'string' && typeof id !== 'number'){
        console.log(GNR8+': GNR8.set : Failed to set, id must be string or number');
        console.error(new Error('invalid id type'))
    }
    else State[id] = value;
    return GNR8;
};

GNR8.get = function(id){
    if(typeof id !== 'string' && typeof id !== 'number'){
        console.log(GNR8+': GNR8.get : Failed to get, id must be string or number');
        console.error(new Error('invalid id type'))
    }
    else return State[id];
    return GNR8;
};

GNR8.implement = GNR8.use = function(module_name){
    try{
        require('./modules/'+module_name+'.js').call(GNR8, GNR8);
    }catch(ex){
        console.log(GNR8+': GNR8.implement: Failed to implement resource');
        console.error(ex);
    }
    return GNR8;
};

module.exports = GNR8;