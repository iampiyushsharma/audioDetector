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
  const average = dataArray.reduce((a, b) => a + b) / bufferLength;
  const frequency = (average / 255) * audioContext.sampleRate / 2;
  // document.getElementById("frequency").textContent = frequency.toFixed(2) + " Hz";
  const idname = `frequency${count}`
  // console.log(idname);
  document.getElementById(idname).style.height = frequency/80 + 'px' ;
  // console.log(document.getElementById(idname).style.width);
  count = count +1 ;
  const storingbox = document.getElementById('graph').innerHTML;
  // console.log(storingbox);
  document.getElementById('graph').innerHTML = storingbox + `<div id="frequency${count}" class="bar"></div>`
}

document.getElementById("start-btn").addEventListener("click", startNoiseDetection);
document.getElementById("stop-btn").addEventListener("click", stopNoiseDetection);