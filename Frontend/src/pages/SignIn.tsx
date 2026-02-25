import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, FormInput, SocialButtons } from '../components';
import './SignIn.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log('Email:', email);
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social login
    console.log('Login with:', provider);
  };

  return (
    <div className="signin-container">
      <BackHeader title="Sign In" backTo="/" />

      <form className="signin-form" onSubmit={handleContinue}>
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={setEmail}
          required
        />

        <button type="submit" className="continue-button">
          Continue
        </button>

        <p className="signup-text">
          Don't have an account? <span className="signup-link" onClick={() => navigate('/signup')}>Create Account</span>
        </p>

        <div className="divider">
          <span>Or</span>
        </div>

        <SocialButtons onSocialLogin={handleSocialLogin} />
      </form>
    </div>
  );
}

export default SignIn;
