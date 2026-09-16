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
  AlertIcon,
  FileTextIcon
} from '@/components/Icons';

export default function HomePage() {
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Proposal Side Drawer State
  const [selectedProposalPersonagem, setSelectedProposalPersonagem] = useState(null);

  // Modal Voting State
  const [selectedPersonagem, setSelectedPersonagem] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchPersonagens = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/personagens');
      const data = await res.json();
      if (data.success) setPersonagens(data.data);
    } catch (err) {
      console.error('Erro ao carregar personagens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPersonagens(); }, []);

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
      setFeedback({ type: 'danger', message: 'Preencha seu Nome Completo e Telefone.' });
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
          telefone,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        fetchPersonagens();
        setTimeout(() => handleCloseModal(), 2200);
      } else {
        setFeedback({ type: 'danger', message: data.error || 'Erro ao registrar voto.' });
      }
    } catch {
      setFeedback({ type: 'danger', message: 'Erro inesperado ao enviar seu voto.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPersonagens = personagens.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVotosGeral = personagens.reduce((sum, p) => sum + (p.total_votos || 0), 0);

  return (
    <>
      <Navbar totalVotos={totalVotosGeral} />

      {/* ===== MOBILE SEARCH BAR ===== */}
      <div className="mobile-search-bar">
        <div className="search-input-group">
          <span className="search-icon">
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            className="input-search"
            placeholder="Buscar candidato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ===== FULL-WIDTH HERO SECTION WITH CAPA.WEBP BACKGROUND ===== */}
      <section className="hero-banner-full">
        <div className="hero-banner-inner">
          <div className="badge-status-light">
            <span className="pulse-dot-light"></span>
            Este sistema não pertence a nenhum órgão governamental
          </div>
          <h1 className="hero-title-full">
            <span>Brasil</span> de Olhos Abertos
          </h1>
          <p className="hero-subtitle-full">
            Registre sua intenção de voto com segurança e ajude a construir a maior auditoria popular do país.
          </p>
        </div>
      </section>

      <main className="main-layout">

        {/* ===== DESKTOP CONTROLS BAR ===== */}
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
            <span>Total de Votos: <strong>{totalVotosGeral.toLocaleString('pt-BR')}</strong></span>
          </div>
        </div>

        {/* ===== CANDIDATE CARDS ===== */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <h3>Carregando candidatos...</h3>
          </div>
        ) : filteredPersonagens.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1.5rem',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-color)'
          }}>
            <AlertIcon size={40} color="var(--brazil-yellow)" />
            <h3 style={{ marginTop: '1rem' }}>Nenhum candidato encontrado.</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Acesse o Painel Admin para cadastrar candidatos.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredPersonagens.map((p, index) => {
              const isTop = index === 0 && p.total_votos > 0;
              const votosFormatados = (p.total_votos || 0).toLocaleString('pt-BR');
              const percentual = totalVotosGeral > 0
                ? (((p.total_votos || 0) / totalVotosGeral) * 100).toFixed(1).replace('.', ',')
                : '0,0';

              return (
                <div className="card-personagem" key={p.id}>
                  {isTop && (
                    <div className="top-rank-badge">
                      <CrownIcon size={15} /> 1º Lugar
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

                    {/* BOTÃO VER PROPOSTAS */}
                    <button
                      className="btn-propostas"
                      onClick={() => setSelectedProposalPersonagem(p)}
                    >
                      <FileTextIcon size={18} />
                      <span>Ver Propostas</span>
                      <ArrowRightIcon size={16} />
                    </button>
                  </div>

                  <div className="card-footer">
                    <div className="vote-count-pill">
                      <HeartIcon size={15} />
                      <span>{votosFormatados} Votos ({percentual}%)</span>
                    </div>
                    <button className="btn-votar" onClick={() => handleOpenVoteModal(p)}>
                      <span>Votar</span>
                      <ArrowRightIcon size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== SECONDARY SHOWCASE BANNER (capa2.jpg) ===== */}
        <section className="showcase-banner">
          <img
            src="/capa2.jpg"
            alt="Democracia Transparente"
            className="showcase-banner-img"
          />
          <div className="showcase-banner-content">
            <h2 className="showcase-title">Democracia Digital & Transparência</h2>
            <p className="showcase-text">
              O Poder do Povo foi criado para conectar cidadãos aos seus representantes legítimos.
              Participe da votação em tempo real, acompanhe estatísticas auditáveis e confira as propostas completas de cada candidato.
            </p>
          </div>
        </section>
      </main>

      {/* ===== SIDE DRAWER FOR PROPOSALS (SLIDE MENU LATERAL) ===== */}
      {selectedProposalPersonagem && (
        <div className="drawer-overlay" onClick={() => setSelectedProposalPersonagem(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-header-info">
                <img
                  src={selectedProposalPersonagem.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedProposalPersonagem.nome}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brazil-green)' }}
                />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--brazil-blue)' }}>
                    {selectedProposalPersonagem.nome}
                  </h3>
                  <span className="badge-cargo">{selectedProposalPersonagem.cargo}</span>
                </div>
              </div>

              <button className="modal-close-btn" style={{ position: 'static' }} onClick={() => setSelectedProposalPersonagem(null)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--brazil-green-dark)', fontWeight: '700' }}>
                <FileTextIcon size={20} />
                <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>Planos & Propostas de Governo</span>
              </div>

              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedProposalPersonagem.descricao) }}
              />
            </div>

            <div className="drawer-footer">
              <button
                className="btn-votar"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  const candidate = selectedProposalPersonagem;
                  setSelectedProposalPersonagem(null);
                  handleOpenVoteModal(candidate);
                }}
              >
                <VoteIcon size={18} />
                <span>Votar neste Candidato</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VOTING MODAL (Bottom Sheet on mobile) ===== */}
      {selectedPersonagem && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle" />

            <button className="modal-close-btn" onClick={handleCloseModal}>
              <CloseIcon size={18} />
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Confirmar Voto</h3>
              <p className="modal-subtitle">Você está votando para:</p>
              <div className="modal-target-badge">
                {selectedPersonagem.nome} — {selectedPersonagem.cargo}
              </div>
            </div>

            {feedback && (
              <div className={`alert alert-${feedback.type}`}>
                {feedback.type === 'success' ? <CheckIcon size={19} /> : <AlertIcon size={19} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVote}>
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={15} color="var(--brazil-green-dark)" />
                  <span>Nome Completo *</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: João da Silva"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  disabled={submitting}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <PhoneIcon size={15} color="var(--brazil-green-dark)" />
                  <span>Telefone com DDD *</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={handlePhoneChange}
                  disabled={submitting}
                  required
                  autoComplete="tel"
                  inputMode="numeric"
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
                <button type="submit" className="btn-submit" disabled={submitting}>
                  <VoteIcon size={17} />
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
