#!/bin/bash

echo "🔧 Starting MongoDB for CollabCanvas..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
    exit 0
fi

# Detect OS and start MongoDB accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Detected macOS - using Homebrew to start MongoDB"
    if command -v brew &> /dev/null; then
        if brew services list | grep mongodb-community | grep -q started; then
            echo "✅ MongoDB service is already started"
        else
            echo "⚡ Starting MongoDB service..."
            brew services start mongodb-community
            sleep 3
            if brew services list | grep mongodb-community | grep -q started; then
                echo "✅ MongoDB started successfully"
            else
                echo "❌ Failed to start MongoDB service"
                echo "💡 Try manually: brew services start mongodb-community"
                exit 1
            fi
        fi
    else
        echo "❌ Homebrew not found. Please install MongoDB manually."
        echo "💡 Visit: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/"
        exit 1
    fi

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detected Linux - using systemctl to start MongoDB"
    if systemctl is-active --quiet mongod; then
        echo "✅ MongoDB is already running"
    else
        echo "⚡ Starting MongoDB service..."
        sudo systemctl start mongod
        sleep 3
        if systemctl is-active --quiet mongod; then
            echo "✅ MongoDB started successfully"
        else
            echo "❌ Failed to start MongoDB"
            echo "💡 Try manually: sudo systemctl start mongod"
            exit 1
        fi
    fi

elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash or Cygwin)
    echo "🪟 Detected Windows - starting MongoDB service"
    if net start | grep -i mongodb > /dev/null; then
        echo "✅ MongoDB is already running"
    else
        echo "⚡ Starting MongoDB service..."
        net start MongoDB
        if [ $? -eq 0 ]; then
            echo "✅ MongoDB started successfully"
        else
            echo "❌ Failed to start MongoDB"
            echo "💡 Try running as administrator: net start MongoDB"
            exit 1
        fi
    fi

else
    echo "❓ Unknown OS: $OSTYPE"
    echo "💡 Please start MongoDB manually for your system"
    exit 1
fi

echo "🎉 MongoDB is ready! You can now start the CollabCanvas servers."

