module.exports = function(){

    let Helpers = {};
    this.Helpers = Helpers;

    function NameMe(max_length, capitalize){
        let s = 'a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|qu|r|s|t|u|v|w|x|y|z|br|bl|ch|cl|cr|dr|fr|fl|gr|gl|kl|kr|pl|pr|squ|scr|scl|str|st|sl|sp|spr|spl|scr|sc|tr|vr|wr'.split('|')
        let c = s.concat('|gh|rch|lch|rd|rm|rn|lm|lp|ck|rst'.split('|'));
        let v = 'a|e|i|o|u'.split('|');
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
                if(steps === 0) rep(s,1);
                else if(steps == max_length - 1 || (max_length <= 3 && steps == max_length - 1)){
                    if(!alt){
                        rep(v, 1);
                        //steps++;
                    } 
                    rep(e,1);
                }
                else if(steps == max_length - 1 && Math.random() > 0.4) rep(l,1);
                else{
                    rep(alt?c:v,alt?1:Math.ceil(Math.random()*2));
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