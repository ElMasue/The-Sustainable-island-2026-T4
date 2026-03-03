import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthFormFooter from './AuthFormFooter';
import './SignInForm.css';
import AuthPageLayout from './AuthPageLayout';
import Divider from './Divider';
import FormInput from './FormInput';
import PrimaryButton from './PrimaryButton';
import SocialButtons from './SocialButtons';

function SignInForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // pretend we authenticated successfully
    console.log('Email:', email);
    login();
    navigate('/');
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social login
    console.log('Login with:', provider);
  };

  return (
    <AuthPageLayout title="Sign In" backTo="/">
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={setEmail}
          required
        />

        <PrimaryButton type="submit">Continue</PrimaryButton>

        <AuthFormFooter
          text="Don't have an account?"
          linkText="Create Account"
          onLinkClick={() => navigate('/signup')}
        />

        <Divider />

        <SocialButtons onSocialLogin={handleSocialLogin} />
      </form>
    </AuthPageLayout>
  );
}

export default SignInForm;
