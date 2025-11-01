// Script to generate simple WAV audio files for call sounds
// Run with: node generate-call-sounds.js

const fs = require('fs');
const path = require('path');

// WAV file generation helpers
function generateWavFile(samples, filename) {
  const sampleRate = 22050;
  const numChannels = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = samples.length * bytesPerSample;
  const fileSize = 44 + dataLength;

  const buffer = Buffer.alloc(fileSize);
  let offset = 0;

  // RIFF chunk descriptor
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt sub-chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // subchunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // audio format (PCM)
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(sampleRate * blockAlign, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitDepth, offset); offset += 2;

  // data sub-chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataLength, offset); offset += 4;

  // Write PCM samples
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.round(sample * (sample < 0 ? 0x8000 : 0x7FFF));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  const outputPath = path.join(__dirname, '..', 'public', 'sounds', filename);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${filename} (${(fileSize / 1024).toFixed(1)} KB)`);
}

// Generate ringtone (2 seconds, 800Hz + 440Hz, pulsing)
function generateRingtone() {
  const sampleRate = 22050;
  const duration = 2;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const period = Math.floor(t / 0.5);
    if (period % 2 === 0) {
      // Ring: 800Hz + 440Hz
      const sample = 0.15 * (Math.sin(2 * Math.PI * 800 * t) + Math.sin(2 * Math.PI * 440 * t));
      samples.push(sample);
    } else {
      samples.push(0); // silence
    }
  }

  generateWavFile(samples, 'ringtone.wav');
}

// Generate ringback (2 seconds, 400Hz continuous)
function generateRingback() {
  const sampleRate = 22050;
  const duration = 2;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    samples.push(0.12 * Math.sin(2 * Math.PI * 400 * t));
  }

  generateWavFile(samples, 'ringback.wav');
}

// Generate end tone (0.3 seconds, 600Hz with fade out)
function generateEndTone() {
  const sampleRate = 22050;
  const duration = 0.3;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const envelope = 1 - (t / duration);
    samples.push(0.2 * envelope * Math.sin(2 * Math.PI * 600 * t));
  }

  generateWavFile(samples, 'end-tone.wav');
}

// Generate mute tone (0.12 seconds, 200Hz)
function generateMuteTone() {
  const sampleRate = 22050;
  const duration = 0.12;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    samples.push(0.1 * Math.sin(2 * Math.PI * 200 * t));
  }

  generateWavFile(samples, 'mute-tone.wav');
}

// Ensure sounds directory exists
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

console.log('🎵 Generating call sounds...\n');
generateRingtone();
generateRingback();
generateEndTone();
generateMuteTone();
console.log('\n✨ All sounds generated successfully!');
console.log('📂 Location: public/sounds/');
