import './AuthFormFooter.css';

export type AuthFormFooterProps = {
  text: string;
  linkText: string;
  onLinkClick: () => void;
};

function AuthFormFooter({ text, linkText, onLinkClick }: AuthFormFooterProps) {
  return (
    <p className="auth-form-footer">
      {text}{' '}
      <span className="auth-form-footer__link" onClick={onLinkClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onLinkClick()}>
        {linkText}
      </span>
    </p>
  );
}

export default AuthFormFooter;
