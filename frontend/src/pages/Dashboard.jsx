import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../api/axios'; // Make sure this path points to your configured axios file

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Decode the token to get the user's role
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Adjust 'role' below if your Django backend named it something else (like 'user_type')
                setUserRole(decoded.role || 'member'); 
            } catch (error) {
                console.error("Invalid token");
            }
        }

        // 2. Fetch the live tasks from Django
        const fetchTasks = async () => {
            try {
                const response = await api.get('tasks/');
                setTasks(response.data);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Task Dashboard</h1>
            
            {/* RBAC IN ACTION: Only the Admin sees this button */}
            {userRole === 'admin' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700">
                    + Create New Task
                </button>
            )}

            {/* Render your tasks dynamically */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tasks.length === 0 ? (
                    <div className="col-span-3 p-8 text-center bg-gray-50 border rounded text-gray-500">
                        No tasks found in the database.
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="bg-white p-5 rounded shadow border-t-4 border-blue-500">
                            <h3 className="font-bold text-lg">{task.title}</h3>
                            <p className="text-sm text-gray-600 mt-2">Project: {task.project_name}</p>
                            <p className="text-sm text-gray-600">Assigned to: <span className="font-semibold">{task.assignee}</span></p>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`px-3 py-1 text-xs rounded-full font-bold 
                                    ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                      task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {task.status}
                                </span>
                                
                                {/* RBAC: Members can update status, Admins can edit the whole task */}
                                <button className="text-sm text-blue-600 hover:underline">
                                    {userRole === 'admin' ? 'Edit Task' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}