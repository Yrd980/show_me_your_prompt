#!/bin/bash

# Helper script to create a new project from template
# Usage: ./create-project.sh <project-name>

if [ -z "$1" ]; then
  echo "Usage: ./create-project.sh <project-name>"
  exit 1
fi

PROJECT_NAME=$1
TEMPLATE_DIR="template"

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Error: Template directory not found"
  exit 1
fi

if [ -d "$PROJECT_NAME" ]; then
  echo "Error: Project '$PROJECT_NAME' already exists"
  exit 1
fi

echo "Creating project: $PROJECT_NAME"
cp -r "$TEMPLATE_DIR" "$PROJECT_NAME"

cd "$PROJECT_NAME" || exit

echo "Installing dependencies..."
npm install

echo ""
echo "Project created successfully!"
echo ""
echo "To get started:"
echo "  cd $PROJECT_NAME"
echo "  npm run dev"
echo ""
