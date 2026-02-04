import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizard } from "@/contexts/WizardContext";

interface Teacher {
  id: string;
  name: string;
  email: string;
  maxHoursPerWeek: number;
  courseId: string;
}

const TeachersStep = () => {
  const { teachers, setTeachers, courses } = useWizard();

  const addTeacher = () => {
    setTeachers([...teachers, {
      id: Date.now().toString(),
      name: "",
      email: "",
      maxHoursPerWeek: 0,
      courseId: ""
    }]);
  };

  const removeTeacher = (id: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  const updateTeacher = (id: string, field: keyof Teacher, value: string | number) => {
    setTeachers(teachers.map(teacher =>
      teacher.id === id ? { ...teacher, [field]: value } : teacher
    ));
  };

  // Get courses that have names filled in
  const availableCourses = courses.filter(course => course.name.trim() !== "");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Add Teachers</h2>
          <p className="text-sm text-muted-foreground">Define teaching staff and their availability</p>
        </div>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="p-4 border-border/50 hover:border-accent/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`teacher-name-${teacher.id}`}>Teacher Name</Label>
                  <Input
                    id={`teacher-name-${teacher.id}`}
                    placeholder="e.g., Dr. Smith"
                    value={teacher.name}
                    onChange={(e) => updateTeacher(teacher.id, "name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`teacher-email-${teacher.id}`}>Email</Label>
                  <Input
                    id={`teacher-email-${teacher.id}`}
                    type="email"
                    placeholder="e.g., smith@university.edu"
                    value={teacher.email}
                    onChange={(e) => updateTeacher(teacher.id, "email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`max-hours-${teacher.id}`}>Max Hours/Week</Label>
                  <Input
                    id={`max-hours-${teacher.id}`}
                    type="number"
                    min="1"
                    placeholder="e.g., 20"
                    value={teacher.maxHoursPerWeek || ""}
                    onChange={(e) => updateTeacher(teacher.id, "maxHoursPerWeek", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`subject-${teacher.id}`}>Subject Specialization</Label>
                  <Select
                    value={teacher.courseId}
                    onValueChange={(value) => updateTeacher(teacher.id, "courseId", value)}
                  >
                    <SelectTrigger id={`subject-${teacher.id}`}>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.length > 0 ? (
                        availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-courses" disabled>
                          Add courses first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {teachers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeacher(teacher.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addTeacher}
        className="w-full border-dashed border-2 hover:border-accent hover:text-accent transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Teacher
      </Button>
    </div>
  );
};

export default TeachersStep;
