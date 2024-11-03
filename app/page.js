"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !isTokenExpired(token)) {
      router.push('/home');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        router.push('/home');
      } else {
        setError('Nombre de usuario o contraseña inválidos');
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Algo salió mal. Por favor, intenta de nuevo.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${apiUrl}/user/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, password: registerPassword }),
      });

      if (response.ok) {
        setSuccessMessage('¡Has sido registrado con éxito!');
        setRegisterUsername('');
        setRegisterPassword('');

        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      } else {
        setError('Error al registrarse. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error durante el registro:', err);
      setError('Algo salió mal. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg">
        {/* Imagen centrada */}
        <div className="flex justify-center mb-4">
          <img
            src="/animal-logo.avif"
            className="w-20 h-20"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800">Inventario de animales</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded text-gray-900 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded text-gray-900 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Iniciar sesión
          </button>
        </form>

        <span
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300 text-center block text-center"
        >
          Registrarse
        </span>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800">Registro</h2>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
            
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label htmlFor="registerUsername" className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                <input
                  type="text"
                  id="registerUsername"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded text-gray-900 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded text-gray-900 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
              >
                Registrarse
              </button>
            </form>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full px-4 py-2 mt-4 text-gray-500 border border-gray-500 rounded hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
