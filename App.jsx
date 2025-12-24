const { useState, useEffect, useRef } = React;

function App() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const intervalRef = useRef(null);
  const speechRef = useRef(null);
  const voiceRef = useRef(null);
  const audioContextRef = useRef(null);

  // iOS 감지
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    console.log('iOS 기기:', iOS);
  }, []);

  // 음성 컨텍스트 초기화 (iOS용)
  const initializeSpeech = () => {
    if (isIOS && window.speechSynthesis) {
      // iOS에서 speechSynthesis를 활성화하기 위한 더미 발화
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
      console.log('iOS 음성 엔진 초기화됨');
    }
  };

  // 음성 합성 기능
  const speak = (number) => {
    if (!voiceEnabled || !voicesLoaded) return;

    // iOS의 경우 speechSynthesis 상태 확인 및 재시작
    if (isIOS && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 이전 음성이 진행 중이면 중지
    if (speechRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(number.toString());

    // 미리 저장된 한국어 음성 사용
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
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

    utterance.onerror = (event) => {
      console.error('음성 재생 오류:', event);
      setIsSpeaking(false);
      speechRef.current = null;
    };

    speechRef.current = utterance;

    // iOS의 경우 약간의 지연 추가
    if (isIOS) {
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  };

  // 카운터 시작/중지
  const toggleCounter = () => {
    // iOS에서 처음 시작할 때 음성 엔진 초기화
    if (!isRunning && isIOS) {
      initializeSpeech();
    }
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

  // 음성 목록 로드 및 초기화 (일부 브라우저에서 필요)
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        // 한국어 음성 찾기 및 저장
        const koreanVoice = voices.find(voice => voice.lang.includes('ko'));
        if (koreanVoice) {
          voiceRef.current = koreanVoice;
          console.log('한국어 음성 찾음:', koreanVoice.name);
        } else {
          // 한국어 음성이 없으면 기본 음성 사용
          voiceRef.current = voices[0];
          console.log('기본 음성 사용:', voices[0].name);
        }

        // 음성이 준비되면 즉시 사용 가능하도록 설정
        setVoicesLoaded(true);
        console.log('음성 엔진이 준비되었습니다. (총 음성 수:', voices.length + ')');
      } else if (retryCount < maxRetries) {
        // 음성이 아직 로드되지 않았으면 재시도
        retryCount++;
        console.log('음성 로드 재시도...', retryCount);
        setTimeout(loadVoices, 200 * retryCount);
      }
    };

    // 음성 목록이 이미 로드되어 있을 수 있음
    loadVoices();

    // voiceschanged 이벤트 리스너 추가
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
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
