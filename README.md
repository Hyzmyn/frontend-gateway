# Frontend Gateway

React.js base project for microservice architecture with API Gateway integration.

## 🚀 Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Latest React features
- 🔌 **API Gateway** - Centralized service communication
- 🔒 **Authentication** - JWT-based auth service
- 🎨 **Clean Architecture** - Well-organized folder structure
- 📦 **Reusable Components** - Common UI components
- 🎣 **Custom Hooks** - Useful React hooks
- 🛠️ **Utilities** - Helper functions and validators

## 📁 Project Structure

```
frontend-gateway/
├── src/
│   ├── components/       # React components
│   │   ├── common/      # Reusable components (Button, Loading, etc.)
│   │   └── layout/      # Layout components (Header, Footer, Layout)
│   ├── contexts/        # React contexts (Auth)
│   ├── hooks/           # Custom hooks (useApi)
│   ├── pages/           # Page components (Home, Dashboard)
│   ├── services/        # API services
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── authService.js      # Authentication service
│   │   └── microserviceService.js  # Microservice communication
│   ├── utils/           # Utility functions
│   │   ├── constants.js # App constants
│   │   ├── helpers.js   # Helper functions
│   │   └── validators.js # Validation functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd frontend-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

4. Update `.env` with your backend API Gateway URL:
```env
VITE_API_GATEWAY_URL=http://localhost:8080/api
VITE_APP_NAME=Frontend Gateway
VITE_ENV=development
```

## 🚀 Usage

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📡 API Integration

### Configure Gateway URL
Update the API Gateway URL in `.env`:
```env
VITE_API_GATEWAY_URL=http://your-gateway-url/api
```

### Using Services

#### Authentication
```javascript
import { authService } from './services';

// Login
const response = await authService.login({ username, password });

// Logout
authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();
```

#### Microservice Communication
```javascript
import { microserviceService } from './services';

// GET request
const data = await microserviceService.get('service-name', '/endpoint');

// POST request
const result = await microserviceService.post('service-name', '/endpoint', data);

// PUT request
const updated = await microserviceService.put('service-name', '/endpoint', data);

// DELETE request
await microserviceService.delete('service-name', '/endpoint');
```

### Custom Hook for API Calls
```javascript
import { useApi } from './hooks';
import { microserviceService } from './services';

const MyComponent = () => {
  const { data, loading, error, execute } = useApi(
    () => microserviceService.get('users', '/list')
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  return <div>{/* Render data */}</div>;
};
```

## 🎨 Components

### Layout Components
- `Header` - Application header with navigation
- `Footer` - Application footer
- `Layout` - Main layout wrapper

### Common Components
- `Button` - Reusable button component
- `Loading` - Loading spinner component

## 🔧 Utilities

### Validators
```javascript
import { isValidEmail, isValidPassword, isValidPhone } from './utils';

const email = 'test@example.com';
if (isValidEmail(email)) {
  // Valid email
}
```

### Helpers
```javascript
import { formatDate, formatCurrency, debounce } from './utils';

const formattedDate = formatDate(new Date());
const price = formatCurrency(100000);
```

## 🔒 Authentication Context

The app includes an AuthContext for managing authentication state:

```javascript
import { useAuth } from './contexts';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  // Use authentication methods
};
```

## 📝 Environment Variables

- `VITE_API_GATEWAY_URL` - Backend API Gateway URL
- `VITE_APP_NAME` - Application name
- `VITE_ENV` - Environment (development/production)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

MIT License

---

**Note:** This is a base project. Customize it according to your specific microservice architecture and requirements.
