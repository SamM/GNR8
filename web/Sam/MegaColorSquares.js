// requires : ./seedrandom.js
// requires : ./Builder.js

var module = module === undefined ? {} : module;
(function(module){

    function MatrixScreen2DHSLA(seed){
        
        const THIS = this;
        if(seed === undefined) seed = '';
        if(Array.isArray(seed)) alert('Array Input');
        if(typeof seed !== 'string') seed = seed.toString();

        if(THIS.seed === undefined || THIS.seed !== seed) {
            if(seed === '') THIS.RANDOM = Math.random;
            else THIS.RANDOM = typeof THIS.RANDOM === 'function' ? THIS.RANDOM : new THIS.seedrandom(seed);
        }
        THIS.seed = seed;

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
                    childScreen.setDraw(draw_function, "2d");
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
        screen.draw(THIS.width, THIS.height, false, function(){
            window.requestAnimationFrame(function(){
                MatrixScreen.renderIndex = 0;
            });
        });

        return screen.canvas;
    }
    MatrixScreen2DHSLA.dependencies = {
        'MAX_DEPTH' : 4,
        'MAX_DIVISIONS': 200,
        'width' : 800,
        'height' : 800,
        'drawDelay' : 1000,
        'MatrixScreen' : MatrixScreen,
        'seedrandom' : Math.seedrandom
    };
    
    const MegaColorSquares = Builder(MatrixScreen2DHSLA, MatrixScreen2DHSLA.dependencies);

    this.MegaColorSquares = MegaColorSquares;

    module.exports = MegaColorSquares;

}).call(this, module);