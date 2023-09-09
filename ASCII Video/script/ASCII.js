const video = document.getElementById('videoInput');
const canvasWidth = 1280; 
const canvasHeight = 760;
const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
canvas.willReadFrequently = true;
const context = canvas.getContext('2d');
let videoElement;
let asciiVideoElement;
let playing = false;
let fontSize = 1;
let asciiFrames = [];

function changeAsciiColor(color) {
    asciiVideoElement.style.color = color;
}

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

        videoElement.play(); 

        videoElement.addEventListener('loadedmetadata', function () {
            const canvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
            canvas.willReadFrequently = true;
            const context = canvas.getContext('2d');
            adjustFontSize(videoElement.videoWidth, videoElement.videoHeight);

            function renderFrame() {
                if (playing) {
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const asciiFrame = convertCanvasToAscii(context.getImageData(0, 0, canvas.width, canvas.height));
                    
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


const gif = new GIF({
    workers: 2,
    quality: 10,
});

canvas.width = video.width;
canvas.height = video.height;

// Event listener for when the video is loaded
video.addEventListener('loadeddata', () => {
    const duration = video.duration;
    const frameRate = 10; 
    const numFrames = Math.floor(duration * frameRate);

    // Function to capture frames and convert to ASCII
    function captureFrame(frameNumber) {
        const time = (frameNumber / frameRate);
        video.currentTime = time;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const asciiFrame = convertCanvasToAscii(ctx.getImageData(0, 0, canvas.width, canvas.height));

        asciiFrames.push(asciiFrame);

        if (frameNumber < numFrames) {

            captureFrame(frameNumber + 1);
        } else {
            console.log(asciiFrames);
        }
    }
    captureFrame(0);
});

// Function to convert a canvas to ASCII (implement this part)
function convertCanvasToAscii(imageData) {
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


document.getElementById('downloadButton').addEventListener('click', generateGIF);

function generateGIF() {
    if (asciiFrames.length > 0) {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
        });

        // Loop through the ASCII frames and convert them back to image frames
        for (let i = 0; i < asciiFrames.length; i++) {
            const asciiFrame = asciiFrames[i];
            const imageFrame = document.createElement('canvas');
            imageFrame.width = videoElement.videoWidth;
            imageFrame.height = videoElement.videoHeight;
            const context = imageFrame.getContext('2d');
            context.font = fontSize + 'px monospace';
            context.fillStyle = 'black';
            context.fillRect(0, 0, imageFrame.width, imageFrame.height);
            context.fillStyle = 'white';
        
            const xCoordinate = 10; 
            const yCoordinate = 20; 
        
            context.fillText(asciiFrame, xCoordinate, yCoordinate);
            gif.addFrame(imageFrame, { copy: true, delay: 100 }); 
        }

        gif.render();

        gif.on('finished', function(blob) {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'ascii_video.gif';
            downloadLink.textContent = 'Download ASCII GIF';
            document.body.appendChild(downloadLink);
        });
    }
}