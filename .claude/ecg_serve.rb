# Minimal threaded static file server for the ECG prototype.
# Serves the project directory directly so it survives /tmp being wiped and
# picks up file edits immediately (no copy step). Port from $PORT (default 8080).
require 'socket'

PORT = (ENV['PORT'] || '8080').to_i
ROOT = '/tmp/ecg'

MIME = {
  '.html' => 'text/html; charset=utf-8',
  '.js'   => 'application/javascript; charset=utf-8',
  '.jsx'  => 'application/javascript; charset=utf-8',
  '.mjs'  => 'application/javascript; charset=utf-8',
  '.css'  => 'text/css; charset=utf-8',
  '.json' => 'application/json; charset=utf-8',
  '.svg'  => 'image/svg+xml',
  '.png'  => 'image/png',
  '.jpg'  => 'image/jpeg',
  '.jpeg' => 'image/jpeg',
  '.gif'  => 'image/gif',
  '.ico'  => 'image/x-icon',
  '.woff' => 'font/woff',
  '.woff2'=> 'font/woff2',
  '.map'  => 'application/json; charset=utf-8'
}.freeze

def handle(client)
  request_line = client.gets
  return unless request_line
  _method, target, _http = request_line.split(' ')
  # Drain the rest of the request headers.
  while (line = client.gets) && line != "\r\n"; end

  path = (target || '/').split('?', 2).first
  path = '/ecg.html' if path.nil? || path == '/' || path.empty?

  # Resolve safely within ROOT (block path traversal).
  full = File.expand_path(File.join(ROOT, path))
  unless full.start_with?(ROOT) && File.file?(full)
    body = 'Not Found'
    client.write "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: #{body.bytesize}\r\nConnection: close\r\n\r\n#{body}"
    return
  end

  data  = File.binread(full)
  ctype = MIME[File.extname(full).downcase] || 'application/octet-stream'
  headers = [
    'HTTP/1.1 200 OK',
    "Content-Type: #{ctype}",
    "Content-Length: #{data.bytesize}",
    'Cache-Control: no-store',
    'Access-Control-Allow-Origin: *',
    'Connection: close'
  ].join("\r\n")
  client.write(headers + "\r\n\r\n")
  client.write(data)
rescue StandardError
  # Best-effort: ignore broken pipes / malformed requests.
ensure
  client.close rescue nil
end

server = TCPServer.new('0.0.0.0', PORT)
puts "ecg static server listening on http://0.0.0.0:#{PORT} (root: #{ROOT})"
$stdout.flush
trap('INT')  { server.close rescue nil; exit 0 }
trap('TERM') { server.close rescue nil; exit 0 }

loop do
  client = server.accept
  Thread.new(client) { |c| handle(c) }
end
