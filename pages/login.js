import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import api from '../lib/api'
export default function Login() { 
    const { register, handleSubmit } = useForm();
    const { login } = useAuth();
    const router = useRouter();
    const [canBootstrap, setCanBootstrap] = useState(false);
    const [checkingBootstrap, setCheckingBootstrap] = useState(true);

    // Check if bootstrap is available
    useEffect(() => {
        const checkBootstrap = async () => {
            try {
                const response = await api.get('/auth/bootstrap/check');
                setCanBootstrap(response.data.canBootstrap);
            } catch (error) {
                console.error('Error checking bootstrap status:', error);
                setCanBootstrap(false);
            } finally {
                setCheckingBootstrap(false);
            }
        };

        checkBootstrap();
    }, []);

    const onSubmit = async d => {
        try {
            const r = await login(d.email, d.password);
            if (r.refreshToken) localStorage.setItem('crm_refresh', r.refreshToken);
            router.push('/');
        } catch (e) {
            alert(e.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow'>
            <h1 className='text-2xl mb-4'>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div>
                    <label className='block text-sm'>Email</label>
                    <input {...register('email')} className='w-full border p-2 rounded' />
                </div>
                <div>
                    <label className='block text-sm'>Password</label>
                    <input {...register('password')} type='password' className='w-full border p-2 rounded' />
                </div>
                <button type='submit' className='w-full bg-blue-600 text-white py-2 rounded'>Login</button>
            </form>
            <div className='mt-4 text-center'>
                {!checkingBootstrap && canBootstrap && (
                    <Link href="/bootstrap" className='text-green-600 hover:text-green-800 text-sm font-medium'>
                        🚀 First time? Setup admin user →
                    </Link>
                )}
            </div>
        </div>
    );
}
