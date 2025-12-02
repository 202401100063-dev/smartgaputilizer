import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Building2 } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string;
}

const RoomsStep = () => {
  const { rooms, setRooms } = useWizard();

  const addRoom = () => {
    setRooms([...rooms, {
      id: Date.now().toString(),
      name: "",
      capacity: 0,
      features: ""
    }]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const updateRoom = (id: string, field: keyof Room, value: string | number) => {
    setRooms(rooms.map(room =>
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Add Rooms</h2>
          <p className="text-sm text-muted-foreground">Define available classrooms and facilities</p>
        </div>
      </div>

      <div className="space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} className="p-4 border-border/50 hover:border-success/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`room-name-${room.id}`}>Room Name/Number</Label>
                  <Input
                    id={`room-name-${room.id}`}
                    placeholder="e.g., Room 101"
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`room-capacity-${room.id}`}>Capacity</Label>
                  <Input
                    id={`room-capacity-${room.id}`}
                    type="number"
                    min="1"
                    placeholder="e.g., 40"
                    value={room.capacity || ""}
                    onChange={(e) => updateRoom(room.id, "capacity", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`room-features-${room.id}`}>Features</Label>
                  <Input
                    id={`room-features-${room.id}`}
                    placeholder="e.g., Projector, Lab"
                    value={room.features}
                    onChange={(e) => updateRoom(room.id, "features", e.target.value)}
                  />
                </div>
              </div>
              
              {rooms.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRoom(room.id)}
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
        onClick={addRoom}
        className="w-full border-dashed border-2 hover:border-success hover:text-success transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Room
      </Button>
    </div>
  );
};

export default RoomsStep;
