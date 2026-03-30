import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Plus, X, Calendar, User, AlignLeft, 
  CheckSquare, ChevronRight, Clock, 
  MoreVertical, Trash2, ListTree, Home, Tag,
  LogOut, Lock, UserCircle, Users
} from 'lucide-react';

// --- Constants & Initial Data ---

// Mock User Database
const MOCK_USERS = [
  { id: 'u1', username: 'admin', password: '123', name: 'Max Mustermann', department: 'Geschäftsführung', role: 'admin', viewAllTasks: true },
  { id: 'u2', username: 'anna', password: '123', name: 'Anna Schmidt', department: 'Buchhaltung', role: 'write', viewAllTasks: true },
  { id: 'u3', username: 'tom', password: '123', name: 'Tom Müller', department: 'IT-Abteilung', role: 'write', viewAllTasks: true },
  { id: 'u4', username: 'lisa', password: '123', name: 'Lisa Meier', department: 'Marketing', role: 'read', viewAllTasks: false },
  { id: 'u5', username: 'hr', password: '123', name: 'Julia Wagner', department: 'Personalwesen (HR)', role: 'write', viewAllTasks: true },
  { id: 'u6', username: 'paul', password: '123', name: 'Paul Weber', department: 'Vertrieb', role: 'read', viewAllTasks: false },
];

const INITIAL_STATUSES = [
  { id: 'todo', label: 'Zu erledigen', color: 'bg-slate-200 text-slate-700', border: 'border-slate-300' },
  { id: 'inProgress', label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
  { id: 'review', label: 'Prüfung', color: 'bg-purple-100 text-purple-700', border: 'border-purple-300' },
  { id: 'done', label: 'Erledigt', color: 'bg-green-100 text-green-700', border: 'border-green-300' }
];

const STATUS_PALETTE = [
  { color: 'bg-teal-100 text-teal-700', border: 'border-teal-300' },
  { color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-300' },
  { color: 'bg-pink-100 text-pink-700', border: 'border-pink-300' },
  { color: 'bg-amber-100 text-amber-700', border: 'border-amber-300' },
  { color: 'bg-rose-100 text-rose-700', border: 'border-rose-300' },
  { color: 'bg-cyan-100 text-cyan-700', border: 'border-cyan-300' }
];

const ALL_STATUS_COLORS = [
  { color: 'bg-slate-200 text-slate-700', border: 'border-slate-300' },
  { color: 'bg-blue-100 text-blue-700', border: 'border-blue-300' },
  { color: 'bg-purple-100 text-purple-700', border: 'border-purple-300' },
  { color: 'bg-green-100 text-green-700', border: 'border-green-300' },
  ...STATUS_PALETTE
];

const TAG_COLORS = [
  { name: 'Grau', colorClass: 'bg-slate-100 text-slate-700 border-slate-300', dotClass: 'bg-slate-400' },
  { name: 'Rot', colorClass: 'bg-red-100 text-red-700 border-red-300', dotClass: 'bg-red-400' },
  { name: 'Orange', colorClass: 'bg-orange-100 text-orange-700 border-orange-300', dotClass: 'bg-orange-400' },
  { name: 'Gelb', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300', dotClass: 'bg-yellow-400' },
  { name: 'Grün', colorClass: 'bg-green-100 text-green-700 border-green-300', dotClass: 'bg-green-400' },
  { name: 'Blau', colorClass: 'bg-blue-100 text-blue-700 border-blue-300', dotClass: 'bg-blue-400' },
  { name: 'Lila', colorClass: 'bg-purple-100 text-purple-700 border-purple-300', dotClass: 'bg-purple-400' }
];

// Normalized state for infinite nesting
const INITIAL_TASKS = {
  't1': { id: 't1', title: 'Neues ERP-System einführen', description: 'Ablösung des alten SAP-Systems durch ein modernes Cloud-ERP.', status: 'inProgress', dueDate: '2026-12-01', assignee: 'IT-Abteilung', parentId: null, subtaskIds: ['t2', 't3', 't4'], tags: [{id: 'tag1', text: 'Prio 1', colorClass: 'bg-red-100 text-red-700 border-red-300'}, {id: 'tag2', text: 'IT', colorClass: 'bg-blue-100 text-blue-700 border-blue-300'}] },
  't2': { id: 't2', title: 'Bedarfsanalyse', description: 'Was brauchen die einzelnen Abteilungen?', status: 'done', dueDate: '2026-02-15', assignee: 'Max Mustermann', parentId: 't1', subtaskIds: ['t5', 't6'], tags: [] },
  't3': { id: 't3', title: 'Anbieterauswahl', description: 'Pitch von 3 verschiedenen Anbietern.', status: 'inProgress', dueDate: '2026-04-30', assignee: 'Geschäftsführung', parentId: 't1', subtaskIds: [], tags: [{id: 'tag3', text: 'Wichtig', colorClass: 'bg-orange-100 text-orange-700 border-orange-300'}] },
  't4': { id: 't4', title: 'Datenmigration', description: 'Altdaten aus SAP exportieren und bereinigen.', status: 'todo', dueDate: '2026-08-01', assignee: 'IT-Abteilung', parentId: 't1', subtaskIds: [], tags: [] },
  't5': { id: 't5', title: 'Interviews Vertrieb', description: 'Anforderungen des Vertriebs aufnehmen.', status: 'done', dueDate: '2026-01-20', assignee: 'Paul Weber', parentId: 't2', subtaskIds: [], tags: [] },
  't6': { id: 't6', title: 'Interviews Buchhaltung', description: 'Anforderungen der FiBu aufnehmen.', status: 'done', dueDate: '2026-01-25', assignee: 'Anna Schmidt', parentId: 't2', subtaskIds: [], tags: [] },
  
  't7': { id: 't7', title: 'Sommerfest 2026 planen', description: 'Organisation des jährlichen Firmensommerfests.', status: 'todo', dueDate: '2026-07-15', assignee: 'Personalwesen (HR)', parentId: null, subtaskIds: ['t8'], tags: [{id: 'tag4', text: 'Event', colorClass: 'bg-purple-100 text-purple-700 border-purple-300'}] },
  't8': { id: 't8', title: 'Catering buchen', description: 'Budget: 50€ pro Person. Vegan und Fleisch.', status: 'todo', dueDate: '2026-05-01', assignee: 'Julia Wagner', parentId: 't7', subtaskIds: [], tags: [] },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

export default function KanbanTracker() {
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Core App State
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const [usersDb, setUsersDb] = useState(MOCK_USERS);
  
  // Permissions & Admin Dashboard
  const isAdmin = currentUser?.role === 'admin';
  const canWrite = isAdmin || currentUser?.role === 'write';
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', name: '', department: '', role: 'read', viewAllTasks: true });

  // Extract unique departments from users
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(usersDb.map(u => u.department))).sort();
  }, [usersDb]);

  // Task Visibility Filter
  const visibleTaskIds = useMemo(() => {
    if (!currentUser || currentUser.viewAllTasks !== false) return null; // null = keine Einschränkung

    const visible = new Set();
    Object.values(tasks).forEach(task => {
      if (task.assignee === currentUser.name || task.assignee === currentUser.department) {
        visible.add(task.id);
        
        // Füge alle Unteraufgaben hinzu (da der Nutzer die Hauptaufgabe besitzt)
        const addDescendants = (tId) => {
          const t = tasks[tId];
          if (t && t.subtaskIds) {
            t.subtaskIds.forEach(cId => {
              visible.add(cId);
              addDescendants(cId);
            });
          }
        };
        addDescendants(task.id);

        // Füge alle übergeordneten Aufgaben hinzu (damit der Nutzer hin-navigieren kann)
        let currentParent = task.parentId;
        while (currentParent) {
          visible.add(currentParent);
          currentParent = tasks[currentParent]?.parentId;
        }
      }
    });
    return visible;
  }, [tasks, currentUser]);

  // Modal State
  const [activePath, setActivePath] = useState([]);
  
  // Tag creation state
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Drag & Drop / UI state
  const [activeDragCol, setActiveDragCol] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Reset tag input when modal changes
  useEffect(() => {
    setNewTagText('');
    setNewTagColor(TAG_COLORS[0]);
    setIsEditingDesc(false);
  }, [activePath]);

  const currentTaskId = activePath.length > 0 ? activePath[activePath.length - 1] : null;
  const currentTask = currentTaskId ? tasks[currentTaskId] : null;

  // -- Auth Handlers --
  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDb.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Ungültiger Benutzername oder Passwort. (Tipp: admin / 123)');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePath([]);
  };

  // -- CRUD Operations --
  const handleCreateTask = (parentId = null) => {
    const newId = generateId();
    const newTask = {
      id: newId,
      title: 'Neue Aufgabe',
      description: '',
      status: statuses.length > 0 ? statuses[0].id : 'todo',
      dueDate: '',
      assignee: currentUser ? currentUser.name : '', // Default to creator
      parentId: parentId,
      subtaskIds: [],
      tags: []
    };

    setTasks(prev => {
      const updated = { ...prev, [newId]: newTask };
      if (parentId && prev[parentId]) {
        updated[parentId] = {
          ...prev[parentId],
          subtaskIds: [...prev[parentId].subtaskIds, newId]
        };
      }
      return updated;
    });

    if (parentId === null) {
      setActivePath([newId]);
    }
  };

  const handleUpdateTask = (id, updates) => {
    setTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleDeleteTask = (id) => {
    if (!window.confirm('Diese Aufgabe und alle Unteraufgaben wirklich löschen?')) return;

    setTasks(prev => {
      const updated = { ...prev };
      
      const getDescendants = (taskId) => {
        let desc = [taskId];
        if (updated[taskId] && updated[taskId].subtaskIds) {
          updated[taskId].subtaskIds.forEach(childId => {
            desc = [...desc, ...getDescendants(childId)];
          });
        }
        return desc;
      };

      const idsToDelete = getDescendants(id);
      const parentId = updated[id].parentId;

      if (parentId && updated[parentId]) {
        updated[parentId] = {
          ...updated[parentId],
          subtaskIds: updated[parentId].subtaskIds.filter(childId => childId !== id)
        };
      }

      idsToDelete.forEach(deleteId => {
        delete updated[deleteId];
      });

      return updated;
    });

    if (activePath.includes(id)) {
      const index = activePath.indexOf(id);
      setActivePath(activePath.slice(0, index));
    }
  };

  // -- Status Operations --
  const handleAddStatus = () => {
    const newId = generateId();
    const randomStyle = STATUS_PALETTE[Math.floor(Math.random() * STATUS_PALETTE.length)];
    setStatuses([...statuses, { 
      id: newId, 
      label: 'Neue Spalte', 
      color: randomStyle.color, 
      border: randomStyle.border 
    }]);
  };

  const handleUpdateStatus = (id, newLabel) => {
    setStatuses(statuses.map(s => s.id === id ? { ...s, label: newLabel } : s));
  };

  const handleUpdateStatusColor = (id, colorObj) => {
    setStatuses(statuses.map(s => s.id === id ? { ...s, color: colorObj.color, border: colorObj.border } : s));
    setActiveColorPicker(null);
  };

  const handleDeleteStatus = (id) => {
    if (statuses.length <= 1) {
      alert("Es muss mindestens eine Spalte übrig bleiben.");
      return;
    }
    const hasTasks = Object.values(tasks).some(t => t.status === id);
    if (hasTasks) {
      if (!window.confirm("Diese Spalte enthält noch Aufgaben. Spalte trotzdem löschen? Die Aufgaben werden in die erste Spalte verschoben.")) return;
      
      const firstAvailableStatus = statuses.find(s => s.id !== id).id;
      setTasks(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].status === id) updated[key].status = firstAvailableStatus;
        });
        return updated;
      });
    }
    setStatuses(statuses.filter(s => s.id !== id));
  };

  // -- Drag & Drop Handlers --
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => setActiveDragCol(null);

  const handleDragOver = (e, statusId) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (activeDragCol !== statusId) setActiveDragCol(statusId);
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    setActiveDragCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && tasks[taskId] && tasks[taskId].status !== statusId) {
      handleUpdateTask(taskId, { status: statusId });
    }
  };

  // -- Tag Handlers --
  const handleAddTag = (taskId) => {
    if (!newTagText.trim()) return;
    const newTag = {
      id: generateId(),
      text: newTagText.trim(),
      colorClass: newTagColor.colorClass
    };
    setTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        tags: [...(prev[taskId].tags || []), newTag]
      }
    }));
    setNewTagText('');
  };

  const handleRemoveTag = (taskId, tagId) => {
    setTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        tags: (prev[taskId].tags || []).filter(t => t.id !== tagId)
      }
    }));
  };

  // -- Modal Navigation --
  const openTask = (id) => setActivePath([id]);
  const pushTask = (id) => setActivePath([...activePath, id]);
  const popToTask = (index) => setActivePath(activePath.slice(0, index + 1));
  const closeModal = () => setActivePath([]);

  const getSubtaskStats = (taskId) => {
    const task = tasks[taskId];
    if (!task || task.subtaskIds.length === 0) return null;
    
    let total = 0;
    let done = 0;

    const countDescendants = (tId) => {
      const t = tasks[tId];
      if (!t) return;
      t.subtaskIds.forEach(childId => {
        if (visibleTaskIds && !visibleTaskIds.has(childId)) return;
        total++;
        if (tasks[childId]?.status === 'done') done++;
        countDescendants(childId);
      });
    };

    countDescendants(taskId);
    return { total, done };
  };

  // -- Render Login Screen --
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">NestiTask Login</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">Bitte melde dich an, um auf deine Aufgaben zuzugreifen.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Benutzername</label>
              <input 
                type="text" 
                autoFocus
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="z.B. admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="••••••"
              />
            </div>
            
            {loginError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{loginError}</p>}
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm">
              Anmelden
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 text-center space-y-2">
            <p><strong>Testzugänge (Passwort immer: 123):</strong></p>
            <p>admin (GF), anna (Buchhaltung), tom (IT), hr (Personalwesen)</p>
          </div>
        </div>
      </div>
    );
  }

  // -- Render Main App --
  const rootTasks = Object.values(tasks).filter(t => t.parentId === null && (!visibleTaskIds || visibleTaskIds.has(t.id)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ListTree className="text-blue-600" />
            NestiTask Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 hidden sm:block">Abteilungsübergreifende Aufgabenverwaltung</p>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          {isAdmin && (
            <button 
              onClick={() => setShowAdminDashboard(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
            >
              <Users size={18} />
              <span className="hidden sm:inline">Nutzerverwaltung</span>
            </button>
          )}

          {canWrite && (
            <button 
              onClick={() => handleCreateTask(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Hauptaufgabe erstellen</span>
            </button>
          )}
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{currentUser.name}</span>
              <span className="text-xs text-slate-500 leading-tight">{currentUser.department}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-1"
              title="Abmelden"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 min-w-max h-full items-start">
          {statuses.map(statusDef => (
            <div 
              key={statusDef.id} 
              className={`w-80 rounded-xl flex flex-col h-full border shrink-0 transition-all ${
                activeDragCol === statusDef.id 
                  ? 'bg-blue-50/80 border-blue-400 border-dashed shadow-inner' 
                  : 'bg-slate-100/50 border-slate-200'
              }`}
              onDragOver={(e) => canWrite && handleDragOver(e, statusDef.id)}
              onDrop={(e) => canWrite && handleDrop(e, statusDef.id)}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/60 group">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => canWrite && setActiveColorPicker(activeColorPicker === statusDef.id ? null : statusDef.id)}
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${canWrite ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-400' : ''} transition-all ${statusDef.color.split(' ')[0]}`}
                      title={canWrite ? "Farbe ändern" : ""}
                    />
                    {activeColorPicker === statusDef.id && canWrite && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveColorPicker(null)} />
                        <div className="absolute top-5 left-0 bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex flex-wrap gap-1.5 w-32 z-20">
                          {ALL_STATUS_COLORS.map((c, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleUpdateStatusColor(statusDef.id, c)}
                              className={`w-4 h-4 rounded-full ${c.color.split(' ')[0]} ${statusDef.color === c.color ? 'ring-2 ring-offset-1 ring-slate-500' : 'hover:opacity-75'}`}
                              title="Farbe wählen"
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input 
                    type="text"
                    value={statusDef.label}
                    onChange={(e) => handleUpdateStatus(statusDef.id, e.target.value)}
                    readOnly={!canWrite}
                    className={`font-semibold text-slate-700 bg-transparent border-b border-transparent ${canWrite ? 'focus:border-slate-300 outline-none' : 'outline-none cursor-default'} w-full truncate transition-colors`}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                    {rootTasks.filter(t => t.status === statusDef.id).length}
                  </span>
                  {canWrite && (
                    <button 
                      onClick={() => handleDeleteStatus(statusDef.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                      title="Spalte löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-3 flex flex-col gap-3 overflow-y-auto">
                {rootTasks.filter(t => t.status === statusDef.id).map(task => {
                  const stats = getSubtaskStats(task.id);
                  return (
                    <div 
                      key={task.id} 
                      draggable={canWrite}
                      onDragStart={(e) => canWrite && handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openTask(task.id)}
                      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all ${canWrite ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group`}
                    >
                      <h3 className="font-medium text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                        {task.title || 'Benennungslose Aufgabe'}
                      </h3>
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                          {task.tags.map(tag => (
                            <span key={tag.id} className={`text-[10px] px-1.5 py-0.5 rounded border ${tag.colorClass}`}>
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2 mt-3">
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <UserCircle size={14} className="text-slate-400" />
                            <span className="truncate bg-slate-100 px-2 py-0.5 rounded-md">{task.assignee}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className={`flex items-center gap-1.5 text-xs w-fit ${new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date() && task.status !== 'done' ? 'bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-semibold shadow-sm' : 'text-slate-500'}`}>
                            <Calendar size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                          </div>
                        )}
                        
                        {stats && stats.total > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span className="flex items-center gap-1"><CheckSquare size={12}/> Unteraufgaben</span>
                              <span>{stats.done}/{stats.total}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${stats.done === stats.total ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${(stats.done / stats.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {rootTasks.filter(t => t.status === statusDef.id).length === 0 && (
                  <div className="text-center p-4 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Keine Aufgaben
                  </div>
                )}
              </div>
            </div>
          ))}

          {canWrite && (
            <button 
              onClick={handleAddStatus}
              className="w-80 h-14 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-100/50 transition-all font-medium"
            >
              <Plus size={18} /> Neue Spalte
            </button>
          )}
        </div>
      </main>

      {/* Task Detail Modal */}
      {currentTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden border border-slate-200">
            
            {/* Modal Header & Breadcrumbs */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <button onClick={closeModal} className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <Home size={14} /> Board
                </button>
                {activePath.map((taskId, idx) => {
                  const t = tasks[taskId];
                  if (!t) return null;
                  return (
                    <React.Fragment key={taskId}>
                      <ChevronRight size={14} className="text-slate-300" />
                      <button 
                        onClick={() => popToTask(idx)}
                        className={`truncate max-w-[150px] hover:text-slate-900 transition-colors ${idx === activePath.length - 1 ? 'font-semibold text-slate-900' : ''}`}
                      >
                        {t.title || 'Unbenannt'}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              
              {/* Left Column: Main Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <input
                    type="text"
                    value={currentTask.title}
                    onChange={(e) => handleUpdateTask(currentTask.id, { title: e.target.value })}
                    readOnly={!canWrite}
                    placeholder="Aufgabentitel eingeben..."
                    className="w-full text-2xl font-bold text-slate-900 border-none bg-transparent focus:ring-0 p-0 placeholder-slate-300 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <AlignLeft size={16} className="text-slate-400" /> Beschreibung
                    </label>
                    {canWrite && (
                      <button 
                        onClick={() => setIsEditingDesc(!isEditingDesc)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-colors"
                      >
                        {isEditingDesc ? 'Vorschau' : 'Bearbeiten'}
                      </button>
                    )}
                  </div>
                  
                  {isEditingDesc ? (
                    <textarea
                      value={currentTask.description}
                      onChange={(e) => handleUpdateTask(currentTask.id, { description: e.target.value })}
                      autoFocus
                      placeholder="Füge eine detaillierte Beschreibung hinzu (Markdown wird unterstützt)..."
                      className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y text-sm font-mono"
                    />
                  ) : (
                    <div 
                      onClick={() => { if(canWrite && !currentTask.description) setIsEditingDesc(true); }}
                      className={`w-full min-h-[120px] p-4 rounded-xl border bg-slate-50 transition-all ${!currentTask.description && canWrite ? 'border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 text-slate-400 italic flex items-center justify-center' : 'border-slate-200'} text-sm text-slate-800 overflow-hidden`}
                    >
                      {currentTask.description ? (
                        <div className="space-y-2 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&>p]:mb-2 [&>a]:text-blue-600 [&>a]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>pre]:bg-slate-800 [&>pre]:text-slate-50 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>code]:bg-slate-200 [&>code]:text-slate-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&_strong]:font-bold [&_em]:italic">
                          <ReactMarkdown>{currentTask.description}</ReactMarkdown>
                        </div>
                      ) : (
                        canWrite ? "Keine Beschreibung vorhanden. Klicken zum Hinzufügen..." : "Keine Beschreibung vorhanden."
                      )}
                    </div>
                  )}
                </div>

                {/* Subtasks Section */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <ListTree size={16} className="text-slate-400" /> Unteraufgaben
                    </label>
                    {canWrite && (
                      <button 
                        onClick={() => handleCreateTask(currentTask.id)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
                      >
                        <Plus size={14} /> Hinzufügen
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      const visibleSubtaskIds = currentTask.subtaskIds.filter(id => !visibleTaskIds || visibleTaskIds.has(id));
                      
                      if (visibleSubtaskIds.length === 0) {
                        return (
                          <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Keine {currentTask.subtaskIds.length > 0 ? 'sichtbaren ' : ''}Unteraufgaben vorhanden.
                          </div>
                        );
                      }

                      return visibleSubtaskIds.map(subId => {
                        const subTask = tasks[subId];
                        if (!subTask) return null;
                        const statusObj = statuses.find(s => s.id === subTask.status) || statuses[0];
                        const statusColor = statusObj?.color || 'bg-slate-100';
                        
                        return (
                          <div 
                            key={subId} 
                            onClick={() => pushTask(subId)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer group bg-white transition-all"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor.split(' ')[0]}`} />
                              <span className={`text-sm truncate font-medium ${subTask.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {subTask.title || 'Unbenannt'}
                              </span>
                              
                              {subTask.tags && subTask.tags.length > 0 && (
                                <div className="hidden sm:flex gap-1 ml-1 flex-shrink-0">
                                  {subTask.tags.slice(0, 2).map(tag => (
                                    <span key={tag.id} className={`text-[9px] px-1 py-0.5 rounded border ${tag.colorClass}`}>
                                      {tag.text}
                                    </span>
                                  ))}
                                  {subTask.tags.length > 2 && <span className="text-[9px] text-slate-400">+{subTask.tags.length - 2}</span>}
                                </div>
                              )}

                              {(() => {
                                const visibleNestedSubtasks = subTask.subtaskIds.filter(id => !visibleTaskIds || visibleTaskIds.has(id));
                                if (visibleNestedSubtasks.length > 0) {
                                  return (
                                    <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                                      {visibleNestedSubtasks.length} Unteraufg.
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                              {subTask.assignee && (
                                <span className="hidden sm:flex items-center gap-1">
                                  <UserCircle size={12} /> <span className="max-w-[100px] truncate">{subTask.assignee}</span>
                                </span>
                              )}
                              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Meta Attributes */}
              <div className="w-full md:w-72 flex-shrink-0 space-y-6 bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={currentTask.status}
                    onChange={(e) => handleUpdateTask(currentTask.id, { status: e.target.value })}
                    disabled={!canWrite}
                    className={`w-full p-2.5 rounded-lg border text-sm font-medium appearance-none ${canWrite ? 'cursor-pointer focus:ring-2 focus:ring-blue-100' : 'cursor-default opacity-80'} outline-none transition-colors
                      ${(statuses.find(s => s.id === currentTask.status) || statuses[0])?.color} 
                      ${(statuses.find(s => s.id === currentTask.status) || statuses[0])?.border} bg-opacity-30`}
                  >
                    {statuses.map(s => (
                      <option key={s.id} value={s.id} className="bg-white text-slate-900">{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee / Department dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} /> Verantwortlich
                  </label>
                  <select
                    value={currentTask.assignee}
                    onChange={(e) => handleUpdateTask(currentTask.id, { assignee: e.target.value })}
                    disabled={!canWrite}
                    className={`w-full p-2.5 rounded-lg border border-slate-200 bg-white ${canWrite ? 'focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer' : 'cursor-default opacity-80'} text-sm outline-none transition-all`}
                  >
                    <option value="">-- Nicht zugewiesen --</option>
                    <optgroup label="Abteilungen">
                      {uniqueDepartments.map(dep => (
                        <option key={`dep-${dep}`} value={dep}>{dep}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Mitarbeiter">
                      {usersDb.map(user => (
                        <option key={`usr-${user.id}`} value={user.name}>{user.name} ({user.department})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} /> Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    value={currentTask.dueDate}
                    onChange={(e) => handleUpdateTask(currentTask.id, { dueDate: e.target.value })}
                    readOnly={!canWrite}
                    className={`w-full p-2.5 rounded-lg border border-slate-200 bg-white ${canWrite ? 'focus:border-blue-400 focus:ring-2 focus:ring-blue-100' : 'cursor-default opacity-80'} outline-none text-sm transition-all text-slate-700`}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} /> Tags
                  </label>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {currentTask.tags && currentTask.tags.map(tag => (
                      <span key={tag.id} className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${tag.colorClass}`}>
                        {tag.text}
                        {canWrite && (
                          <button 
                            onClick={() => handleRemoveTag(currentTask.id, tag.id)} 
                            className="hover:text-black opacity-50 hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                    {(!currentTask.tags || currentTask.tags.length === 0) && (
                       <span className="text-xs text-slate-400 italic">Keine Tags</span>
                    )}
                  </div>

                  {canWrite && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2.5 shadow-sm">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTagText}
                          onChange={(e) => setNewTagText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag(currentTask.id)}
                          placeholder="Neuer Tag..."
                          className="flex-1 min-w-0 text-xs p-1.5 border-b border-slate-200 focus:border-blue-400 outline-none bg-transparent"
                        />
                        <button 
                          onClick={() => handleAddTag(currentTask.id)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-colors"
                        >
                          Hinzufügen
                        </button>
                      </div>
                      <div className="flex gap-1.5 justify-between px-1">
                        {TAG_COLORS.map(c => (
                          <button
                            key={c.name}
                            onClick={() => setNewTagColor(c)}
                            className={`w-4 h-4 rounded-full ${c.dotClass} 
                              ${newTagColor.name === c.name ? 'ring-2 ring-offset-1 ring-slate-500' : 'opacity-50 hover:opacity-100'} transition-all`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {canWrite && (
                  <div className="pt-6 border-t border-slate-200">
                    <button 
                      onClick={() => handleDeleteTask(currentTask.id)}
                      className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} /> Aufgabe löschen
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                      Löscht diese Aufgabe inkl. aller eingebetteten Unteraufgaben.
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Dashboard Modal */}
      {showAdminDashboard && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-blue-600" />
                Nutzer- und Rechteverwaltung
              </h2>
              <button onClick={() => setShowAdminDashboard(false)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Create User Form */}
                <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-0">
                  <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Neuen Nutzer anlegen</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Benutzername (Login)</label>
                      <input 
                        type="text" 
                        value={newUserForm.username} 
                        onChange={e => setNewUserForm({...newUserForm, username: e.target.value})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Passwort</label>
                      <input 
                        type="text" 
                        value={newUserForm.password} 
                        onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Anzeigename</label>
                      <input 
                        type="text" 
                        value={newUserForm.name} 
                        onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Abteilung</label>
                      <input 
                        type="text" 
                        list="dashboard-departments"
                        value={newUserForm.department} 
                        onChange={e => setNewUserForm({...newUserForm, department: e.target.value})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none" 
                      />
                      <datalist id="dashboard-departments">
                        {uniqueDepartments.map(dep => <option key={dep} value={dep} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Berechtigung</label>
                      <select 
                        value={newUserForm.role} 
                        onChange={e => setNewUserForm({...newUserForm, role: e.target.value})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                      >
                        <option value="read">Lesezugriff</option>
                        <option value="write">Lese- & Schreibzugriff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Sichtbarkeit</label>
                      <select 
                        value={newUserForm.viewAllTasks ? 'all' : 'restricted'} 
                        onChange={e => setNewUserForm({...newUserForm, viewAllTasks: e.target.value === 'all'})}
                        className="w-full p-2 mt-1 rounded text-sm border focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                      >
                        <option value="all">Alle Aufgaben sehen</option>
                        <option value="restricted">Nur eigene & Abteilung</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        if(!newUserForm.username || !newUserForm.name) return;
                        setUsersDb([...usersDb, { id: 'u'+Date.now(), ...newUserForm }]);
                        setNewUserForm({ username: '', password: '', name: '', department: '', role: 'read', viewAllTasks: true });
                      }}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-medium transition-colors"
                    >
                      Nutzer hinzufügen
                    </button>
                  </div>
                </div>

                {/* User List */}
                <div className="md:col-span-2 space-y-3">
                  {usersDb.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-sm text-slate-900 truncate">{u.name} <span className="text-slate-400 font-normal ml-1">(@{u.username})</span></p>
                          <p className="text-xs text-slate-500 truncate">{u.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                        <select
                          value={u.viewAllTasks !== false ? 'all' : 'restricted'}
                          onChange={(e) => setUsersDb(usersDb.map(user => user.id === u.id ? {...user, viewAllTasks: e.target.value === 'all'} : user))}
                          className="text-xs p-1.5 rounded border outline-none bg-slate-50 border-slate-200 text-slate-600"
                        >
                          <option value="all">Alle Aufgaben</option>
                          <option value="restricted">Nur eigene</option>
                        </select>
                        
                        <select
                          value={u.role}
                          onChange={(e) => {
                            if(u.id === currentUser.id && e.target.value !== 'admin') {
                              if(!window.confirm("Achtung: Du entziehst dir selbst die Admin-Rechte! Fortfahren?")) return;
                            }
                            setUsersDb(usersDb.map(user => user.id === u.id ? {...user, role: e.target.value} : user))
                          }}
                          className={`text-xs p-1.5 rounded border outline-none ${
                            u.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' : 
                            u.role === 'write' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                            'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <option value="read">Lesezugriff</option>
                          <option value="write">Lese- & Schreibzugriff</option>
                          <option value="admin">Administrator</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            if(u.id === currentUser.id) return alert("Du kannst dich nicht selbst löschen.");
                            if(window.confirm(`Nutzer ${u.name} wirklich löschen?`)) {
                              setUsersDb(usersDb.filter(user => user.id !== u.id));
                            }
                          }}
                          disabled={u.id === currentUser.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}