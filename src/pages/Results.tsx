import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimetableEntry {
  course: string;
  courseCode: string;
  teacher: string;
  room: string;
  day: string;
  hour: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { timetable, fitnessScore } = location.state || { timetable: [], fitnessScore: 0 };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  const getTimetableCell = (day: string, hour: string) => {
    return timetable.filter(
      (entry: TimetableEntry) => entry.day === day && entry.hour === hour
    );
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-accent";
    return "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/wizard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wizard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Generated Timetable</h1>
              <p className="text-muted-foreground">Your optimized schedule is ready</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Fitness Score</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(fitnessScore)}`} />
                  <span className="text-2xl font-bold">{fitnessScore.toFixed(1)}%</span>
                </div>
              </div>
              
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              
              <Button className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border p-3 bg-muted/50 text-left font-semibold">
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="border border-border p-3 bg-muted/50 text-left font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="border border-border p-3 bg-muted/30 font-medium">
                      {hour}
                    </td>
                    {days.map(day => {
                      const entries = getTimetableCell(day, hour);
                      return (
                        <td key={`${day}-${hour}`} className="border border-border p-2">
                          {entries.length > 0 ? (
                            <div className="space-y-2">
                              {entries.map((entry: TimetableEntry, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-primary/10 border border-primary/30 rounded p-2 text-sm"
                                >
                                  <div className="font-semibold text-primary">
                                    {entry.course}
                                  </div>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {entry.courseCode}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    👤 {entry.teacher}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    🚪 {entry.room}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm py-4">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;
