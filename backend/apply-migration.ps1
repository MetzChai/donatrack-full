# Script to apply the Proof imageUrls migration
Write-Host "Applying database migration..."
cd $PSScriptRoot

# Check if prisma is installed
if (Test-Path "node_modules\.bin\prisma.cmd") {
    Write-Host "Found Prisma CLI"
    
    # Apply schema changes
    Write-Host "Pushing schema changes to database..."
    & "node_modules\.bin\prisma.cmd" db push --accept-data-loss
    
    # Regenerate Prisma client
    Write-Host "Regenerating Prisma client..."
    & "node_modules\.bin\prisma.cmd" generate
    
    Write-Host "Migration completed!"
} else {
    Write-Host "Error: Prisma CLI not found. Please run 'npm install' first."
    exit 1
}

