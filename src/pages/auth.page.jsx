import { Routes, Route, Navigate } from "react-router-dom";
import SignInForm from "../components/auth-related/signin-form.component";
import SignUpForm from "../components/auth-related/signup-form.component";
import ForgotPasswordForm from "../components/auth-related/forgot-password-form.component";
import AuthLayout from "../components/auth-related/authLayout.component";

const AuthPage = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route path="sign-in" element={<SignInForm />}/>
        <Route path="sign-up" element={<SignUpForm />}/>
        <Route path="forgot-password" element={<ForgotPasswordForm />}/>
        <Route path="*" element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  )
}

export default AuthPage;
