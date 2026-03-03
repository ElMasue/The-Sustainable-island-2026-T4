import { type ReactNode } from 'react';
import BackHeader from './BackHeader';
import './AuthPageLayout.css';

export type AuthPageLayoutProps = {
  title: string;
  backTo: string;
  children: ReactNode;
};

function AuthPageLayout({ title, backTo, children }: AuthPageLayoutProps) {
  return (
    <div className="auth-page-layout">
      <BackHeader title={title} backTo={backTo} />
      <div className="auth-page-layout__content">
        {children}
      </div>
    </div>
  );
}

export default AuthPageLayout;
