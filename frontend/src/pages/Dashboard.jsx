import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        // Fetch tasks. Django automatically filters them based on the user's token!
        api.get('tasks/').then(response => setTasks(response.data));
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        await api.patch(`tasks/${taskId}/`, { status: newStatus });
        // Refresh the list after updating
        const response = await api.get('tasks/');
        setTasks(response.data);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Task Dashboard</h1>
                <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">Logout</button>
            </div>

            {/* RBAC: Only Admins see this button */}
            {user?.role === 'admin' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
                    + Create New Task
                </button>
            )}

            <div className="grid gap-4">
                {tasks.map(task => {
                    // Overdue Calculation
                    const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Completed';

                    return (
                        // Tailwind dynamic styling based on status
                        <div key={task.id} className={`p-4 border rounded shadow ${isOverdue ? 'bg-red-50 border-red-400' : 'bg-white'}`}>
                            <div className="flex justify-between">
                                <h3 className="text-xl font-bold">{task.title}</h3>
                                {isOverdue && <span className="text-red-600 font-bold">OVERDUE</span>}
                            </div>
                            <p className="text-gray-600">Due: {task.due_date}</p>
                            
                            <select 
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="mt-4 border p-2 rounded"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}