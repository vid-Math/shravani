import React, { useRef, useState } from 'react';
import './common.css';

function ChapterPage() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    const newProgress = (audio.currentTime / audio.duration) * 100;
    setProgress(newProgress);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="menu-icon" onClick={() => window.history.back()}>&#8592;</div>
        <div className="title">ShraVani</div>
      </div>

      <div className="player">
        <div className="play-button" onClick={toggleAudio}>
          <img
            src={isPlaying
              ? "https://img.icons8.com/ios-filled/50/ffffff/pause.png"
              : "https://img.icons8.com/ios-filled/50/ffffff/play.png"}
            alt="play-pause"
          />
        </div>
        <div className="progress-container">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="chapter-title">1.1 MODE OF NUTRITION IN PLANTS</div>

      <div className="chapter-content">
        Plants are the only organisms that can prepare food for themselves by using water, carbon dioxide and minerals. The raw materials are present in their surroundings. <br /><br />
        The nutrients enable living organisms to build their bodies, to grow, to repair damaged parts of their bodies and provide the energy to carry out life processes. Nutrition is the mode of taking food by an organism and its utilisation by the body. <br /><br />
        The mode of nutrition in which organisms make food themselves from simple substances is called autotrophic (auto = self; trophos = nourishment) nutrition. Therefore, plants are called autotrophs. Animals and most other organisms take in food prepared by plants. They are called heterotrophs (heteros = other).
      </div>

      <div className="bottom-nav">
        <div className="nav-item active">Home</div>
        <div className="nav-item">Shop</div>
        <div className="nav-item">Profile</div>
      </div>

      <audio ref={audioRef} src="audio/paragraph_1.mp3" onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}

export default ChapterPage;