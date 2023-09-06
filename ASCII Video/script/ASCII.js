let videoElement;
let asciiVideoElement;
let playing = false;
let fontSize = 16;

// Function to handle zoom in button click
document.getElementById('zoomInButton').addEventListener('click', function () {
    fontSize += 2; 
    asciiVideoElement.style.fontSize = fontSize + 'px';
});

// Function to handle zoom out button click
document.getElementById('zoomOutButton').addEventListener('click', function () {
    if (fontSize > 2) {
        fontSize -= 2; 
        asciiVideoElement.style.fontSize = fontSize + 'px';
    }
});

function playVideo() {
    if (videoElement) {
        playing = true;
        document.getElementById('playButton').disabled = true;
        document.getElementById('stopButton').disabled = false;

        // Wait for the video to load and obtain its dimensions
        videoElement.addEventListener('loadedmetadata', function () {
            const canvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
            canvas.willReadFrequently = true;
            const context = canvas.getContext('2d');

            function renderFrame() {
                if (!playing) {
                    return;
                }

                context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const asciiFrame = frameToASCII(context.getImageData(0, 0, canvas.width, canvas.height));
                asciiVideoElement.textContent = asciiFrame;

                requestAnimationFrame(renderFrame);
            }

            renderFrame();
        });
    }
}

// Function to stop playing the video as ASCII
function stopVideo() {
    playing = false;
    document.getElementById('playButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
    asciiVideoElement.textContent = '';
}

// Function to convert a video frame to ASCII
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

// Event listener for the video input
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

// Event listeners for play and stop buttons
document.getElementById('playButton').addEventListener('click', playVideo);
document.getElementById('stopButton').addEventListener('click', stopVideo);
