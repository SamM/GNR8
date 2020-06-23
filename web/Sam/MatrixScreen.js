function MatrixScreen(context){
    this.context = context||"2d";
    this.canvas = null;
    this.getCanvas = function(){
        if(this.canvas === null){
            this.canvas = document.createElement('canvas');
        }
        return this.canvas;
    }
    this.appendTo = function(parentElement){
        var canvas = this.getCanvas();
        parentElement.appendChild(canvas);
        return canvas;
    };
    this.draw_function = function(width, height, context, done){
        if(typeof done != "function") done = function(){};
        done();
        return null;
    };
    this.setDraw = function(draw_function, context){
        this.draw_function = draw_function;
        this.context = context||this.context;
    }
    this.getDraw = function(){
        return this.draw_function;
    }
    var self = this;
    this.draw = function(width, height, context, done){
        if(typeof done != "function") done = function(){};
        if(!width) width = 100;
        if(!height) height = 100;
        if(!context){
            var canvas = this.getCanvas();
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext(this.context);
        }
        if(MatrixScreen.renderIndex++ % MatrixScreen.throttleEvents == 0){
            window.requestAnimationFrame(function(){
                self.draw_function.call(self, width, height, context, done);
            });
        }else{
            self.draw_function.call(self, width, height, context, done);
        }
    }
    this.children = [];
    this.drawIndex = 0;
    this.drawChildren = function(width, height, context, done){
        var max = self.children.length;
        if(typeof done != "function") done = function(){};
        self.drawIndex = -1;
        function drawNextChild(){
            self.drawIndex++;
            if(self.drawIndex<max){
                self.children[self.drawIndex].draw(width, height, context, drawNextChild);
            }else{
                done();
            }
        }
        drawNextChild();
    }
    this.add = function(screen){
        this.children.push(screen);
    }
    this.values = {};
    this.setValue = function(key, value){
        if(typeof key != "string" && typeof key != "number") throw "setValue(key, value); key must be a number or string";
        this.values[key] = value;
    }
    this.getValue = function(key){
        if(typeof key != "string" && typeof key != "number") throw "getValue(key); key must be a number or string";
        return this.values[key];
    }
    this.clearChildren = function(){
        delete this.children;
        this.children = [];
    }
}
MatrixScreen.renderIndex = 0;
MatrixScreen.throttleEvents = 250;