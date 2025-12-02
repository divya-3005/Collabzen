import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getUsers } from '../api/users';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import TaskCard from '../components/TaskCard';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', priority: '' });
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' });
    const [showCreate, setShowCreate] = useState(false);

    const fetchData = async () => {
        try {
            // Fetch Project
            try {
                const projRes = await getProject(id);
                setProject(projRes.data);
            } catch (e) { console.error("Failed to fetch project", e); }

            // Fetch Tasks
            try {
                const tasksRes = await getTasks({ projectId: id, ...filter });
                console.log('Fetched Tasks:', tasksRes.data);
                setTasks(tasksRes.data.tasks || []);
            } catch (e) { console.error("Failed to fetch tasks", e); }

            // Fetch Users
            try {
                const usersRes = await getUsers();
                console.log('Users Response:', usersRes.data);
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            } catch (e) {
                console.error("Failed to fetch users", e);
                setUsers([]); // Fallback to empty
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, filter]);

    useEffect(() => {
        if (project) {
            document.title = `${project.name} | CollabZen`;
        }
    }, [project]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTask({ ...newTask, projectId: id });
            setNewTask({ title: '', description: '', priority: 'medium', deadline: '', assignedTo: '' });
            setShowCreate(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        // Optimistic update
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        await updateTask(taskId, { status: newStatus });
        fetchData(); // Refresh to be safe
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Delete task?')) {
            await deleteTask(taskId);
            fetchData();
        }
    };

    const getColumnTasks = (status) => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter(t => t.status === status);
    };

    if (loading) return <Loader />;

    return (
        <div className="container">
            <Navbar />

            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    ← Back to Dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>{project?.name}</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{project?.description}</p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                        + Add Task
                    </button>
                </div>
            </div>

            <div className="glass" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                    placeholder="Search tasks..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    style={{ maxWidth: '300px' }}
                />
                <select
                    value={filter.priority}
                    onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                    style={{ maxWidth: '200px' }}
                >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="glass modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Add New Task</h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Task Title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                                autoFocus
                            />
                            <textarea
                                placeholder="Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                rows="3"
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                <input
                                    type="date"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                />
                            </div>
                            <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                                <option value="">Assign to...</option>
                                {users.length > 0 ? (
                                    users.map(u => (
                                        <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                                    ))
                                ) : (
                                    <option disabled>No users found</option>
                                )}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="kanban-board">
                {['todo', 'in-progress', 'completed'].map(status => (
                    <div key={status} className="kanban-column">
                        <div className="column-header">
                            <span className="column-title">{status.replace('-', ' ')}</span>
                            <span className="task-count">{getColumnTasks(status).length}</span>
                        </div>

                        <div style={{ minHeight: '200px' }}>
                            {console.log(`Rendering ${status} column:`, getColumnTasks(status))}
                            {getColumnTasks(status).map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    users={users}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectDetails;
