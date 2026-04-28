import Button from './Button';

interface Props {
  label:    string;
  icon:     string;
  isActive: boolean;
  isNight:  boolean;
  onClick:  () => void;
}

export default function WeatherStateToggle({ label, icon, isActive, isNight, onClick }: Props) {
  return (
    <Button variant="ghost" isActive={isActive} isNight={isNight} onClick={onClick} aria-pressed={isActive}>
      <i aria-hidden="true" className={icon} style={{ fontSize: 11 }} />
      {label}
    </Button>
  );
}
