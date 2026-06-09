import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, Mail, Chrome } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  // Inyectar script de Google Identity Services de forma asíncrona
  useEffect(() => {
    const scriptId = 'google-gis-sdk';
    let script = document.getElementById(scriptId);

    const initializeGoogleSignIn = () => {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-example.apps.googleusercontent.com';

        // Inicializar el cliente de credenciales (ID Token Flow)
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Configurar también el cliente de token de acceso OAuth2 para la integración del botón personalizado
        try {
          window.googleTokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                handleGoogleAccessTokenSuccess(tokenResponse);
              }
            },
          });
        } catch (e) {
          console.error('Error inicializando el cliente de tokens OAuth2:', e);
        }

        // Renderizar el botón estándar invisible o visible si se desea fallback
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            type: 'standard',
            shape: 'pill',
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Limpieza opcional
    };
  }, []);

  // Callback para recibir el JWT (Id Token) de Google
  const handleGoogleCredentialResponse = (response) => {
    setIsLoading(true);
    setError('');
    try {
      const jwt = response.credential;
      console.log('Google credential response recibida. Token JWT:', jwt);
      
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const userEmail = payload.email;

      // Simular verificación del handshake del servidor
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess({
            provider: 'google',
            token: jwt,
            user: { email: userEmail, role: 'operator' }
          });
        }
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setError('Error al procesar la autenticación de Google');
    }
  };

  // Callback para recibir el access_token de Google (cuando se usa flujo de token)
  const handleGoogleAccessTokenSuccess = (tokenResponse) => {
    setIsLoading(true);
    setError('');
    console.log('Token de Google recibido:', tokenResponse.access_token);

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data && data.email) {
          if (onLoginSuccess) {
            onLoginSuccess({
              provider: 'google_oauth2',
              token: tokenResponse.access_token,
              user: { email: data.email, role: 'operator' }
            });
          }
        } else {
          setError('No se pudo obtener el perfil de Google.');
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('Error al procesar la autenticación de Google');
      });
  };

  // Disparador manual para el flujo nativo de Google utilizando nuestro botón personalizado
  const triggerGoogleSignIn = () => {
    if (window.googleTokenClient) {
      window.googleTokenClient.requestAccessToken();
    } else if (window.google && window.google.accounts.id) {
      // Fallback a One Tap o login estándar
      window.google.accounts.id.prompt();
    } else {
      setError('El servicio de Google no está disponible aún. Intenta nuevamente.');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación básica de campos
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      setIsLoading(false);
      return;
    }

    // Simulación del flujo de autenticación corporativa
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'admin@polakgrupo.com' && password === 'admin123') {
        if (onLoginSuccess) {
          onLoginSuccess({
            provider: 'credentials',
            user: { email, role: 'admin' }
          });
        }
      } else if (email.endsWith('@polakgrupo.com')) {
        if (onLoginSuccess) {
          onLoginSuccess({
            provider: 'credentials',
            user: { email, role: 'operator' }
          });
        }
      } else {
        setError('Credenciales incorrectas o usuario no registrado en Polak Grupo.');
      }
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen bg-[#5E5F61] overflow-hidden select-none font-sans">

      {/* Lado Izquierdo (35% - 40% de la pantalla) - Logo Corporativo */}
      <div className="hidden md:flex md:w-[35%] lg:w-[40%] bg-white items-center justify-center p-8 border-r border-slate-100 shadow-xl z-10">
        <div className="text-center flex flex-col items-center max-w-xs animate-fade-in">
          {/* Logo Corporativo de Polak Grupo (SVG Premium) */}
          <svg className="w-48 h-auto mb-6 text-[#FF152B]" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20 C20 20 20 60 20 80 C20 100 40 100 50 100 C70 100 80 80 80 80 L80 100 L110 100 L110 20 L80 20 L80 50 C80 50 70 20 50 20 Z" fill="currentColor" />
            <circle cx="160" cy="60" r="40" stroke="currentColor" strokeWidth="20" fill="none" />
            <path d="M230 20 L230 100 L280 100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M320 100 L350 20 L380 100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M335 65 L365 65" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
            <path d="M420 20 L420 100 M420 60 L460 20 M420 60 L460 100" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="h-[2px] w-24 bg-[#FF152B] mb-4"></div>
          <span className="text-[12px] font-black text-[#111827] uppercase tracking-[0.4em]">Grupo Industrial</span>
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mt-1">Eficiencia e Innovación</span>
        </div>
      </div>

      {/* Lado Derecho (60% - 65% de la pantalla) - Tarjeta de Login */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[#5E5F61]">

        {/* Tarjeta Central */}
        <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[500px] transition-transform duration-300 hover:scale-[1.01]">

          {/* Columna Formulario (Blanca) */}
          <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-[#111827] mb-1">
                Inicio Sesión
              </h2>
              <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">
                Ingresa al Portal Inteligencia Operativa
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-bounce">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-ping"></span>
                {error}
              </div>
            )}

            {/* Formulario HTML5 Semántico */}
            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Input Correo */}


              {/* Input Contraseña */}




              {/* Botones de acción */}
              <div className="pt-2 space-y-3">


                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="absolute bg-white px-3 text-[9px] font-black text-[#6B7280] uppercase tracking-widest">Ingresar con</span>
                </div>

                {/* Botón de Google Personalizado */}
                <button
                  type="button"
                  onClick={triggerGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-[#E5E7EB] hover:bg-slate-50 bg-white text-[#111827] text-xs font-black uppercase tracking-widest rounded-full transition-all active:scale-[0.98]"
                >
                  <Chrome className="text-[#FF152B]" size={16} />
                  <span>Continuar con Google</span>
                </button>

                {/* Contenedor invisible para renderizar botón estándar de Google (requerido para inicialización/fallback) */}
                <div ref={googleButtonRef} className="hidden" />
              </div>
            </form>
          </div>

          {/* Columna Bienvenida (Roja) */}
          <div className="hidden md:flex flex-col justify-between p-8 md:p-10 bg-[#FF152B] text-white relative">
            {/* Fondo de patrón tecnológico abstracto */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            {/* Header del panel */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                Tablero Planta v2.0
              </span>
            </div>

            {/* Contenido Central */}
            <div className="my-auto z-10 space-y-4">
              <h3 className="text-3xl font-black tracking-tight leading-tight">
                Bienvenido
              </h3>
              <p className="text-[11px] text-red-50 font-bold leading-relaxed max-w-xs uppercase tracking-wider">
                Accede al panel central de KPIs de planta para monitorear el desempeño diario, gestionar métricas SQCDP y revisar las tendencias operativas de Polak Grupo.
              </p>
            </div>

            {/* Botón de Registrarse / Contactar Soporte */}
            <div className="z-10 pt-4">
              <p className="text-[9px] font-black text-red-200 uppercase tracking-widest mb-2">¿No tienes cuenta corporativa?</p>
              <button
                type="button"
                onClick={() => alert('Por favor, contacta al departamento de soporte técnico de Polak Grupo para solicitar tu alta de usuario.')}
                className="px-6 py-2.5 bg-white text-[#FF152B] hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all active:scale-[0.98]"
              >
                Registrarse
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
