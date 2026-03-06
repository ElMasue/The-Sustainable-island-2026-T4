import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthFormFooter from './AuthFormFooter';
import './SignUpForm.css';
import AuthPageLayout from './AuthPageLayout';
import Divider from './Divider';
import FormInput from './FormInput';
import PrimaryButton from './PrimaryButton';
import SocialButtons from './SocialButtons';

function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await signUp(email, password, name);
      if (!res.data.session) {
        // no session means user must confirm email before logging in
        setError('¡Registro recibido! Comprueba tu correo para activar la cuenta.');
        return;
      }
      // profile upsert happens in context automatically once session exists
      navigate('/');
    } catch (err: any) {
      console.error('sign up failed', err);
      setError(err.message || 'Unable to register');
    }
  };


  return (
    <AuthPageLayout title="Sign Up" backTo="/">
      <form className="sign-up-form" onSubmit={handleSubmit}>
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
        <FormInput
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={setPassword}
          required
        />
        {error && <p className="auth-error">{error}</p>}

        <PrimaryButton type="submit">Continue</PrimaryButton>

        <AuthFormFooter
          text="Already have an account?"
          linkText="Sign In"
          onLinkClick={() => navigate('/signin')}
        />

        <Divider />

        <SocialButtons />
      </form>
    </AuthPageLayout>
  );
}

export default SignUpForm;
