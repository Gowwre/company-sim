import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Download,
  Upload,
  Trash2,
  LogOut,
  AlertTriangle,
  Save,
  Trophy,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Award,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function SettingsView() {
  const { company, resetGame } = useGameStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!company) return null;

  const activeEmployees = company.employees.filter((e) => !e.quitMonth).length;
  const totalEmployees = company.employees.length;
  const completedProjects = company.projects.filter((p) => p.status === 'completed').length;
  const monthsSurvived = company.currentMonth;
  const avgProjectQuality =
    completedProjects > 0
      ? (
          company.projects
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.quality, 0) / completedProjects
        ).toFixed(1)
      : 'N/A';

  const handleExport = () => {
    const saveData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      company: company,
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.name.replace(/\s+/g, '_')}_month${company.currentMonth}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Game data exported successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);

        if (!saveData.company || !saveData.company.id) {
          throw new Error('Invalid save file format');
        }

        localStorage.setItem(
          'company-simulator-game',
          JSON.stringify({
            company: saveData.company,
            isPlaying: true,
          })
        );

        setShowImportDialog(true);
      } catch (err) {
        toast.error('Failed to import save file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const confirmImport = () => {
    window.location.reload();
  };

  const handleReset = () => {
    resetGame();
    setShowResetDialog(false);
    toast.success('Game reset successfully');
  };

  const handleClearStorage = () => {
    localStorage.removeItem('company-simulator-game');
    toast.success('Local storage cleared');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your game data and preferences</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Company Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatItem icon={Calendar} label="Months Survived" value={monthsSurvived.toString()} />
          <StatItem
            icon={DollarSign}
            label="Current Cash"
            value={`$${company.cash.toLocaleString()}`}
          />
          <StatItem
            icon={Users}
            label="Total Employees"
            value={`${activeEmployees}/${totalEmployees}`}
          />
          <StatItem
            icon={Briefcase}
            label="Completed Projects"
            value={completedProjects.toString()}
          />
          <StatItem icon={Award} label="Reputation" value={company.reputation.toString()} />
          <StatItem
            icon={Trophy}
            label="Avg Project Quality"
            value={avgProjectQuality.toString()}
          />
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Save className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-auto py-4 border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3 w-full">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Export Save Data</p>
                  <p className="text-sm text-zinc-400">Download as JSON file</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleImportClick}
              variant="outline"
              className="h-auto py-4 border-zinc-700 hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3 w-full">
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Import Save Data</p>
                  <p className="text-sm text-zinc-400">Load from JSON file</p>
                </div>
              </div>
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json"
            className="hidden"
          />

          <div className="border-t border-zinc-800 pt-4">
            <Button
              onClick={handleClearStorage}
              variant="outline"
              className="w-full border-yellow-600/50 text-yellow-500 hover:bg-yellow-950/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Local Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-900/50 bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowResetDialog(true)} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Reset Game (Start New Company)
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent
          className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
          aria-describedby="reset-description"
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Reset Game</DialogTitle>
          <DialogDescription id="reset-description" className="sr-only">
            This will delete all your progress and start a new game. This action cannot be undone.
          </DialogDescription>

          {/* Terminal Header */}
          <div className="bg-terminal-red/10 border-b border-terminal-red px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-terminal-red text-sm">[ RESET_GAME_CONFIRM ]</span>
            <button
              onClick={() => setShowResetDialog(false)}
              className="text-terminal-dim hover:text-terminal-red transition-colors text-sm"
            >
              [X]
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-terminal-dim text-sm">
              <p className="mb-2">This will delete all your progress and start a new game.</p>
            </div>

            <div className="bg-terminal-red/10 border border-terminal-red/30 p-3 text-xs text-terminal-red">
              ⚠ Warning: This action cannot be undone. All game data will be permanently lost.
            </div>
          </div>

          <div className="border-t border-terminal-green-dark px-4 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="border-terminal-green-dark text-terminal-dim hover:bg-terminal-green/10 hover:text-terminal-green font-mono text-xs"
            >
              [ CANCEL ]
            </Button>
            <Button
              onClick={handleReset}
              className="bg-terminal-red text-terminal-bg hover:bg-terminal-red/80 font-mono font-bold text-xs border-0"
            >
              <LogOut className="w-3 h-3 mr-2" />[ RESET_GAME ]
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent
          className="bg-terminal-dark border-2 border-terminal-green text-terminal-green font-mono p-0 overflow-hidden max-w-md"
          aria-describedby="import-description"
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Import Successful</DialogTitle>
          <DialogDescription id="import-description" className="sr-only">
            Save file imported successfully. The page will reload to load your game.
          </DialogDescription>

          {/* Terminal Header */}
          <div className="bg-terminal-green/10 border-b border-terminal-green px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-terminal-green text-sm">[ IMPORT_SUCCESSFUL ]</span>
            <button
              onClick={() => setShowImportDialog(false)}
              className="text-terminal-dim hover:text-terminal-red transition-colors text-sm"
            >
              [X]
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-terminal-dim text-sm">
              Save file imported successfully. The page will reload to load your game.
            </p>
          </div>

          <div className="border-t border-terminal-green-dark px-4 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              className="border-terminal-green-dark text-terminal-dim hover:bg-terminal-green/10 hover:text-terminal-green font-mono text-xs"
            >
              [ CANCEL ]
            </Button>
            <Button
              onClick={confirmImport}
              className="bg-terminal-green text-terminal-bg hover:bg-terminal-green/80 font-mono font-bold text-xs border-0"
            >
              [ RELOAD_PAGE ]
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3">
      <Icon className="w-4 h-4 text-zinc-500 mb-2" />
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
