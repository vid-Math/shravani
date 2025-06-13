import React, { useState, useEffect, useRef } from 'react';

// import { DropzoneArea } from "material-ui-dropzone";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://56.228.31.167:8000";

function UploadPage() {
  const [pdf, setPdf] = useState(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ttsReady, setTtsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [userAudioMap, setUserAudioMap] = useState({});
  const [canProceed, setCanProceed] = useState(false); // 👈

  // const express = require("express");
  // const cors = require("cors");

  const corsOptions = {
    origin: "56.228.31.167:8000",
  };

  // const app = express();
  // app.use(cors(corsOptions));


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdf && !text) {
      setStatus('Please upload a PDF or enter text.');
      return;
    }

    const formData = new FormData();
    if (pdf) formData.append('pdf', pdf);
    if (text) formData.append('text', text);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log("check 1")
      if (response.ok) {
        console.log("check 2")
        if (data.paragraphs) {
          setParagraphs(data.paragraphs);
          setCurrentIndex(0);
          setStatus("Paragraphs ready. Start reviewing.");
        }
      } else {
        setStatus(`Upload failed: ${data?.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatus('Error uploading file.');
    }
  };

  useEffect(() => {
    if (paragraphs.length === 0) return;
    const audioPath = `${API_BASE}/audio/chunk_${currentIndex+1}.wav`;
    console.log(audioPath)

    const checkAudioExists = async () => {
      try {
        // const res = await fetch(audioPath, { method: 'HEAD' });
        const res = await fetch(audioPath, { method: "GET" });

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

  // eslint-disable-next-line no-unused-expressions
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const uploadUserAudio = async (blob) => {
    // const headers = {
    //   "content-type": "multipart/form-data",
    // };  
    const paraId = paragraphs[currentIndex].id;
    const formData = new FormData();
    formData.append("audio", blob, `user_para_${paraId}.webm`);
    formData.append("wav_file", blob, `user_para_${paraId}.wav`);

    // axios
    //   .post(`${API_BASE}/upload-audio/${paraId}`, { formData }, { headers })
    //   .then((res) => console.log(res.data));

    try {
      const res = await fetch(`${API_BASE}/upload-audio/${paraId}`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        // setCurrentIndex((prev) => prev + 1);
        // setTtsReady(false);
        // setStatus("Audio uploaded. Next chunk...");

        // for the NEXT button
        // const data = await res.json();  // read returned URL
        // setUserAudioMap((prev) => ({
        //   ...prev,
        //   [paraId]: `${API_BASE}${data.url}`
        // }));
        // // setCurrentIndex((prev) => prev + 1);
        // setTtsReady(false);
        // setStatus("Audio uploaded. Next chunk...");

        const data = await res.json();
        setUserAudioMap((prev) => ({
          ...prev,
          [paraId]: `${API_BASE}${data.url}`
        }));
        setCanProceed(true); // 👈 Enable "Next"
        setStatus("✅ Audio uploaded. Click Next to continue...");
      } else {
        setStatus("Audio upload failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error uploading recorded audio.");
    }
  };

  const analyzeRecording = async () => {
    const paraId = paragraphs[currentIndex].id;
    console.log(paragraphs[currentIndex].text)
    const filename = `user_para_${paraId}.webm`;
    console.log(filename)
  
    const analysisRes = await fetch(`${API_BASE}/analyze_audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true
      },
      body: JSON.stringify({
        filename: filename,
        sentence: paragraphs[currentIndex].text
      })
    });
  
    const analysisData = await analysisRes.json();
    if (analysisRes.ok) {
      console.log(analysisData);
      if (!analysisData.speed_ok) {
        setStatus("⚡ Speak slower!");
      }
      if (analysisData.words_to_repeat.length > 0) {
        setStatus(`Please re-record these words: ${analysisData.words_to_repeat.join(', ')}`);
      } else {
        setStatus("✅ Good pronunciation!");
      }
    } else {
      setStatus("Failed to analyze recording.");
    }
  };
  

  return (
    <div className="page-container">
      <h2>Upload PDF or Type Text</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files[0])} /><br /><br />
        <textarea
          rows="6"
          style={{ width: '100%' }}
          placeholder="...or type/paste your text here"
          value={text}
          onChange={e => setText(e.target.value)}
        /><br /><br />
        <button className="btn" type="submit">Convert to Speech</button>
      </form>
      <p>{status}</p>
      
      {paragraphs.length > 0 && currentIndex < paragraphs.length && (
        <div>
          <h4>Paragraph {currentIndex + 1}</h4>
          <p>{paragraphs[currentIndex].text}</p>
          {ttsReady ? (
            <>
              {/* <audio controls src={`${API_BASE}/audio/chunk_${currentIndex}.wav`}></audio><br /> */}
              <audio controls key={`chunk-${currentIndex+1}`} src={`${API_BASE}/audio/chunk_${currentIndex+1}.wav`}></audio><br />
              <button className="btn" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
      
              {userAudioMap[paragraphs[currentIndex].id] && (
              <>
                <p>🔊 Your recording:</p>
                <audio
                  controls
                  key={`user-${currentIndex}`}
                  src={userAudioMap[paragraphs[currentIndex].id]}
                ></audio>
                <br />
                <button className="btn" style={{ marginTop: "10px" }} onClick={analyzeRecording}>
                  🧠 Analyze
                </button>
              </>
            )}

            {canProceed && (
              <button className="btn" style={{ marginTop: "10px" }} onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                setTtsReady(false);
                setCanProceed(false);
                setStatus("");
              }}>
              ➡️ Next
              </button>
            )}
            </>
          ) : (
            <p>⏳ Generating TTS audio...</p>
          )}
        </div>
      )}

      {currentIndex >= paragraphs.length && paragraphs.length > 0 && (
        <p>✅ All paragraphs complete!</p>
      )}
    </div>
  );
}

export default UploadPage;