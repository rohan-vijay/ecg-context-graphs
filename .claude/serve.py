import os, sys, http.server, socketserver

port = int(os.environ.get("PORT", 8080))
os.chdir("/Users/rohanvijay/Desktop/ECG")

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", port), Handler) as httpd:
    print(f"Serving at http://localhost:{port}", flush=True)
    httpd.serve_forever()
