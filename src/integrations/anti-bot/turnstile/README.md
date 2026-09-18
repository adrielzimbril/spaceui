# React Cloudflare Turnstile

[![NPM Version](https://img.shields.io/npm/v/@thind9xdev/react-turnstile.svg)](https://www.npmjs.com/package/@thind9xdev/react-turnstile)
[![NPM Monthly Downloads](https://img.shields.io/npm/dm/@thind9xdev/react-turnstile.svg)](https://www.npmjs.com/package/@thind9xdev/react-turnstile)
[![License](https://img.shields.io/npm/l/@thind9xdev/react-turnstile.svg)](https://github.com/thind9xdev/react-turnstile/blob/main/LICENSE)

A modern and clean React library for integrating Cloudflare Turnstile.

## 📦 Installation

```bash
npm install @thind9xdev/react-turnstile
```

## 🚀 Import into React

```tsx
import { useTurnstile, TurnstileComponent } from "@thind9xdev/react-turnstile"
```

## 📝 How to Use the Hook (useTurnstile)

### Basic Usage with Hook

```tsx
import React from "react"
import { useTurnstile } from "@thind9xdev/react-turnstile"

const MyComponent = () => {
  const siteKey = "YOUR_SITE_KEY" // Replace with your actual site key
  const { ref, token, error, isLoading } = useTurnstile(siteKey)

  if (isLoading) {
    return <div>Loading Turnstile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // You can use the token to send requests to your API
  return (
    <div>
      <div ref={ref}></div>
      {token && <p>Turnstile token generated successfully!</p>}
    </div>
  )
}

export default MyComponent
```

### Advanced Usage with Hook

```tsx
import React from "react"
import { useTurnstile, TurnstileOptions } from "@thind9xdev/react-turnstile"

const AdvancedComponent = () => {
  const siteKey = "YOUR_SITE_KEY"
  const options: TurnstileOptions = {
    theme: "light",
    size: "normal",
    language: "en",
    retry: "auto",
    "refresh-expired": "auto",
    appearance: "always",
  }

  const { ref, token, error, isLoading, reset, execute, getResponse } = useTurnstile(siteKey, options)

  const handleSubmit = async () => {
    try {
      const currentToken = getResponse()
      if (currentToken) {
        // Send request to API with token
        console.log("Current token:", currentToken)

        // Example API call
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken }),
        })

        const result = await response.json()
        console.log("Verification result:", result)
      } else {
        // Execute Turnstile if no token yet
        execute()
      }
    } catch (err) {
      console.error("Unable to get Turnstile token:", err)
    }
  }

  const handleReset = () => {
    reset() // Reset widget to initial state
  }

  return (
    <div>
      <div ref={ref}></div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Verifying..." : "Submit"}
      </button>
      <button onClick={handleReset} disabled={isLoading}>
        Reset Turnstile
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {token && <p style={{ color: "green" }}>Token is ready!</p>}
    </div>
  )
}

export default AdvancedComponent
```

## 🧩 How to Use the Component (TurnstileComponent)

### Basic Usage with Component

```tsx
import React, { useRef } from "react"
import { TurnstileComponent, TurnstileComponentRef } from "@thind9xdev/react-turnstile"

const ComponentExample = () => {
  const turnstileRef = useRef<TurnstileComponentRef>(null)
  const siteKey = "YOUR_SITE_KEY"

  const handleSubmit = () => {
    const token = turnstileRef.current?.getResponse()
    if (token) {
      console.log("Token from component:", token)
      // Send token to your API
    } else {
      console.log("No token yet, executing verification...")
      turnstileRef.current?.execute()
    }
  }

  const handleReset = () => {
    turnstileRef.current?.reset()
  }

  return (
    <div>
      <h3>Using TurnstileComponent</h3>

      <TurnstileComponent
        ref={turnstileRef}
        siteKey={siteKey}
        theme="auto"
        size="normal"
        className="my-turnstile"
        style={{ margin: "20px 0" }}
      />

      <div>
        <button onClick={handleSubmit}>Submit Form</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  )
}

export default ComponentExample
```

### Component Usage with Advanced Options

```tsx
import React, { useRef, useState } from "react"
import { TurnstileComponent, TurnstileComponentRef } from "@thind9xdev/react-turnstile"

const AdvancedComponentExample = () => {
  const turnstileRef = useRef<TurnstileComponentRef>(null)
  const [status, setStatus] = useState<string>("")
  const siteKey = "YOUR_SITE_KEY"

  const handleSuccess = (token: string) => {
    setStatus(`Verification successful! Token: ${token.substring(0, 20)}...`)
  }

  const handleError = (error?: string) => {
    setStatus(`Verification error: ${error || "Unknown"}`)
  }

  const handleLoad = () => {
    setStatus("Turnstile loaded")
  }

  return (
    <div>
      <h3>Component with callback handlers</h3>

      <TurnstileComponent
        ref={turnstileRef}
        siteKey={siteKey}
        theme="dark"
        size="compact"
        language="en"
        onSuccess={handleSuccess}
        onError={handleError}
        onLoad={handleLoad}
        className="custom-turnstile"
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
        }}
      />

      {status && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          {status}
        </div>
      )}
    </div>
  )
}

export default AdvancedComponentExample
```

## 🔍 Invisible Mode

### Using Invisible Mode with Hook

```tsx
import React, { useState } from "react"
import { useTurnstile } from "@thind9xdev/react-turnstile"

const InvisibleTurnstile = () => {
  const [email, setEmail] = useState("")
  const siteKey = "YOUR_SITE_KEY"

  const { ref, token, error, isLoading, execute } = useTurnstile(siteKey, {
    appearance: "execute", // Invisible mode
    execution: "execute",
    theme: "light",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      // Execute Turnstile verification
      console.log("Verifying...")
      execute()
      return
    }

    // Submit form with token
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })

      if (response.ok) {
        console.log("Form submitted successfully!")
        setEmail("")
      }
    } catch (err) {
      console.error("Form submission error:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden container for Turnstile */}
      <div ref={ref} style={{ display: "none" }}></div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading || !email}>
        {isLoading ? "Verifying..." : "Register"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  )
}

export default InvisibleTurnstile
```

## 📚 API Documentation

### `useTurnstile(siteKey, options?)`

#### Parameters:

- `siteKey` (string): Your Cloudflare Turnstile site key
- `options` (TurnstileOptions, optional): Configuration options

#### Options (TurnstileOptions):

- `theme` ('light' | 'dark' | 'auto'): Widget theme (default: 'auto')
- `size` ('normal' | 'compact'): Widget size (default: 'normal')
- `language` (string): Language code (default: 'auto')
- `retry` ('auto' | 'never'): Retry behavior (default: 'auto')
- `retry-interval` (number): Retry interval (milliseconds)
- `refresh-expired` ('auto' | 'manual' | 'never'): Token refresh behavior (default: 'auto')
- `appearance` ('always' | 'execute' | 'interaction-only'): When to show the widget (default: 'always')
- `execution` ('render' | 'execute'): Execution mode (default: 'render')
- `onLoad` (function): Callback when widget loads
- `onSuccess` (function): Callback on successful verification
- `onError` (function): Callback on error
- `onExpire` (function): Callback when token expires
- `onTimeout` (function): Callback on timeout

#### Returns:

- `ref` (React.RefObject): Ref to attach to the container div
- `token` (string | null): Turnstile token
- `error` (string | null): Error message if any
- `isLoading` (boolean): Loading state
- `reset` (function): Reset the widget
- `execute` (function): Manually execute Turnstile (for invisible mode)
- `getResponse` (function): Get the current token
- `widgetId` (string | null): Widget ID returned by Turnstile

### `TurnstileComponent`

#### Props:

- `siteKey` (string): Your Cloudflare Turnstile site key
- `className` (string, optional): CSS class for the container
- `style` (React.CSSProperties, optional): Inline styles for the container
- All options from `TurnstileOptions`

#### Ref Methods:

- `reset()`: Reset the widget to its initial state
- `execute()`: Manually execute verification
- `getResponse()`: Get the current token

## 🎨 TypeScript Support

This library includes full TypeScript support with exported interfaces:

```tsx
import {
  useTurnstile,
  TurnstileComponent,
  TurnstileResponse,
  TurnstileOptions,
  TurnstileComponentProps,
  TurnstileComponentRef,
} from "@thind9xdev/react-turnstile"
```

## 🎭 Appearance and Display Modes

### Themes

- `light`: Light theme
- `dark`: Dark theme
- `auto`: Follows user's system settings

### Sizes

- `normal`: Standard widget size
- `compact`: Compact widget size

### Appearance Modes

- `always`: Widget always visible (default)
- `execute`: Invisible mode - widget appears only when executed
- `interaction-only`: Widget appears only when user interaction is required

## ✨ Features

- ✅ Modern, clean React hook
- ✅ Full TypeScript support
- ✅ Auto script loading and cleanup
- ✅ Error handling
- ✅ Loading state
- ✅ Manual token refresh and reset
- ✅ Invisible mode support
- ✅ Customizable appearance and size
- ✅ Multi-language support
- ✅ Comprehensive widget lifecycle management
- ✅ No dependencies (peer dependency: React >=16.8.0)

## 🔧 Get Your Site Key

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Turnstile"
3. Create a new site
4. Copy your **Site Key** and **Secret Key**

### Test Site Key

For testing, you can use: `1x00000000000000000000AA`

## 🔧 Backend Integration

### Verify Turnstile token with Node.js/Express:

```javascript
const express = require("express")
const axios = require("axios")
const app = express()

app.use(express.json())

const TURNSTILE_SECRET_KEY = "YOUR_SECRET_KEY" // Replace with your actual secret key

app.post("/verify-turnstile", async (req, res) => {
  const { token, remoteip } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Missing token",
    })
  }

  try {
    const response = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      secret: process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: remoteip, // optional
    })

    const { success, error_codes } = response.data

    if (success) {
      res.json({
        success: true,
        message: "Verification successful",
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Verification failed",
        error_codes,
      })
    }
  } catch (error) {
    console.error("Turnstile verification error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})
```

### Verify Turnstile token with NestJS:

#### Create TurnstileGuard:

```bash
nest generate guard turnstile
```

#### Add code for the guard:

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { Request } from "express"
import axios from "axios"

@Injectable()
export class TurnstileGuard implements CanActivate {
  private readonly secretKey = "YOUR_SECRET_KEY" // Replace with your actual secret key

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const turnstileToken = request.body.token

    if (!turnstileToken) {
      throw new UnauthorizedException("Missing Turnstile token")
    }

    try {
      const response = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        secret: this.secretKey,
        response: turnstileToken,
        remoteip: request.ip,
      })

      const { success, error_codes } = response.data

      if (!success) {
        throw new UnauthorizedException({
          message: "Invalid Turnstile token",
          error_codes,
        })
      }

      return true
    } catch (error) {
      console.error("Turnstile verification error:", error)
      throw new UnauthorizedException("Turnstile verification failed")
    }
  }
}
```

#### Use the Guard in Controller:

```typescript
import { Controller, Post, UseGuards, Body } from "@nestjs/common"
import { TurnstileGuard } from "./turnstile.guard"

@Controller("api")
export class AppController {
  @Post("submit")
  @UseGuards(TurnstileGuard)
  submitForm(@Body() body: any) {
    // Handle form logic after Turnstile verification
    return { message: "Form submitted successfully!" }
  }
}
```

### Verification with PHP (Laravel):

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TurnstileController extends Controller
{
    public function verify(Request $request)
    {
        $token = $request->input('token');
        $secretKey = env('TURNSTILE_SECRET_KEY'); // Add to .env

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Missing token'
            ], 400);
        }

        $response = Http::post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $secretKey,
            'response' => $token,
            'remoteip' => $request->ip()
        ]);

        $result = $response->json();

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Verification successful'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'error_codes' => $result['error_codes'] ?? []
            ], 400);
        }
    }
}
```

## 🚀 Getting Started with Cloudflare Turnstile

1. **Sign up for Cloudflare**: Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Navigate to Turnstile**: Find "Turnstile" in the sidebar
3. **Create a Site**: Click "Add Site" and configure your domain
4. **Get your keys**: Copy your Site Key and Secret Key
5. **Configure your site**: Set allowed domains and other settings

## ⚠️ Error Handling

Common error codes and their meanings:

- `missing-input-secret`: Missing secret parameter
- `invalid-input-secret`: Invalid or malformed secret parameter
- `missing-input-response`: Missing response parameter
- `invalid-input-response`: Invalid or malformed response parameter
- `bad-request`: Invalid or malformed request
- `timeout-or-duplicate`: Response parameter has already been validated

### Error Handling Example:

```tsx
import { useTurnstile } from "@thind9xdev/react-turnstile"

const ErrorHandlingExample = () => {
  const { ref, token, error, isLoading, reset } = useTurnstile("YOUR_SITE_KEY")

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "timeout-or-duplicate":
        return "Token has been used or timed out. Please try again."
      case "invalid-input-response":
        return "Invalid response. Please refresh the page."
      default:
        return `Verification error: ${error}`
    }
  }

  return (
    <div>
      <div ref={ref}></div>
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <p>{getErrorMessage(error)}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
      {token && <p style={{ color: "green" }}>✅ Verification successful!</p>}
    </div>
  )
}
```

## 🌐 Browser Support

Cloudflare Turnstile works on all modern browsers supporting:

- ES6 Promises
- Fetch API or XMLHttpRequest
- Modern JavaScript features

## 🔄 Migration from reCAPTCHA

If you are migrating from Google reCAPTCHA, the main differences are:

1. **Script URL**: Use Cloudflare CDN instead of Google
2. **API Methods**: Different method names and parameters
3. **Verification endpoint**: Use Cloudflare's verification API
4. **Configuration options**: Different theme and customization options
5. **Privacy**: Better privacy as Cloudflare does not track users

### Comparison Table:

| reCAPTCHA                  | Turnstile                 |
| -------------------------- | ------------------------- |
| `grecaptcha.render()`      | `turnstile.render()`      |
| `grecaptcha.reset()`       | `turnstile.reset()`       |
| `grecaptcha.getResponse()` | `turnstile.getResponse()` |
| Google CDN                 | Cloudflare CDN            |
| Tracks users               | Privacy-focused           |

## 🤝 Contributing

Contributions are welcome! Please open a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Copyright 2025 thind9xdev

## 🔗 Links

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [GitHub Repository](https://github.com/thind9xdev/react-turnstile)
- [NPM Package](https://www.npmjs.com/package/@thind9xdev/react-turnstile)
- [Quick Start Guide](./QUICK_START.md)
