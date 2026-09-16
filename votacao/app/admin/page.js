'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { renderMarkdown } from '@/lib/markdown';
import { 
  UsersIcon, 
  ListIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  UserIcon, 
  PhoneIcon, 
  CheckIcon, 
  AlertIcon,
  VoteIcon,
  ImageIcon,
  SettingsIcon
} from '@/components/Icons';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
];

export default function AdminPage() {
  // Authentication State
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState('personagens');
  const [personagens, setPersonagens] = useState([]);
  const [votos, setVotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Personagem
  const [editingId, setEditingId] = useState(null);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch('/api/admin/login');
      const data = await res.json();
      if (data.authenticated) {
        setAuthenticated(true);
        loadData();
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setLoginError('Digite a senha de administrador.');
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError('');

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setAuthenticated(true);
        setInputPassword('');
        loadData();
      } else {
        setLoginError(data.error || 'Senha incorreta.');
      }
    } catch {
      setLoginError('Erro de conexão ao tentar fazer login.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setAuthenticated(false);
      setPersonagens([]);
      setVotos([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [resP, resV] = await Promise.all([
        fetch('/api/personagens'),
        fetch('/api/votos'),
      ]);

      const dataP = await resP.json();
      const dataV = await resV.json();

      if (dataP.success) setPersonagens(dataP.data);
      if (dataV.success) setVotos(dataV.data);
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setNome('');
    setCargo('');
    setDescricao('# Título do Perfil\n\nDescreva a trajetória e as propostas deste candidato usando **Markdown**.\n\n- Proposta 1\n- Proposta 2');
    setFotoUrl(PRESET_AVATARS[0]);
    setFeedback(null);
    setActiveTab('novo');
  };

  const handleOpenEditForm = (p) => {
    setEditingId(p.id);
    setNome(p.nome);
    setCargo(p.cargo);
    setDescricao(p.descricao);
    setFotoUrl(p.foto_url || PRESET_AVATARS[0]);
    setFeedback(null);
    setActiveTab('novo');
  };

  const handleDeletePersonagem = async (id, nomeParam) => {
    if (!confirm(`Tem certeza que deseja excluir o personagem "${nomeParam}"? Todos os votos associados a ele também serão apagados.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/personagens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Personagem removido com sucesso!');
        loadData();
      } else {
        alert(data.error || 'Erro ao deletar personagem.');
      }
    } catch {
      alert('Erro de conexão ao deletar personagem.');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !cargo.trim() || !descricao.trim()) {
      setFeedback({ type: 'danger', message: 'Preencha Nome, Cargo e Descrição.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        id: editingId,
        nome,
        cargo,
        descricao,
        foto_url: fotoUrl,
      };

      const res = await fetch('/api/personagens', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: 'success',
          message: editingId ? 'Personagem atualizado com sucesso!' : 'Personagem cadastrado com sucesso!',
        });
        loadData();
        setTimeout(() => {
          setActiveTab('personagens');
        }, 1500);
      } else {
        setFeedback({ type: 'danger', message: data.error || 'Erro ao salvar.' });
      }
    } catch {
      setFeedback({ type: 'danger', message: 'Erro de conexão.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <main className="main-layout" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Verificando credenciais...</p>
        </main>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Navbar />
        <main className="main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(80vh - 80px)' }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 2rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'var(--brazil-blue-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '2px solid rgba(0, 39, 118, 0.15)'
            }}>
              <SettingsIcon size={32} color="var(--brazil-blue)" />
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--brazil-blue)', marginBottom: '0.4rem' }}>
              Acesso Restrito
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Digite a senha mestra para acessar o Painel Administrativo.
            </p>

            {loginError && (
              <div className="alert alert-danger" style={{ textAlign: 'left' }}>
                <AlertIcon size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Senha de Administrador</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Digite a senha..."
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  disabled={loggingIn}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
                disabled={loggingIn}
              >
                <span>{loggingIn ? 'Autenticando...' : 'Entrar no Painel'}</span>
              </button>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="main-layout">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Painel Administrativo</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Gerencie candidatos, edite descrições em Markdown e acompanhe os votos em tempo real.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-votar" onClick={handleOpenCreateForm}>
              <PlusIcon size={18} />
              <span>Cadastrar Personagem</span>
            </button>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.1rem' }}
              onClick={handleLogout}
            >
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'personagens' ? 'active' : ''}`}
            onClick={() => setActiveTab('personagens')}
          >
            <UsersIcon size={18} />
            <span>Personagens ({personagens.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'votos' ? 'active' : ''}`}
            onClick={() => setActiveTab('votos')}
          >
            <ListIcon size={18} />
            <span>Registro de Votos ({votos.length})</span>
          </button>
          {activeTab === 'novo' && (
            <button className="tab-btn active">
              {editingId ? <EditIcon size={18} /> : <PlusIcon size={18} />}
              <span>{editingId ? 'Editar Personagem' : 'Novo Personagem'}</span>
            </button>
          )}
        </div>

        {/* TAB 1: Personagens List */}
        {activeTab === 'personagens' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Carregando candidatos...</div>
            ) : personagens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-color)' }}>
                <UsersIcon size={40} color="var(--brazil-blue)" />
                <h3 style={{ marginTop: '1rem' }}>Nenhum personagem cadastrado ainda.</h3>
                <button className="btn-votar" style={{ marginTop: '1.25rem', marginInline: 'auto' }} onClick={handleOpenCreateForm}>
                  <PlusIcon size={18} />
                  <span>Cadastrar Primeiro Personagem</span>
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Nome</th>
                      <th>Cargo</th>
                      <th>Votos Acumulados</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personagens.map((p) => (
                      <tr key={p.id}>
                        <td style={{ width: '60px' }}>
                          <img
                            src={p.foto_url || PRESET_AVATARS[0]}
                            alt={p.nome}
                            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brazil-green-light)' }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: 'var(--brazil-blue)' }}>{p.nome}</strong>
                        </td>
                        <td>
                          <span className="badge-cargo">{p.cargo}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--brazil-green-dark)', fontSize: '1.05rem' }}>{p.total_votos || 0} votos</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn-icon"
                              onClick={() => handleOpenEditForm(p)}
                            >
                              <EditIcon size={16} />
                              <span>Editar</span>
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => handleDeletePersonagem(p.id, p.nome)}
                            >
                              <TrashIcon size={16} />
                              <span>Deletar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Votos List */}
        {activeTab === 'votos' && (
          <div>
            {votos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-color)' }}>
                <VoteIcon size={40} color="var(--brazil-yellow)" />
                <h3 style={{ marginTop: '1rem' }}>Nenhum voto registrado até o momento.</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Eleitor (Nome Completo)</th>
                      <th>Telefone</th>
                      <th>Candidato Escolhido</th>
                      <th>Data / Hora do Voto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votos.map((v, index) => (
                      <tr key={v.id}>
                        <td><strong>#{votos.length - index}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserIcon size={16} color="var(--brazil-blue)" />
                            <strong style={{ color: 'var(--text-main)' }}>{v.nome_completo}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                            <PhoneIcon size={16} />
                            <span>{v.telefone}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge-cargo">{v.personagem_nome}</span> ({v.personagem_cargo})
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          {new Date(v.created_at).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Create / Edit Form */}
        {activeTab === 'novo' && (
          <div style={{ background: '#ffffff', padding: '2.25rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', color: 'var(--brazil-blue)' }}>
              {editingId ? 'Editar Personagem' : 'Cadastrar Novo Personagem'}
            </h2>

            {feedback && (
              <div className={`alert alert-${feedback.type}`}>
                {feedback.type === 'success' ? <CheckIcon size={20} /> : <AlertIcon size={20} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <UserIcon size={16} color="var(--brazil-green-dark)" />
                    <span>Nome do Personagem *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Maria Eduarda"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <VoteIcon size={16} color="var(--brazil-green-dark)" />
                    <span>Cargo / Posição *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Vereadora / Presidente do Bairro"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <ImageIcon size={16} color="var(--brazil-green-dark)" />
                  <span>URL da Foto de Perfil</span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                />

                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Ou selecione um avatar rápido:
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Avatar preset"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: fotoUrl === url ? '3px solid var(--brazil-green)' : '2px solid transparent',
                          opacity: fotoUrl === url ? 1 : 0.6,
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setFotoUrl(url)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Markdown Editor with Split Preview */}
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">
                  <ListIcon size={16} color="var(--brazil-green-dark)" />
                  <span>Descrição (Formatada em Markdown) *</span>
                </label>
                <div className="editor-split">
                  <div>
                    <textarea
                      className="form-control"
                      style={{ minHeight: '220px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="# Titulo&#10;&#10;Escreva em Markdown..."
                      required
                    ></textarea>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                      Suporta títulos (#), negrito (**), listas (-), etc.
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Pré-visualização do Markdown:
                    </span>
                    <div
                      className="markdown-content"
                      style={{ minHeight: '220px', maxHeight: '220px' }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(descricao) }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTab('personagens')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  <CheckIcon size={18} />
                  <span>{submitting ? 'Salvando...' : editingId ? 'Atualizar Personagem' : 'Salvar Personagem'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
