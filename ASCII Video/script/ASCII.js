let videoElement;
let asciiVideoElement;
let playing = false;
let fontSize = 1;


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

            // Function to render frames continuously.
            function renderFrame() {
                if (playing) {
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const asciiFrame = frameToASCII(context.getImageData(0, 0, canvas.width, canvas.height));
                    asciiVideoElement.textContent = asciiFrame;
                } 
                else if (videoElement.paused) {
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