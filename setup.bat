@echo off
echo Setting up Clueso project...
echo.

echo Installing dependencies...
call npm run install:all

echo.
echo Copying environment files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Created backend/.env from example
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Created frontend/.env from example
)

echo.
echo Setup complete!
echo.
echo To start the application:
echo   npm run dev
echo.
echo Access points:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   API Docs: http://localhost:5000/api/docs
echo.
pause