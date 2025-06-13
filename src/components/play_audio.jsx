import React, { useState, useRef, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function ParagraphTTSRecorder() {
  const [pdf, setPdf] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [ttsReady, setTtsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handlePDFUpload = async (e) => {
    e.preventDefault();
    if (!pdf) return setStatus("Please upload a PDF.");
    const formData = new FormData();
    formData.append("pdf", pdf);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setParagraphs(data.paragraphs);
        setStatus("Paragraphs loaded. Waiting for TTS...");
      } else {
        setStatus(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Upload error.");
    }
  };

  useEffect(() => {
    if (paragraphs.length === 0) return;
    const audioPath = `${API_BASE}/audio/chunk_${currentIndex}.wav`;

    const checkAudioExists = async () => {
      try {
        const res = await fetch(audioPath, { method: 'HEAD' });
        setTtsReady(res.ok);
      } catch {
        setTtsReady(false);
      }
    };

    checkAudioExists();
    const interval = setInterval(checkAudioExists, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, paragraphs]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      uploadUserAudio(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadUserAudio = async (blob) => {
    const paraId = paragraphs[currentIndex].id;
    const formData = new FormData();
    formData.append("audio", blob, `user_para_${paraId}.wav`);
    try {
      const res = await fetch(`${API_BASE}/upload-audio/${paraId}`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setCurrentIndex((prev) => prev + 1);
        setTtsReady(false);
        setStatus("Audio saved. Next chunk...");
      } else {
        setStatus("Audio upload failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error uploading audio.");
    }
  };

  return (
    <div className="page-container">
      <h2>TTS Paragraph Review & Recording</h2>
      <form onSubmit={handlePDFUpload}>
        <input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files[0])} />
        <button type="submit" className="btn">Upload PDF</button>
      </form>

      <p>{status}</p>

      {paragraphs.length > 0 && currentIndex < paragraphs.length && (
        <div>
          <h4>Paragraph {currentIndex + 1}</h4>
          <p>{paragraphs[currentIndex].text}</p>

          {ttsReady ? (
            <>
              <audio controls src={`${API_BASE}/audio/chunk_${currentIndex}.wav`}></audio><br />
              <button className="btn" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            </>
          ) : (
            <p>⏳ Generating TTS audio...</p>
          )}
        </div>
      )}

      {currentIndex >= paragraphs.length && paragraphs.length > 0 && (
        <p>✅ All paragraphs completed!</p>
      )}
    </div>
  );
}

export default ParagraphTTSRecorder;
