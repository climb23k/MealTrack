import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MealFeedScreen from './screens/MealFeedScreen';
import DailyIntakeScreen from './screens/DailyIntakeScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'light',
        primaryColor: 'blue',
        components: {
          Button: {
            defaultProps: {
              size: 'md',
            },
          },
        },
      }}
    >
      <Notifications />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MealFeedScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <PrivateRoute>
                  <DailyIntakeScreen />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
