import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, FormInput, SocialButtons } from '../components';
import './SignUp.css';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement sign up logic
    console.log('Sign up:', { name, email });
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social login
    console.log('Sign up with:', provider);
  };

  return (
    <div className="signup-container">
      <BackHeader title="Sign Up" backTo="/" />

      <form className="signup-form" onSubmit={handleContinue}>
        <FormInput
          label="Full Name"
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={setName}
          required
        />

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

        <p className="signin-text">
          Already have an account? <span className="signin-link" onClick={() => navigate('/signin')}>Sign In</span>
        </p>

        <div className="divider">
          <span>Or</span>
        </div>

        <SocialButtons onSocialLogin={handleSocialLogin} />
      </form>
    </div>
  );
}

export default SignUp;
