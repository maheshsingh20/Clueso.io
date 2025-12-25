#!/bin/bash

echo "Setting up Clueso project..."
echo

echo "Installing dependencies..."
npm run install:all

echo
echo "Copying environment files..."
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "Created backend/.env from example"
fi

if [ ! -f "frontend/.env" ]; then
    cp "frontend/.env.example" "frontend/.env"
    echo "Created frontend/.env from example"
fi

echo
echo "Setup complete!"
echo
echo "To start the application:"
echo "  npm run dev"
echo
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API Docs: http://localhost:5000/api/docs"
echo