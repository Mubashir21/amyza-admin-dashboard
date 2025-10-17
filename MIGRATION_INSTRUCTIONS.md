# Adding Nationality and Age Fields to Students Table

## Overview
This guide explains how to add `nationality` and `age` fields to your students table in the admin dashboard.

## What Was Changed

### 1. Database Schema
- Added `nationality` (TEXT, optional) column
- Added `age` (INTEGER, optional) column with validation (5-100 years)

### 2. TypeScript Interfaces
- Updated `Student` interface in `lib/students-services.tsx`
- Updated `CreateStudentData` interface
- Updated `UpdateStudentData` interface

### 3. Forms Updated
- **Add Student Form** (`components/add-student-dialogue.tsx`):
  - Added nationality input field
  - Added age number input field
  - Updated form validation schema

- **Edit Student Form** (`components/students/students-edit-dialog.tsx`):
  - Added nationality input field
  - Added age number input field
  - Updated form validation schema
  - Updated student summary section

### 4. Display Components
- **Student Details Dialog** (`components/students/student-details-dialog.tsx`):
  - Added age field with Cake icon
  - Added nationality field with Globe icon
  - Both fields display in the Basic Information section

## Database Migration Steps

### Step 1: Run the SQL Migration
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Add nationality column (text field, optional)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Add age column (integer, optional)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN students.nationality IS 'Student nationality/country of origin';
COMMENT ON COLUMN students.age IS 'Student age in years';

-- Add constraint to ensure age is reasonable if provided
ALTER TABLE students 
ADD CONSTRAINT age_reasonable_check 
CHECK (age IS NULL OR (age >= 5 AND age <= 100));
```

### Step 2: Verify the Migration
After running the SQL, verify that:
1. The columns were added successfully
2. The constraint was created
3. No existing data was affected

### Step 3: Test the Application
1. **Add a new student** with nationality and age
2. **Edit an existing student** to add these fields
3. **View student details** to see the new fields displayed
4. **Test validation**: Try entering an age less than 5 or greater than 100 (should show validation error)

## Field Details

### Nationality Field
- **Type**: Text (optional)
- **Validation**: None (free text)
- **Example**: "American", "British", "Canadian", etc.
- **Icon**: Globe icon (lucide-react)

### Age Field
- **Type**: Number (optional)
- **Validation**: Must be between 5 and 100 years
- **Icon**: Cake icon (lucide-react)
- **Database Constraint**: Enforced at database level

## Features
- ✅ Both fields are optional
- ✅ Age validation (5-100 years)
- ✅ Proper icons for visual clarity
- ✅ Responsive layout
- ✅ Works in add, edit, and view modes
- ✅ Type-safe TypeScript interfaces

## Rollback (if needed)
If you need to remove these fields:

```sql
-- Remove constraint
ALTER TABLE students DROP CONSTRAINT IF EXISTS age_reasonable_check;

-- Remove columns
ALTER TABLE students DROP COLUMN IF EXISTS age;
ALTER TABLE students DROP COLUMN IF EXISTS nationality;
```

## Notes
- Existing students will have NULL values for these fields
- The fields can be populated gradually through the edit function
- Both fields are properly handled in the search and filter functionality

