import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Image,
  FileInput,
  NumberInput,
  Modal,
  Select,
  Box,
  AppShell,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Meal {
  id: string;
  date: string;
  calories: number;
  protein: number;
  confidence: 'High' | 'Low';
  glucose_readings: Array<{
    value: number;
    timestamp: string;
  }>;
  image_url?: string;
}

export default function MealFeedScreen() {
  const { logout } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [newMeal, setNewMeal] = useState({
    calories: 0,
    protein: 0,
    confidence: 'High' as 'High' | 'Low',
    image: null as File | null,
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const data = await api.getMeals();
      setMeals(data.map(meal => ({
        ...meal,
        id: meal.id.toString(),
      })));
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch meals',
        color: 'red',
      });
    }
  };

  const handleAddMeal = async () => {
    try {
      const formData = new FormData();
      formData.append('calories', newMeal.calories.toString());
      formData.append('protein', newMeal.protein.toString());
      formData.append('confidence', newMeal.confidence);
      if (newMeal.image) {
        formData.append('image', newMeal.image);
      }

      await api.addMeal(formData);
      await fetchMeals();
      close();
      setNewMeal({
        calories: 0,
        protein: 0,
        confidence: 'High',
        image: null,
      });
      notifications.show({
        title: 'Success',
        message: 'Meal added successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add meal',
        color: 'red',
      });
    }
  };

  return (
    <AppShell
      padding="md"
    >
      <AppShell.Header h={60}>
        <Box p="xs" style={{ height: 60, borderBottom: '1px solid #eee' }}>
          <Group justify="space-between">
            <Title order={2}>MealTrack</Title>
            <Group>
              <Button component={Link} to="/stats" variant="subtle">
                Daily Stats
              </Button>
              <Button onClick={logout} variant="subtle" color="red">
                Logout
              </Button>
            </Group>
          </Group>
        </Box>
      </AppShell.Header>

      <Container size="md">
        <Group justify="space-between" mb="xl">
          <Title order={3}>Meal Feed</Title>
          <Button onClick={open}>Add Meal</Button>
        </Group>

        <Stack gap="md">
          {meals.map((meal) => (
            <Card key={meal.id} shadow="sm" p="lg">
              <Group justify="space-between" mb="xs">
                <Text fw={500}>
                  {dayjs(meal.date).format('MMM D, YYYY h:mm A')}
                </Text>
                <Badge color={meal.confidence === 'High' ? 'green' : 'yellow'}>
                  {meal.confidence} Confidence
                </Badge>
              </Group>

              <Group gap="xs">
                <div>
                  <Text size="sm" color="dimmed">
                    Calories
                  </Text>
                  <Text fw={500}>{meal.calories}</Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">
                    Protein
                  </Text>
                  <Text fw={500}>{meal.protein}g</Text>
                </div>
              </Group>

              {meal.image_url && (
                <Image
                  src={meal.image_url}
                  height={200}
                  fit="cover"
                  mt="md"
                />
              )}

              {meal.glucose_readings.length > 0 && (
                <Card.Section mt="md" p="md">
                  <Text size="sm" fw={500} mb="xs">
                    Glucose Readings
                  </Text>
                  <LineChart
                    width={600}
                    height={200}
                    data={meal.glucose_readings}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(time) => dayjs(time).format('h:mm A')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) =>
                        dayjs(label).format('MMM D, YYYY h:mm A')
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </Card.Section>
              )}
            </Card>
          ))}
        </Stack>

        <Modal opened={opened} onClose={close} title="Add New Meal">
          <Stack>
            <NumberInput
              label="Calories"
              value={newMeal.calories}
              onChange={(val) =>
                setNewMeal({ ...newMeal, calories: Number(val) || 0 })
              }
              min={0}
              required
            />
            <NumberInput
              label="Protein (g)"
              value={newMeal.protein}
              onChange={(val) =>
                setNewMeal({ ...newMeal, protein: Number(val) || 0 })
              }
              min={0}
              required
            />
            <Select
              label="Confidence Level"
              value={newMeal.confidence}
              onChange={(value: string | null) => {
                if (value === "High" || value === "Low") {
                  setNewMeal({ ...newMeal, confidence: value });
                }
              }}
              data={[
                { value: 'High', label: 'High Confidence' },
                { value: 'Low', label: 'Low Confidence' },
              ]}
              required
            />
            <FileInput
              label="Meal Photo"
              accept="image/*"
              value={newMeal.image}
              onChange={(file: File | null) => setNewMeal({ ...newMeal, image: file })}
            />
            <Button onClick={handleAddMeal}>Add Meal</Button>
          </Stack>
        </Modal>
      </Container>
    </AppShell>
  );
}
