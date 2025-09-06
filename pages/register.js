import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import withAuth from '../utils/withAuth'
import api from '../lib/api'

function Register() { 
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerUser, user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Check if user is admin or if bootstrap is needed
    useEffect(() => {
        const checkAccess = async () => {
            if (user && user.role !== 'admin') {
                router.push('/');
                return;
            }
            
            // If no user is logged in, check if bootstrap is needed
            if (!user) {
                try {
                    const response = await api.get('/auth/bootstrap/check');
                    if (response.data.canBootstrap) {
                        router.push('/bootstrap');
                        return;
                    }
                } catch (error) {
                    console.error('Error checking bootstrap status:', error);
                }
            }
        };

        checkAccess();
    }, [user, router]);

    // Show access denied if not admin
    if (user && user.role !== 'admin') {
        return (
            <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow text-center'>
                <h1 className='text-2xl mb-4 text-red-600'>Access Denied</h1>
                <p className='text-gray-600 mb-4'>Only administrators can register new users.</p>
                <button 
                    onClick={() => router.push('/')}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await registerUser(data);
            alert('User registered successfully!');
            router.push('/users');
        } catch (e) {
            alert(e.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='max-w-md mx-auto mt-24 bg-white p-8 rounded shadow'>
            <h1 className='text-2xl mb-4'>Register New User</h1>
            <p className='text-sm text-gray-600 mb-6'>Admin only - Create a new user account</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div>
                    <label className='block text-sm font-medium mb-1'>Name *</label>
                    <input 
                        {...register('name', { required: 'Name is required' })} 
                        className='w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        placeholder="Enter full name"
                    />
                    {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name.message}</p>}
                </div>
                
                <div>
                    <label className='block text-sm font-medium mb-1'>Email *</label>
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
                        placeholder="Enter email address"
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
                        placeholder="Enter password (min 6 characters)"
                    />
                    {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>}
                </div>
                
                <div>
                    <label className='block text-sm font-medium mb-1'>Role *</label>
                    <select 
                        {...register('role', { required: 'Role is required' })} 
                        className='w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                        <option value="">Select a role</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                    {errors.role && <p className='text-red-500 text-xs mt-1'>{errors.role.message}</p>}
                </div>
                
                <button 
                    type='submit' 
                    disabled={isLoading}
                    className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
                >
                    {isLoading ? 'Creating User...' : 'Create User'}
                </button>
            </form>
            
            <div className='mt-6 text-center'>
                <button 
                    onClick={() => router.push('/users')}
                    className='text-blue-600 hover:text-blue-800 text-sm'
                >
                    ← Back to Users
                </button>
            </div>
        </div>
    );
}

export default withAuth(Register);
