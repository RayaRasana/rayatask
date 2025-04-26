#!/bin/bash

# Stop on Error
set -e

# Configure those to match your Planka Docker container names
PLANKA_DOCKER_CONTAINER_POSTGRES="rayatask-postgres-1"
PLANKA_DOCKER_CONTAINER_PLANKA="rayatask-rayatask-1"

# Extract tgz archive
PLANKA_BACKUP_ARCHIVE_TGZ=$1
PLANKA_BACKUP_ARCHIVE=$(basename "$PLANKA_BACKUP_ARCHIVE_TGZ" .tgz)

if [ -z "$PLANKA_BACKUP_ARCHIVE_TGZ" ]; then
    echo "Error: No backup file provided."
    echo "Usage: $0 <backup-archive.tgz>"
    exit 1
fi

echo -n "Extracting tarball $PLANKA_BACKUP_ARCHIVE_TGZ ... "
tar -xzf "$PLANKA_BACKUP_ARCHIVE_TGZ"
echo "Success!"

# Import Database
echo -n "Importing postgres database ... "
cat "$PLANKA_BACKUP_ARCHIVE/postgres.sql" | docker exec -i "$PLANKA_DOCKER_CONTAINER_POSTGRES" psql -U postgres
echo "Success!"

# Restore Docker Volumes
echo -n "Restoring user-avatars ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -r /backup/user-avatars /app/public/
echo "Success!"

echo -n "Restoring project-background-images ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -r /backup/project-background-images /app/public/
echo "Success!"

echo -n "Restoring attachments ... "
docker run --rm --volumes-from "$PLANKA_DOCKER_CONTAINER_PLANKA" -v "$(pwd)/$PLANKA_BACKUP_ARCHIVE:/backup" ubuntu cp -r /backup/attachments /app/private/
echo "Success!"

# Clean up extracted folder
echo -n "Cleaning up temporary files and folders ... "
rm -rf "$PLANKA_BACKUP_ARCHIVE"
echo "Success!"

echo "Restore Complete!"
