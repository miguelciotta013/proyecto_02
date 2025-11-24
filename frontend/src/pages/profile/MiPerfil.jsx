import React, { useContext, useEffect, useState } from "react";
import sistemaApi from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { LogOut, User, Mail, Shield, Star } from "lucide-react";

export default function MiPerfil() {
  const { accessToken, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Confirmación para salir
  const handleLogout = () => {
    const seguro = window.confirm("¿Estás seguro que deseas cerrar sesión?");
    if (seguro) logout();
  };

  useEffect(() => {
    async function fetchUser() {
      if (!accessToken) {
        setError("No autenticado");
        setLoading(false);
        return;
      }

      try {
        const resp = await sistemaApi.post("/auth/verify/", {
          token: accessToken,
        });
        if (resp.data?.user) setUser(resp.data.user);
        else setError("No se pudo obtener información del usuario");
      } catch (e) {
        console.error("Error obtener perfil:", e);
        setError("Error al obtener perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [accessToken]);

  // Construir nombre completo preferente: first_name + last_name, si no existe usar nombre_completo o username
  const fullName = (() => {
    const first = user?.first_name?.toString?.().trim();
    const last = user?.last_name?.toString?.().trim();
    if (first || last) return `${first || ''}${first && last ? ' ' : ''}${last || ''}`.trim();
    if (user?.nombre_completo) return user.nombre_completo;
    return user?.username || '';
  })();

  const firstName = (user?.first_name?.toString?.().trim()) || (user?.nombre_completo ? String(user.nombre_completo).split(' ')[0] : '');
  const lastName = (user?.last_name?.toString?.().trim()) || (user?.nombre_completo ? String(user.nombre_completo).split(' ').slice(1).join(' ') : '');

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      {/* === ESTILOS CSS PURO === */}
      <style>{`
        .perfil-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to bottom, #e8f6ff, #ffffff);
          padding: 40px;
        }

        .perfil-card {
          background: #ffffff;
          width: 100%;
          max-width: 600px;
          border-radius: 25px;
          padding: 35px;
          border: 1px solid #cde7ff;
          box-shadow: 0px 10px 25px rgba(0, 80, 160, 0.12);
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .perfil-header {
          display: flex;
          align-items: center;
          gap: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #d5e9ff;
        }

        .avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7cc6ff, #1e73be);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 36px;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0, 80, 160, 0.3);
        }

        .titulo {
          font-size: 32px;
          font-weight: 700;
          color: #134d8b;
        }

        .username {
          font-size: 16px;
          color: #2678c2;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 25px;
        }

        .info-card {
          background: #f8fbff;
          border: 1px solid #cfe6ff;
          border-radius: 15px;
          padding: 15px 20px;
          box-shadow: 0px 4px 12px rgba(0, 100, 200, 0.08);
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 14px;
          color: #357ec7;
          font-weight: 600;
        }

        .info-value {
          font-size: 20px;
          font-weight: 700;
          color: #134d8b;
        }

        .valor-verde { color: #2b9d3f !important; }
        .valor-rojo { color: #d64545 !important; }

        .logout-container {
          margin-top: 30px;
          display: flex;
          justify-content: center;
        }

        .logout-btn {
          background: #d64545;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0px 4px 12px rgba(200, 0, 0, 0.25);
          transition: 0.2s;
        }

        .logout-btn:hover {
          background: #b93131;
        }

        .loading, .error {
          padding: 20px;
          text-align: center;
          font-size: 18px;
        }
      `}</style>

      {/* === CONTENIDO === */}
      <div className="perfil-container">
        <div className="perfil-card">

          <div className="perfil-header">
            <div className="avatar">
              <span>{fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}</span>
            </div>

            <div>
              <h2 className="titulo">Mi Perfil</h2>
              <p className="username">{fullName}</p>
              <p style={{ margin: 0, color: '#4a90e2' }}>@{user?.username}</p>
            </div>
          </div>

          <div className="info-grid">
            <InfoCard label="Nombre" value={firstName || '—'} icon={User} />
            <InfoCard label="Apellido" value={lastName || '—'} icon={User} />
            <InfoCard label="Usuario" value={user?.username || '—'} icon={User} />
            <InfoCard label="Email" value={user?.email || "—"} icon={Mail} />
            <InfoCard label="Rol" value={user?.rol || "—"} icon={Shield} />
            <InfoCard
              label="Superuser"
              value={user?.is_superuser ? "Sí" : "No"}
              icon={Star}
              valueColor={user?.is_superuser ? "valor-verde" : "valor-rojo"}
            />
          </div>

          <div className="logout-container">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} /> Cerrar sesión
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value, icon: Icon, valueColor = "" }) {
  return (
    <div className="info-card">
      <div className="info-label">
        <Icon size={18} />
        {label}
      </div>
      <div className={`info-value ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}
