#!/usr/bin/env python3
"""本地 HTTPS 服务器 + HTTP重定向"""
import http.server
import ssl
import os
import threading

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# HTTPS 主服务器（端口8443）
server = http.server.HTTPServer(("0.0.0.0", 8443), http.server.SimpleHTTPRequestHandler)
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("cert.pem", "key.pem")
server.socket = ctx.wrap_socket(server.socket, server_side=True)

# HTTP 服务器（端口8080，用于下载CA根证书）
http_server = http.server.HTTPServer(("0.0.0.0", 8080), http.server.SimpleHTTPRequestHandler)

print("🔒 HTTPS → https://localhost:8443")
print("📦 HTTP  → http://localhost:8080  （下载 rootCA.pem 用）")

threading.Thread(target=http_server.serve_forever, daemon=True).start()
server.serve_forever()
