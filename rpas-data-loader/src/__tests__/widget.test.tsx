/** @jsx jsx */
import { jsx } from 'jimu-core';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Widget from '../runtime/widget';
import { Config } from '../config';

// Mock jimu-ui components
jest.mock('jimu-ui', () => ({
  Select: ({ children, value, onChange, className }: any) => (
    <select value={value} onChange={onChange} className={className}>
      {children}
    </select>
  ),
  Option: ({ children, value }: any) => <option value={value}>{children}</option>,
  Label: ({ children }: any) => <label>{children}</label>,
  Button: ({ children, onClick, disabled, className, type }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} type={type}>
      {children}
    </button>
  )
}));

// Mock jimu-theme
jest.mock('jimu-theme', () => ({
  useTheme2: () => ({
    colors: {
      palette: {
        neutral: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          300: '#d9d9d9',
          800: '#333333',
          900: '#1a1a1a'
        },
        primary: {
          600: '#0079c1'
        },
        danger: {
          600: '#d32f2f'
        },
        warning: {
          50: '#fff8e1',
          600: '#f57c00',
          800: '#ef6c00'
        },
        info: {
          600: '#0288d1'
        },
        success: {
          600: '#388e3c'
        }
      }
    }
  })
}));

// Mock the child components
jest.mock('../runtime/RPASElevation', () => ({
  __esModule: true,
  default: function MockRPASElevation() {
    return <div data-testid="rpas-elevation">RPAS Elevation Component</div>;
  }
}));

jest.mock('../runtime/TLSElevation', () => ({
  __esModule: true,
  default: function MockTLSElevation() {
    return <div data-testid="tls-elevation">TLS Elevation Component</div>;
  }
}));

jest.mock('../runtime/SmallProjectImagery', () => ({
  __esModule: true,
  default: function MockSmallProjectImagery() {
    return <div data-testid="small-project-imagery">Small Project Imagery Component</div>;
  }
}));

describe('Widget', () => {
  const mockConfig: Config = {
    allowedExtensions: ['.las', '.laz', '.xyz', '.txt'],
    maxFileSizeMB: 500,
    webhookUrl: 'https://example.com/webhook'
  };

  const defaultProps = {
    id: 'test-widget-id',
    config: mockConfig,
    style: {},
    portalUrl: 'https://www.arcgis.com',
    user: null,
    token: null,
    theme: {
      colors: {
        palette: {
          neutral: {
            50: '#f9f9f9',
            100: '#f3f3f3',
            300: '#d9d9d9',
            800: '#333333',
            900: '#1a1a1a'
          },
          primary: {
            600: '#0079c1'
          },
          danger: {
            600: '#d32f2f'
          },
          warning: {
            50: '#fff8e1',
            600: '#f57c00',
            800: '#ef6c00'
          },
          info: {
            600: '#0288d1'
          },
          success: {
            600: '#388e3c'
          }
        }
      }
    }
  };

  it('should render the widget', () => {
    render(<Widget {...defaultProps} />);
    const widget = screen.getByText(/Survey Type/i);
    expect(widget).toBeInTheDocument();
  });

  it('should render survey type dropdown', () => {
    render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
  });

  it('should have three survey type options', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const options = container.querySelectorAll('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('RPAS Elevation');
    expect(options[1]).toHaveTextContent('TLS Elevation');
    expect(options[2]).toHaveTextContent('Small Project Imagery');
  });

  it('should default to RPAS Elevation', () => {
    render(<Widget {...defaultProps} />);
    expect(screen.getByTestId('rpas-elevation')).toBeInTheDocument();
  });

  it('should render RPAS Elevation component when rpas is selected', () => {
    render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(dropdown, { target: { value: 'rpas' } });

    expect(screen.getByTestId('rpas-elevation')).toBeInTheDocument();
    expect(screen.queryByTestId('tls-elevation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('small-project-imagery')).not.toBeInTheDocument();
  });

  it('should render TLS Elevation component when tls is selected', () => {
    render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(dropdown, { target: { value: 'tls' } });

    expect(screen.getByTestId('tls-elevation')).toBeInTheDocument();
    expect(screen.queryByTestId('rpas-elevation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('small-project-imagery')).not.toBeInTheDocument();
  });

  it('should render Small Project Imagery component when smallproject is selected', () => {
    render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(dropdown, { target: { value: 'smallproject' } });

    expect(screen.getByTestId('small-project-imagery')).toBeInTheDocument();
    expect(screen.queryByTestId('rpas-elevation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tls-elevation')).not.toBeInTheDocument();
  });

  it('should switch between components when selection changes', async () => {
    render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    // Initially RPAS
    expect(screen.getByTestId('rpas-elevation')).toBeInTheDocument();

    // Switch to TLS
    fireEvent.change(dropdown, { target: { value: 'tls' } });
    await waitFor(() => {
      expect(screen.getByTestId('tls-elevation')).toBeInTheDocument();
    });

    // Switch to Small Project
    fireEvent.change(dropdown, { target: { value: 'smallproject' } });
    await waitFor(() => {
      expect(screen.getByTestId('small-project-imagery')).toBeInTheDocument();
    });

    // Switch back to RPAS
    fireEvent.change(dropdown, { target: { value: 'rpas' } });
    await waitFor(() => {
      expect(screen.getByTestId('rpas-elevation')).toBeInTheDocument();
    });
  });

  it('should pass config to child components', () => {
    render(<Widget {...defaultProps} />);
    const component = screen.getByTestId('rpas-elevation');
    expect(component).toBeInTheDocument();
  });

  it('should render with widget-rpas-data-loader class', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const widget = container.querySelector('.widget-rpas-data-loader');
    expect(widget).toBeInTheDocument();
  });

  it('should render with jimu-widget class', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const widget = container.querySelector('.jimu-widget');
    expect(widget).toBeInTheDocument();
  });

  it('should render with widget-content wrapper', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const content = container.querySelector('.widget-content');
    expect(content).toBeInTheDocument();
  });

  it('should have form-group class for survey type selector', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const formGroup = container.querySelector('.form-group');
    expect(formGroup).toBeInTheDocument();
  });

  it('should handle undefined config gracefully', () => {
    const propsWithoutConfig = {
      ...defaultProps,
      config: undefined
    };

    render(<Widget {...propsWithoutConfig} />);
    expect(screen.getByText(/Survey Type/i)).toBeInTheDocument();
  });

  it('should handle config without style property', () => {
    const configWithoutStyle = {
      ...defaultProps,
      config: {
        allowedExtensions: ['.las'],
        maxFileSizeMB: 100,
        webhookUrl: 'https://example.com'
      }
    };

    render(<Widget {...configWithoutStyle} />);
    expect(screen.getByText(/Survey Type/i)).toBeInTheDocument();
  });

  it('should apply custom style config when provided', () => {
    const customStyleConfig = {
      ...defaultProps,
      config: {
        ...mockConfig,
        style: {
          padding: 20,
          formGroupSpacing: 15,
          labelFontSize: 1.2,
          inputFontSize: 1.1,
          borderRadius: 8,
          inputBorderWidth: 2,
          backgroundColor: '#ffffff',
          borderColor: '#cccccc',
          primaryColor: '#0066cc',
          errorColor: '#cc0000',
          warningColor: '#ff9900',
          infoColor: '#0099cc',
          successColor: '#00cc00'
        }
      }
    };

    const { container } = render(<Widget {...customStyleConfig} />);
    const widget = container.querySelector('.widget-rpas-data-loader');
    expect(widget).toBeInTheDocument();
  });

  it('should maintain selected survey type across re-renders', () => {
    const { rerender } = render(<Widget {...defaultProps} />);
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(dropdown, { target: { value: 'tls' } });

    expect(screen.getByTestId('tls-elevation')).toBeInTheDocument();

    // Re-render with same props
    rerender(<Widget {...defaultProps} />);

    // Survey type should still be TLS
    expect(screen.getByTestId('tls-elevation')).toBeInTheDocument();
  });

  it('should use default style config values when not provided', () => {
    const minimalConfig = {
      ...defaultProps,
      config: {
        allowedExtensions: ['.las'],
        maxFileSizeMB: 100,
        webhookUrl: 'https://example.com'
      },
      theme: undefined
    };

    render(<Widget {...minimalConfig} />);
    expect(screen.getByText(/Survey Type/i)).toBeInTheDocument();
  });

  it('should render label with strong tag for Survey Type', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const strongElement = container.querySelector('strong');
    expect(strongElement).toBeInTheDocument();
    expect(strongElement).toHaveTextContent('Survey Type');
  });

  it('should have w-100 class on select element', () => {
    const { container } = render(<Widget {...defaultProps} />);
    const select = container.querySelector('select.w-100');
    expect(select).toBeInTheDocument();
  });
});
