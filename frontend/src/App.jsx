import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://platosugerido-func.azurewebsites.net/api';

function App() {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuggestion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/getSuggestion`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSuggestion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-decoration header-decoration-left">
          <img src="/img/dibujo2.png" alt="" className="decoration-img" />
        </div>
        <div className="header-decoration header-decoration-right">
          <img src="/img/dibujo1.png" alt="" className="decoration-img" />
        </div>
        <div className="header-content">
          <img src="/img/logo.png" alt="Augusto Pastas" className="logo" />
          <h1>AUGUSTO PASTAS</h1>
          <p className="subtitle">Sugerencia del Día</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading && (
          <div className="loading">
            <p>Cargando sugerencia del día...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p><strong>Error al cargar la sugerencia:</strong></p>
            <p>{error}</p>
            <div className="button-container">
              <button onClick={fetchSuggestion} className="load-button">
                Intentar nuevamente
              </button>
            </div>
          </div>
        )}

        {suggestion && !loading && (
          <>
            {/* Date Display */}
            <div className="date-display">
              <p>{new Date(suggestion.date).toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>

            {/* Weather Card */}
            <div className="section">
              <h2 className="section-title">Clima en {suggestion.weather.location}</h2>
              <div className="weather-card">
                <div className="weather-info">
                  <div className="weather-temp">{suggestion.weather.temperature}°C</div>
                  <div className="weather-details">
                    <div className="weather-condition">{suggestion.weather.condition}</div>
                    <div className="weather-location">
                      {suggestion.weather.description} • Humedad: {suggestion.weather.humidity}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Suggestions */}
            <div className="section">
              <h2 className="section-title">Menú Sugerido</h2>

              {/* Starter */}
              <h3 className="subsection-title">Entrada</h3>
              <MenuItem item={suggestion.suggestions.starter} />

              {/* Main Dish */}
              <h3 className="subsection-title">Plato Principal</h3>
              <MenuItem item={suggestion.suggestions.mainDish} />

              {/* Dessert */}
              <h3 className="subsection-title">Postre</h3>
              <MenuItem item={suggestion.suggestions.dessert} />

              {/* Reasoning */}
              <div className="reasoning-box">
                <h4 className="reasoning-title">¿Por qué esta combinación?</h4>
                <p className="reasoning-text">{suggestion.reasoning}</p>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="button-container">
              <button onClick={fetchSuggestion} className="load-button">
                Actualizar Sugerencia
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function MenuItem({ item }) {
  return (
    <div className="menu-item">
      <div className="item-content">
        <div className="item-name">{item.name}</div>
        <div className="item-description">{item.description}</div>
        <div className="item-ingredients">
          {item.ingredients.map((ingredient, index) => (
            <span key={index} className="ingredient-tag">{ingredient}</span>
          ))}
        </div>
      </div>
      <div className="item-price">${item.price}</div>
    </div>
  );
}

export default App
