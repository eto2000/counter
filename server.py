#!/usr/bin/env python3
"""
Simple HTTP server for testing PWA functionality
Run with: python3 server.py
"""

import http.server
import socketserver
import os
import mimetypes

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
    
    def guess_type(self, path):
        # Ensure proper MIME types for PWA files
        mimetype, encoding = mimetypes.guess_type(path)
        
        if path.endswith('.webmanifest') or path.endswith('manifest.json'):
            return 'application/manifest+json'
        elif path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.jsx'):
            return 'text/babel'
        
        return mimetype

PORT = 8000

if __name__ == "__main__":
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), PWAHandler) as httpd:
        print(f"🚀 PWA 서버가 시작되었습니다!")
        print(f"📱 브라우저에서 http://localhost:{PORT} 를 열어주세요")
        print(f"🔧 PWA 기능을 테스트하려면 HTTPS가 필요할 수 있습니다")
        print(f"⏹️  서버를 중지하려면 Ctrl+C를 누르세요")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 서버가 중지되었습니다")
            httpd.shutdown()