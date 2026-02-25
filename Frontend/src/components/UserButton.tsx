import './UserButton.css';

export type UserButtonProps = {
  onClick: () => void;
  'aria-label'?: string;
};

function UserButton({ onClick, 'aria-label': ariaLabel = 'Open profile' }: UserButtonProps) {
  return (
    <button
      type="button"
      className="user-button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <svg className="user-button__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
  );
}

export default UserButton;
