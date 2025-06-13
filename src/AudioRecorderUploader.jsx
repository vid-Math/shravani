import React, { useState, useRef } from 'react';

const API_BASE = "http://localhost:8000";

function AudioRecorderUploader() {
  const [status, setStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedURL(url);
        uploadRecording(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('🎙 Recording...');
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatus('❌ Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setStatus('🛑 Stopped. Uploading...');
  };

  const uploadRecording = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "recorded.webm");

    try {
      const res = await fetch(`${API_BASE}/upload-audio/0`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Upload successful!");
        console.log("Server response:", data);
      } else {
        setStatus(`❌ Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("❌ Upload failed.");
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🎧 Audio Recorder & Uploader (.webm)</h2>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "⏹ Stop Recording" : "🎤 Start Recording"}
      </button>
      <p>{status}</p>

      {recordedURL && (
        <div>
          <h4>▶️ Your Recording</h4>
          <audio controls src={recordedURL} type="audio/webm" />
        </div>
      )}
    </div>
  );
}

export default AudioRecorderUploader;
