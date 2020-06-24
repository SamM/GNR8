(function(){
    
    let active = false;
    let initialX, initialY, currentX, currentY, initialScrollX, initialScrollY;
    
    function dragStart(e){
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX;
            initialY = e.touches[0].clientY;
        } else {
            initialX = e.clientX;
            initialY = e.clientY;
        }

        initialScrollY = GNR8.display.scrollTop;
        initialScrollX = GNR8.display.scrollLeft;

        active = true;
    }
    function dragEnd(e){
        initialX = currentX;
        initialY = currentY;

        active = false;
    }
    function drag(e){
        if (active) {
      
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            GNR8.display.scrollTo(initialScrollX - currentX, initialScrollY - currentY);

        }
    }

    GNR8.Event('setup')(function(){
        GNR8.display.addEventListener("touchstart", dragStart, false);
        GNR8.display.addEventListener("touchend", dragEnd, false);
        GNR8.display.addEventListener("touchmove", drag, false);

        GNR8.display.addEventListener("mousedown", dragStart, false);
        GNR8.display.addEventListener("mouseup", dragEnd, false);
        GNR8.display.addEventListener("mousemove", drag, false);

        window.addEventListener('mouseup', dragEnd, false);
    });

})();