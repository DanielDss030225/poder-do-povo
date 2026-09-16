'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { renderMarkdown } from '@/lib/markdown';
import { 
  CrownIcon, 
  HeartIcon, 
  SearchIcon, 
  VoteIcon, 
  UserIcon, 
  PhoneIcon, 
  CloseIcon, 
  ArrowRightIcon, 
  CheckIcon, 
  AlertIcon 
} from '@/components/Icons';

export default function HomePage() {
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Voting State
  const [selectedPersonagem, setSelectedPersonagem] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch candidates from API
  const fetchPersonagens = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/personagens');
      const data = await res.json();
      if (data.success) {
        setPersonagens(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar personagens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonagens();
  }, []);

  // Format Phone mask (XX) XXXXX-XXXX
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setTelefone(value);
  };

  const handleOpenVoteModal = (p) => {
    setSelectedPersonagem(p);
    setNomeCompleto('');
    setTelefone('');
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setSelectedPersonagem(null);
    setFeedback(null);
  };

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    if (!nomeCompleto.trim() || !telefone.trim()) {
      setFeedback({ type: 'danger', message: 'Por favor, preencha seu Nome Completo e Telefone.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const res = await fetch('/api/votos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personagem_id: selectedPersonagem.id,
          nome_completo: nomeCompleto,
          telefone: telefone,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        fetchPersonagens(); // Refresh vote count
        setTimeout(() => {
          handleCloseModal();
        }, 2200);
      } else {
        setFeedback({ type: 'danger', message: data.error || 'Erro ao registrar voto.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Ocorreu um erro inesperado ao enviar seu voto.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter personagens
  const filteredPersonagens = personagens.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Total votes calculate
  const totalVotosGeral = personagens.reduce((sum, p) => sum + (p.total_votos || 0), 0);

  return (
    <>
      <Navbar />

      <main className="main-layout">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="badge-status">
            <span className="pulse-dot"></span>
            Votação Aberta 2026
          </div>
          <h1 className="hero-title">Decida o Futuro da Sua Comunidade</h1>
          <p className="hero-subtitle">
            Conheça os projetos, leia os planos de ação detalhados e registre seu voto nos representantes da sua preferência.
          </p>
        </section>

        {/* Controls & Search */}
        <div className="controls-bar">
          <div className="search-input-group">
            <span className="search-icon">
              <SearchIcon size={20} />
            </span>
            <input
              type="text"
              className="input-search"
              placeholder="Buscar candidato por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stats-pill">
            <VoteIcon size={18} color="var(--brazil-green)" />
            <span>Total de Votos Registrados: <strong>{totalVotosGeral}</strong></span>
          </div>
        </div>

        {/* Loading / Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>Carregando candidatos do banco de dados...</h3>
          </div>
        ) : filteredPersonagens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-color)' }}>
            <AlertIcon size={40} color="var(--brazil-yellow)" />
            <h3 style={{ marginTop: '1rem' }}>Nenhum candidato encontrado.</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Acesse o Painel Admin para cadastrar novos candidatos.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredPersonagens.map((p, index) => {
              const isTop = index === 0 && p.total_votos > 0;
              return (
                <div className="card-personagem" key={p.id}>
                  {isTop && (
                    <div className="top-rank-badge">
                      <CrownIcon size={16} /> 1º Lugar
                    </div>
                  )}

                  <div>
                    <div className="card-header-info">
                      <div className="avatar-wrapper">
                        <img
                          src={p.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={p.nome}
                          className="avatar-img"
                        />
                      </div>
                      <div className="card-title-group">
                        <h2 className="card-nome">{p.nome}</h2>
                        <span className="badge-cargo">{p.cargo}</span>
                      </div>
                    </div>

                    {/* Markdown Description */}
                    <div
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(p.descricao) }}
                    />
                  </div>

                  <div className="card-footer">
                    <div className="vote-count-pill">
                      <HeartIcon size={16} />
                      <span>{p.total_votos || 0} {p.total_votos === 1 ? 'Voto' : 'Votos'}</span>
                    </div>

                    <button
                      className="btn-votar"
                      onClick={() => handleOpenVoteModal(p)}
                    >
                      <span>Votar</span>
                      <ArrowRightIcon size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Voting Modal Dialog */}
      {selectedPersonagem && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <CloseIcon size={20} />
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Confirmar Voto</h3>
              <p className="modal-subtitle">Você está registrando seu voto para:</p>
              <div className="modal-target-badge">
                {selectedPersonagem.nome} — ({selectedPersonagem.cargo})
              </div>
            </div>

            {feedback && (
              <div className={`alert alert-${feedback.type}`}>
                {feedback.type === 'success' ? <CheckIcon size={20} /> : <AlertIcon size={20} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVote}>
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={16} color="var(--brazil-green-dark)" />
                  <span>Seu Nome Completo *</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: João da Silva"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <PhoneIcon size={16} color="var(--brazil-green-dark)" />
                  <span>Seu Telefone com DDD *</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={handlePhoneChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  <VoteIcon size={18} />
                  <span>{submitting ? 'Computando...' : 'Confirmar Voto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
