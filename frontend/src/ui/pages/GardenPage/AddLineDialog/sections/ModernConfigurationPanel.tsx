import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Settings2 } from 'lucide-react';
import { IntervalAreaSection } from './IntervalAreaSection';
import { LocationSection } from './LocationSection';
import { MaintenanceLevelSection } from './MaintenanceLevelSection';
import { PlantTypeSection } from './PlantTypeSection';
import { TechniqueSettingsSection } from './TechniqueSettingsSection';

export function ModernConfigurationPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="configuration-section-panel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Settings2 className="size-4" />
          Configuration
        </h3>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id="configuration-section-panel"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="grid gap-4 overflow-hidden"
          >
            <PlantTypeSection />
            <MaintenanceLevelSection />
            <LocationSection />
            <IntervalAreaSection />
            <TechniqueSettingsSection />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
