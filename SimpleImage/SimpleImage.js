
// Inspired by:
// https://coderwall.com/p/iyhizq/get-the-pixel-data-of-an-image-in-html

export class SimpleImage {

        constructor(url)
        {
        this.loaded=false;
        this.img = new Image();
        this.img.onload=this.onload.bind(this);
        this.img.src = url;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    onload()
    {
        // something should be done regarding async loading, or fail to load
        this.loaded=true;
        this.context.drawImage(this.img, 0, 0);
        this.width= this.img.naturalWidth;
        this.height= this.img.naturalHeight;

        // just for demo purposes
        console.log("lol: ", this.getPixel(100,100));
    }

    getPixel(x, y) {
        if (this.loaded)
            return this.context.getImageData(x, y, 1, 1).data;
        else
            return null;
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
    }
}