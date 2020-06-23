//////
//  //
//////////
    //  //  GNR8.ART
    //////

// Requires: Event.js

let GNR8 = {};

GNR8._hash = '';
GNR8._title = '';

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
        let art = GNR8.generate(event.context.hash)();
        GNR8.show(art);
        GNR8.Event('update').trigger({
            hash : event.context.hash,
            output : art
        })();
    }
}

GNR8.show = function(element){
    GNR8.display.style.display = 'flex';
    if(element){
        GNR8.clear();
        let event = GNR8.Event('show').trigger({
            element : element
        })();
        GNR8.display.appendChild(event.context.element);
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

GNR8.setup = function(){
    document.body.style.backgroundColor = 'black';  

    GNR8.display = document.createElement('div');
    let style = GNR8.display.style;
    Object.assign(style, {
        'position': 'absolute',
        'background-color': 'black',
        'display': 'flex',
        'align-items' : 'center',
        'justify-content' : 'center'
    });
    style.top = style.bottom = style.left = style.right = '0';
    style.width = style.height = '100%';
    GNR8.hide();
    document.body.appendChild(GNR8.display);
    GNR8._title = document.title;
    window.addEventListener('hashchange', GNR8.updateHash);
    window.addEventListener('hashchange', GNR8.update);
    GNR8.updateHash();

    GNR8.Event('setup').trigger({
        'hash' : GNR8._hash
    })();

    GNR8.update();
}

window.addEventListener('load', GNR8.setup);