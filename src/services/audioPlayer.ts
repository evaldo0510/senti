let audioContext: AudioContext | null = null;

export async function playPCM(base64Data: string, sampleRate: number = 24000) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Decode base64 to binary string safely
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // A 16-bit PCM sample is exactly 2 bytes. Ensure we only read an even number of bytes to avoid RangeError.
    const samplesCount = Math.floor(len / 2);
    const floatData = new Float32Array(samplesCount);

    // Read 16-bit signed integer values (little-endian) and normalize to float [-1.0, 1.0]
    for (let i = 0; i < samplesCount; i++) {
      const byteIndex = i * 2;
      const low = bytes[byteIndex];
      const high = bytes[byteIndex + 1];
      
      // Combine bytes to 16-bit unsigned value (little-endian: low byte first)
      let val = low | (high << 8);
      
      // Convert unsigned 16-bit integer to signed 16-bit integer (two's complement)
      if (val & 0x8000) {
        val -= 0x10000;
      }
      
      // Normalize to Float32 [-1.0, 1.0]
      floatData[i] = val / 32768.0;
    }

    const buffer = audioContext.createBuffer(1, floatData.length, sampleRate);
    buffer.getChannelData(0).set(floatData);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    
    return source;
  } catch (error) {
    console.error("Error playing PCM audio:", error);
    return null;
  }
}

export function stopAllAudio() {
  if (audioContext) {
    try {
      audioContext.close();
    } catch (e) {
      console.warn("Error closing AudioContext:", e);
    }
    audioContext = null;
  }
}
