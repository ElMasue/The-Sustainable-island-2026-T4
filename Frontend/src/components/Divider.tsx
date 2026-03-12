import { useTranslation } from '../i18n';
import './Divider.css';

export type DividerProps = {
  text?: string;
};

function Divider({ text }: DividerProps) {
  const t = useTranslation();
  return (
    <div className="divider" role="separator">
      <span>{text || t.or}</span>
    </div>
  );
}

export default Divider;
