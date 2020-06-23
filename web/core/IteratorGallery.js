(function(){
    let controls = {};
    controls.i = 0;
    controls.hash = '';

    let button_styles = {
        'position' : 'absolute',
        'width' : '50px',
        'top' : '0',
        'height' : '100%',
        'bottom': '0',
        'cursor' : 'pointer',
        'text-align': 'center',
        'display' : 'flex',
        'align-items' : 'center',
        'justify-content' : 'center'
    };

    let icon_styles = {
        'transform' : 'scale(1,3)',
        'color' : 'rgba(255,255,255,0.2)',
        'font-size' : '50px',
        'font-weight' : 'bolder'
    };

    function UpdateI(){
        let hash = GNR8.updateHash();
        hash = hash.split('#');
        if(hash.length > 1){
            let index = parseInt(hash.slice(-1)[0]);
            if(!isNaN(index)){
                controls.i = index;
                hash = hash.slice(0,-1).join('#')
            }else{
                hash = hash.join('#');
            }
        }else{
            hash = hash.join('#');
        }
        controls.hash = hash;
    }
    function CreateButton(icon_code, tooltip, onClick){
        let button = document.createElement('div');
        Object.assign(button.style, button_styles);
        let icon = document.createElement('span');
        icon.innerHTML = icon_code;
        Object.assign(icon.style, icon_styles);
        button.appendChild(icon);
        button.title = tooltip;
        if(typeof onClick === 'function') button.addEventListener('click', onClick);
        document.body.appendChild(button);
        return button;
    }

    function Setup(){
        controls.back = CreateButton('&lt;', 'Previous', function(e){
            UpdateI();
            let nextI = controls.i;
            if(controls.i <= 0) nextI = 0;
            else nextI = controls.i - 1;
            window.location.hash = '#'+controls.hash+'#'+nextI;
        });
        controls.back.style.left = '0';
    
        controls.next = CreateButton('&gt;', 'Next', function(e){
            UpdateI();
            let nextI = controls.i;
            if(controls.i < 0) nextI = 0;
            else nextI = controls.i + 1;
            window.location.hash = '#'+controls.hash+'#'+nextI;
        });
        controls.next.style.right = '0';
    }

    GNR8.Event('setup')(Setup);

    GNR8.galleryControls = controls;

})();