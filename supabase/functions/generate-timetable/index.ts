import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const POPULATION_SIZE = 80;
    const MAX_GENERATIONS = 200;
    const MUTATION_RATE = 0.15;
    const CROSSOVER_RATE = 0.85;

    // Days ordered by priority: Mon-Thu first, then Friday
    const priorityDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const overflowDays = ['Friday'];
    const allDays = [...priorityDays, ...overflowDays];
    
    // Consecutive time slots (no lunch gap issue - slots are sequential)
    const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    const hourIndex: Record<string, number> = {};
    hours.forEach((h, i) => { hourIndex[h] = i; });

    interface Gene {
      courseId: string;
      teacherId: string;
      roomId: string;
      day: string;
      hour: string;
    }

    // Find teacher for a course based on specialization (courseId match)
    function findTeacherForCourse(courseId: string): string {
      const specialized = teachers.filter((t: any) => t.courseId === courseId);
      if (specialized.length > 0) {
        return specialized[Math.floor(Math.random() * specialized.length)].id;
      }
      return teachers[Math.floor(Math.random() * teachers.length)].id;
    }

    // Create a timetable that prefers Mon-Thu and consecutive slots
    function createSmartTimetable(): Gene[] {
      const timetable: Gene[] = [];
      
      // Track occupied slots: day -> Set of hour indices
      const occupied = new Map<string, Set<number>>();
      allDays.forEach(d => occupied.set(d, new Set()));

      for (const course of courses) {
        for (let i = 0; i < course.hoursPerWeek; i++) {
          let placed = false;
          
          // Try priority days first (Mon-Thu), then overflow (Fri)
          const daysToTry = [...priorityDays, ...overflowDays];
          
          for (const day of daysToTry) {
            if (placed) break;
            const usedSlots = occupied.get(day)!;
            
            // Find a consecutive slot next to existing ones to minimize gaps
            if (usedSlots.size > 0) {
              const sorted = [...usedSlots].sort((a, b) => a - b);
              // Try slot right after last used
              const nextSlot = sorted[sorted.length - 1] + 1;
              if (nextSlot < hours.length && !usedSlots.has(nextSlot)) {
                timetable.push({
                  courseId: course.id,
                  teacherId: findTeacherForCourse(course.id),
                  roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
                  day,
                  hour: hours[nextSlot],
                });
                usedSlots.add(nextSlot);
                placed = true;
                continue;
              }
              // Try slot before first used
              const prevSlot = sorted[0] - 1;
              if (prevSlot >= 0 && !usedSlots.has(prevSlot)) {
                timetable.push({
                  courseId: course.id,
                  teacherId: findTeacherForCourse(course.id),
                  roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
                  day,
                  hour: hours[prevSlot],
                });
                usedSlots.add(prevSlot);
                placed = true;
                continue;
              }
            }
            
            // Find any free slot on this day
            for (let s = 0; s < hours.length; s++) {
              if (!usedSlots.has(s)) {
                timetable.push({
                  courseId: course.id,
                  teacherId: findTeacherForCourse(course.id),
                  roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
                  day,
                  hour: hours[s],
                });
                usedSlots.add(s);
                placed = true;
                break;
              }
            }
          }
          
          // Fallback: random placement if all slots taken
          if (!placed) {
            const day = allDays[Math.floor(Math.random() * allDays.length)];
            timetable.push({
              courseId: course.id,
              teacherId: findTeacherForCourse(course.id),
              roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
              day,
              hour: hours[Math.floor(Math.random() * hours.length)],
            });
          }
        }
      }
      
      return timetable;
    }

    // Calculate fitness score
    function calculateFitness(timetable: Gene[]): number {
      let score = 100;
      
      // === HARD CONSTRAINTS (heavy penalties) ===
      
      // Check for conflicts (same teacher/room at same time)
      const timeSlots = new Map<string, { teachers: Set<string>, rooms: Set<string> }>();
      
      for (const gene of timetable) {
        const key = `${gene.day}-${gene.hour}`;
        if (!timeSlots.has(key)) {
          timeSlots.set(key, { teachers: new Set(), rooms: new Set() });
        }
        
        const slot = timeSlots.get(key)!;
        
        if (slot.teachers.has(gene.teacherId)) {
          score -= 15;
        }
        slot.teachers.add(gene.teacherId);
        
        if (slot.rooms.has(gene.roomId)) {
          score -= 15;
        }
        slot.rooms.add(gene.roomId);
      }
      
      // Check teacher workload
      const teacherHours = new Map<string, number>();
      for (const gene of timetable) {
        teacherHours.set(gene.teacherId, (teacherHours.get(gene.teacherId) || 0) + 1);
      }
      
      for (const teacher of teachers) {
        const hrs = teacherHours.get(teacher.id) || 0;
        if (hrs > teacher.maxHoursPerWeek) {
          score -= (hrs - teacher.maxHoursPerWeek) * 5;
        }
      }

      // === SOFT CONSTRAINTS ===
      
      // 1. MINIMIZE GAPS between slots per day
      // Group slots by day, sort by hour index, count gaps
      const daySlots = new Map<string, number[]>();
      for (const gene of timetable) {
        const idx = hourIndex[gene.hour];
        if (!daySlots.has(gene.day)) {
          daySlots.set(gene.day, []);
        }
        daySlots.get(gene.day)!.push(idx);
      }
      
      for (const [, slots] of daySlots) {
        const sorted = [...new Set(slots)].sort((a, b) => a - b);
        if (sorted.length > 1) {
          for (let i = 1; i < sorted.length; i++) {
            const gap = sorted[i] - sorted[i - 1] - 1;
            // Penalize each gap slot (lunch break gap between 12:00→14:00 = index 4→5 is ok)
            if (gap > 0) {
              // Don't penalize the lunch break gap (index 4 to 5)
              if (!(sorted[i - 1] === 4 && sorted[i] === 5)) {
                score -= gap * 3;
              }
            }
          }
        }
      }
      
      // 2. PREFER MON-THU: penalize Friday usage
      let fridayCount = 0;
      let monThuCount = 0;
      for (const gene of timetable) {
        if (gene.day === 'Friday') {
          fridayCount++;
        } else {
          monThuCount++;
        }
      }
      
      // Calculate Mon-Thu capacity
      const monThuCapacity = priorityDays.length * hours.length;
      
      // Only penalize Friday if there's still room on Mon-Thu
      if (fridayCount > 0 && monThuCount < monThuCapacity) {
        score -= fridayCount * 4;
      }
      
      // 3. REWARD compact scheduling (classes packed together)
      for (const [, slots] of daySlots) {
        const sorted = [...new Set(slots)].sort((a, b) => a - b);
        if (sorted.length >= 2) {
          const span = sorted[sorted.length - 1] - sorted[0] + 1;
          const density = sorted.length / span;
          score += density * 2; // Reward high density
        }
      }

      // 4. Ensure teacher teaches their specialization
      for (const gene of timetable) {
        const teacher = teachers.find((t: any) => t.id === gene.teacherId);
        if (teacher && teacher.courseId && teacher.courseId !== gene.courseId) {
          score -= 8; // Penalize teaching outside specialization
        }
      }
      
      return Math.max(0, score);
    }

    // Selection (Tournament)
    function tournamentSelection(population: Gene[][], fitnessScores: number[]): Gene[] {
      const tournamentSize = 5;
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

    // Smart mutation: biased toward Mon-Thu and consecutive slots
    function mutate(timetable: Gene[]): Gene[] {
      return timetable.map(gene => {
        if (Math.random() < MUTATION_RATE) {
          const mutationType = Math.floor(Math.random() * 5);
          
          switch (mutationType) {
            case 0:
              return { ...gene, teacherId: findTeacherForCourse(gene.courseId) };
            case 1:
              return { ...gene, roomId: rooms[Math.floor(Math.random() * rooms.length)].id };
            case 2:
              // Biased day mutation: 80% chance Mon-Thu, 20% Friday
              if (Math.random() < 0.8) {
                return { ...gene, day: priorityDays[Math.floor(Math.random() * priorityDays.length)] };
              }
              return { ...gene, day: allDays[Math.floor(Math.random() * allDays.length)] };
            case 3:
              return { ...gene, hour: hours[Math.floor(Math.random() * hours.length)] };
            case 4: {
              // Try to move to adjacent time slot (reduce gaps)
              const currentIdx = hourIndex[gene.hour];
              const direction = Math.random() < 0.5 ? -1 : 1;
              const newIdx = currentIdx + direction;
              if (newIdx >= 0 && newIdx < hours.length) {
                return { ...gene, hour: hours[newIdx] };
              }
              return gene;
            }
            default:
              return gene;
          }
        }
        return gene;
      });
    }

    // Initialize population with smart seeding
    let population: Gene[][] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population.push(createSmartTimetable());
    }

    let bestTimetable: Gene[] = population[0];
    let bestFitness = calculateFitness(bestTimetable);

    // Evolution loop
    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
      const fitnessScores = population.map(calculateFitness);
      
      for (let i = 0; i < population.length; i++) {
        if (fitnessScores[i] > bestFitness) {
          bestFitness = fitnessScores[i];
          bestTimetable = [...population[i]];
        }
      }
      
      if (generation % 20 === 0) {
        console.log(`Generation ${generation + 1}: Best fitness = ${bestFitness.toFixed(2)}`);
      }
      
      // Elitism: keep top 2
      const indexed = fitnessScores.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f);
      const newPopulation: Gene[][] = [
        [...population[indexed[0].i]],
        [...population[indexed[1].i]],
      ];
      
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = tournamentSelection(population, fitnessScores);
        const parent2 = tournamentSelection(population, fitnessScores);
        let offspring = crossover(parent1, parent2);
        offspring = mutate(offspring);
        newPopulation.push(offspring);
      }
      
      population = newPopulation;
      
      if (bestFitness >= 98) {
        console.log('Reached excellent fitness, stopping early');
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

    // Sort by day priority then hour
    const dayOrder: Record<string, number> = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 };
    formattedTimetable.sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
      if (dayDiff !== 0) return dayDiff;
      return (hourIndex[a.hour] || 0) - (hourIndex[b.hour] || 0);
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
