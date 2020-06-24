function MatrixScreen(context){
    var self = this;

    this.context = context||"2d";
    this.canvas = null;
    this.depth = 0;
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
    this.render = function(width, height, context, depth, done){
        this.depth = depth;
        return this.draw(width, height, context, done);
    };
    this.draw_function = function(width, height, context, done){
        if(typeof done != "function") done = function(){};
        done();
    };
    this.setDraw = function(draw_function, context){
        this.draw_function = draw_function;
        this.context = context||this.context;
    }
    this.getDraw = function(){
        return this.draw_function;
    }
    
    this.draw = function(width, height, context, done){
        
        if(!context){
            var canvas = this.getCanvas();
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext(this.context);
        }
        let self = this;
        this.depth--;
        if(MatrixScreen.throttleEvents && MatrixScreen.renderIndex++ % MatrixScreen.throttleEvents === 0){
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
        var max = this.children.length;
        var self = this;

        function drawNextChild(index){
            if(self.depth <= 0) return done();
            if(index<max){
                self.depth--;
                (function(w,h,c,i){
                    self.children[i].draw(w, h, c, drawNextChild.bind(self, i+1));
                })(width, height, context, index);
            }else{
                done();
            }
        }

        drawNextChild(0);
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