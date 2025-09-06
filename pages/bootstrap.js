import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function Bootstrap() { 
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [canBootstrap, setCanBootstrap] = useState(null);
    const [checking, setChecking] = useState(true);

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
                setChecking(false);
            }
        };

        checkBootstrap();
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/auth/bootstrap', data);
            alert('First admin user created successfully! You can now login.');
            router.push('/login');
        } catch (e) {
            alert(e.response?.data?.message || 'Bootstrap failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (checking) {
        return (
            <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow text-center'>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Checking system status...</p>
            </div>
        );
    }

    if (!canBootstrap) {
        return (
            <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow text-center'>
                <h1 className='text-2xl mb-4 text-red-600'>Bootstrap Not Available</h1>
                <p className='text-gray-600 mb-4'>
                    The system already has admin users. Bootstrap is only available when no admin users exist.
                </p>
                <button 
                    onClick={() => router.push('/login')}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow'>
            <div className="text-center mb-6">
                <h1 className='text-2xl mb-2'>🚀 System Setup</h1>
                <p className='text-sm text-gray-600'>Create your first admin user to get started</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div>
                    <label className='block text-sm font-medium mb-1'>Full Name *</label>
                    <input 
                        {...register('name', { required: 'Name is required' })} 
                        className='w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        placeholder="Enter your full name"
                    />
                    {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name.message}</p>}
                </div>
                
                <div>
                    <label className='block text-sm font-medium mb-1'>Email Address *</label>
                    <input 
                        {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })} 
                        type='email'
                        className='w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        placeholder="Enter your email address"
                    />
                    {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
                </div>
                
                <div>
                    <label className='block text-sm font-medium mb-1'>Password *</label>
                    <input 
                        {...register('password', { 
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                            }
                        })} 
                        type='password' 
                        className='w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        placeholder="Create a secure password (min 6 characters)"
                    />
                    {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
                </div>
                
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                    <p><strong>Note:</strong> This will create the first admin user. After setup, you can use the regular registration process to create additional users.</p>
                </div>
                
                <button 
                    type='submit' 
                    disabled={isLoading}
                    className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                >
                    {isLoading ? 'Creating Admin User...' : 'Create Admin User'}
                </button>
            </form>
            
            <div className='mt-6 text-center'>
                <button 
                    onClick={() => router.push('/login')}
                    className='text-blue-600 hover:text-blue-800 text-sm'
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
}
