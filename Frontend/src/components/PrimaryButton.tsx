import './PrimaryButton.css';

export type PrimaryButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

function PrimaryButton({
  type = 'button',
  children,
  onClick,
  className = '',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`primary-button ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
