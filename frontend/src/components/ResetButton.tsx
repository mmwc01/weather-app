import Button from './Button';
import Tooltip from './Tooltip';

interface Props {
  isNight: boolean;
  onReset: () => void;
}

export default function ResetButton({ isNight, onReset }: Props) {
  return (
    <Tooltip text="Back to your actual weather" side="bottom" align="end">
      <Button
        variant="icon"
        isNight={isNight}
        onClick={onReset}
        aria-label="Reset to actual weather"
      >
        <i aria-hidden="true" className="fa-solid fa-rotate-left" style={{ fontSize: 15 }} />
      </Button>
    </Tooltip>
  );
}
