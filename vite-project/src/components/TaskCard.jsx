import { useState, useEffect } from 'react';
import { getComments, createComment } from '../api/comments';

const TaskCard = ({ task, users, onStatusChange, onDelete }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await getComments(task._id);
            setComments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            fetchComments();
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await createComment({ text: newComment, taskId: task._id });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
    const isDueSoon = task.deadline && new Date(task.deadline) < new Date(Date.now() + 86400000 * 2) && task.status !== 'completed'; // 2 days

    let dateColor = 'var(--text-muted)';
    if (isOverdue) dateColor = 'var(--danger)';
    else if (isDueSoon) dateColor = 'var(--warning)';

    return (
        <div className="task-card" style={{ borderColor: isOverdue ? 'var(--danger)' : 'var(--glass-border)' }}>
            <div className="task-tags">
                <span className={`tag ${task.priority}`}>{task.priority}</span>
                {task.deadline && (
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: dateColor }}>
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{task.description}</p>

            <div className="task-meta">
                <span>{users.find(u => u._id === task.assignedTo)?.username || 'Unassigned'}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleToggleComments}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                        title="Comments"
                    >
                        💬
                    </button>
                    {task.status !== 'todo' && (
                        <button
                            onClick={() => onStatusChange(task._id, task.status === 'completed' ? 'in-progress' : 'todo')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            title="Move Back"
                        >
                            ←
                        </button>
                    )}
                    {task.status !== 'completed' && (
                        <button
                            onClick={() => onStatusChange(task._id, task.status === 'todo' ? 'in-progress' : 'completed')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                            title="Move Forward"
                        >
                            →
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(task._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        title="Delete"
                    >
                        ×
                    </button>
                </div>
            </div>

            {showComments && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                    <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Send</button>
                    </form>

                    {loadingComments ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : (
                        <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {comments.map(comment => (
                                <div key={comment._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '2px' }}>
                                        {comment.user.username} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>{comment.text}</div>
                                </div>
                            ))}
                            {comments.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet.</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;
