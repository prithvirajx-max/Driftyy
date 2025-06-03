import React from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { MessageProvider } from './MessageContext';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MessageProvider>
          {children}
        </MessageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppProvider;
