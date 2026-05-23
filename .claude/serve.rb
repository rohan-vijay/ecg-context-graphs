require 'webrick'
port = (ENV['PORT'] || 8080).to_i
root = File.expand_path('..', __FILE__)
server = WEBrick::HTTPServer.new(Port: port, DocumentRoot: root, Logger: WEBrick::Log.new($stdout), AccessLog: [])
trap('INT') { server.shutdown }
puts "Serving at http://localhost:#{port}"
$stdout.flush
server.start
