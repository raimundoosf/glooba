import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyCard from '../CompanyCard';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

// Mock the Clerk useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
}));

// Mock the toast
jest.mock('react-hot-toast');

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
});

// Mock the toggleFollow action
const mockToggleFollow = jest.fn();
jest.mock('@/actions/user.action', () => ({
  toggleFollow: () => mockToggleFollow(),
}));

describe('CompanyCard', () => {
  const mockCompany = {
    id: '1',
    clerkId: 'clerk-123',
    name: 'Test Company',
    username: 'testcompany',
    image: 'https://example.com/logo.jpg',
    location: 'Santiago, Chile',
    categories: ['Tecnología', 'Sustentabilidad'],
    bio: 'A test company description',
    backgroundImage: 'https://example.com/background.jpg',
    isFollowing: false,
    averageRating: 4.5,
    reviewCount: 10,
    followerCount: 25,
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      company: mockCompany,
      dbUserId: 'user-123',
      ...props,
    };
    return render(<CompanyCard {...defaultProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { publicMetadata: { dbId: 'user-123' } },
      isSignedIn: true,
    });
  });

  it('renders company information correctly', () => {
    renderComponent();

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('@testcompany')).toBeInTheDocument();
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
    expect(screen.getByText('Sustentabilidad')).toBeInTheDocument();
    expect(screen.getByText('25 seguidores')).toBeInTheDocument();
    
    // Check if the company name is displayed
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    
    // Check if the username is displayed
    expect(screen.getByText('@testcompany')).toBeInTheDocument();
    
    // Check if the location is displayed
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
  });

  it('renders follow button for non-owner users', () => {
    renderComponent();
    expect(screen.getByText('Seguir')).toBeInTheDocument();
  });

  it('does not render follow button for the company owner', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { publicMetadata: { dbId: '1' } }, // Same as company id
      isSignedIn: true,
    });
    
    renderComponent();
    expect(screen.queryByText('Seguir')).not.toBeInTheDocument();
  });

  it('shows sign in button when user is not signed in', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isSignedIn: false,
    });

    renderComponent();
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  it('calls toggleFollow when follow button is clicked', async () => {
    mockToggleFollow.mockResolvedValue({ success: true });
    renderComponent();

    const followButton = screen.getByText('Seguir');
    fireEvent.click(followButton);

    // Verify the follow function was called
    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast when follow action fails', async () => {
    mockToggleFollow.mockResolvedValue({ 
      success: false, 
      error: 'Failed to follow' 
    });
    
    renderComponent();
    const followButton = screen.getByText('Seguir');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to follow');
    });
  });

  it('handles missing optional fields gracefully', () => {
    const companyWithoutOptional = {
      ...mockCompany,
      image: null,
      backgroundImage: null,
      bio: '',
      location: '',
      categories: [],
    };

    renderComponent({ company: companyWithoutOptional });

    // Verify fallback avatar is shown
    expect(screen.getByText('T')).toBeInTheDocument();
    
    // Verify no image is loaded (since we set image: null)
    const images = screen.queryAllByRole('img');
    expect(images.length).toBe(0);
    
    // Verify the component still renders the company name
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    
    // Verify the component still renders the username
    expect(screen.getByText('@testcompany')).toBeInTheDocument();
  });
});
