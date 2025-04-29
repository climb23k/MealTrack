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
  AppShell,
  Header,
  FileInput,
  NumberInput,
  Modal,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MealFeedScreen() {
  const { logout } = useAuth();
  const [meals, setMeals] = useState<api.Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [newMeal, setNewMeal] = useState({
    calories: 0,
    protein: 0,
    confidence: 'Low' as 'High' | 'Low',
    image: null as File | null,
  });

  const loadMeals = async () => {
    try {
      const data = await api.getMeals();
      setMeals(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load meals',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  const handleAddMeal = async () => {
    const formData = new FormData();
    formData.append('calories', newMeal.calories.toString());
    formData.append('protein', newMeal.protein.toString());
    formData.append('confidence', newMeal.confidence);
    if (newMeal.image) {
      formData.append('image', newMeal.image);
    }

    try {
      await api.addMeal(formData);
      notifications.show({
        title: 'Success',
        message: 'Meal added successfully',
        color: 'green',
      });
      close();
      loadMeals();
      setNewMeal({
        calories: 0,
        protein: 0,
        confidence: 'Low',
        image: null,
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
      header={
        <Header height={60} p="xs">
          <Group position="apart">
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
        </Header>
      }
    >
      <Container size="md">
        <Group position="apart" mb="xl">
          <Title order={3}>Meal Feed</Title>
          <Button onClick={open}>Add Meal</Button>
        </Group>

        <Stack spacing="md">
          {meals.map((meal) => (
            <Card key={meal.id} shadow="sm" p="lg">
              <Group position="apart" mb="xs">
                <Text weight={500}>
                  {dayjs(meal.date).format('MMM D, YYYY h:mm A')}
                </Text>
                <Badge color={meal.confidence === 'High' ? 'green' : 'yellow'}>
                  {meal.confidence} Confidence
                </Badge>
              </Group>

              <Group spacing="xl">
                <div>
                  <Text size="sm" color="dimmed">
                    Calories
                  </Text>
                  <Text weight={500}>{meal.calories}</Text>
                </div>
                <div>
                  <Text size="sm" color="dimmed">
                    Protein
                  </Text>
                  <Text weight={500}>{meal.protein}g</Text>
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
                  <Text size="sm" weight={500} mb="xs">
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
                setNewMeal({ ...newMeal, calories: val || 0 })
              }
              min={0}
              required
            />
            <NumberInput
              label="Protein (g)"
              value={newMeal.protein}
              onChange={(val) =>
                setNewMeal({ ...newMeal, protein: val || 0 })
              }
              min={0}
              required
            />
            <Select
              label="Confidence Level"
              value={newMeal.confidence}
              onChange={(val: 'High' | 'Low') =>
                setNewMeal({ ...newMeal, confidence: val })
              }
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
              onChange={(file) => setNewMeal({ ...newMeal, image: file })}
            />
            <Button onClick={handleAddMeal}>Add Meal</Button>
          </Stack>
        </Modal>
      </Container>
    </AppShell>
  );
}
