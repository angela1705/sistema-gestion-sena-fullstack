import { Persona } from '../types/usuarios/usuarios';

export const updateUser = async (
  userId: number,
  updates: Partial<Persona>
): Promise<Persona> => {
  const response = await fetch(`/api/personas/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Error al actualizar usuario');
  return response.json();
};

// Tipos específicos para actualizaciones
export type UserUpdatePayload = Partial<
  Pick<Persona, 
    'first_name' | 
    'last_name' | 
    'email' | 
    'telefono' | 
    'is_active' | 
    'foto_url'
  >
>;