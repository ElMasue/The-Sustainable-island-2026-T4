import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement sign up logic
    console.log('Sign up:', { name, email });
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social login
    console.log('Sign up with:', provider);
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

        <PrimaryButton type="submit">Continue</PrimaryButton>

        <AuthFormFooter
          text="Already have an account?"
          linkText="Sign In"
          onLinkClick={() => navigate('/signin')}
        />

        <Divider />

        <SocialButtons onSocialLogin={handleSocialLogin} />
      </form>
    </AuthPageLayout>
  );
}

export default SignUpForm;
