module.exports = function(){

    let Helpers = {};
    this.Helpers = Helpers;

    function HTMLPage(title, head, body){
        let template = [
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>","</title>","</head><body>","</body></html>"
        ];
        title = typeof title == 'string' ? title : '';
        head = typeof head == 'string' ? head : '';
        body = typeof body == 'string' ? body : '';
        let template = [
            "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>",
            title,
            "</title>",
            head,
            "</head><body>",
            body,
            "</body></html>"
        ];
        return template.join("\r\n");
    }

    Helpers.HTMLPage = HTMLPage;

    function Worder(syllables, capitalize){
        let s = 'b|c|d|f|g|h|j|k|l|m|n|p|qu|r|s|t|v|w|x|y|z'.split('|')
        let sd = 'br|bl|ch|cl|cr|dr|fr|fl|gr|gl|kl|kr|pl|pr|st|sl|sp|sc|tr|vr|wr'.split('|');
        let st = 'squ|scr|scl|str|spr|spl|scr'.split('|');
        let v = 'a|e|i|o|u'.split('|');
        let e = 'lp|lk|gh|lm|mn|rc|rst|st|ch|rch|x|t|b|ll|lp|p|n|rb|b|ss|m|ng|xt'.split('|');
        let l = 's|y|ar|ed|ee|ies|ie|er|ers|or|ors|le|ler|lers'.split('|');
    
        let word = '';
        
        function rand(list){
            return list[Math.floor(Math.random()*list.length)];
        }
        function rep(list, n){
            word += rand(list);
        }
    
        let steps = 0;
        let alt = false;
        function last(n){
            n = typeof n == 'number' ? n : 1;
            return word.slice(word.length-n, n);
        }
        function BuildSyllable(add_start){
            if(steps >= syllables) return;
            if(add_start) rep(Math.random() < 1/3 ? s : Math.random() < 1/2 ? sd : st,1);
            rep(v, 1);
            rep(e,1+Math.floor(Math.random()));
            if(steps == syllables - 1 && Math.random() > 1/3) rep(l,1);
            word = word.replace(/u(u+)/g,"u");
            steps++;
            BuildSyllable(Math.random() < 1/3);
        }
    
        BuildSyllable(true);
        
        if(capitalize){
            word = word[0].toUpperCase() + word.slice(1);
        }
    
        return word;
    }

    Helpers.Worder = Worder;

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