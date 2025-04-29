import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  AppShell,
  Box,
  Stack,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DailyIntakeScreen() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<api.DailyStats | null>(null);


  const loadStats = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const data = await api.getDailyStats(today);
      setStats(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load daily stats',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData = stats
    ? [
        {
          name: 'Today',
          'High Confidence': stats.high_confidence_calories,
          'Low Confidence': stats.low_confidence_calories,
        },
      ]
    : [];

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Box p="xs">
          <Group justify="space-between">
            <Title order={2}>MealTrack</Title>
            <Group>
              <Button component={Link} to="/" variant="subtle">
                Meal Feed
              </Button>
              <Button onClick={logout} variant="subtle" color="red">
                Logout
              </Button>
            </Group>
          </Group>
        </Box>
      </AppShell.Header>
      <Container size="md">
        <Title order={3} mb="xl">
          Daily Intake
        </Title>

        {stats && (
          <Stack gap="xl">
            <Card shadow="sm" p="lg">
              <BarChart
                width={600}
                height={300}
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="High Confidence"
                  stackId="a"
                  fill="#2E7D32"
                />
                <Bar
                  dataKey="Low Confidence"
                  stackId="a"
                  fill="#C2185B"
                />
              </BarChart>
            </Card>

            <Group grow>
              <Card shadow="sm" p="lg">
                <Text size="sm" color="dimmed">
                  Total Calories
                </Text>
                <Title order={3}>
                  {stats.high_confidence_calories + stats.low_confidence_calories}
                </Title>
              </Card>

              <Card shadow="sm" p="lg">
                <Text size="sm" color="dimmed">
                  Total Protein
                </Text>
                <Title order={3}>{stats.total_protein}g</Title>
              </Card>

              <Card shadow="sm" p="lg">
                <Text size="sm" color="dimmed">
                  High Confidence %
                </Text>
                <Title order={3}>
                  {Math.round(
                    (stats.high_confidence_calories /
                      (stats.high_confidence_calories +
                        stats.low_confidence_calories)) *
                      100
                  )}
                  %
                </Title>
              </Card>
            </Group>
          </Stack>
        )}
      </Container>
    </AppShell>
  );
}
