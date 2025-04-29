import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName || !birthdate) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all fields',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      await login(lastName, birthdate.toISOString().split('T')[0]);
      navigate('/');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Invalid credentials',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({
          fontFamily: \`Greycliff CF, \${theme.fontFamily}\`,
          fontWeight: 900,
        })}
      >
        Welcome to MealTrack
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <DateInput
              label="Birthdate"
              placeholder="Pick your birthdate"
              value={birthdate}
              onChange={setBirthdate}
              required
            />

            <Button type="submit" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
