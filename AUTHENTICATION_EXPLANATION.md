# Authentication System - Step-by-Step Explanation

## 📋 Overview

This Learning Management System uses **client-side authentication** stored in the browser's `localStorage`. This is perfect for demos and learning, but in production, you'd use a secure backend server.

---

## 🔐 How Sign Up Works

### Step 1: User Fills Out the Form
When a user visits `signup.html`, they see a form with:
- **Full Name** field
- **Email** field  
- **Password** field (with strength indicator)
- **Confirm Password** field

### Step 2: Form Validation (Client-Side)
Located in `src/main.js` → `bindSignup()` function:

```javascript
// Validates:
1. Name is not empty
2. Email matches email format (regex)
3. Password is at least 8 characters
4. Confirm password matches password
```

**Visual Feedback:**
- Red error messages appear below invalid fields
- Password strength bar shows: Red (weak) → Yellow (medium) → Green (strong)
- Submit button is disabled if validation fails

### Step 3: Submit the Form
When user clicks "Sign up":

```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents page reload
    
    // Validate all fields
    // If valid, call registerUser()
    registerUser(name.value, email.value, password.value);
});
```

### Step 4: Register User Function
Located in `src/main.js` → `registerUser()`:

```javascript
function registerUser(name, email, password) {
    // 1. Get all existing users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 2. Check if email already exists
    if (users.find(u => u.email === email)) {
        toast('An account with this email already exists', 'error');
        return false; // Stop here
    }
    
    // 3. Create new user object
    const newUser = {
        id: 'user-' + Date.now(),        // Unique ID
        name: name,
        email: email,
        password: password,               // ⚠️ In production, hash this!
        role: 'student',                 // Default role
        createdAt: new Date().toISOString()
    };
    
    // 4. Add user to array and save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 5. Auto-login the new user
    const authData = {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    // 6. Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}
```

### Step 5: Data Storage
**localStorage Structure:**
```json
// localStorage.getItem('users')
[
    {
        "id": "user-1234567890",
        "name": "John Doe",
        "email": "john@example.com",
        "password": "mypassword123",
        "role": "student",
        "createdAt": "2024-01-15T10:30:00.000Z"
    }
]

// localStorage.getItem('auth')
{
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "loginTime": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔑 How Sign In Works

### Step 1: User Enters Credentials
On `signin.html`, user enters:
- **Email**
- **Password**
- Optional: "Remember me" checkbox

### Step 2: Form Validation
Located in `src/main.js` → `bindSignin()`:

```javascript
// Validates:
1. Email format is valid
2. Password is not empty
```

### Step 3: Submit the Form
```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate fields
    // If valid, call authenticateUser()
    authenticateUser(email.value, password.value);
});
```

### Step 4: Authenticate User Function
Located in `src/main.js` → `authenticateUser()`:

```javascript
function authenticateUser(email, password) {
    // 1. Get all registered users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 2. Find user by email
    const user = users.find(u => u.email === email);
    
    // 3. Check if user exists
    if (!user) {
        toast('Invalid email or password', 'error');
        return false;
    }
    
    // 4. Check if password matches
    // ⚠️ In production, compare hashed passwords!
    if (user.password !== password) {
        toast('Invalid email or password', 'error');
        return false;
    }
    
    // 5. Create authentication session
    const authData = {
        email: user.email,
        name: user.name,
        role: user.role || 'student',
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    // 6. Show success message
    toast('Signed in successfully', 'success');
    
    // 7. Redirect based on role
    setTimeout(() => {
        if (authData.role === 'admin') {
            window.location.href = 'admin.html';  // Admin dashboard
        } else {
            window.location.href = 'dashboard.html'; // Student dashboard
        }
    }, 500);
    
    return true;
}
```

### Step 5: Role-Based Redirect
- **Admin users** → Redirected to `admin.html`
- **Student users** → Redirected to `dashboard.html`

---

## 🎯 How Demo Login Works

### Step 1: Default Admin Creation
When the page loads, `src/main.js` runs `initDefaultAdmin()`:

```javascript
function initDefaultAdmin() {
    // 1. Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 2. Check if admin already exists
    const adminExists = users.find(u => u.role === 'admin');
    
    // 3. If no admin exists, create one
    if (!adminExists) {
        const defaultAdmin = {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@lms.com',
            password: 'admin123',  // ⚠️ Demo only!
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));
    }
}
```

**This runs automatically** when `main.js` loads, ensuring there's always an admin account.

### Step 2: Demo Credentials Display
On `signin.html`, there's a demo credentials box:

```html
<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p class="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
    <div>
        <span>Email: admin@lms.com</span><br>
        <span>Password: admin123</span>
    </div>
    <button id="demoAdminBtn">Use Admin Credentials</button>
</div>
```

### Step 3: Auto-Fill Button
Located in `signin.html` (bottom script):

```javascript
const demoAdminBtn = document.getElementById('demoAdminBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

demoAdminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 1. Fill in the credentials
    emailInput.value = 'admin@lms.com';
    passwordInput.value = 'admin123';
    
    // 2. Trigger input events (clears any error messages)
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 3. Focus on password field
    passwordInput.focus();
    
    // 4. Show success message
    toast('Admin credentials filled. Click "Sign In" to continue.', 'success');
});
```

### Step 4: User Clicks Sign In
After clicking "Use Admin Credentials", the form is filled. User clicks "Sign In" button, which:
1. Validates the form
2. Calls `authenticateUser('admin@lms.com', 'admin123')`
3. Finds the admin user in localStorage
4. Creates auth session
5. Redirects to `admin.html` (because role is 'admin')

---

## 🔄 Complete Authentication Flow

### Sign Up Flow:
```
User visits signup.html
    ↓
Fills form (name, email, password, confirm)
    ↓
Form validation (client-side)
    ↓
registerUser() function
    ↓
Check if email exists → If yes, show error
    ↓
Create new user object
    ↓
Save to localStorage['users']
    ↓
Auto-login (save to localStorage['auth'])
    ↓
Redirect to dashboard.html
```

### Sign In Flow:
```
User visits signin.html
    ↓
Enters email and password
    ↓
Form validation
    ↓
authenticateUser() function
    ↓
Find user by email in localStorage['users']
    ↓
Check password matches
    ↓
Create auth session (localStorage['auth'])
    ↓
Check role:
    - admin → admin.html
    - student → dashboard.html
```

### Demo Login Flow:
```
Page loads → initDefaultAdmin() runs
    ↓
Creates admin@lms.com / admin123 if doesn't exist
    ↓
User clicks "Use Admin Credentials"
    ↓
Form auto-fills with admin credentials
    ↓
User clicks "Sign In"
    ↓
authenticateUser() validates
    ↓
Redirects to admin.html
```

---

## 🗄️ Data Storage Structure

### localStorage Keys:

1. **`users`** - Array of all registered users
   ```json
   [
       {
           "id": "user-1234567890",
           "name": "John Doe",
           "email": "john@example.com",
           "password": "plaintext123",
           "role": "student",
           "createdAt": "2024-01-15T10:30:00.000Z"
       },
       {
           "id": "admin-1",
           "name": "Admin User",
           "email": "admin@lms.com",
           "password": "admin123",
           "role": "admin",
           "createdAt": "2024-01-15T10:30:00.000Z"
       }
   ]
   ```

2. **`auth`** - Current logged-in user session
   ```json
   {
       "email": "admin@lms.com",
       "name": "Admin User",
       "role": "admin",
       "loginTime": "2024-01-15T10:30:00.000Z"
   }
   ```

---

## 🔒 Security Notes (Important!)

### ⚠️ Current Implementation (Demo Only):
- Passwords stored in **plain text** (not secure!)
- No password hashing
- Client-side only (no server validation)
- localStorage can be accessed by JavaScript

### ✅ Production Requirements:
1. **Hash passwords** using bcrypt or similar
2. **Server-side validation** and authentication
3. **HTTPS** for secure data transmission
4. **JWT tokens** or session management
5. **Rate limiting** to prevent brute force
6. **Password reset** functionality
7. **Email verification**

---

## 🧪 Testing the System

### Test Sign Up:
1. Go to `signup.html`
2. Fill in: Name, Email, Password (8+ chars), Confirm Password
3. Click "Sign up"
4. Should redirect to `dashboard.html`

### Test Sign In:
1. Go to `signin.html`
2. Enter email and password of registered user
3. Click "Sign in"
4. Should redirect based on role

### Test Demo Login:
1. Go to `signin.html`
2. Click "Use Admin Credentials" button
3. Form auto-fills
4. Click "Sign In"
5. Should redirect to `admin.html`

---

## 📝 Key Functions Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `registerUser()` | `src/main.js:96` | Creates new user account |
| `authenticateUser()` | `src/main.js:50` | Validates login credentials |
| `initDefaultAdmin()` | `src/main.js:236` | Creates default admin user |
| `bindSignup()` | `src/main.js:186` | Handles signup form |
| `bindSignin()` | `src/main.js:156` | Handles signin form |
| `updateNavigation()` | `src/main.js:259` | Updates nav based on auth |

---

## 🎓 Learning Points

1. **localStorage** - Browser storage that persists across sessions
2. **JSON.parse/stringify** - Convert between objects and strings
3. **Form validation** - Client-side checks before submission
4. **Event listeners** - Handle form submissions
5. **Role-based access** - Different dashboards for different roles
6. **Auto-login** - Automatically sign in after registration
7. **Session management** - Store auth state in localStorage

---

## 🚀 Next Steps to Improve

1. Add password hashing (bcrypt)
2. Add email verification
3. Add password reset functionality
4. Add "Remember me" functionality
5. Add logout functionality (already exists in dashboards)
6. Add session timeout
7. Add account deletion
8. Add profile editing

---

This authentication system is perfect for learning and demos! 🎉

