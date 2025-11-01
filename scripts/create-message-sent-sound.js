const fs = require('fs');
const path = require('path');

// إنشاء صوت "تكة" بسيط بصيغة WAV
function createMessageSentSound() {
    const sampleRate = 44100;
    const duration = 0.05; // 50ms
    const numSamples = Math.floor(sampleRate * duration);
    const frequency = 1200; // Hz
    
    // إنشاء PCM data
    const samples = [];
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 50); // Decay
        const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        const value = Math.max(-1, Math.min(1, sample));
        const pcm = Math.floor(value * 32767);
        samples.push(pcm);
    }
    
    // إنشاء WAV header
    const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
    const fileSize = 44 + dataSize;
    
    const buffer = Buffer.alloc(fileSize);
    
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize - 8, 4);
    buffer.write('WAVE', 8);
    
    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // chunk size
    buffer.writeUInt16LE(1, 20); // format (PCM)
    buffer.writeUInt16LE(1, 22); // channels (mono)
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buffer.writeUInt16LE(2, 32); // block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    
    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Write samples
    let offset = 44;
    for (const sample of samples) {
        buffer.writeInt16LE(sample, offset);
        offset += 2;
    }
    
    return buffer;
}

// إنشاء الملف
const soundBuffer = createMessageSentSound();
const outputPath = path.join(__dirname, '..', 'public', 'sounds', 'message-sent.mp3');

fs.writeFileSync(outputPath, soundBuffer);
console.log('✅ تم إنشاء ملف الصوت:', outputPath);
console.log('📊 حجم الملف:', soundBuffer.length, 'bytes');
