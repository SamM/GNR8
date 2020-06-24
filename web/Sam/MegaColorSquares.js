// requires : seedrandom.js
// requires : Builder.js
// requires : MatrixScreen.js

var module = module === undefined ? {} : module;
(function(module){

    function MegaSquare(seed){
        
        const THIS = this;
        if(seed === undefined) seed = '';
        if(typeof seed !== 'string') seed = seed.toString();

        let input = seed.split('#');
        if(input.length > 1){
            let index = parseInt(input.slice(-1)[0]);
            if(!isNaN(index)){
                seed = input.slice(0,-1).join('#');
                THIS.i = index;
            }
        }

        if(THIS.seed === undefined || THIS.seed !== seed) {
            if(seed === '') THIS.RANDOM = Math.random;
            else THIS.RANDOM = typeof THIS.RANDOM === 'function' ? THIS.RANDOM : new THIS.seedrandom(seed);
        }
        THIS.seed = seed;

        if(THIS.i !== undefined && THIS.seed !== ''){
            THIS.RANDOM = new THIS.seedrandom(seed);
            for(var i=0; i<THIS.i; i++){
                FakeRun();
            }
        }

        function FakeRun(){
            THIS.RANDOM();
            fakeRandom2DScreen(THIS.MAX_DIVISIONS, THIS.MAX_DEPTH);
        }
        function fakeRandom2DScreen(max_divisions, max_depth){
            if(max_depth<=0) return;
            var divs = max_divisions-Math.floor(THIS.RANDOM()*max_divisions);
            for(var i=0; i<divs; i++){
                (function(a){
                    THIS.RANDOM();
                    THIS.RANDOM();
                    THIS.RANDOM();
                    THIS.RANDOM();
                    var newDepth = max_depth-Math.ceil(THIS.RANDOM()*max_depth);
                    if(newDepth>1) fakeRandom2DScreen(max_divisions, newDepth);
                })(i);
            }
        }

        let screen = new THIS.MatrixScreen('2d');

        function draw_function(w, h, context, done){
           
            var self = this;
                var startX = self.getValue("startX");
                var endX = self.getValue("endX");
                var startY = self.getValue("startY");
                var endY = self.getValue("endY");
                var scaleX = endX-startX;
                var scaleY = endY-startY;
                var hue = Math.floor(self.getValue("h")*360);
                var s = Math.floor(self.getValue("s")*100);
                var l = Math.floor(self.getValue("l")*100);
                var color = "hsl("+hue+", "+100+"%,"+l+"%,"+(s/100)+")";
                context.save();
                context.translate(Math.round(startX*w),Math.round(startY*h));
                context.scale(scaleX, scaleY);
                context.fillStyle = color;
                context.fillRect(0, 0, w, h);
                context.restore();
                context.save();
                context.translate(Math.round(startX*w),Math.round(startY*h));
                context.scale(scaleX, scaleY);
                self.depth--;
                self.drawChildren(w, h, context, function(){context.restore();done();});
                
        };
        
        function makeRandom2DScreen(parentScreen, max_divisions, max_depth){
            if(max_depth<=0) return;
            var divs = max_divisions-Math.floor(THIS.RANDOM()*max_divisions);
            for(var i=0; i<divs; i++){
                (function(a){
                    var childStartX = THIS.RANDOM();
                    var childStartY = THIS.RANDOM();
                    var childSize = THIS.RANDOM()*(Math.min(1-childStartX, 1-childStartY));
                    var childEndY = childStartY+childSize;
                    var childEndX = childStartX+childSize;
                    var childScreen = new MatrixScreen(parentScreen.context);
                    childScreen.setValue("h", THIS.RANDOM());
                    childScreen.setValue("s", ((1+THIS.MAX_DEPTH)-max_depth)/THIS.MAX_DEPTH);
                    childScreen.setValue("l", 0.5);
                    childScreen.setValue("startX", childStartX);
                    childScreen.setValue("endX", childEndX);
                    childScreen.setValue("startY", childStartY);
                    childScreen.setValue("endY", childEndY);
                    parentScreen.add(childScreen);
                    var newDepth = max_depth-Math.ceil(THIS.RANDOM()*max_depth);
                    if(newDepth>1) makeRandom2DScreen(childScreen, max_divisions, newDepth);
                    childScreen.setDraw(draw_function.bind(childScreen), "2d");
                })(i);
               
            }
        }
        screen.setValue("startX", 0);
        screen.setValue("endX", 1);
        screen.setValue("startY", 0);
        screen.setValue("endY", 1);

        screen.setDraw(draw_function, "2d");

        screen.setValue("h", THIS.RANDOM());
        screen.setValue("s", 0);
        screen.setValue("l", 0.5);
        screen.clearChildren();

        makeRandom2DScreen(screen, THIS.MAX_DIVISIONS, THIS.MAX_DEPTH);
        screen.render(THIS.width, THIS.height, false, THIS.drawDepth, function(){
            window.requestAnimationFrame(function(){
                MatrixScreen.renderIndex = 0;
            });
        });

        screen.canvas.style['flex-shrink'] = '0';

        return screen.canvas;
    }

    function Setup(){
        // ?size=800
        // in pixels
        let _size = GNR8.query('size');
        let w = window.innerWidth || document.clientWidth || document.body.clientWidth;
        let h = window.innerHeight|| document.clientHeight|| document.body.clientHeight;
        _size = typeof _size === 'number' ? _size : Math.round(Math.min(h, w) * 0.85);
        MegaColorSquares.materials.width = MegaColorSquares.materials.height = _size;

        // ?delay=1000
        // is milliseconds
        let _delay = GNR8.query('delay');
        _delay = typeof _delay === 'number' ? _delay : 10;
        MegaColorSquares.materials.drawDelay = _delay;
        MatrixScreen.throttleEvents = _delay;
    }

    GNR8.Event('setup')(Setup);

    MegaSquare.materials = {
        'drawDepth' : 1024,
        'MAX_DEPTH' : 4,
        'MAX_DIVISIONS': 200,
        'width' : 100,
        'height' : 100,
        'drawDelay' : 0,
        'MatrixScreen' : MatrixScreen,
        'seedrandom' : Math.seedrandom
    };
    
    let MegaColorSquares = Builder(MegaSquare, MegaSquare.materials);

    this.MegaColorSquares = MegaColorSquares;

    GNR8.generate = MegaColorSquares;

    module.exports = MegaColorSquares;

}).call(this, module);