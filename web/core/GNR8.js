//////
//  //
//////////
    //  //  GNR8.ART
    //////

// Requires: Event.js

let GNR8 = {};

GNR8._hash = '';
GNR8._title = '';
GNR8._query = {};

GNR8.displayPadRatio = 1.5;

GNR8.enableLightTheme = true;

GNR8.updateHash = function(){
    GNR8._hash = window.location.hash == '' ? '' : decodeURIComponent(window.location.hash.slice(1));
    GNR8.Event('update-hash').trigger({
        hash : GNR8._hash
    })();
    return GNR8._hash;
};

GNR8.update = function(){
    if(typeof GNR8.generate === 'function'){
        if(GNR8._hash !== '') document.title = GNR8._hash+ ' << ' + GNR8._title
        else document.title = GNR8._title;
        
        let event = GNR8.Event('pre-update').trigger({
            hash : GNR8._hash
        })();
        let element = GNR8.generate(event.context.hash)();
        GNR8.show(element);
        GNR8.Event('update').trigger({
            hash : event.context.hash,
            element : element
        })(element);
    }
}

GNR8.show = function(element){
    GNR8.display.style.display = 'block';
    if(element){
        GNR8.clear();
        let event = GNR8.Event('show').trigger({
            element : element
        })();
        element = event.context.element;
        GNR8.display.appendChild(element);
    }
};
GNR8.clear = function(){
    GNR8.display.innerHTML = '';
    GNR8.Event('clear').trigger({})();
};
GNR8.hide = function(){
    GNR8.display.style.display = 'none';
    GNR8.Event('hide').trigger({})();
};

GNR8.toVar = function(str){
    // Parse Number: Integer and Float
    if(str.search(/^[\-\+]?[0-9]+(\.([0-9])+)?$/g) === 0){
        if(str.indexOf('.') > -1) return parseFloat(str);
        else return parseInt(str);
    }
    // Parse Array / List
    if(str.search(/^\[[^,]*(,[^,]*)*\]$/g) === 0){
        str = str.slice(1,-1);
        str = str.split(',');
        return str.map(toVar);
    }
    // Parse boolean
    if(str === 'true') return true;
    if(str === 'false') return false;

    // Parse null
    if(str === 'null') return null;

    // Parse undefined
    if(str === '') return undefined;
    
    // Otherwise keep as string
    return str;
};

GNR8.updateQuery = function(){
    let query = window.location.href.split('#')[0].split('?');
    if(query.length > 1){
        GNR8._query = {};
        query = query.slice(-1)[0];
        query = query.split('&');
        query.forEach(function(expr){
            expr = expr.split('=');
            let key = decodeURIComponent(expr[0]);
            if(expr.length === 1){
                if(key.length) GNR8._query[key] = true;
            }else{
                if(expr.length > 2){
                    GNR8._query[key] = GNR8.toVar(decodeURIComponent(expr.slice(1).join('=')));
                }else{
                    GNR8._query[key] = GNR8.toVar(decodeURIComponent(expr[1]));
                }
            }
        })
    }
}

GNR8.query = function(param){
    return GNR8._query[param];
};

GNR8.setup = function(){
    document.body.style.backgroundColor = GNR8.enableLightTheme ? 'white' : 'black';  
    document.body.style.overflow = 'hidden';  

    GNR8.Event('show')(function(){
        let element = this.element;
        this.element = document.createElement('div');
        this.element.appendChild(element);
        let style = this.element.style;
        let size = element.getBoundingClientRect();
        let screen = GNR8.display.getBoundingClientRect();
        size.width = size.width || element.width || screen.width || 0;
        size.height = size.height || element.height || screen.height || 0;
        size.width = Math.max(size.width, screen.width);
        size.height = Math.max(size.height, screen.height);
        Object.assign(style, {
            'display': 'flex',
            'align-items' : 'center',
            'justify-content' : 'center',
            'width': (size.width * GNR8.displayPadRatio)+'px',
            'height': (size.height * GNR8.displayPadRatio)+'px'
        });
        console.log(size.width, size.height);
    });

    GNR8.display = document.createElement('div');
    GNR8.display.innerHTML = "&nbsp;";
    let style = GNR8.display.style;
    Object.assign(style, {
        'position': 'absolute',
        'display': 'flex',
        'align-items' : 'center',
        'justify-content' : 'center',
        'background-color': GNR8.enableLightTheme ? 'white' : 'black',
        'overflow' : 'auto'
    });
    style.top = style.bottom = style.left = style.right = '0';
    style.width = style.height = '100%';
    GNR8.hide();
    
    document.body.appendChild(GNR8.display);
    GNR8._title = document.title;
    
    window.addEventListener('hashchange', GNR8.updateHash);
    window.addEventListener('hashchange', GNR8.update);

    GNR8.updateHash();
    GNR8.updateQuery();

    // ?bg=+FFFFFF ==> will set the background color to hexcode : #FFFFFF
    // ?bg=rgb(255,255,255) ==> will also set it to white
    let background = GNR8.query('bg');
    if(typeof background === 'string'){
        background = background.split('+').join('#');
        if(background.slice(0, 3) === 'hsl'){
            let bg = background.slice(background.indexOf('('),-1).split(',');
            if(bg.length > 1) bg[1] = bg[1]+'%';
            if(bg.length > 2) bg[2] = bg[2].slice(0,-1)+'%';
            background = (bg.length > 3 ? 'hsla' : 'hsl')+bg.join(',')+')';
        }
        GNR8.display.style.backgroundColor = background;
        document.body.backgroundColor = background;
    }

    GNR8.Event('setup').trigger({
        'hash' : GNR8._hash
    })();

    GNR8.update();
}

window.addEventListener('load', GNR8.setup);