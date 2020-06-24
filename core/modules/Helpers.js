module.exports = function(){

    let Helpers = {};
    this.Helpers = Helpers;

    function NameMe(max_length, capitalize){
        let c = 'qu|w|r|t|y|p|s|d|f|g|h|j|k|l|z|x|c|v|b|n|m|qu|ch|gh|pl|pr|br|bl|wr|wh|tr|sl|sp|spl|sn|spr|sc|scr|squ|st|str|scl|dr'.split('|');
        let v = 'a|e|i|o|u|ee|oo|ae|ai|ou|oa|ie|ia|ei'.split('|');
        let e = 'lp|lk|gh|lm|mn|rc|rst|st|ch|rch|x|t|b|ll|lp|p|n|rb|b|ss|m'.split('|');
        let l = 's|y|ee|ies|ie|er|ers|or|ors|le|ler|lers'.split('|');
    
        let name = '';
        
        function rand(list){
            return list[Math.floor(Math.random()*list.length)];
        }
        function rep(list, n){
            name += rand(list);
        }
    
        let steps = 0;
        let alt = false;
        function BuildName(){
            if(steps < max_length){
                if(steps === 0) rep(c,1);
                else if(steps == max_length - 2 || (max_length <= 3 && steps == max_length - 1)){
                    if(!alt){
                        rep(v, 1);
                        //steps++;
                    } 
                    rep(e,1);
                }
                else if(steps == max_length - 1 && Math.random() > 0.4) rep(l,1);
                else{
                    rep(alt?c:v,1);
                    alt = !alt;
                }
                steps++;
                BuildName();
            }
        }
    
        BuildName();
        
        if(capitalize){
            name = name[0].toUpperCase() + name.slice(1);
        }
    
        return name;
    }

    Helpers.NameMe = NameMe;

    function RandomRGB(){
        function rand(n){
            return Math.floor(Math.random()*n);
        }
        return 'rgb('+[rand(256), rand(256), rand(256)].join(',')+')';
    };

    function RandomHSL(){
        function rand(n){
            return Math.floor(Math.random()*n);
        }
        return 'hsl('+[rand(360), rand(100)+'%', rand(100)+'%'].join(',')+')';
    };

    function RandomHSLA(alphaModifier){
        alphaModifier = alphaModifier === undefined ? 1 : alphaModifier;
        function rand(n){
            return Math.floor(Math.random()*n);
        }
        return 'hsla('+[rand(360), rand(100)+'%', rand(100)+'%', Math.random()*alphaModifier].join(',')+')';
    };

    Helpers.RandomHSL = RandomHSL;
    Helpers.RandomHSLA = RandomHSLA;
    Helpers.RandomRGB = RandomRGB;
}