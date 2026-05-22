import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../api/axios';

export default function Dashboard() {
    const [role, setRole] = useState('');
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    // Form States
    const [newProject, setNewProject] = useState('');
    const [newTask, setNewTask] = useState({ title: '', project: '', assignee: '', due_date: '' });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decoded = jwtDecode(token);
            setRole(decoded.role || 'member');
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tasksRes = await api.get('tasks/');
            setTasks(tasksRes.data);

            // Admins need to fetch projects and users to populate the assignment dropdowns
            const token = localStorage.getItem('access_token');
            const decoded = jwtDecode(token);
            if (decoded.role === 'admin') {
                const projRes = await api.get('projects/');
                const userRes = await api.get('users/');
                setProjects(projRes.data);
                setUsers(userRes.data.filter(u => u.role === 'member')); // Only assign to members
            }
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    // --- ADMIN ACTIONS ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('projects/', { name: newProject });
            setNewProject('');
            fetchData(); // Refresh list
        } catch (error) { alert("Failed to create project"); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('tasks/', newTask);
            setNewTask({ title: '', project: '', assignee: '', due_date: '' });
            fetchData();
        } catch (error) { alert("Failed to create task"); }
    };

    // --- SHARED ACTIONS ---
    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await api.patch(`tasks/${taskId}/`, { status: newStatus });
            fetchData();
        } catch (error) { alert("Failed to update status"); }
    };

    // --- HELPER: Overdue Calculation ---
    const isOverdue = (dateString, status) => {
        if (!dateString || status === 'Completed') return false;
        return new Date(dateString) < new Date(new Date().setHours(0,0,0,0));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Task Manager Dashboard</h1>
                    <span className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold uppercase tracking-wide">
                        Role: {role}
                    </span>
                </header>

                {/* ========================================== */}
                {/* ADMIN ONLY CONTROLS                        */}
                {/* ========================================== */}
                {role === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Project Creation */}
                        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
                            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                            <form onSubmit={handleCreateProject} className="flex gap-2">
                                <input 
                                    type="text" placeholder="Project Name" required
                                    className="flex-1 p-2 border rounded"
                                    value={newProject} onChange={(e) => setNewProject(e.target.value)}
                                />
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-bold">
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* Task Creation & Assignment */}
                        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                            <h2 className="text-xl font-bold mb-4">Assign New Task</h2>
                            <form onSubmit={handleCreateTask} className="space-y-3">
                                <input 
                                    type="text" placeholder="Task Title" required
                                    className="w-full p-2 border rounded"
                                    value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <select required className="flex-1 p-2 border rounded" value={newTask.project} onChange={(e) => setNewTask({...newTask, project: e.target.value})}>
                                        <option value="">Select Project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <select required className="flex-1 p-2 border rounded" value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}>
                                        <option value="">Assign To...</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                    </select>
                                </div>
                                <input 
                                    type="date" required
                                    className="w-full p-2 border rounded"
                                    value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                />
                                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">
                                    Create & Assign Task
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* SHARED VIEW: TASK TRACKING BOARD           */}
                {/* ========================================== */}
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                    {role === 'admin' ? "All Team Tasks" : "My Assigned Tasks"}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tasks.length === 0 ? (
                        <p className="text-gray-500 italic col-span-3">No tasks found.</p>
                    ) : (
                        tasks.map(task => {
                            const overdue = isOverdue(task.due_date, task.status);
                            return (
                                <div key={task.id} className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${overdue ? 'border-red-500' : 'border-blue-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                                        {overdue && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded animate-pulse">OVERDUE</span>}
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-1">📁 Project: <span className="font-semibold">{task.project_name}</span></p>
                                    <p className="text-sm text-gray-600 mb-1">👤 Assigned: <span className="font-semibold">{task.assignee_name}</span></p>
                                    <p className="text-sm text-gray-600 mb-4">📅 Due: <span className={overdue ? "text-red-600 font-bold" : ""}>{task.due_date || 'No Date'}</span></p>
                                    
                                    <div className="mt-4 pt-4 border-t bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-lg flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-600">Update Status:</span>
                                        <select 
                                            className={`text-sm p-1 border rounded font-bold ${
                                                task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}
                                            value={task.status}
                                            onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}