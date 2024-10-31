import { LoginForm } from '../components/login-form.tsx';

function Register() {
    return <div className="flex justify-center items-center min-h-screen">
                <LoginForm route='/api/user/register/' method='register'/> 
            </div>
}

export default Register