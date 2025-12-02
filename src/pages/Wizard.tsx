import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Calendar, Users, DoorOpen, Settings, Loader2 } from "lucide-react";
import { WizardProvider, useWizard } from "@/contexts/WizardContext";
import CoursesStep from "@/components/wizard/CoursesStep";
import TeachersStep from "@/components/wizard/TeachersStep";
import RoomsStep from "@/components/wizard/RoomsStep";
import ConstraintsStep from "@/components/wizard/ConstraintsStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Courses", icon: Calendar, component: CoursesStep },
  { id: 2, title: "Teachers", icon: Users, component: TeachersStep },
  { id: 3, title: "Rooms", icon: DoorOpen, component: RoomsStep },
  { id: 4, title: "Constraints", icon: Settings, component: ConstraintsStep },
];

const WizardContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { courses, teachers, rooms, hardConstraints, softConstraints } = useWizard();
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Validate data
      const validCourses = courses.filter(c => c.name && c.code && c.hoursPerWeek > 0);
      const validTeachers = teachers.filter(t => t.name && t.email && t.maxHoursPerWeek > 0);
      const validRooms = rooms.filter(r => r.name && r.capacity > 0);
      
      if (validCourses.length === 0 || validTeachers.length === 0 || validRooms.length === 0) {
        toast({
          title: "Missing Data",
          description: "Please fill in all required fields before generating.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Prepare constraints
      const allConstraints = [
        ...hardConstraints.filter(c => c.description).map(c => ({ ...c, isHard: true })),
        ...softConstraints.filter(c => c.description).map(c => ({ ...c, isHard: false })),
      ];

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: {
          courses: validCourses,
          teachers: validTeachers,
          rooms: validRooms,
          constraints: allConstraints,
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your timetable has been generated successfully.",
      });

      // Navigate to results page
      navigate('/results', {
        state: {
          timetable: data.timetable,
          fitnessScore: data.fitnessScore,
        }
      });

    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Schedule</h1>
          <p className="text-muted-foreground">Follow the steps to input all necessary data</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : isCompleted
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8 shadow-lg border-border/50">
          <CurrentStepComponent />
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="shadow-md shadow-primary/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Timetable
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="shadow-md shadow-primary/20"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Wizard = () => {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
};

export default Wizard;
