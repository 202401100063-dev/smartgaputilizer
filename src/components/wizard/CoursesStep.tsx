import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

interface Course {
  id: string;
  name: string;
  code: string;
  hoursPerWeek: number;
}

const CoursesStep = () => {
  const { courses, setCourses } = useWizard();

  const addCourse = () => {
    setCourses([...courses, {
      id: Date.now().toString(),
      name: "",
      code: "",
      hoursPerWeek: 0
    }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Add Courses</h2>
          <p className="text-sm text-muted-foreground">Define all subjects that need scheduling</p>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <Card key={course.id} className="p-4 border-border/50 hover:border-primary/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`course-name-${course.id}`}>Course Name</Label>
                  <Input
                    id={`course-name-${course.id}`}
                    placeholder="e.g., Mathematics"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`course-code-${course.id}`}>Course Code</Label>
                  <Input
                    id={`course-code-${course.id}`}
                    placeholder="e.g., MATH101"
                    value={course.code}
                    onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`hours-${course.id}`}>Hours/Week</Label>
                  <Input
                    id={`hours-${course.id}`}
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={course.hoursPerWeek || ""}
                    onChange={(e) => updateCourse(course.id, "hoursPerWeek", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              {courses.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(course.id)}
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
        onClick={addCourse}
        className="w-full border-dashed border-2 hover:border-primary hover:text-primary transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Course
      </Button>
    </div>
  );
};

export default CoursesStep;
