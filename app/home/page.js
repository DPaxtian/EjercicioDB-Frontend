"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [newAnimal, setNewAnimal] = useState({ name: '', species: '', age: '', habitat: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchAnimals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`${apiUrl}/animal/getAnimals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching animals');
      }

      const data = await response.json();
      setAnimals(data.data);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('No se pudieron cargar los animales. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);

          if (decodedToken.exp < currentTime) {
            localStorage.removeItem('access_token');
            router.push('/');
            return;
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          router.push('/');
          return;
        }
      } else {
        router.push('/');
        return;
      }

      fetchAnimals();
    }
  }, [router, apiUrl]);

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Elimina el token
    router.push('/'); // Redirige al login
  };

  const handleAddAnimal = () => {
    setIsEditMode(false);
    setNewAnimal({ name: '', species: '', age: '', habitat: '' });
    setIsModalOpen(true);
  };

  const handleEditAnimal = (animal) => {
    setCurrentAnimal(animal);
    setNewAnimal({
      name: animal.name,
      species: animal.species,
      age: animal.age,
      habitat: animal.habitat
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteAnimal = (_id) => {
    setAnimalToDelete(_id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAnimal = async () => {
    if (!animalToDelete) return;

    try {
      const response = await fetch(`${apiUrl}/animal/deleteAnimal/${animalToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAnimals();
        setIsDeleteConfirmOpen(false);
      } else {
        setError('Error al eliminar el animal. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error deleting animal:', err);
      setError('Algo salió mal. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode
      ? `${apiUrl}/animal/updateAnimal/${currentAnimal._id}`
      : `${apiUrl}/animal/addAnimal`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnimal),
      });

      if (response.ok) {
        fetchAnimals();
        setIsModalOpen(false);
      } else {
        setError('Error al guardar el animal. Por favor, intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error submitting animal:', err);
      setError('Algo salió mal. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='container flex min-w-full py-10 px-5'>
        <h1 className="text-2xl grow  font-bold text-black">Inventario de Animales</h1>
        <button
          onClick={handleLogout}
          className="flex-none items-center text-white bg-gray-500 rounded hover:bg-gray-600"
        >
          <img className='w-7 p-1' src='/exit.png'></img>
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      <div className='container min-w-full px-5'>
        <button
          onClick={handleAddAnimal}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 my-3"
        >
          Agregar animal
        </button>
        <table className="border-collapse min-w-full min-h-full shadow-lg bg-white">
          <thead>
            <tr>
              <th className="py-2 border text-black">Nombre</th>
              <th className="py-2 border text-black">Especie</th>
              <th className="py-2 border text-black">Edad</th>
              <th className="py-2 border text-black">Habitat</th>
              <th className="py-2 border text-black">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {animals.length > 0 ? (
              animals.map(animal => (
                <tr key={animal._id} className="text-center">
                  <td className="py-2 border text-black">{animal.name}</td>
                  <td className="py-2 border text-black">{animal.species}</td>
                  <td className="py-2 border text-black">{animal.age}</td>
                  <td className="py-2 border text-black">{animal.habitat}</td>
                  <td className="py-2 border">
                    <button onClick={() => handleEditAnimal(animal)} className="text-blue-500 hover:underline">Editar</button>
                    <button onClick={() => handleDeleteAnimal(animal._id)} className="text-red-500 hover:underline ml-4">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-black">No se encontraron animales</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para añadir/editar animal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg">
            <h2 className="text-2xl font-bold text-center text-black">{isEditMode ? 'Editar Animal' : 'Añadir Animal'}</h2>
            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  id="name"
                  value={newAnimal.name}
                  onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
                />
              </div>
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700">Especie</label>
                <input
                  type="text"
                  id="species"
                  value={newAnimal.species}
                  onChange={(e) => setNewAnimal({ ...newAnimal, species: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                  type="number"
                  id="age"
                  value={newAnimal.age}
                  onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
                />
              </div>
              <div>
                <label htmlFor="habitat" className="block text-sm font-medium text-gray-700">Habitat</label>
                <input
                  type="text"
                  id="habitat"
                  value={newAnimal.habitat}
                  onChange={(e) => setNewAnimal({ ...newAnimal, habitat: e.target.value })}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
              >
                {isEditMode ? 'Actualizar Animal' : 'Añadir Animal'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-lg">
            <h2 className="text-xl font-bold text-center text-black">¿Estás seguro de eliminar este animal?</h2>
            <div className="flex justify-around">
              <button
                onClick={confirmDeleteAnimal}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
