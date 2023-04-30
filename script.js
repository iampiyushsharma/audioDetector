let audioContext, analyzer, source, dataArray, bufferLength, isRunning = false;
let count = 1;

function startNoiseDetection() {
  audioContext = new AudioContext();

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      source = audioContext.createMediaStreamSource(stream);
      analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      source.connect(analyzer);

      bufferLength = analyzer.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      isRunning = true;

      detectNoise();
    })
    .catch(error => {
      console.log(error);
    });
}

function stopNoiseDetection() {
  isRunning = false;
  source.disconnect();
  analyzer.disconnect();
}

function detectNoise() {
  if (!isRunning) return;

  requestAnimationFrame(detectNoise);
  analyzer.getByteFrequencyData(dataArray);
  console.log(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / bufferLength;
  const frequency = (average / 255) * audioContext.sampleRate / 2;
  const volume = average / 255;

  // Add volume recognition based on the volume value
  let volumeLabel;
  if (volume < 0.2) {
    volumeLabel = "Low Volume";
  } else if (volume < 0.35) {
    volumeLabel = "Medium Volume";
  } else {
    volumeLabel = "High Volume";
  }

  // Calculate decibel values using a reference level
  const referenceLevel = -50; // Adjust this value based on your microphone sensitivity and environment
  const decibels = 20 * Math.log10(frequency) - referenceLevel;

  // Update the HTML elements with the volume label, decibel value, and frequency
  document.getElementById("volume-label").textContent = "Volume: " + volumeLabel;
  document.getElementById("decibel-value").textContent = "Decibels: " + decibels.toFixed(2) + " dB";
  document.getElementById("frequency-value").textContent = "Frequency: " + frequency.toFixed(2) + " Hz";

  const idname = `frequency${count}`;
  document.getElementById(idname).style.height = volume * 200 + 'px';

  count = count + 1;
  const storingbox = document.getElementById('graph').innerHTML;
  document.getElementById('graph').innerHTML = storingbox + `<div id="frequency${count}" class="bar"></div>`;
}

document.getElementById("start-btn").addEventListener("click", startNoiseDetection);
document.getElementById("stop-btn").addEventListener("click", stopNoiseDetection);
