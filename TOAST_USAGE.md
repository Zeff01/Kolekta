# Toast Notification System

A reusable toast notification system for displaying user feedback messages throughout the application.

## Usage

### 1. Import the hook

```tsx
import { useToast } from '@/contexts/ToastContext';
```

### 2. Use in your component

```tsx
export default function MyComponent() {
  const toast = useToast();

  const handleAction = () => {
    // Show different types of toasts
    toast.success('Operation completed successfully!');
    toast.error('Something went wrong!');
    toast.warning('Please check your input');
    toast.info('Here is some information');
  };

  return (
    <button onClick={handleAction}>Click me</button>
  );
}
```

## API Reference

### Toast Types

- **`success(message, duration?)`** - Green toast for successful operations (default: 3000ms)
- **`error(message, duration?)`** - Red toast for errors (default: 4000ms)
- **`warning(message, duration?)`** - Yellow toast for warnings (default: 3500ms)
- **`info(message, duration?)`** - Blue toast for informational messages (default: 3000ms)
- **`showToast(message, type?, duration?)`** - Generic method for custom configuration

### Parameters

- `message` (string): The text to display in the toast
- `duration` (number, optional): How long to show the toast in milliseconds

## Examples

```tsx
// Success notification
toast.success('Profile updated successfully!');

// Error with custom duration (5 seconds)
toast.error('Failed to save changes', 5000);

// Warning
toast.warning('You have unsaved changes');

// Info
toast.info('New features available!');

// Custom toast
toast.showToast('Custom message', 'info', 2000);
```

## Features

- ✅ Auto-dismiss after specified duration
- ✅ Manual close button
- ✅ Multiple toasts stack vertically
- ✅ Slide-in animation from right
- ✅ Retro Pokemon-themed styling
- ✅ Accessible (ARIA labels)
- ✅ Dark mode support

## Styling

Toast colors match the app's retro theme:
- Success: Green (#22c55e)
- Error: Red (#dc0a2d)
- Warning: Yellow (#fbbf24) with black text
- Info: Blue (#3b82f6)

All toasts use the pixel font and retro border styling to match the app aesthetic.

## Location

Toasts appear in the top-right corner of the screen and stack vertically if multiple are shown.
