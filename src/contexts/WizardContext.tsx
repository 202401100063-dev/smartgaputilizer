import { createContext, useContext, useState, ReactNode } from "react";

interface Course {
  id: string;
  name: string;
  code: string;
  hoursPerWeek: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  maxHoursPerWeek: number;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string;
}

interface Constraint {
  id: string;
  description: string;
  isHard: boolean;
}

interface WizardContextType {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  hardConstraints: Constraint[];
  setHardConstraints: (constraints: Constraint[]) => void;
  softConstraints: Constraint[];
  setSoftConstraints: (constraints: Constraint[]) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", code: "", hoursPerWeek: 0 }
  ]);
  
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: "1", name: "", email: "", maxHoursPerWeek: 0 }
  ]);
  
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "", capacity: 0, features: "" }
  ]);
  
  const [hardConstraints, setHardConstraints] = useState<Constraint[]>([
    { id: "1", description: "", isHard: true }
  ]);
  
  const [softConstraints, setSoftConstraints] = useState<Constraint[]>([
    { id: "1", description: "", isHard: false }
  ]);

  return (
    <WizardContext.Provider
      value={{
        courses,
        setCourses,
        teachers,
        setTeachers,
        rooms,
        setRooms,
        hardConstraints,
        setHardConstraints,
        softConstraints,
        setSoftConstraints,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};
