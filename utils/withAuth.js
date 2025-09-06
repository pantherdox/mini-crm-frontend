import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Router from 'next/router'
export default function withAuth(Component){ return props => { const { user } = useAuth(); useEffect(()=>{ if(!user) Router.replace('/login') },[user]); if(!user) return null; return <Component {...props} /> } }
