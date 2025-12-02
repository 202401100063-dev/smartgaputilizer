import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courses, teachers, rooms, constraints } = await req.json();
    
    console.log('Starting timetable generation...');
    console.log('Courses:', courses.length);
    console.log('Teachers:', teachers.length);
    console.log('Rooms:', rooms.length);
    console.log('Constraints:', constraints.length);

    // Genetic Algorithm Parameters
    const POPULATION_SIZE = 50;
    const MAX_GENERATIONS = 100;
    const MUTATION_RATE = 0.1;
    const CROSSOVER_RATE = 0.8;

    // Time slots (5 days, 8 hours per day)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

    interface Gene {
      courseId: string;
      teacherId: string;
      roomId: string;
      day: string;
      hour: string;
    }

    // Create initial population
    function createRandomTimetable(): Gene[] {
      const timetable: Gene[] = [];
      
      for (const course of courses) {
        for (let i = 0; i < course.hoursPerWeek; i++) {
          const gene: Gene = {
            courseId: course.id,
            teacherId: teachers[Math.floor(Math.random() * teachers.length)].id,
            roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
            day: days[Math.floor(Math.random() * days.length)],
            hour: hours[Math.floor(Math.random() * hours.length)],
          };
          timetable.push(gene);
        }
      }
      
      return timetable;
    }

    // Calculate fitness score
    function calculateFitness(timetable: Gene[]): number {
      let score = 100;
      
      // Check for conflicts (same teacher/room at same time)
      const timeSlots = new Map<string, { teachers: Set<string>, rooms: Set<string> }>();
      
      for (const gene of timetable) {
        const key = `${gene.day}-${gene.hour}`;
        if (!timeSlots.has(key)) {
          timeSlots.set(key, { teachers: new Set(), rooms: new Set() });
        }
        
        const slot = timeSlots.get(key)!;
        
        // Penalize teacher conflicts
        if (slot.teachers.has(gene.teacherId)) {
          score -= 10;
        }
        slot.teachers.add(gene.teacherId);
        
        // Penalize room conflicts
        if (slot.rooms.has(gene.roomId)) {
          score -= 10;
        }
        slot.rooms.add(gene.roomId);
      }
      
      // Check teacher workload
      const teacherHours = new Map<string, number>();
      for (const gene of timetable) {
        teacherHours.set(gene.teacherId, (teacherHours.get(gene.teacherId) || 0) + 1);
      }
      
      for (const teacher of teachers) {
        const hours = teacherHours.get(teacher.id) || 0;
        if (hours > teacher.maxHoursPerWeek) {
          score -= (hours - teacher.maxHoursPerWeek) * 5;
        }
      }
      
      // Bonus for distributing classes across the week
      const dayDistribution = new Map<string, number>();
      for (const gene of timetable) {
        dayDistribution.set(gene.day, (dayDistribution.get(gene.day) || 0) + 1);
      }
      
      const avgPerDay = timetable.length / days.length;
      for (const count of dayDistribution.values()) {
        const variance = Math.abs(count - avgPerDay);
        score -= variance * 2;
      }
      
      return Math.max(0, score);
    }

    // Selection (Tournament)
    function tournamentSelection(population: Gene[][], fitnessScores: number[]): Gene[] {
      const tournamentSize = 3;
      let best = Math.floor(Math.random() * population.length);
      
      for (let i = 1; i < tournamentSize; i++) {
        const competitor = Math.floor(Math.random() * population.length);
        if (fitnessScores[competitor] > fitnessScores[best]) {
          best = competitor;
        }
      }
      
      return population[best];
    }

    // Crossover
    function crossover(parent1: Gene[], parent2: Gene[]): Gene[] {
      if (Math.random() > CROSSOVER_RATE) {
        return [...parent1];
      }
      
      const crossoverPoint = Math.floor(Math.random() * parent1.length);
      return [
        ...parent1.slice(0, crossoverPoint),
        ...parent2.slice(crossoverPoint)
      ];
    }

    // Mutation
    function mutate(timetable: Gene[]): Gene[] {
      return timetable.map(gene => {
        if (Math.random() < MUTATION_RATE) {
          const mutationType = Math.floor(Math.random() * 4);
          
          switch (mutationType) {
            case 0:
              return { ...gene, teacherId: teachers[Math.floor(Math.random() * teachers.length)].id };
            case 1:
              return { ...gene, roomId: rooms[Math.floor(Math.random() * rooms.length)].id };
            case 2:
              return { ...gene, day: days[Math.floor(Math.random() * days.length)] };
            case 3:
              return { ...gene, hour: hours[Math.floor(Math.random() * hours.length)] };
            default:
              return gene;
          }
        }
        return gene;
      });
    }

    // Initialize population
    let population: Gene[][] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population.push(createRandomTimetable());
    }

    let bestTimetable: Gene[] = population[0];
    let bestFitness = calculateFitness(bestTimetable);

    // Evolution loop
    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
      const fitnessScores = population.map(calculateFitness);
      
      // Find best in current generation
      for (let i = 0; i < population.length; i++) {
        if (fitnessScores[i] > bestFitness) {
          bestFitness = fitnessScores[i];
          bestTimetable = population[i];
        }
      }
      
      console.log(`Generation ${generation + 1}: Best fitness = ${bestFitness.toFixed(2)}`);
      
      // Create new population
      const newPopulation: Gene[][] = [];
      
      // Elitism: keep best solution
      newPopulation.push([...bestTimetable]);
      
      // Generate rest of population
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = tournamentSelection(population, fitnessScores);
        const parent2 = tournamentSelection(population, fitnessScores);
        let offspring = crossover(parent1, parent2);
        offspring = mutate(offspring);
        newPopulation.push(offspring);
      }
      
      population = newPopulation;
      
      // Early stopping if fitness is good enough
      if (bestFitness >= 95) {
        console.log('Reached satisfactory fitness, stopping early');
        break;
      }
    }

    console.log(`Final best fitness: ${bestFitness.toFixed(2)}`);

    // Format the result
    const formattedTimetable = bestTimetable.map(gene => {
      const course = courses.find((c: any) => c.id === gene.courseId);
      const teacher = teachers.find((t: any) => t.id === gene.teacherId);
      const room = rooms.find((r: any) => r.id === gene.roomId);
      
      return {
        course: course?.name || 'Unknown',
        courseCode: course?.code || '',
        teacher: teacher?.name || 'Unknown',
        room: room?.name || 'Unknown',
        day: gene.day,
        hour: gene.hour,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        timetable: formattedTimetable,
        fitnessScore: bestFitness,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating timetable:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
