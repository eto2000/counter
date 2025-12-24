const { useState, useEffect, useRef } = React;

function App() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const intervalRef = useRef(null);
  const speechRef = useRef(null);

  // 음성 합성 기능
  const speak = (number) => {
    if (!voiceEnabled) return;

    // 이전 음성이 진행 중이면 중지
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(number.toString());

    // 한국어 음성 설정
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => voice.lang.includes('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0; // 속도
    utterance.pitch = 1.0; // 음높이
    utterance.volume = 1.0; // 볼륨

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      speechRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      speechRef.current = null;
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // 카운터 시작/중지
  const toggleCounter = () => {
    setIsRunning(!isRunning);
  };

  // 카운터 리셋
  const resetCounter = () => {
    setCount(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // 음성 on/off
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // 카운터 로직
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCount(prevCount => {
          const newCount = prevCount + 1;
          speak(newCount);
          return newCount;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // 음성 목록 로드 (일부 브라우저에서 필요)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="background-gradient">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <h1>음성 카운터</h1>
          <p>1초마다 숫자가 증가하며 음성으로 읽어드립니다</p>
        </header>

        {/* Counter Card */}
        <div className="counter-card">
          <div className="counter-display">
            <div className="counter-label">현재 카운트</div>
            <div className="counter-value">{count}</div>
          </div>

          <div className="controls">
            <button
              className={isRunning ? "btn btn-secondary" : "btn btn-primary"}
              onClick={toggleCounter}
            >
              <span>{isRunning ? '⏸ 일시정지' : '▶ 시작'}</span>
            </button>

            <button
              className="btn btn-danger"
              onClick={resetCounter}
            >
              <span>↻ 리셋</span>
            </button>

            <button
              className={voiceEnabled ? "btn btn-primary" : "btn btn-secondary"}
              onClick={toggleVoice}
            >
              <span>{voiceEnabled ? '🔊 음성 켜짐' : '🔇 음성 꺼짐'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="status-indicator">
          <div className={`status-dot ${isRunning ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
          <span className="status-text">
            {isSpeaking ? '카운터 실행 중' : isRunning ? '카운터 실행 중' : '대기 중'}
          </span>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
