import { useState, useEffect } from 'react';
import { getProjects, createProject, deleteProject } from '../api/projects';
import { getAnalytics } from '../api/analytics';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ActivityFeed from '../components/ActivityFeed';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, statsRes] = await Promise.all([
        getProjects({ sort: 'createdAt:desc' }),
        getAnalytics()
      ]);
      setProjects(projRes.data.projects);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard | CollabZen';
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setNewProject({ name: '', description: '' });
      setShowCreate(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // Prevent navigation
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      fetchData();
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      <Navbar />

      <div className="stats-grid">
        <div className="glass stat-card">
          <span className="stat-value">{stats.totalProjects}</span>
          <span className="stat-label">Active Projects</span>
        </div>
        <div className="glass stat-card">
          <span className="stat-value">{stats.totalTasks}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="glass stat-card">
          <span className="stat-value">{stats.completedTasks}</span>
          <span className="stat-label">Completed Tasks</span>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="glass modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Create New Project</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                autoFocus
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows="4"
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Your Projects</h2>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                + New Project
                </button>
            </div>

            <div className="project-grid">
                {projects.map(project => (
                <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass project-card">
                    <div className="project-header">
                        <h3 className="project-title">{project.name}</h3>
                    </div>
                    <p className="project-desc">{project.description || 'No description provided.'}</p>
                    
                    {project.stats && (
                        <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span>Progress</span>
                            <span>{project.stats.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                            width: `${project.stats.progress}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {project.stats.completedTasks} / {project.stats.totalTasks} tasks completed
                        </div>
                        </div>
                    )}

                    <div className="project-footer">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <button
                        onClick={(e) => handleDelete(e, project._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                        Delete
                        </button>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
        </div>
        
        <div style={{ position: 'sticky', top: '100px' }}>
            <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
