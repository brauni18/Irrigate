import { GARDEN_DIALOG_INPUT_CLASSNAME } from '@/consts/GardenDialog.consts';
import { useGardenDialogContext } from '../context';

export function GardenNameSection() {
  const { name, errors, onNameChange } = useGardenDialogContext();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="garden-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Garden Name <span className="text-destructive normal-case">*</span>
      </label>
      <input
        id="garden-name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="My Rooftop Garden"
        className={GARDEN_DIALOG_INPUT_CLASSNAME}
      />
      {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
    </div>
  );
}