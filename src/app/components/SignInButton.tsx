'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import { useAppContext } from '../context/AppContext';

interface SignInButtonProps {
  onSignIn?: (customerId: number) => void;
}

export function SignInButton({ onSignIn }: SignInButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const { hasCredentials, customerId, setHasCredentials, setCustomerId } = useAppContext();

  const checkCredentials = async (customerId: number) => {
    try {
      const response = await fetch('/api/bayou/credentialCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId })
      });

      if (!response.ok) {
        throw new Error('Failed to check credentials');
      }

      const data = await response.json();
      return data.has_credentials;
    } catch (error) {
      console.error('Error checking credentials:', error);
      return false;
    }
  };

  const startPolling = (customerId: number) => {
    const pollInterval = setInterval(async () => {
      const hasCreds = await checkCredentials(customerId);
      if (hasCreds) {
        setHasCredentials(true);
        clearInterval(pollInterval);
        setIsModalOpen(false);
        setIsWaiting(false);
        // wait 1 second before calling onSignIn
        setTimeout(() => {
          onSignIn?.(customerId);
        }, 1000);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  };

  const handleSignIn = async () => {
    try {
      setIsModalOpen(true);
      setIsWaiting(true);

      // Call the sign-in API
      const response = await fetch('/api/bayou/signIn', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate sign-in link');
      }

      const data = await response.json();
      setCustomerId(data.customer_id);
      setOnboardingLink(data.onboarding_link);

      // Start polling for credentials
      startPolling(data.customer_id);

    } catch (error) {
      console.error('Error during sign-in:', error);
      setIsWaiting(false);
    }
  };

  return (
    <>
      {!hasCredentials ? (
        <Button
          variant="contained"
          onClick={handleSignIn}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Sign In
        </Button>
      ) : (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          ml: 'auto',
          p: 1,
          borderRadius: 1,
          backgroundColor: 'rgba(25, 118, 210, 0.08)'
        }}>
          <AccountCircleIcon sx={{ color: '#1976d2' }} />
          <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 500 }}>
            Welcome, Troy
          </Typography>
        </Box>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => !isWaiting && setIsModalOpen(false)}
        aria-labelledby="sign-in-modal"
        aria-describedby="sign-in-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          {isWaiting ? (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Waiting for credentials...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please complete the sign-in process in the new window
              </Typography>
              {onboardingLink && (
                <Button
                  variant="contained"
                  color="primary"
                  href={onboardingLink}
                  target="_blank"
                  sx={{ mt: 2 }}
                >
                  Open Sign In Window
                </Button>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Sign In Required
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Please sign in to view your energy data
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignIn}
                disabled={isWaiting}
              >
                Start Sign In
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
} 