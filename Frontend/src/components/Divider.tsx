import './Divider.css';

export type DividerProps = {
  text?: string;
};

function Divider({ text = 'Or' }: DividerProps) {
  return (
    <div className="divider" role="separator">
      <span>{text}</span>
    </div>
  );
}

export default Divider;
