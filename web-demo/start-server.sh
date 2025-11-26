#!/bin/bash

# ThirdShift Web Demo Server Starter

echo "🚀 Starting ThirdShift Web Demo..."
echo ""

# Check which server is available
if command -v python3 &> /dev/null; then
    echo "✓ Using Python 3 HTTP Server"
    echo "📱 Open: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✓ Using Python 2 HTTP Server"
    echo "📱 Open: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
elif command -v php &> /dev/null; then
    echo "✓ Using PHP Built-in Server"
    echo "📱 Open: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8000
else
    echo "❌ No suitable server found!"
    echo ""
    echo "Please install one of:"
    echo "  - Python 3: brew install python3"
    echo "  - PHP: brew install php"
    echo "  - Node.js: brew install node (then use: npx http-server)"
    exit 1
fi
