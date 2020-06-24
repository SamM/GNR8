GNR8.Event('update')(function(element){
    let div = GNR8.display;
    let size = element.getBoundingClientRect();
    let screen = div.getBoundingClientRect();
    let width = ((Math.max(size.width, screen.width) * GNR8.displayPadRatio) / 2) - (screen.width/2);
    let height = ((Math.max(size.height, screen.height) * GNR8.displayPadRatio) / 2) - (screen.height/2);
    div.scrollTo( width, height);
});