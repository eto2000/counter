// PWA Installation and Service Worker Registration
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isStandalone = false;
    
    this.init();
  }

  init() {
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Register service worker
    this.registerServiceWorker();
    
    // Setup install prompt handling
    this.setupInstallPrompt();
    
    // Setup app update handling
    this.setupAppUpdate();
    
    // Add install button if needed
    this.addInstallButton();
  }

  checkInstallStatus() {
    // Check if running in standalone mode
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
    
    // Check if installed via other means
    this.isInstalled = this.isStandalone || 
                      localStorage.getItem('pwa-installed') === 'true';
    
    // iOS 감지
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    console.log('PWA Status:', {
      isStandalone: this.isStandalone,
      isInstalled: this.isInstalled,
      isIOS: this.isIOS
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker not supported');
    }
  }

  setupInstallPrompt() {
    // iOS Safari는 beforeinstallprompt 이벤트를 지원하지 않음
    if (this.isIOS) {
      // iOS에서는 수동으로 설치 안내 표시
      if (!this.isInstalled) {
        setTimeout(() => {
          this.showIOSInstallInstructions();
        }, 3000); // 3초 후 안내 표시
      }
      return;
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      this.deferredPrompt = e;
      
      // Show install button
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      localStorage.setItem('pwa-installed', 'true');
      this.hideInstallButton();
      this.showInstalledNotification();
    });
  }

  setupAppUpdate() {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: New service worker activated');
        window.location.reload();
      });
    }
  }

  addInstallButton() {
    // Create install button container
    const installContainer = document.createElement('div');
    installContainer.id = 'pwa-install-container';
    installContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: none;
    `;

    // Create install button
    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = '📱 앱 설치';
    installButton.style.cssText = `
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
    `;

    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.6)';
    });

    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
    });

    installButton.addEventListener('click', () => {
      this.installApp();
    });

    installContainer.appendChild(installButton);
    document.body.appendChild(installContainer);
  }

  showInstallButton() {
    const container = document.getElementById('pwa-install-container');
    if (container && !this.isInstalled) {
      container.style.display = 'block';
      
      // Animate in
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  hideInstallButton() {
    const container = document.getElementById('pwa-install-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      this.hideInstallButton();
      
    } catch (error) {
      console.error('PWA: Install failed:', error);
    }
  }

  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 30, 40, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      z-index: 1001;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span>🔄 새 버전이 사용 가능합니다</span>
        <button id="update-app" style="
          background: #6366f1;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        ">업데이트</button>
        <button id="dismiss-update" style="
          background: transparent;
          color: #a1a1aa;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        ">나중에</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Handle update button
    document.getElementById('update-app').addEventListener('click', () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      document.body.removeChild(notification);
    });
    
    // Handle dismiss button
    document.getElementById('dismiss-update').addEventListener('click', () => {
      document.body.removeChild(notification);
    });
    
    // Auto dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }

  showInstalledNotification() {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 185, 129, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 1001;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    notification.innerHTML = '✅ 앱이 성공적으로 설치되었습니다!';
    
    document.body.appendChild(notification);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  showIOSInstallInstructions() {
    // iOS Safari 전용 설치 안내
    const modal = document.createElement('div');
    modal.id = 'ios-install-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(10px);
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: rgba(30, 30, 40, 0.95);
      border-radius: 16px;
      padding: 24px;
      max-width: 350px;
      width: 100%;
      color: white;
      font-family: 'Inter', sans-serif;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    `;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 12px;">📱</div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">앱으로 설치하기</h3>
        <p style="margin: 0; font-size: 14px; color: #a1a1aa;">홈 화면에 추가하여 앱처럼 사용하세요</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
          <span style="margin-right: 12px; font-size: 20px;">1️⃣</span>
          <span>하단의 <strong>공유</strong> 버튼 (📤) 탭</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 14px;">
          <span style="margin-right: 12px; font-size: 20px;">2️⃣</span>
          <span><strong>"홈 화면에 추가"</strong> 선택</span>
        </div>
        <div style="display: flex; align-items: center; font-size: 14px;">
          <span style="margin-right: 12px; font-size: 20px;">3️⃣</span>
          <span><strong>"추가"</strong> 버튼 탭</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button id="ios-install-later" style="
          flex: 1;
          background: transparent;
          color: #a1a1aa;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        ">나중에</button>
        <button id="ios-install-ok" style="
          flex: 1;
          background: #6366f1;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">확인</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 버튼 이벤트
    document.getElementById('ios-install-ok').addEventListener('click', () => {
      document.body.removeChild(modal);
      localStorage.setItem('ios-install-shown', 'true');
    });

    document.getElementById('ios-install-later').addEventListener('click', () => {
      document.body.removeChild(modal);
      // 24시간 후 다시 표시
      localStorage.setItem('ios-install-dismissed', Date.now().toString());
    });

    // 배경 클릭으로 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        localStorage.setItem('ios-install-dismissed', Date.now().toString());
      }
    });

    // 이미 표시했거나 최근에 닫았으면 표시하지 않음
    const wasShown = localStorage.getItem('ios-install-shown');
    const wasDismissed = localStorage.getItem('ios-install-dismissed');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    if (wasShown || (wasDismissed && parseInt(wasDismissed) > oneDayAgo)) {
      document.body.removeChild(modal);
      return;
    }
  }
}

// Initialize PWA installer when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
  });
} else {
  new PWAInstaller();
}