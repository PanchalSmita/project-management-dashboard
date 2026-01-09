// Test utilities for React Testing Library with Redux and Router

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../redux/slices/authSlice';
import { projectsSlice } from '../redux/slices/projectsSlice';
import { tasksSlice } from '../redux/slices/tasksSlice';
import { uiSlice } from '../redux/slices/uiSlice';

// Create a test store
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      projects: projectsSlice.reducer,
      tasks: tasksSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Property-based testing utilities
export const generators = {
  // Generate random strings
  string: (minLength = 1, maxLength = 50) => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return Array.from({ length }, () => 
      String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    ).join('');
  },

  // Generate random emails
  email: () => {
    const username = generators.string(3, 10);
    const domain = generators.string(3, 8);
    const tld = ['com', 'org', 'net', 'edu'][Math.floor(Math.random() * 4)];
    return `${username}@${domain}.${tld}`;
  },

  // Generate random IDs
  id: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // Generate random dates
  date: (start = new Date(2020, 0, 1), end = new Date()) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  // Generate random priorities
  priority: () => {
    const priorities = ['Low', 'Medium', 'High'] as const;
    return priorities[Math.floor(Math.random() * priorities.length)];
  },

  // Generate random roles
  role: () => {
    const roles = ['Admin', 'User'] as const;
    return roles[Math.floor(Math.random() * roles.length)];
  },

  // Generate random user
  user: (overrides = {}) => ({
    id: generators.id(),
    name: generators.string(2, 20),
    email: generators.email(),
    role: generators.role(),
    ...overrides,
  }),

  // Generate random project
  project: (overrides = {}) => ({
    id: generators.id(),
    name: generators.string(3, 30),
    description: generators.string(10, 100),
    createdAt: generators.date(),
    updatedAt: generators.date(),
    ownerId: generators.id(),
    members: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => generators.id()),
    ...overrides,
  }),

  // Generate random task
  task: (overrides = {}) => ({
    id: generators.id(),
    title: generators.string(3, 50),
    description: generators.string(10, 200),
    boardId: generators.id(),
    projectId: generators.id(),
    priority: generators.priority(),
    createdAt: generators.date(),
    updatedAt: generators.date(),
    order: Math.floor(Math.random() * 100),
    ...overrides,
  }),

  // Generate random board
  board: (overrides = {}) => ({
    id: generators.id(),
    name: generators.string(3, 20),
    projectId: generators.id(),
    order: Math.floor(Math.random() * 10),
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    ...overrides,
  }),
};

// Mock implementations for hooks
export const mockHookImplementations = {
  useAuth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },

  useProjects: {
    projects: [],
    activeProject: null,
    isLoading: false,
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    selectProject: jest.fn(),
  },

  useTasks: {
    tasks: [],
    isLoading: false,
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    moveTask: jest.fn(),
    assignTask: jest.fn(),
    getTasksByProject: jest.fn(() => []),
    getTasksByBoard: jest.fn(() => []),
  },

  useNotifications: {
    notifications: [],
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
    clearAllNotifications: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
};

// Async test utilities
export const waitFor = (condition: () => boolean, timeout = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
};

// Property-based test runner
export const runPropertyTest = (
  property: (...args: any[]) => boolean,
  generators: (() => any)[],
  iterations = 100
) => {
  for (let i = 0; i < iterations; i++) {
    const args = generators.map(gen => gen());
    const result = property(...args);
    
    if (!result) {
      throw new Error(`Property failed on iteration ${i + 1} with args: ${JSON.stringify(args)}`);
    }
  }
};