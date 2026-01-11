import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import type { ClockSettings as ClockSettingsType, ClockDesign, ClockTheme, TimeFormat } from '@/lib/storage';

interface ClockSettingsProps {
  settings: ClockSettingsType;
  onSettingsChange: (settings: ClockSettingsType) => void;
}

export function ClockSettings({ settings, onSettingsChange }: ClockSettingsProps) {
  const updateSetting = <K extends keyof ClockSettingsType>(
    key: K,
    value: ClockSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Customize Watch</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Clock Design */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Clock Design</Label>
            <Select
              value={settings.design}
              onValueChange={(value: ClockDesign) => updateSetting('design', value)}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="flip">Flip Clock (Fliqlo Style)</SelectItem>
                <SelectItem value="minimal">Minimal Digital</SelectItem>
                <SelectItem value="bold">Bold Exam Clock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: ClockTheme) => updateSetting('theme', value)}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="pure-black">Pure Black</SelectItem>
                <SelectItem value="dark-gray">Dark Gray</SelectItem>
                <SelectItem value="soft-white">Soft White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Time Format</Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value: TimeFormat) => updateSetting('timeFormat', value)}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show Seconds */}
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Show Seconds</Label>
            <Switch
              checked={settings.showSeconds}
              onCheckedChange={(checked) => updateSetting('showSeconds', checked)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
