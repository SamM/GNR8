let GNR8 = {};

GNR8._hash = '';

GNR8.updateHash = function(){
    GNR8._hash = window.location.hash == '' ? '' : decodeURIComponent(window.location.hash.slice(1));
    GNR8.update();
};

GNR8.update = function(){
    if(typeof GNR8.generate === 'function'){
        let art = GNR8.generate(GNR8._hash)();
        GNR8.show(art);
    }
}

GNR8.show = function(element){
    GNR8.display.style.display = 'flex';
    if(element){
        GNR8.clear();
        GNR8.display.appendChild(element);
    }
};
GNR8.clear = function(){
    GNR8.display.innerHTML = '';
};
GNR8.hide = function(){
    GNR8.display.style.display = 'none';
};

GNR8.setup = function(){
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
    window.addEventListener('hashchange', GNR8.updateHash);
    GNR8.updateHash();
    GNR8.update();
}

window.addEventListener('load', GNR8.setup);