/*
   Happy Anniversary & I Love You Web App
   Masterpiece JavaScript: Web Audio API Synth, Microphone Blowing Engine, Canvas Confetti & Interactions
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. CONFIGURATION & STATE
  // ==========================================
  // วันเริ่มต้นคบกัน (Anniversary Date) - ตั้งค่าปี 2023-11-30 (2 ปี 5 เดือน 28 วัน)
  const anniversaryDate = new Date('2023-11-30');
  
  const loveLetterText = `มุมุ พี่รัหนูมากๆน้าาาา เนื่องในวันเกิดของหนู พี่ขอให้หนูมึความสุขที่สุดในโลกเยยยยยยยย พี่จะทำให้หนูเจริญที่สุด ขอให้หนูเป็นเด็กดี รักพี่มากๆน้าาา ถ้าหนูกลับมาจากเมกาแน้ว พี่จะไม่ให้หนูลำบอกเยยยย พี่ยักมุมุที่สุดในโลกเยยย บางอย่างถ้าพี่ซื่อบื่อไป พี่ขอโทษด้วยน้าาา ขอบคุณสำหรับทุกช่วงเวลาดีๆ ที่ผ่านมานมุมุ พี่ขอบคุณที่เป็นคนน่ารัก เอาใจใส่ คอยเป็นกำลังใจที่อบอุ่นที่สุดในยามเหนื่อยจากทำงาน และพี่จะเป็นเซฟโซนที่อบอุ่นที่สุดให้มุมุในทุกๆ วันตลอดไปนะ รักมุมุที่สุดในโลกเลย 💖`;

  // ลิงก์เพลงรักเสริม (Pixabay / Archive.org Romantic Piano)
  const backupAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Fallback
  // เราจะใช้คลาสคีย์บอร์ด Synth พรีเมียมเป็นหลัก และมีตัวเลือกสลับเพลงบรรเลง Lofi/Piano คิวปิด
  const sweetPianoUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'; // เพลงเปียโนบรรเลงน่ารัก

  let audioCtx = null;
  let synthInterval = null;
  let isPlaying = false;
  let currentAudioSource = 'synth'; // 'synth' or 'piano'
  let micStream = null;
  let micAnalyser = null;
  let isMicActive = false;
  let candlesBlown = 0;
  const totalCandles = 3;
  let isTransitioning = false;

  // DOM Elements
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const btnMusicSource = document.getElementById('btn-music-source');
  const songTitle = document.getElementById('song-title');
  const musicDisc = document.getElementById('music-disc');
  const musicPlayerContainer = document.getElementById('music-player-container');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const bgAudio = document.getElementById('bg-audio');
  
  const btnAllowMic = document.getElementById('btn-allow-mic');
  const btnBlowFallback = document.getElementById('btn-blow-fallback');
  const micStatusContainer = document.getElementById('mic-status-container');
  const micText = document.getElementById('mic-text');
  const micMeterFill = document.getElementById('mic-meter-fill');
  const micMeterWrapper = document.getElementById('mic-meter-wrapper');
  
  const successOverlay = document.getElementById('success-overlay');
  const secCakeBlow = document.getElementById('sec-cake-blow');
  const secMemoryJourney = document.getElementById('sec-memory-journey');
  const daysNumber = document.getElementById('days-number');
  const polaroidGrid = document.getElementById('polaroid-container');
  
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const loveEnvelope = document.getElementById('love-envelope');
  const typingContainer = document.getElementById('typing-container');
  const ambientParticlesContainer = document.getElementById('ambient-particles');

  // ==========================================
  // 2. AMBIENT FLOATING PARTICLES (HEARTS & ROSES)
  // ==========================================
  function createAmbientParticles() {
    const particleCount = 20;
    const symbols = ['💖', '❤️', '🌸', '✨', '💕', '🌹'];
    
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'floating-heart';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.animationDuration = `${10 + Math.random() * 12}s`;
      p.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      p.style.opacity = `${0.15 + Math.random() * 0.35}`;
      ambientParticlesContainer.appendChild(p);
    }
  }
  createAmbientParticles();

  // ==========================================
  // 3. PROCEDURAL SYNTHESIZER (WEB AUDIO API)
  // ==========================================
  // สร้างและเริ่มต้นระบบ Web Audio สำหรับ Synth
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // เสียงสังเคราะห์คอร์ดเปียโน/ลูลาบายแสนโรแมนติกเชิงฟิสิกส์
  function playSynthChord(frequencies, duration = 3.5) {
    if (!audioCtx || currentAudioSource !== 'synth' || !isPlaying) return;
    
    // Node สัญญาณเสียงหลัก
    const masterGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const delay = audioCtx.createDelay();
    const feedback = audioCtx.createGain();
    
    // ตั้งค่าตัวกรองความถี่ต่ำเพื่อโทนเสียงละมุน นุ่มนวล ไม่บาดหู
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + duration);
    
    // สร้างเอฟเฟกต์ก้องเสียงสะท้อน (Echo Delay Node)
    delay.delayTime.setValueAtTime(0.35, audioCtx.currentTime);
    feedback.gain.setValueAtTime(0.4, audioCtx.currentTime);
    
    // ต่อสายสัญญาณเสียง
    masterGain.connect(filter);
    filter.connect(audioCtx.destination);
    
    // ต่อเอฟเฟกต์ Delay
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay); // Loop back
    delay.connect(audioCtx.destination);
    
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18 / frequencies.length, audioCtx.currentTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    // สร้างคลื่นเสียงผสมผสานแต่ละตัวโน้ตในคอร์ด
    frequencies.forEach(freq => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      
      // คลื่นเสียง Triangle ให้เสียงนุ่มนวลเหมือนขลุ่ย/เครื่องดนตรีอคูสติก
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      // คลื่นเสียง Sine บริสุทธิ์เสริมฐานเสียงล่าง
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 0.5, audioCtx.currentTime); // โน้ต Octave ต่ำลง 1 ระดับ
      
      osc1.connect(masterGain);
      osc2.connect(masterGain);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(audioCtx.currentTime + duration);
      osc2.stop(audioCtx.currentTime + duration);
    });
  }

  // ลำดับคอร์ดเพลง "Love Loop Lullaby"
  const loveChords = [
    [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7 (C3, C4, E4, G4, B4)
    [174.61, 349.23, 440.00, 523.25, 659.25], // Fmaj7 (F3, F4, A4, C5, E5)
    [196.00, 392.00, 493.88, 587.33, 698.46], // G7 (G3, G4, B4, D5, F5)
    [220.00, 440.00, 523.25, 659.25, 783.99]  // Am7 (A3, A4, C5, E5, G5)
  ];
  let chordIndex = 0;

  function startSynthLoop() {
    stopSynthLoop();
    initAudioContext();
    
    // เล่นคอร์ดแรกทันที
    playSynthChord(loveChords[chordIndex]);
    chordIndex = (chordIndex + 1) % loveChords.length;
    
    // รันลูปเปลี่ยนคอร์ดทุกๆ 4 วินาที
    synthInterval = setInterval(() => {
      if (isPlaying && currentAudioSource === 'synth') {
        playSynthChord(loveChords[chordIndex]);
        chordIndex = (chordIndex + 1) % loveChords.length;
      }
    }, 4000);
  }

  function stopSynthLoop() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  // เสียงพิเศษสไตล์กระดิ่งลมแก้ว (Wind Chime Bell Sound) เมื่อเป่าเทียนสำเร็จ
  function playSuccessChime() {
    initAudioContext();
    const bellGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    
    bellGain.connect(filter);
    filter.connect(audioCtx.destination);
    
    bellGain.gain.setValueAtTime(0, audioCtx.currentTime);
    bellGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
    
    // คลื่นเสียงความถี่สูงจำลองเสียงเคาะระฆัง/แก้ว
    const bellNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // คอร์ด C Major สูง
    bellNotes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08); // Arpeggio หน่วงเวลา
      osc.connect(bellGain);
      osc.start(audioCtx.currentTime + index * 0.08);
      osc.stop(audioCtx.currentTime + 2.5);
    });
  }

  // เสียงลมเป่าแบบสังเคราะห์ (Procedural Wind Noise) เผื่อสลับเสียงเป่าเทียน
  function playExtinguishSound() {
    if (!audioCtx) return;
    const noiseGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    // สร้างคลื่นเสียงรบกวนสีขาว (White Noise buffer)
    const bufferSize = audioCtx.sampleRate * 0.3; // 0.3 วินาที
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
    
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    whiteNoise.start();
    whiteNoise.stop(audioCtx.currentTime + 0.3);
  }

  // ==========================================
  // 4. MUSIC CONTROLS (SYNTH vs ROMANTIC MP3)
  // ==========================================
  function toggleMusic() {
    if (!audioCtx) {
      initAudioContext();
    }
    
    if (isPlaying) {
      // Pause
      isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      musicDisc.classList.remove('disc-rotating');
      musicPlayerContainer.classList.remove('playing');
      
      if (currentAudioSource === 'piano') {
        bgAudio.pause();
      } else {
        stopSynthLoop();
      }
    } else {
      // Play
      isPlaying = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      musicDisc.classList.add('disc-rotating');
      musicPlayerContainer.classList.add('playing');
      
      if (currentAudioSource === 'piano') {
        bgAudio.play().catch(err => console.log("Audio play failed:", err));
      } else {
        startSynthLoop();
      }
    }
  }

  function switchMusicSource() {
    initAudioContext();
    const previouslyPlaying = isPlaying;
    
    // หยุดเสียงปัจจุบันก่อน
    if (previouslyPlaying) {
      toggleMusic();
    }
    
    if (currentAudioSource === 'synth') {
      currentAudioSource = 'piano';
      songTitle.textContent = 'Romantic Piano Melody';
      btnMusicSource.textContent = '🎸';
      bgAudio.src = sweetPianoUrl;
    } else {
      currentAudioSource = 'synth';
      songTitle.textContent = 'Dreamy Synth Pad';
      btnMusicSource.textContent = '🎹';
      bgAudio.src = '';
    }
    
    // เปิดเพลงเล่นต่อทันทีด้วยแนวเพลงใหม่
    if (previouslyPlaying) {
      toggleMusic();
    }
  }

  btnMusicToggle.addEventListener('click', toggleMusic);
  btnMusicSource.addEventListener('click', switchMusicSource);

  // ตั้งค่าเบื้องต้นให้เริ่มเล่นเสียง (เบราว์เซอร์บังคับให้มีการสัมผัสหน้าจอก่อนถึงจะเปิดเสียงได้)
  document.body.addEventListener('click', () => {
    if (!audioCtx) {
      initAudioContext();
      // ไม่บังคับเล่นเพลงทันที เพื่อให้สิทธิ์ควบคุมเป็นของยูสเซอร์ผ่านวิดเจ็ต
    }
  }, { once: true });

  // ==========================================
  // 5. MICROPHONE BLOW DETECTION ENGINE
  // ==========================================
  async function setupMicrophone() {
    try {
      initAudioContext();
      
      // ขอสิทธิ์ใช้ไมค์
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream = stream;
      
      const source = audioCtx.createMediaStreamSource(stream);
      micAnalyser = audioCtx.createAnalyser();
      micAnalyser.fftSize = 256;
      
      source.connect(micAnalyser);
      
      isMicActive = true;
      micStatusContainer.className = 'mic-status-active';
      micText.textContent = 'ไมโครโฟนพร้อมแล้ว! เป่าลมใส่ไมค์ได้เลย';
      micMeterWrapper.classList.remove('hidden');
      btnAllowMic.classList.add('hidden');
      
      // เริ่มต้นกระบวนการตรวจจับเสียงเป่า
      detectBlow();
      
      // เริ่มเปิดคลื่นเสียงเพลงคลอเบาๆ
      if (!isPlaying) {
        toggleMusic();
      }
      
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      micStatusContainer.className = 'mic-status-inactive';
      micText.textContent = 'ไม่สามารถเปิดไมค์ได้ โปรดใช้ปุ่มเป่าด้านข้างนะ';
      btnAllowMic.textContent = '⚠️ ไมค์ไม่ทำงาน (กดปุ่มเป่าแทน)';
    }
  }

  function detectBlow() {
    if (!isMicActive || !micAnalyser || isTransitioning) return;
    
    const bufferLength = micAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function checkVolume() {
      if (!isMicActive || isTransitioning) return;
      
      micAnalyser.getByteFrequencyData(dataArray);
      
      // คำนวณความดังโดยรวม (Average Volume of high frequencies for blow noise)
      let sum = 0;
      // วิเคราะห์ย่านความถี่กลาง-สูง (ลมเป่ามักสร้างสัญญาณเสียงรบกวนย่านความถี่กว้าง)
      for (let i = 4; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const averageVolume = sum / (bufferLength - 4);
      
      // ปรับปรุงสเกลระดับไมค์
      const meterPercent = Math.min(100, (averageVolume / 140) * 100);
      micMeterFill.style.width = `${meterPercent}%`;
      
      // หากเสียงดังเกินเกณฑ์ (Threshold สำหรับเป่าลมเทียน)
      if (averageVolume > 70) {
        triggerCandleBlow();
      }
      
      requestAnimationFrame(checkVolume);
    }
    
    checkVolume();
  }

  btnAllowMic.addEventListener('click', setupMicrophone);

  // ==========================================
  // 6. CANDLE EXTINGUISHING LOGIC
  // ==========================================
  function triggerCandleBlow() {
    if (isTransitioning) return;
    
    candlesBlown++;
    
    // เล่นเสียงลมดับเทียน
    playExtinguishSound();
    
    // ค้นหาและดับเทียนทีละเล่ม
    const candleToBlow = document.getElementById(`candle-${candlesBlown}`);
    if (candleToBlow) {
      candleToBlow.classList.add('flame-extinguished');
      
      // เอฟเฟกต์ Confetti หัวใจดวงย่อมๆ สำหรับเทียนแต่ละเล่ม
      fireSingleCandleConfetti(candleToBlow);
    }
    
    // หากดับเทียนครบหมดทุกเล่มแล้ว
    if (candlesBlown >= totalCandles) {
      isTransitioning = true;
      if (micStream) {
        // ปิดการใช้ไมค์เพื่อความเป็นส่วนตัวของแฟน
        micStream.getTracks().forEach(track => track.stop());
        isMicActive = false;
      }
      
      // ดีเลย์เล็กน้อยเพื่ออรรถรส แล้วแสดงฉากฉลอง
      setTimeout(celebrateSuccess, 800);
    } else {
      // หน่วงเวลาชั่วครู่เพื่อป้องกันความไวไมค์ดับเทียนพร้อมกันหมด
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
        if (isMicActive) detectBlow(); // ตรวจจับเสียงต่อสำหรับเทียนเล่มถัดไป
      }, 700);
    }
  }

  // ปุ่มเป่าเทียนสำรอง
  btnBlowFallback.addEventListener('click', () => {
    if (isTransitioning) return;
    
    // ให้เสียงเพลงเริ่มเล่นอัตโนมัติหากกดปุ่ม
    if (!isPlaying) {
      toggleMusic();
    }
    
    // ทำแอนิเมชันเป่าเทียนทีละเล่มห่างกันเล่มละ 0.5 วินาที
    function blowNextSequentially() {
      if (candlesBlown < totalCandles) {
        triggerCandleBlow();
        setTimeout(blowNextSequentially, 550);
      }
    }
    blowNextSequentially();
  });

  // ==========================================
  // 7. CANVAS CONFETTI & HEART EXPLOSION
  // ==========================================
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let isCanvasActive = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor(x, y, isHeart = false) {
      this.x = x;
      this.y = y;
      this.size = 6 + Math.random() * 8;
      this.color = `oklch(${70 + Math.random() * 20}% ${0.15 + Math.random() * 0.1} ${300 + Math.random() * 60})`; // Pink, Gold, Magenta hues
      this.speedX = -6 + Math.random() * 12;
      this.speedY = -12 - Math.random() * 10;
      this.gravity = 0.25;
      this.friction = 0.98;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = -5 + Math.random() * 10;
      this.isHeart = isHeart || Math.random() > 0.4;
      this.opacity = 1;
      this.fadeSpeed = 0.008 + Math.random() * 0.008;
    }

    update() {
      this.speedX *= this.friction;
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fadeSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      
      if (this.isHeart) {
        // วาดรูปหัวใจอันสมบูรณ์
        ctx.beginPath();
        const d = this.size;
        ctx.moveTo(0, d / 4);
        ctx.bezierCurveTo(-d/2, -d/2, -d, d/3, 0, d);
        ctx.bezierCurveTo(d, d/3, d/2, -d/2, 0, d/4);
        ctx.closePath();
        ctx.fill();
      } else {
        // วาดริบบิ้น/ประกาย
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      }
      ctx.restore();
    }
  }

  function fireSingleCandleConfetti(candleElement) {
    const rect = candleElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    initCanvasLoop();
    for (let i = 0; i < 15; i++) {
      particles.push(new ConfettiParticle(x, y, true));
    }
  }

  function fireGrandSuccessConfetti() {
    initCanvasLoop();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.65; // จุดที่เค้กตั้งอยู่โดยประมาณ
    
    // ยิงหัวใจและริบบิ้นระเบิดใหญ่ออกมา 150 ชิ้น
    for (let i = 0; i < 150; i++) {
      particles.push(new ConfettiParticle(centerX, centerY));
    }
    
    // และเพิ่มพลุประกายจากขอบล่างซ้ายและขวา
    for (let i = 0; i < 40; i++) {
      const pLeft = new ConfettiParticle(0, window.innerHeight);
      pLeft.speedX = 5 + Math.random() * 10;
      pLeft.speedY = -15 - Math.random() * 12;
      particles.push(pLeft);

      const pRight = new ConfettiParticle(window.innerWidth, window.innerHeight);
      pRight.speedX = -5 - Math.random() * 10;
      pRight.speedY = -15 - Math.random() * 12;
      particles.push(pRight);
    }
  }

  function initCanvasLoop() {
    if (isCanvasActive) return;
    isCanvasActive = true;
    
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        
        if (p.opacity <= 0 || p.y > window.innerHeight) {
          particles.splice(i, 1);
        }
      }
      
      if (particles.length > 0) {
        requestAnimationFrame(loop);
      } else {
        isCanvasActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // ล้างสเตจเมื่อหมดแรง
      }
    }
    
    loop();
  }

  // ==========================================
  // 8. CELEBRATION & TRANSITION TO GALLERY
  // ==========================================
  function celebrateSuccess() {
    // 1. เล่นเสียงกระดิ่งลมแสนหวานฉลอง
    playSuccessChime();
    
    // 2. ยิงพลุกระดาษฉลองใหญ่
    fireGrandSuccessConfetti();
    
    // 3. แสดงแผ่น Overlay ความยินดี
    successOverlay.classList.remove('hidden');
    
    // 4. หลังจากแสดงความยินดี 3.5 วินาที จะเลื่อนเปลี่ยนผ่านเข้าสู่แกลเลอรี
    setTimeout(() => {
      // เลือนหายไปอย่างนุ่มนวล
      successOverlay.style.opacity = '0';
      
      setTimeout(() => {
        successOverlay.classList.add('hidden');
        
        // สลับ Section หน้าเว็บ
        secCakeBlow.classList.remove('active-section');
        secCakeBlow.classList.add('hidden-section');
        
        secMemoryJourney.classList.remove('hidden-section');
        secMemoryJourney.classList.add('active-section');
        
        // รันแอนิเมชันนับจำนวนวันคบกัน
        animateDaysCounter();
        
        // รันตัวตรวจจับการเลื่อนจอแสดงรูปภาพ (Scroll Reveals)
        setupScrollReveal();
        
      }, 600);
      
    }, 3800);
  }

  // ==========================================
  // 9. ANIMATED DAYS COUNTER
  // ==========================================
  function animateDaysCounter() {
    // คำนวณระยะวันจริงที่ต่างกัน
    const today = new Date();
    const diffTime = Math.abs(today - anniversaryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let currentCount = 0;
    const duration = 2000; // 2 วินาทีความเร็วในการไต่ตัวเลข
    const stepTime = Math.max(1, Math.floor(duration / diffDays));
    
    const timer = setInterval(() => {
      currentCount += Math.ceil(diffDays / 60); // ไต่เพิ่มทีละระดับ
      if (currentCount >= diffDays) {
        currentCount = diffDays;
        clearInterval(timer);
      }
      daysNumber.textContent = currentCount;
    }, 30);
  }

  // ==========================================
  // 10. SCROLL REVEALS FOR POLAROIDS
  // ==========================================
  function setupScrollReveal() {
    const revealCards = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target); // รันครั้งเดียว
        }
      });
    }, observerOptions);
    
    revealCards.forEach(card => observer.observe(card));
  }

  // ==========================================
  // 11. ENVELOPE OPENING & TYPING LOVE LETTER
  // ==========================================
  let isLetterOpened = false;

  waxSealBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // กัน event ลามไปส่วนอื่น
    if (isLetterOpened) return;
    isLetterOpened = true;
    
    // 1. เพิ่มคลาสทำให้ซองจดหมายเปิด flap และยื่นจดหมายขึ้นมา
    loveEnvelope.classList.add('envelope-opened');
    
    // 2. ดีเลย์ให้จดหมายลอยเสร็จสิ้นก่อนเริ่มพิมพ์ตัวอักษรทีละตัว (Typing effect)
    setTimeout(startLetterTyping, 1200);
  });

  function startLetterTyping() {
    let index = 0;
    typingContainer.textContent = ''; // ล้างค่าเริ่มต้น
    
    function typeNextChar() {
      if (index < loveLetterText.length) {
        const char = loveLetterText.charAt(index);
        typingContainer.textContent += char;
        index++;
        
        // หน่วงเวลาพิมพ์ช้า-เร็วแตกต่างกันเล็กน้อยตามประเภทตัวอักษรเพื่อความเป็นธรรมชาติ (เหมือนคนพิมพ์จริง)
        let delay = 35;
        if (char === '\n') delay = 300; // เว้นบรรทัดให้หยุดนิดนึง
        if (char === '.' || char === '💖' || char === '。') delay = 400; // เครื่องหมายปลายประโยค
        
        setTimeout(typeNextChar, delay);
      }
    }
    
    typeNextChar();
  }

});
