import { LoginForm } from '../components/login-form.tsx';

function Login() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <LoginForm route='/api/token/' method='login'/>
        </div>
    );
}

export default Login;
