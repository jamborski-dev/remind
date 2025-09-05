# Error Boundary Implementation

## Overview

Added comprehensive error handling to prevent app crashes from environment-specific failures.

## Top-Level Error Boundary

- **Location**: `/src/components/AppErrorBoundary.tsx`
- **Scope**: Wraps the entire app in `main.tsx`
- **Features**:
  - Catches all unhandled React errors
  - Shows user-friendly fallback UI
  - Provides "Try Again" and "Reload Page" buttons
  - Development mode shows detailed error information
  - Logs errors for debugging

## Defensive Error Handling Added

### 1. **Group Scheduler** (`useGroupScheduler.ts`)

- Wraps scheduling logic in try-catch
- Prevents crashes from timing/calculation errors
- Separate error handling for setTimeout callbacks
- Continues operation with degraded functionality

### 2. **Time Provider** (`TimeContext.tsx`)

- Error handling for setInterval operations
- Graceful degradation if time updates fail
- Prevents crashes from Date.now() issues

### 3. **Audio System** (`sounds.ts`)

- Already had try-catch for audio context creation
- Silently fails if audio devices unavailable
- No impact on app functionality

### 4. **Wake Lock** (`actions.ts`)

- Already had error handling for permission issues
- Logs errors but doesn't crash app
- Graceful fallback when wake lock unavailable

## Error Scenarios Handled

✅ **Audio Device Issues:**

- No audio context support
- Audio permissions denied
- Speaker/headphone disconnection

✅ **Wake Lock Problems:**

- Permission denied
- Browser doesn't support wake lock
- Mobile browser restrictions

✅ **Scheduling/Timer Failures:**

- setTimeout/setInterval failures
- Date calculation errors
- Memory/performance issues

✅ **General React Errors:**

- Component rendering failures
- State update errors
- Prop validation issues

## User Experience

### Normal Operation

- App works normally
- No visible changes to functionality

### Error Occurred

- Clean error page with clear message
- Option to retry without full reload
- Option to reload page completely
- Development details for debugging

### Production vs Development

- **Production**: Clean error messages, basic recovery options
- **Development**: Detailed error stack traces, component stack

## Testing Error Boundary

For development testing, you can trigger the error boundary by:

```javascript
// In browser console
throw new Error("Test error boundary")
```

Or by temporarily adding a component that throws:

```tsx
const ErrorTest = () => {
  throw new Error("Test error")
  return null
}
```

## Benefits

1. **Prevents White Screen**: App shows helpful error page instead of crashing
2. **User Recovery**: Users can try to continue without losing all progress
3. **Developer Friendly**: Clear error information in development
4. **Robust**: Handles environment-specific failures gracefully
5. **Graceful Degradation**: Core functionality continues even if features fail
