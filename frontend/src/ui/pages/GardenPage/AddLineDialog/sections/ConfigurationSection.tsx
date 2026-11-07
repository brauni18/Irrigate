import { LegacyConfigurationPanel } from './LegacyConfigurationPanel';
import { ModernConfigurationPanel } from './ModernConfigurationPanel';
import { useAddLineDialogContext } from '../context';

const tabs = [
  { key: 'modern', label: 'Configuration' },
  { key: 'legacy', label: 'Old School Configuration' },
] as const;

export function ConfigurationSection() {
  const { configurationMode, setConfigurationMode } = useAddLineDialogContext();

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-muted/25 p-4">
      <div className="flex rounded-xl border border-border/80 bg-background/60 p-1">
        {tabs.map((tab) => {
          const isActive = configurationMode === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setConfigurationMode(tab.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {configurationMode === 'modern' ? <ModernConfigurationPanel /> : <LegacyConfigurationPanel />}
    </div>
  );
}