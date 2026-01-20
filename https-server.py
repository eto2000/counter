#!/usr/bin/env python3
"""
HTTPS server for testing PWA on iOS
Requires: pip install pyopenssl
Run with: python3 https-server.py
"""

import http.server
import socketserver
import ssl
import os
import tempfile
import subprocess
import sys

class PWAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add PWA-friendly headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        super().end_headers()

def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS"""
    cert_file = 'server.crt'
    key_file = 'server.key'
    
    if os.path.exists(cert_file) and os.path.exists(key_file):
        return cert_file, key_file
    
    print("🔐 Creating self-signed certificate...")
    
    # Create certificate using openssl
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', key_file,
        '-out', cert_file, '-days', '365', '-nodes', '-subj',
        '/C=KR/ST=Seoul/L=Seoul/O=PWA Test/CN=localhost'
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print("✅ Certificate created successfully")
        return cert_file, key_file
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create certificate: {e}")
        print("Please install OpenSSL or use ngrok for HTTPS testing")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ OpenSSL not found. Please install OpenSSL or use ngrok:")
        print("   brew install openssl  # macOS")
        print("   or use: npx ngrok http 8000")
        sys.exit(1)

PORT = 8443

if __name__ == "__main__":
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create self-signed certificate
    cert_file, key_file = create_self_signed_cert()
    
    # Create HTTPS server
    with socketserver.TCPServer(("", PORT), PWAHandler) as httpd:
        # Wrap with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"🚀 HTTPS PWA 서버가 시작되었습니다!")
        print(f"📱 브라우저에서 https://localhost:{PORT} 를 열어주세요")
        print(f"⚠️  자체 서명 인증서 경고가 나타나면 '고급' → '계속 진행' 선택")
        print(f"📲 iOS 테스트: 같은 WiFi의 다른 기기에서 https://[컴퓨터IP]:{PORT}")
        print(f"⏹️  서버를 중지하려면 Ctrl+C를 누르세요")
        print("-" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 HTTPS 서버가 중지되었습니다")
            httpd.shutdown()
        finally:
            # Clean up certificate files
            if os.path.exists(cert_file):
                os.remove(cert_file)
            if os.path.exists(key_file):
                os.remove(key_file)