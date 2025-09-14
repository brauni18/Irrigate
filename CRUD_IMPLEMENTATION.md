# CRUD Functions Implementation

This document outlines the complete CRUD (Create, Read, Update, Delete) functionality implemented for the Garden management system.

## Overview

The application now provides full CRUD operations for managing gardens through both backend API endpoints and frontend user interface.

## Backend Implementation

### Service Layer (`services/garden.js`)
- `createGarden(name, address, image)` - Creates a new garden
- `getAllGardens()` - Retrieves all gardens
- `getGarden(id)` - Retrieves a specific garden by ID
- `updateGarden(id, updateData)` - Updates a garden by ID
- `deleteGarden(id)` - Deletes a garden by ID

### Controller Layer (`controllers/api_gardens.js`)
- `getGardens` - GET all gardens
- `getGarden` - GET garden by ID
- `createGarden` - POST new garden with file upload
- `updateGarden` - PATCH garden by ID with file upload
- `deleteGarden` - DELETE garden by ID

### Router Layer (`routers/api_gardens.js`)
```
GET    /api/gardens       - Get all gardens
POST   /api/gardens       - Create new garden
GET    /api/gardens/:id   - Get garden by ID
PATCH  /api/gardens/:id   - Update garden by ID
DELETE /api/gardens/:id   - Delete garden by ID
```

## Frontend Implementation

### User Interface (`public/index.html`)
- Garden card display with edit and delete buttons
- Modal form for creating/editing gardens
- File upload support for garden images

### JavaScript Functions (`public/index.js`)
- `getGardens()` - Fetches and displays all gardens
- `createGarden(event)` - Creates new garden via form submission
- `editGarden(gardenId, currentName, currentAddress)` - Opens edit modal with pre-filled data
- `deleteGarden(gardenId)` - Deletes garden with confirmation dialog
- `resetFormToCreate()` - Resets modal to create mode

## Features

### Create
- Modal form with name, address, and image upload
- File validation (images only, 5MB limit)
- Form validation and error handling

### Read
- Display all gardens as cards on homepage
- Individual garden retrieval by ID
- Garden images displayed with fallback to default image

### Update
- Edit button on each garden card
- Pre-populated form with current garden data
- Support for updating image, name, and address
- Visual feedback on successful update

### Delete
- Delete button on each garden card
- Confirmation dialog before deletion
- Automatic refresh of garden list after deletion

## Error Handling

- Service layer includes try-catch blocks with descriptive error messages
- Controller layer returns appropriate HTTP status codes
- Frontend displays user-friendly error messages
- Form validation prevents invalid data submission

## File Upload

- Images stored in `public/uploads/` directory
- Multer middleware handles file upload
- File type validation (images only)
- File size limit (5MB)
- Timestamp prefix to prevent naming conflicts

## Usage

1. **View Gardens**: Homepage displays all gardens automatically
2. **Create Garden**: Click the floating "+" button to open creation modal
3. **Edit Garden**: Click the edit (pen) icon on any garden card
4. **Delete Garden**: Click the delete (trash) icon and confirm deletion

All operations provide visual feedback and automatically refresh the garden list to reflect changes.