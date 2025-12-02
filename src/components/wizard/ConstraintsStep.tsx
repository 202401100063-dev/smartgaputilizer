import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Constraint {
  id: string;
  description: string;
}

const ConstraintsStep = () => {
  const [hardConstraints, setHardConstraints] = useState<Constraint[]>([
    { id: "1", description: "" }
  ]);
  
  const [softConstraints, setSoftConstraints] = useState<Constraint[]>([
    { id: "1", description: "" }
  ]);

  const addHardConstraint = () => {
    setHardConstraints([...hardConstraints, {
      id: Date.now().toString(),
      description: ""
    }]);
  };

  const addSoftConstraint = () => {
    setSoftConstraints([...softConstraints, {
      id: Date.now().toString(),
      description: ""
    }]);
  };

  const removeHardConstraint = (id: string) => {
    setHardConstraints(hardConstraints.filter(c => c.id !== id));
  };

  const removeSoftConstraint = (id: string) => {
    setSoftConstraints(softConstraints.filter(c => c.id !== id));
  };

  const updateHardConstraint = (id: string, description: string) => {
    setHardConstraints(hardConstraints.map(c =>
      c.id === id ? { ...c, description } : c
    ));
  };

  const updateSoftConstraint = (id: string, description: string) => {
    setSoftConstraints(softConstraints.map(c =>
      c.id === id ? { ...c, description } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Define Constraints</h2>
        <p className="text-sm text-muted-foreground">
          Set hard rules (must be satisfied) and soft preferences (nice to have)
        </p>
      </div>

      <Tabs defaultValue="hard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hard" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Hard Constraints
          </TabsTrigger>
          <TabsTrigger value="soft" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Soft Constraints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hard" className="space-y-4 mt-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive mb-1">Hard Constraints</h4>
                <p className="text-sm text-destructive/80">
                  These rules MUST be satisfied. No timetable will be accepted if these are violated.
                </p>
              </div>
            </div>
          </div>

          {hardConstraints.map((constraint) => (
            <Card key={constraint.id} className="p-4 border-destructive/20">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`hard-${constraint.id}`}>Constraint Description</Label>
                  <Textarea
                    id={`hard-${constraint.id}`}
                    placeholder="e.g., Teacher X cannot teach on Fridays"
                    value={constraint.description}
                    onChange={(e) => updateHardConstraint(constraint.id, e.target.value)}
                    rows={2}
                  />
                </div>
                
                {hardConstraints.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHardConstraint(constraint.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addHardConstraint}
            className="w-full border-dashed border-2 hover:border-destructive hover:text-destructive transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hard Constraint
          </Button>
        </TabsContent>

        <TabsContent value="soft" className="space-y-4 mt-6">
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-success mb-1">Soft Constraints</h4>
                <p className="text-sm text-success/80">
                  These are preferences to optimize. The algorithm will try to satisfy as many as possible.
                </p>
              </div>
            </div>
          </div>

          {softConstraints.map((constraint) => (
            <Card key={constraint.id} className="p-4 border-success/20">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`soft-${constraint.id}`}>Preference Description</Label>
                  <Textarea
                    id={`soft-${constraint.id}`}
                    placeholder="e.g., Minimize back-to-back classes for students"
                    value={constraint.description}
                    onChange={(e) => updateSoftConstraint(constraint.id, e.target.value)}
                    rows={2}
                  />
                </div>
                
                {softConstraints.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSoftConstraint(constraint.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addSoftConstraint}
            className="w-full border-dashed border-2 hover:border-success hover:text-success transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Soft Constraint
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConstraintsStep;
