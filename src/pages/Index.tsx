import { Button } from "@/components/ui/button";
import { Calendar, Users, DoorOpen, Settings, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-4 h-4" />
            Powered by Genetic Algorithms
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            Smart Gap Utilizer
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-900">
            Optimize your schedule by intelligently utilizing gaps between classes.
            Advanced genetic algorithms balance constraints and maximize efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Link to="/wizard">
              <Button size="lg" className="group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="shadow-md hover:shadow-lg transition-all">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Courses"
            description="Add subjects with required hours and scheduling needs"
            delay="delay-100"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Teachers"
            description="Define availability, preferences, and workload limits"
            delay="delay-200"
          />
          <FeatureCard
            icon={<DoorOpen className="w-6 h-6" />}
            title="Rooms"
            description="Set capacity, features, and availability windows"
            delay="delay-300"
          />
          <FeatureCard
            icon={<Settings className="w-6 h-6" />}
            title="Constraints"
            description="Configure hard and soft rules for optimization"
            delay="delay-[400ms]"
          />
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Input Data"
              description="Enter courses, teachers, rooms, and all scheduling constraints through our intuitive wizard"
            />
            <StepCard
              number="02"
              title="Generate"
              description="Our genetic algorithm engine optimizes thousands of possible schedules to find the best fit"
            />
            <StepCard
              number="03"
              title="Export & Use"
              description="Review your optimized timetable, make manual adjustments, and export in your preferred format"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center p-12 rounded-2xl bg-gradient-to-r from-primary to-accent shadow-2xl">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to optimize your schedule?
          </h2>
          <p className="text-primary-foreground/90 mb-8 text-lg">
            Join institutions worldwide using AI-powered timetable generation
          </p>
          <Link to="/wizard">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Start Generating
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-8 duration-700 ${delay}`}>
      <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 h-full">
        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => {
  return (
    <div className="relative">
      <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">
        {number}
      </div>
      <div className="relative pt-8">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Index;
