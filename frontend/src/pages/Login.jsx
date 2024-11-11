import { Navbar } from '../components/landingPage/Navbar';
import { LoginForm } from '../components/login-form.tsx';

function Login() {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex flex-grow justify-center items-center bg-background">
                    <LoginForm route='/api/token/' method='login' />
                </div>
            </div>
        </>
    );
}

export default Login;
