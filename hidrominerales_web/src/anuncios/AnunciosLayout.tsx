import React, { useState, useEffect } from "react";
import type { Anuncio } from "../types";
import "./styles/Anuncios.css";

const AnunciosLayout: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnuncios = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/api/anuncios");
        if (!response.ok)
          throw new Error("No se pudieron cargar los anuncios.");
        const data = await response.json();
        setAnuncios(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnuncios();
  }, []);

  return (
    <div className="anuncios-container">
      <h1>Tablón de Anuncios</h1>
      {isLoading && <p>Cargando anuncios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!isLoading && anuncios.length === 0 && (
        <p>No hay anuncios para mostrar.</p>
      )}
      {anuncios.map((anuncio) => (
        <article key={anuncio.id} className="anuncio-card">
          <h2>{anuncio.titulo}</h2>
          <p className="anuncio-card-meta">
            Publicado por <strong>{anuncio.autor_nombre}</strong> el{" "}
            {new Date(anuncio.timestamp).toLocaleDateString("es-MX")}
          </p>
          <p className="anuncio-card-contenido">{anuncio.contenido}</p>
        </article>
      ))}
    </div>
  );
};

export default AnunciosLayout;
