import { render, screen } from '@testing-library/react';
import AlertBanner from './AlertBanner';
import { PreferencesProvider } from '../../context/PreferencesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('AlertBanner', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    axios.get.mockImplementation((url) => {
      if (url === '/api/alerts/active') {
        return Promise.resolve({ data: [] });
      }
      if (url === '/api/surge') {
        return Promise.resolve({ data: null });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an active alert properly', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/alerts/active') {
        return Promise.resolve({
          data: [{
            _id: 'test_alert',
            message: 'Bus routes are delayed due to rain',
            severity: 'high'
          }]
        });
      }
      if (url === '/api/surge') return Promise.resolve({ data: null });
      return Promise.resolve({ data: {} });
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <AlertBanner />
        </PreferencesProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Bus routes are delayed due to rain')).toBeInTheDocument();
  });

  it('renders nothing when no alert is provided', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <AlertBanner />
        </PreferencesProvider>
      </QueryClientProvider>
    );
    
    // Give time for query to resolve and component to settle
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(container).toBeEmptyDOMElement();
  });
});
