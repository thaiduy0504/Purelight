@echo off
setlocal enabledelayedexpansion

REM Purelight Database Setup Script for Windows
REM This script automates the PostgreSQL database setup process

title Purelight Database Setup

echo.
echo ================================
echo   Purelight Database Setup
echo ================================
echo.

REM Check if PostgreSQL is installed
echo [INFO] Checking PostgreSQL installation...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH!
    echo [WARNING] Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo [WARNING] Make sure to add PostgreSQL to your PATH during installation
    pause
    exit /b 1
)

echo [INFO] PostgreSQL is installed
psql --version

REM Check if PostgreSQL service is running
echo.
echo [INFO] Checking PostgreSQL service...
sc query postgresql-x64-14 >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL service not found. Trying alternative service names...
    sc query postgresql >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Cannot find PostgreSQL service!
        echo [WARNING] Please start PostgreSQL service manually and run this script again
        pause
        exit /b 1
    )
)

echo [INFO] PostgreSQL service is running

REM Get database credentials
echo.
echo [INFO] Setting up database and user...
set /p DB_SUPERUSER="Enter PostgreSQL superuser (default: postgres): "
if "%DB_SUPERUSER%"=="" set DB_SUPERUSER=postgres

set /p DB_NAME="Enter database name (default: purelight_db): "
if "%DB_NAME%"=="" set DB_NAME=purelight_db

set /p DB_USER="Enter application user (default: purelight_user): "
if "%DB_USER%"=="" set DB_USER=purelight_user

set /p DB_PASSWORD="Enter password for application user: "

REM Create database
echo.
echo [INFO] Creating database: %DB_NAME%
createdb -U %DB_SUPERUSER% %DB_NAME% 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Database %DB_NAME% might already exist
)

REM Create user
echo [INFO] Creating user: %DB_USER%
psql -U %DB_SUPERUSER% -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] User %DB_USER% might already exist
)

REM Grant privileges
echo [INFO] Granting privileges...
psql -U %DB_SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
psql -U %DB_SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %DB_USER%;"
psql -U %DB_SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %DB_USER%;"

REM Create tables
echo [INFO] Creating tables...
psql -U %DB_SUPERUSER% -d %DB_NAME% -f database_setup.sql
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create tables. Please check database_setup.sql file exists.
    pause
    exit /b 1
)

echo [INFO] Database setup completed successfully!

REM Create .env file
echo.
echo [INFO] Creating .env file...
(
echo # Database Configuration
echo DB_USER=%DB_USER%
echo DB_HOST=localhost
echo DB_NAME=%DB_NAME%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_PORT=5432
echo.
echo # Email Configuration
echo EMAIL_USER=booking.purelight@gmail.com
echo EMAIL_PASS=your_app_password_here
echo.
echo # Server Configuration
echo PORT=3000
) > .env

echo [INFO] .env file created successfully!
echo [WARNING] Please update EMAIL_PASS with your Gmail App Password

REM Test database connection
echo.
echo [INFO] Testing database connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h localhost -U %DB_USER% -d %DB_NAME% -c "SELECT 'Connection successful!' as status;"
if %errorlevel% neq 0 (
    echo [ERROR] Database connection test failed!
    pause
    exit /b 1
)
echo [INFO] Database connection test passed!

REM Install Node.js dependencies
echo.
echo [INFO] Installing Node.js dependencies...
if exist package.json (
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully!
) else (
    echo [ERROR] package.json not found!
    pause
    exit /b 1
)

echo.
echo [INFO] Setup completed successfully!
echo [WARNING] Don't forget to:
echo   1. Update EMAIL_PASS in .env file with your Gmail App Password
echo   2. Start the backend server: npm run dev
echo   3. Test the contact form on your website
echo.
pause
