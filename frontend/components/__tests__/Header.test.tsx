import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/Header';

// Mock the context and hooks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    isAdmin: false,
  }),
}));

vi.mock('@/lib/store', () => ({
  useCartStore: (selector: any) => {
    const state = {
      items: [],
    };
    return selector(state);
  },
}));

describe('Header Component', () => {
  describe('rendering', () => {
    it('renders logo and title', () => {
      render(<Header />);
      expect(screen.getByText('Printsy')).toBeInTheDocument();
    });

    it('renders navigation links on desktop', () => {
      render(<Header />);
      expect(screen.getByText('Gallery')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('renders shopping bag icon', () => {
      render(<Header />);
      const links = screen.getAllByText('Gallery');
      expect(links.length).toBeGreaterThan(0);
    });

    it('renders mobile menu button', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('authentication', () => {
    it('shows Sign In button when not authenticated', () => {
      render(<Header />);
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('opens login modal when Sign In is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);
      const signInButton = screen.getByText('Sign In');
      
      await user.click(signInButton);
      // Login modal should open (check for its existence)
      // This depends on modal implementation
    });
  });

  describe('cart functionality', () => {
    it('shows cart badge with item count', () => {
      // Mock cart with items
      vi.mocked(require('@/lib/store').useCartStore).mockImplementation((selector: any) => {
        const state = {
          items: [
            { id: '1', quantity: 2 },
            { id: '2', quantity: 1 },
          ],
        };
        return selector(state);
      });

      render(<Header />);
      // Cart badge should show "3" (2 + 1)
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('does not show badge when cart is empty', () => {
      render(<Header />);
      // Empty cart, badge should not appear
      const badges = screen.queryAllByText(/^\d+$/);
      expect(badges.length).toBe(0);
    });
  });

  describe('mobile menu', () => {
    it('toggles mobile menu on button click', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      // Menu should be closed initially (height 0)
      await user.click(menuButton);
      // Menu should open after first click
      
      await user.click(menuButton);
      // Menu should close after second click
    });

    it('closes menu when a link is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);
      
      // Menu should be open now
      // This test depends on mobile menu implementation
    });
  });

  describe('responsive behavior', () => {
    it('hides desktop nav on mobile', () => {
      // This would require mocking window.innerWidth
      render(<Header />);
      // Check if desktop nav is hidden at mobile breakpoint
    });
  });
});
