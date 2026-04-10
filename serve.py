#!/usr/bin/env python3
"""本地 HTTP 服务器"""
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

server = http.server.HTTPServer(("0.0.0.0", 8080), http.server.SimpleHTTPRequestHandler)
print("🌐 http://localhost:8080")
server.serve_forever()
