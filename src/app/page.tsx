'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { MuffinLogo } from './muffin-logo';
import styles from "./page.module.css";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LogoutIcon from '@mui/icons-material/Logout';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState } from 'react';

// Sample data for comparison charts
const withoutMuffinData = [
  { month: 'Jan', spend: 120 },
  { month: 'Feb', spend: 135 },
  { month: 'Mar', spend: 130 },
  { month: 'Apr', spend: 125 },
];

const withMuffinData = [
  { month: 'Jan', spend: 90, savings: 30 },
  { month: 'Feb', spend: 95, savings: 40 },
  { month: 'Mar', spend: 85, savings: 45 },
  { month: 'Apr', spend: 80, savings: 45 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ 
        p: 2, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: payload[0].color,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Energy Spend: ${payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function Home() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

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
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
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

  const drawerWidth = 240;

  const menuItems = [
    { text: 'Account Information', icon: <AccountCircleIcon /> },
    { text: 'View my Recommendations', icon: <LightbulbIcon />, href: '/dashboard' },
    { text: 'Bill Prediction', icon: <TrendingUpIcon /> },
    { text: 'Change Password', icon: <LockIcon /> },
    { text: 'Contact', icon: <ContactSupportIcon /> },
    { text: 'Log Out', icon: <LogoutIcon /> },
  ];

  return (
    <main className={styles.page}>
      <AppBar position="fixed" elevation={0} sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: '0 !important' }}>
            <Box 
              component="a" 
              href="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              <MuffinLogo width={32} height={32} />
              <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                Energy Muffin
              </Typography>
            </Box>
            {hasCredentials ? (
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
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSignIn}
                sx={{ ml: 'auto' }}
              >
                Sign In
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

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

      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              backgroundColor: 'white',
              marginTop: '64px', // Height of the AppBar
            },
          }}
        >
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={item.text}
                onClick={() => handleTabChange(index)}
                component={item.href ? 'a' : 'div'}
                href={item.href}
                sx={{
                  backgroundColor: selectedTab === index ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedTab === index 
                      ? 'rgba(25, 118, 210, 0.12)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemIcon sx={{ color: selectedTab === index ? '#1976d2' : '#666' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: selectedTab === index ? '#1976d2' : '#666',
                    '& .MuiTypography-root': {
                      fontWeight: selectedTab === index ? 600 : 400,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ py: 8 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center',
              gap: 4
            }}>
              <Box sx={{ maxWidth: 600 }}>
                <Typography variant="h3" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  textAlign: 'center'
                }}>
                  Welcome, Troy!
                </Typography>
                <Typography variant="h5" sx={{ color: '#666', mb: 4 }}>
                  Energy Muffin is your smart energy companion for a more sustainable and cost-effective home.
                </Typography>
              </Box>

              {/* Comparison Charts */}
              <Paper elevation={0} sx={{ 
                p: 4,
                width: '100%',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'white'
              }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600, color: '#1a1a1a', textAlign: 'center' }}>
                  See the Difference
                </Typography>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 4
                }}>
                  {/* Without Muffin Chart */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#666', textAlign: 'center' }}>
                      Without Energy Muffin
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={withoutMuffinData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                            domain={[0, 140]}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="spend" 
                            fill="#ff9800"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* With Muffin Chart */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#1976d2', textAlign: 'center' }}>
                      With Energy Muffin
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={withMuffinData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <defs>
                            <pattern id="savings-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                              <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" 
                                    style={{ stroke: '#4caf50', strokeWidth: 2 }} />
                            </pattern>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                            domain={[0, 140]}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length >= 2) {
                                const currentSpend = payload[0].value as number;
                                const savings = payload[1].value as number;
                                return (
                                  <Paper sx={{ 
                                    p: 2, 
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                  }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                      {label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                                      Current Spend: ${currentSpend}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                      Savings: ${savings}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                      Total: ${currentSpend + savings}
                                    </Typography>
                                  </Paper>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="spend" 
                            fill="#1976d2"
                            radius={[4, 4, 0, 0]}
                            stackId="stack"
                          />
                          <Bar 
                            dataKey="savings" 
                            fill="url(#savings-pattern)"
                            fillOpacity={1}
                            stroke="#4caf50"
                            strokeWidth={1}
                            radius={[4, 4, 0, 0]}
                            stackId="stack"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 600 }}>
                    Save up to 30% on your energy bills
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', mt: 1, mb: 4 }}>
                    Energy Muffin helps you optimize your energy usage with smart recommendations
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    href="/dashboard"
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      fontSize: '1.2rem',
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.24)',
                      '&:hover': {
                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.32)',
                      }
                    }}
                  >
                    View my Recommendations
                  </Button>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        sx={{
                          color: '#1976d2',
                          '&.Mui-checked': {
                            color: '#1976d2',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                        Give me timely notifications on how I can save more money
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </main>
  );
}
