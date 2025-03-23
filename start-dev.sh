#!/bin/bash

# Open a new terminal window for the server
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/server && npm start"'

# Start the client in the current terminal
npm start
