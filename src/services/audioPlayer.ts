let audioContext: AudioContext | null = null;

export async function playPCM(base64Data: string, sampleRate: number = 24000) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 32768.0;
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
    audioContext.close();
    audioContext = null;
  }
}
