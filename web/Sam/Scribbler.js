(function(){

    function Generator(seed, i){
        if(typeof i !== 'number') i = 0;

        let RANDOM = seed === '' ? Math.random : new Math.seedrandom(seed);

        function FakeRun(){

        }

        let CONFIG = Generator.settings;

        let _size = CONFIG._size;
        let _change = 0.25;
        let _spacing = 1.5;
        let _paint_bias = 2/3;
        let _draw_bias = 1/2;
        let _max_strokes = CONFIG.max_strokes == undefined ? 16 : CONFIG.max_strokes;
        let _min_strokes = CONFIG.min_strokes == undefined ? 0 : CONFIG.min_strokes;
        let _canvas = CONFIG.canvas || document.createElement('canvas');
        let _color_shift = CONFIG.color_shift == undefined ? 1 : CONFIG.color_shift;
        let _alpha_shift = CONFIG.alpha_shift == undefined ? 1 : CONFIG.alpha_shift;
        _canvas.width = _canvas.height = _size;
        let _context = _canvas.getContext('2d');

        let max_line_width = _size / 12;
        let max_draw_streak = 64;
        let stroke_count = 0;

        function Point(x,y,weight,color){
            if(!(this instanceof Point)) return new Point(x,y,weight,color);
            this.x = x;
            this.y = y;
            this.w = weight;
            this.c = color;
        }

        function RandomPoint(widthModifier, opacityModifier){
            widthModifier = typeof widthModifier === 'number' ? widthModifier : 1;
            opacityModifier = typeof opacityModifier === 'number' ? opacityModifier : 1;
            return new Point(RANDOM() * _size, RANDOM() * _size, RANDOM()*max_line_width*widthModifier, [Math.floor(RANDOM()*360), RANDOM()*100, RANDOM()*100, RANDOM()*opacityModifier])
        }

        function AdaptedPoint(p){
            function clampBetween(num, low, high){
                if(num < low) return low;
                if(num > high) return high;
                return num;
            }
            let x = p.x + (p.x * _change * (RANDOM() - 0.5) * 2);
            let y = p.y + (p.y * _change * (RANDOM() - 0.5) * 2);
            let w = (p.w * _change * (RANDOM() - 0.5) * 2);
            w = p.w + w < 0.1 ? p.w - w : p.w + w > max_line_width ? p.w - w : p.w + w;
            w = clampBetween(w, 0.1, max_line_width);
            let c = [];
            c[0] = (360 * _change * (RANDOM() - 0.5) * 2 * _color_shift);
            c[0] = p.c[0] + c[0] < 0 ? p.c[0] + c[0] + 360 : p.c[0] + c[0] % 360;
            c[1] = p.c[1] + (p.c[1] * _change * (RANDOM() - 0.5) * 2);
            c[1] = clampBetween(c[1], 0, 100);
            c[2] = p.c[2] + (p.c[2] * _change * (RANDOM() - 0.5) * 2);
            c[2] = clampBetween(c[1], 0, 100);
            c[3] = p.c[3] + (p.c[3] * _change * (RANDOM() - 0.5) * 2 * _alpha_shift);
            c[3] = clampBetween(c[1], 0, 1);
            return new Point(x, y, w, c);
        }

        let CMD = 'draw';
        function Render(){
            _context.save();
            _context.scale(0.75,0.75);
            Render.stop = false;
            let Stroke = ['draw', RandomPoint(1,1)];
            function Step(){
                if(Render.stop) return;
                if(_max_strokes <= stroke_count){
                    // Stop all drawing
                    console.log('max strokes reached: '+stroke_count);
                    DrawStroke(Stroke);
                    Stroke = undefined;
                    return;
                }
                stroke_count++;
                let cmd = RANDOM() < _draw_bias ? 'draw' : RANDOM() < _paint_bias ? 'paint' : 'wash';
                if(CMD !== cmd){
                    DrawStroke(Stroke);
                    Stroke = [cmd, cmd === 'draw' ? RandomPoint(1/3, 1) : cmd === 'paint' ? RandomPoint(1, 1/3) : RandomPoint(2.5,0.1)];
                }
                CMD = cmd;
                // Select how many steps to draw/paint
                let m = Math.floor(RANDOM()*max_draw_streak);
                let p = Stroke.slice(-1)[0];
                
                for(let i=0; i<m; i++){
                    p = AdaptedPoint(p);
                    Stroke.push(p);
                }
                
                Step();
            }

            function FadeValue(v1,v2,N,i){
                return v1 + ((v2 - v1) / N) * i;
            }
            function FadePoint(p1,p2,N,i){
                let c = [FadeValue(p1.c[0], p2.c[0], N,i),FadeValue(p1.c[1], p2.c[1], N,i),FadeValue(p1.c[2], p2.c[2], N,i),FadeValue(p1.c[3], p2.c[3], N,i)];
                return new Point(FadeValue(p1.x, p2.x, N,i),FadeValue(p1.y, p2.y, N,i),FadeValue(p1.w, p2.w, N,i),c);
            }
            function DrawStroke(stroke){
                let cmd = stroke.shift();
                let p1, p2,d;
                for(var i=0; i<stroke.length-1; i++){
                    p1 = stroke[i];
                    p2 = stroke[i+1];
                    d = Math.floor(Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2))/_spacing);
                    for(var s=0;s<d;s++){
                        point = FadePoint(p1, p2, d, s);
                        
                        _context.save();
                        _context.fillStyle = 'hsla('+[point.c[0], point.c[0]+"%", point.c[2]+"%", point.c[3]].join(',')+')';
                        if(cmd === 'draw'){
                            _context.beginPath();
                            _context.arc(point.x, point.y, point.w/2, 0, 2 * Math.PI, false);
                            _context.closePath();
                            _context.fill();
                        }else if(cmd === 'paint'){
                            _context.fillRect(point.x-(point.w/2), point.y-(point.w/2), point.w, point.w);
                        }
                        _context.restore();
                        //context.lineWidth = 5;
                        //context.strokeStyle = '#003300';
                        //context.stroke();
                    }
                }
            }

            Step();

            return _canvas;
            
        };
        Render.stop = false;

        return Render;
    }
    Generator.settings = {
        '_size' : 512,
        '_change' : 0.1,
        'min_strokes' : 10,
        'max_strokes' : 128,
        'color_shift' : 0.5,
        'alpha_shift' : 0.5
    };
    GNR8.Event('setup')(Setup);
    function Setup(){
        // ?size=800
        // in pixels
        let _size = GNR8.query('size');
        let w = window.innerWidth || document.clientWidth || document.body.clientWidth;
        let h = window.innerHeight|| document.clientHeight|| document.body.clientHeight;
        _size = typeof _size === 'number' ? _size : Math.round(Math.min(h, w) * 0.85);
        Generator.settings._size = _size;

        // ?max_strokes=10
        // in pixels
        let max_strokes = GNR8.query('max_strokes');
        max_strokes = typeof max_strokes === 'number' ? max_strokes : 24;
        Generator.settings.max_strokes = max_strokes;
    }

    GNR8.generate = Generator;

})();