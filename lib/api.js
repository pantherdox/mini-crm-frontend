import axios from 'axios'
import Router from 'next/router'
const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api', headers: { 'Content-Type': 'application/json' } })
API.interceptors.request.use((cfg)=>{ try{ const t=localStorage.getItem('crm_access'); if(t) cfg.headers.Authorization='Bearer '+t }catch(e){} return cfg })
API.interceptors.response.use(res=>res, async err=>{ const orig=err.config; if(err.response&&err.response.status===401&&!orig._retry){ orig._retry=true; try{ const refresh=localStorage.getItem('crm_refresh'); if(!refresh) throw new Error('no refresh'); const r=await API.post('/auth/refresh',{ refreshToken: refresh }); localStorage.setItem('crm_access', r.data.accessToken); orig.headers.Authorization='Bearer '+r.data.accessToken; return API(orig) }catch(e){ localStorage.removeItem('crm_access'); localStorage.removeItem('crm_refresh'); Router.push('/login'); return Promise.reject(e) } } return Promise.reject(err) })
export default API
