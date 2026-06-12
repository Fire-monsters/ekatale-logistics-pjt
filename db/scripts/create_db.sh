# db/scripts/create_db.sh

#!/bin/bash
set -e  # Exit immediately if any command fails

DB_NAME="ekatale"
DB_USER="ekatale_app"
DB_HOST="localhost"

echo "🌱 Setting up E-Katale database..."

# Run schema files in order
for file in db/schemas/*.sql; do
    echo "Running $file..."
    psql -U $DB_USER -d $DB_NAME -h $DB_HOST -f "$file"
done

# Run seed files
for file in db/seeds/*.sql; do
    echo "Seeding $file..."
    psql -U $DB_USER -d $DB_NAME -h $DB_HOST -f "$file"
done

echo "✅ Database setup complete."