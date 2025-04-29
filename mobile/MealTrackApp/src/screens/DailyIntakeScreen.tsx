import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { MainTabScreenProps } from '../types/navigation';
import * as api from '../services/api';
import { DailyStats } from '../types/api';

export default function DailyIntakeScreen({ navigation }: MainTabScreenProps<'DailyIntake'>) {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getDailyStats(today);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const chartData = {
    labels: ['Today'],
    data: [
      [
        stats.high_confidence_calories,
        stats.low_confidence_calories,
      ],
    ],
    barColors: ['#2E7D32', '#C2185B'],
  };

  const totalCalories = stats.high_confidence_calories + stats.low_confidence_calories;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.title}>Daily Calorie Intake</Text>
        <StackedBarChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
          hideLegend={false}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2E7D32' }]} />
            <Text style={styles.legendText}>
              High Confidence ({stats.high_confidence_calories} cal)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#C2185B' }]} />
            <Text style={styles.legendText}>
              Low Confidence ({stats.low_confidence_calories} cal)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Calories</Text>
          <Text style={styles.statValue}>{totalCalories}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Protein</Text>
          <Text style={styles.statValue}>{stats.total_protein}g</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Confidence Ratio</Text>
          <Text style={styles.statValue}>
            {Math.round((stats.high_confidence_calories / totalCalories) * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});
