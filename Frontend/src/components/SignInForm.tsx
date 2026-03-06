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
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('sign in failed', err);
      setError(err.message || 'Unable to sign in');
    }
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
        <FormInput
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={setPassword}
          required
        />
        <PrimaryButton type="submit">Continue</PrimaryButton>
        {error && <p className="auth-error">{error}</p>}

        <AuthFormFooter
          text="Don't have an account?"
          linkText="Create Account"
          onLinkClick={() => navigate('/signup')}
        />

        <Divider />

        <SocialButtons />
      </form>
    </AuthPageLayout>
  );
}

export default SignInForm;
