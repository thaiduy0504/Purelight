#!/bin/bash

# Purelight Database Setup Script
# This script automates the PostgreSQL database setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is installed"
        psql --version
    else
        print_error "PostgreSQL is not installed!"
        print_warning "Please install PostgreSQL first:"
        echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
        echo "  macOS: brew install postgresql"
        echo "  Windows: Download from https://www.postgresql.org/download/"
        exit 1
    fi
}

# Check if PostgreSQL service is running
check_postgresql_service() {
    print_status "Checking PostgreSQL service..."
    
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        print_status "PostgreSQL service is running"
    elif service postgresql status &> /dev/null; then
        print_status "PostgreSQL service is running"
    else
        print_warning "PostgreSQL service is not running. Starting it..."
        
        if command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        elif command -v service &> /dev/null; then
            sudo service postgresql start
        else
            print_error "Cannot start PostgreSQL service automatically"
            print_warning "Please start PostgreSQL manually and run this script again"
            exit 1
        fi
    fi
}

# Create database and user
setup_database() {
    print_status "Setting up database and user..."
    
    # Get database credentials
    read -p "Enter PostgreSQL superuser (default: postgres): " DB_SUPERUSER
    DB_SUPERUSER=${DB_SUPERUSER:-postgres}
    
    read -p "Enter database name (default: purelight_db): " DB_NAME
    DB_NAME=${DB_NAME:-purelight_db}
    
    read -p "Enter application user (default: purelight_user): " DB_USER
    DB_USER=${DB_USER:-purelight_user}
    
    read -s -p "Enter password for application user: " DB_PASSWORD
    echo
    
    # Create database
    print_status "Creating database: $DB_NAME"
    sudo -u $DB_SUPERUSER createdb $DB_NAME 2>/dev/null || print_warning "Database $DB_NAME might already exist"
    
    # Create user
    print_status "Creating user: $DB_USER"
    sudo -u $DB_SUPERUSER psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || print_warning "User $DB_USER might already exist"
    
    # Grant privileges
    print_status "Granting privileges..."
    sudo -u $DB_SUPERUSER psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    sudo -u $DB_SUPERUSER psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
    sudo -u $DB_SUPERUSER psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
    
    # Create tables
    print_status "Creating tables..."
    sudo -u $DB_SUPERUSER psql -d $DB_NAME -f database_setup.sql
    
    print_status "Database setup completed successfully!"
    
    # Create .env file
    create_env_file
}

# Create .env file
create_env_file() {
    print_status "Creating .env file..."
    
    cat > .env << EOF
# Database Configuration
DB_USER=$DB_USER
DB_HOST=localhost
DB_NAME=$DB_NAME
DB_PASSWORD=$DB_PASSWORD
DB_PORT=5432

# Email Configuration
EMAIL_USER=booking.purelight@gmail.com
EMAIL_PASS=your_app_password_here

# Server Configuration
PORT=3000
EOF
    
    print_status ".env file created successfully!"
    print_warning "Please update EMAIL_PASS with your Gmail App Password"
}

# Test database connection
test_connection() {
    print_status "Testing database connection..."
    
    if [ -f .env ]; then
        source .env
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 'Connection successful!' as status;"
        print_status "Database connection test passed!"
    else
        print_error ".env file not found. Please run setup first."
        exit 1
    fi
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if [ -f package.json ]; then
        npm install
        print_status "Dependencies installed successfully!"
    else
        print_error "package.json not found!"
        exit 1
    fi
}

# Main menu
show_menu() {
    print_header "Purelight Database Setup"
    echo "1. Full Setup (Recommended for first time)"
    echo "2. Check PostgreSQL Installation"
    echo "3. Setup Database Only"
    echo "4. Test Database Connection"
    echo "5. Install Dependencies"
    echo "6. Exit"
    echo
    read -p "Choose an option (1-6): " choice
    
    case $choice in
        1)
            check_postgresql
            check_postgresql_service
            setup_database
            install_dependencies
            test_connection
            print_status "Full setup completed!"
            ;;
        2)
            check_postgresql
            check_postgresql_service
            ;;
        3)
            setup_database
            ;;
        4)
            test_connection
            ;;
        5)
            install_dependencies
            ;;
        6)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-6."
            show_menu
            ;;
    esac
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Some operations might not work correctly."
    print_warning "Consider running as a regular user with sudo privileges."
fi

# Main execution
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        "check")
            check_postgresql
            check_postgresql_service
            ;;
        "setup")
            check_postgresql
            check_postgresql_service
            setup_database
            ;;
        "test")
            test_connection
            ;;
        "install")
            install_dependencies
            ;;
        "full")
            check_postgresql
            check_postgresql_service
            setup_database
            install_dependencies
            test_connection
            ;;
        *)
            echo "Usage: $0 [check|setup|test|install|full]"
            echo "  check  - Check PostgreSQL installation and service"
            echo "  setup  - Setup database and user"
            echo "  test   - Test database connection"
            echo "  install- Install Node.js dependencies"
            echo "  full   - Run full setup"
            echo "  (no args) - Show interactive menu"
            exit 1
            ;;
    esac
fi

print_status "Setup completed successfully!"
print_warning "Don't forget to:"
echo "  1. Update EMAIL_PASS in .env file with your Gmail App Password"
echo "  2. Start the backend server: npm run dev"
echo "  3. Test the contact form on your website"
