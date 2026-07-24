import { render, screen } from '@testing-library/react';
import AlertBanner from './AlertBanner';
import { PreferencesProvider } from '../../context/PreferencesContext';

describe('AlertBanner', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );
  });

  it('renders an active alert properly', async () => {
    const alert = {
      message: 'Bus routes are delayed due to rain',
      severity: 'high'
    };
    
    render(
      <PreferencesProvider>
        <AlertBanner activeAlert={alert} />
      </PreferencesProvider>
    );

    expect(await screen.findByText('Bus routes are delayed due to rain')).toBeInTheDocument();
  });

  it('renders nothing when no alert is provided', () => {
    const { container } = render(
      <PreferencesProvider>
        <AlertBanner activeAlert={null} />
      </PreferencesProvider>
    );
    
    expect(container).toBeEmptyDOMElement();
  });
});
