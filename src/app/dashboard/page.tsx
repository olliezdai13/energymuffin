'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import { MuffinLogo } from '../muffin-logo';
import styles from "../page.module.css";
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useEffect } from 'react';
import { SignInButton } from '../components/SignInButton';
import Link from 'next/link';
import { useAppContext } from '../context/AppContext';

// Mock data for energy usage and projected savings
const energyData = [
  { month: 'Jan', usage: 120, savings: null, isForecasted: false },
  { month: 'Feb', usage: 135, savings: null, isForecasted: false },
  { month: 'Mar', usage: 130, savings: null, isForecasted: false },
  { month: 'Apr', usage: 125, savings: null, isForecasted: false },
  { month: 'May', usage: 110, savings: 30, isForecasted: true },
  { month: 'Jun', usage: 105, savings: 35, isForecasted: true },
  { month: 'Jul', usage: 100, savings: 40, isForecasted: true },
  { month: 'Aug', usage: 95, savings: 45, isForecasted: true },
  { month: 'Sep', usage: 90, savings: 50, isForecasted: true },
  { month: 'Oct', usage: 85, savings: 55, isForecasted: true },
  { month: 'Nov', usage: 80, savings: 60, isForecasted: true },
  { month: 'Dec', usage: 75, savings: 65, isForecasted: true },
];

const pieData = [
  { name: 'Space Heating', value: 41, color: '#2196f3' },
  { name: 'Water Heating', value: 26, color: '#ff9800' },
  { name: 'Appliances', value: 15, color: '#4caf50' },
  { name: 'Lighting', value: 12, color: '#9c27b0' },
  { name: 'Other', value: 6, color: '#e0e0e0' }
];

const CustomBar = (props: any) => {
  const { fill, x, y, width, height, isForecasted, value } = props;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={isForecasted ? 0.7 : 1}
        stroke={fill}
        strokeWidth={2}
        strokeDasharray={isForecasted ? "4 4" : "0"}
        rx={4}
        ry={4}
      />
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fill="#666"
        fontSize={12}
      >
        ${value}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{
        p: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {label} {payload[0]?.payload?.isForecasted ? '(Forecasted)' : '(Historical)'}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: entry.color,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.5
            }}
          >
            <Box component="span" sx={{
              width: 8,
              height: 8,
              borderRadius: entry.dataKey === 'savings' ? '50%' : '2px',
              backgroundColor: entry.color,
              display: 'inline-block'
            }} />
            {entry.name}: ${entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function Dashboard() {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasCredentials, customerId } = useAppContext();

  useEffect(() => {
    if (hasCredentials && customerId) {
      fetchForecastData(customerId);
    }
  }, [hasCredentials, customerId]);

  const fetchForecastData = async (customerId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        customerId: customerId.toString(),
        monthsBefore: '12',
        monthsAfter: '12'
      });

      const response = await fetch(`/api/bayou/forecast?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const data = await response.json();

      if (!data || !data.monthly_forecasts) {
        throw new Error('Invalid forecast data received');
      }

      // Transform the forecast data into the format expected by the chart
      const transformedData = data.monthly_forecasts.map((record: any) => {
        const isForecasted = new Date(record.month_year) > new Date();
        return {
          month: new Date(record.month_year).toLocaleString('default', { month: 'short' }),
          usage: isForecasted ? Math.round(record.action_cost || 0) : Math.round(record.baseline_cost || 0),
          savings: isForecasted ? Math.round(record.action_savings || 0) : null,
          isForecasted: isForecasted
        };
      });

      setForecastData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
      console.error('Error fetching forecast data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (customerId: number) => {
    await fetchForecastData(customerId);
  };

  return (
    <main className={styles.page}>
      <AppBar position="static" elevation={0} sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        mb: 2
      }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: '0 !important' }}>
            <Box
              component={Link}
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
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <SignInButton onSignIn={handleSignIn} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Box sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{
              p: 2,
              background: '#ffebee',
              borderRadius: 2,
              border: '1px solid #ffcdd2'
            }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          </Box>
        )}

        <Box sx={{ width: '100%', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, width: '100%' }}>
            <Paper elevation={0} sx={{
              p: 4,
              width: '100%',
              maxWidth: '1200px',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              background: '#e3f2fd'
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Save more by doing this
              </Typography>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Heat your home from 12pm - 3pm to save up to <span style={{ color: '#4caf50' }}>${forecastData.length > 0
                  ? forecastData.reduce((sum, record) => sum + (record.savings || 0), 0)
                  : 30}</span>{forecastData.length > 0 ? " in the next 12 months" : "/month"}
              </Typography>
            </Paper>
          </Box>

          <Paper elevation={0} sx={{
            p: 4,
            width: '100%',
            background: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
              Monthly Energy Usage ($) for Heating
            </Typography>
            <Box sx={{
              width: '100%',
              display: 'flex',
              gap: 4,
              alignItems: 'center'
            }}>
              {isLoading ? (
                <Box sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ flex: 1, height: 400, position: 'relative' }}>
                  <ResponsiveContainer>
                    <ComposedChart
                      data={forecastData.length > 0 ? forecastData : energyData}
                      margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
                      barSize={32}
                      barGap={8}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fill: '#666', fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="rect"
                        iconSize={8}
                      />
                      <Bar
                        dataKey="usage"
                        fill="#2196f3"
                        name="Energy Usage ($)"
                        shape={<CustomBar />}
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#4caf50"
                        strokeWidth={2}
                        name="Projected Savings ($)"
                        dot={{ stroke: '#4caf50', strokeWidth: 2, r: 4, fill: 'white' }}
                        activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2, fill: 'white' }}
                        connectNulls={true}
                        label={{
                          position: 'top',
                          fill: 'rgb(102, 102, 102)',
                          fontSize: 12,
                          formatter: (value: any) => value ? `$${value}` : ''
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {/* <Box sx={{ width: 250, height: 250, position: 'relative' }}>
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{ mb: 2, fontWeight: 600, color: '#1a1a1a' }}
                >
                  Energy Usage Breakdown
                </Typography>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={entry.name === 'Space Heating' ? 1 : 0.7}
                          stroke={entry.name === 'Space Heating' ? '#1976d2' : 'none'}
                          strokeWidth={entry.name === 'Space Heating' ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box> */}
            </Box>
          </Paper>
        </Box>
      </Container>
    </main>
  );
} 