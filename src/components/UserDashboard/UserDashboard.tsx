import React, { useEffect, useState } from 'react';

export const UserDashboard = () => {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/user')
            .then((res) => {
                if (!res.ok) throw new Error('Servicio temporalmente no disponible');
                return res.json();
            })
            .then((data) => setUser(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div role="alert">{error}</div>;

    return <h1>Bienvenido, {user?.name}</h1>;
};