let videoElement;
let asciiVideoElement;
let playing = false;
let fontSize = 1;
let asciiFrames = [];

// Function to change the ASCII color
function changeAsciiColor(color) {
    asciiVideoElement.style.color = color;
}
// Event listener for the color picker input
colorPicker.addEventListener('input', function() {
const selectedColor = colorPicker.value;
changeAsciiColor(selectedColor);
});

// Function to adjust the font size of the ASCII art based on video dimensions and window size.
function adjustFontSize(videoWidth, videoHeight) {
    const maxFontSize = 10;
    const minFontSize = 2;
    const fontSizeX = Math.floor(window.innerWidth / videoWidth);
    const fontSizeY = Math.floor(window.innerHeight / videoHeight);

    const newFontSize = Math.min(maxFontSize, Math.max(minFontSize, Math.min(fontSizeX, fontSizeY)));
    asciiVideoElement.style.fontSize = newFontSize + 'px';
}

document.getElementById('zoomInButton').addEventListener('click', function () {
    if(fontSize < 10){
        fontSize += 1; 
        asciiVideoElement.style.fontSize = fontSize + 'px';
    }
});

document.getElementById('zoomOutButton').addEventListener('click', function () {
    if (fontSize > 1) {
        fontSize -= 1; 
        asciiVideoElement.style.fontSize = fontSize + 'px';
    }
});

// Function to play the video.
function playVideo() {
    if (videoElement && !playing) { 
        playing = true;
        document.getElementById('playButton').disabled = true;
        document.getElementById('stopButton').disabled = false;
        asciiFrames = [];
        videoElement.play(); 

        videoElement.addEventListener('loadedmetadata', function () {
            const canvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
            canvas.willReadFrequently = true;
            const context = canvas.getContext('2d');
            adjustFontSize(videoElement.videoWidth, videoElement.videoHeight);

            // Function to render frames continuously.
            function renderFrame() {
                if (playing) {
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const asciiFrame = frameToASCII(context.getImageData(0, 0, canvas.width, canvas.height));
                    
                    // Add the ASCII frame to the array
                    asciiFrames.push(asciiFrame);
                    asciiVideoElement.textContent = asciiFrame;
                } else if (videoElement.paused) {
                    asciiVideoElement.textContent = "Video Paused";
                }
            
                requestAnimationFrame(renderFrame);
            }
            renderFrame();
        });
    }
}
// Function to stop playing the video.
function stopVideo() {
    playing = false;
    document.getElementById('playButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}
// Function to convert a video frame to ASCII art.
function frameToASCII(imageData) {
    const { data, width, height } = imageData;
    const asciiCharacters = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ','];

    let asciiFrame = '';

    for (let i = 0; i < height; i += 2) {
        for (let j = 0; j < width; j++) {
            const pixelIndex = (i * width + j) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            const asciiIndex = Math.floor((luminance / 255) * (asciiCharacters.length - 1));
            const asciiChar = asciiCharacters[asciiIndex];

            asciiFrame += asciiChar;
        }
        asciiFrame += '\n'; 
    }

    return asciiFrame;
}
// Event listener for the file input to select a video file.
document.getElementById('videoInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.autoplay = true;
        videoElement.controls = false;
        videoElement.style.display = 'none';

        document.body.appendChild(videoElement);

        asciiVideoElement = document.getElementById('asciiVideo');
        playVideo();
    }
});

document.getElementById('playButton').addEventListener('click', playVideo);
document.getElementById('stopButton').addEventListener('click', stopVideo);


function downloadAsciiGif(canvas) {
    if (asciiFrames.length > 0) {
        const gif = new GIF({
            workers: 2,
            quality: 10
        });

        const dummyCanvas = document.createElement('canvas');
        const dummyContext = dummyCanvas.getContext('2d');

        // Assuming canvas dimensions match the dimensions of your ASCII frames
        dummyCanvas.width = canvas.width;
        dummyCanvas.height = canvas.height;

        // Add each frame to the GIF
        for (let i = 0; i < asciiFrames.length; i++) {
            // Check if the dimensions of the current frame match the canvas dimensions
            if (asciiFrames[i].length !== canvas.height || asciiFrames[i][0].length !== canvas.width) {
                console.error(`Frame ${i} dimensions do not match the canvas dimensions.`);
                continue;
            }

            const frameImageData = dummyContext.createImageData(dummyCanvas.width, dummyCanvas.height);
            // Convert the ASCII frame back to image data
            frameImageData.data.set(asciiToImageData(asciiFrames[i]));

            // Draw the image data on the dummy canvas
            dummyContext.putImageData(frameImageData, 0, 0);

            // Convert the dummy canvas to an image element
            const frameImage = new Image();
            frameImage.src = dummyCanvas.toDataURL("image/png");

            gif.addFrame(frameImage, { delay: 100 });
        }

        // Create the GIF and trigger download
        gif.on('finished', function (blob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'ascii_video.gif';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        gif.render();
    }
}

function asciiToImageData(asciiFrame) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Assuming each character in the ASCII frame represents a pixel, set canvas dimensions accordingly
    canvas.width = asciiFrame[0].length;
    canvas.height = asciiFrame.length;

    // Get the size of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Iterate through the ASCII frame and set pixel values
    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
            // Check if the current coordinates are within the bounds of the ASCII frame
            if (y < asciiFrame.length && x < asciiFrame[y].length) {
                const pixelValue = asciiFrame[y][x]; // Replace this with your logic to convert ASCII to pixel values

                // Ensure pixelValue is a valid color or grayscale value
                if (isValidPixelValue(pixelValue)) {
                    context.fillStyle = pixelValue;
                    context.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    return imageData.data;
}
function isValidPixelValue(pixelValue) {
    // Regular expression pattern for valid CSS colors
    const colorPattern = /^#([0-9a-fA-F]{3}){1,2}$|^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/i;

    // Regular expression pattern for valid grayscale values (0-255)
    const grayscalePattern = /^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    // Check if pixelValue matches either color or grayscale pattern
    return colorPattern.test(pixelValue) || grayscalePattern.test(pixelValue);
}

// Event listener for the download button
document.getElementById('downloadButton').addEventListener('click', downloadAsciiGif);