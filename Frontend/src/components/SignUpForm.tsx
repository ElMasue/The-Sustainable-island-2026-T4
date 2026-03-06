import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
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
  const t = useTranslation();

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
    <AuthPageLayout title={t.signUp} backTo="/">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <FormInput
          label={t.fullName}
          type="text"
          placeholder={t.enterFullName}
          value={name}
          onChange={setName}
          required
        />

        <FormInput
          label={t.emailAddress}
          type="email"
          placeholder={t.enterEmail}
          value={email}
          onChange={setEmail}
          required
        />
        <FormInput
          label={t.password}
          type="password"
          placeholder={t.enterPassword}
          value={password}
          onChange={setPassword}
          required
        />
        {error && <p className="auth-error">{error}</p>}

        <PrimaryButton type="submit">{t.continue}</PrimaryButton>

        <AuthFormFooter
          text={t.alreadyHaveAccount}
          linkText={t.signIn}
          onLinkClick={() => navigate('/signin')}
        />

        <Divider />

        <SocialButtons />
      </form>
    </AuthPageLayout>
  );
}

export default SignUpForm;
