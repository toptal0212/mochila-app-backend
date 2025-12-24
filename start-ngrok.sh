#!/bin/bash
echo "========================================"
echo "  ngrok Tunnel for Client Sharing"
echo "========================================"
echo ""
echo "Make sure your backend is running on port 3000 first!"
echo "(Run: npm run dev in another terminal)"
echo ""
echo "After ngrok starts, copy the HTTPS URL and share it with your client."
echo "You can also monitor requests at: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo "========================================"
echo ""
ngrok http 3000

