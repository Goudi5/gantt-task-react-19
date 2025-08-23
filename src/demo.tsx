import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Gantt } from './index';
import { Task, ViewMode, Dependency, OnRelationChange, DateExtremity } from './types/public-types';

// Sample tasks data with proper hierarchy using parent property
const initialTasks: Task[] = [
  {
    id: "1",
    name: "Planning Phase",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 15),
    progress: 100,
    type: "project",
    isDisabled: false,
    hideChildren: false,
  },
  {
    id: "1.1", 
    name: "Requirements Gathering",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 5),
    progress: 100,
    type: "task",
    parent: "1",
    isDisabled: false,
  },
  {
    id: "1.2", 
    name: "Research & Analysis",
    start: new Date(2024, 0, 6),
    end: new Date(2024, 0, 15),
    progress: 80,
    type: "task",
    parent: "1",
    dependencies: [
      {
        sourceId: "1.1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  },
  {
    id: "2",
    name: "Design Phase", 
    start: new Date(2024, 0, 16),
    end: new Date(2024, 0, 30),
    progress: 50,
    type: "project",
    dependencies: [
      {
        sourceId: "1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
    hideChildren: false,
  },
  {
    id: "2.1",
    name: "UI/UX Design",
    start: new Date(2024, 0, 16),
    end: new Date(2024, 0, 25),
    progress: 70,
    type: "task",
    parent: "2",
    isDisabled: false,
  },
  {
    id: "2.2",
    name: "Database Design",
    start: new Date(2024, 0, 20),
    end: new Date(2024, 0, 30),
    progress: 30,
    type: "task",
    parent: "2",
    dependencies: [
      {
        sourceId: "2.1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  },
  {
    id: "3",
    name: "Development",
    start: new Date(2024, 1, 1),
    end: new Date(2024, 2, 15),
    progress: 25,
    type: "project",
    dependencies: [
      {
        sourceId: "2",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
    hideChildren: false,
  },
  {
    id: "3.1",
    name: "Frontend Development",
    start: new Date(2024, 1, 1),
    end: new Date(2024, 1, 20),
    progress: 40,
    type: "task",
    parent: "3",
    isDisabled: false,
  },
  {
    id: "3.2",
    name: "Backend Development",
    start: new Date(2024, 1, 5),
    end: new Date(2024, 2, 10),
    progress: 20,
    type: "task",
    parent: "3",
    dependencies: [
      {
        sourceId: "3.1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  },
  {
    id: "3.3",
    name: "Integration",
    start: new Date(2024, 2, 11),
    end: new Date(2024, 2, 15),
    progress: 0,
    type: "task",
    parent: "3",
    dependencies: [
      {
        sourceId: "3.1",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      },
      {
        sourceId: "3.2",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  },
  {
    id: "4",
    name: "Testing",
    start: new Date(2024, 2, 16),
    end: new Date(2024, 2, 30), 
    progress: 0,
    type: "task",
    dependencies: [
      {
        sourceId: "3",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  },
  {
    id: "5",
    name: "Deployment",
    start: new Date(2024, 3, 1),
    end: new Date(2024, 3, 7),
    progress: 0,
    type: "milestone",
    dependencies: [
      {
        sourceId: "4",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    isDisabled: false,
  }
];

const GanttDemo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskChange = (task: Task) => {
    console.log("Task changed:", task);
    const newTasks = tasks.map(t => t.id === task.id ? task : t);
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about deleting " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    console.log("Progress changed:", task);
  };

  const handleDblClick = (task: Task) => {
    alert("You clicked on " + task.name);
  };

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
    setSelectedTask(task);
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    console.log("Expander clicked:", task);
  };

  const handleRelationChange: OnRelationChange = (
    from: [Task, DateExtremity, number],
    to: [Task, DateExtremity, number],
    isOneDescendant: boolean
  ) => {
    const [fromTask, fromTarget] = from;
    const [toTask, toTarget] = to;

    if (isOneDescendant) {
      console.log("Cannot create dependency between ancestor and descendant");
      return;
    }

    const newDependency = {
      sourceId: fromTask.id,
      sourceTarget: fromTarget,
      ownTarget: toTarget
    };

    // Add the dependency to the target task
    const updatedTasks = tasks.map(task => {
      if (task.id === toTask.id) {
        const existingDependencies = task.dependencies || [];
        // Check if dependency already exists
        const dependencyExists = existingDependencies.some(dep => 
          dep.sourceId === fromTask.id && 
          dep.sourceTarget === fromTarget && 
          dep.ownTarget === toTarget
        );

        if (!dependencyExists) {
          return {
            ...task,
            dependencies: [...existingDependencies, newDependency]
          };
        }
      }
      return task;
    });

    setTasks(updatedTasks);
    console.log(`Created dependency: ${fromTask.name} -> ${toTask.name}`);
    
    // Show user feedback
    const message = `✅ Dependency created: "${fromTask.name}" → "${toTask.name}"`;
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      background: #28a745; color: white; padding: 12px 20px;
      border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: system-ui; font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const addSubtask = () => {
    if (!selectedTask) {
      alert("Please select a parent task first by clicking on it.");
      return;
    }

    const taskName = prompt("Enter subtask name:");
    if (!taskName) return;

    const parentId = selectedTask.type === "project" ? selectedTask.id : selectedTask.parent || selectedTask.id;
    const maxSubtaskId = Math.max(
      0,
      ...tasks
        .filter(t => t.parent === parentId)
        .map(t => {
          const parts = t.id.split('.');
          return parts.length > 1 ? parseInt(parts[parts.length - 1]) : 0;
        })
    );

    const newSubtaskId = `${parentId}.${maxSubtaskId + 1}`;
    
    const parentTask = tasks.find(t => t.id === parentId);
    const startDate = new Date(parentTask?.start || new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5); // Default 5 days duration

    const newSubtask: Task = {
      id: newSubtaskId,
      name: taskName,
      start: startDate,
      end: endDate,
      progress: 0,
      type: "task",
      parent: parentId,
      isDisabled: false,
    };

    setTasks([...tasks, newSubtask]);
  };

  const addMainTask = () => {
    const taskName = prompt("Enter task name:");
    if (!taskName) return;

    const maxTaskId = Math.max(0, ...tasks.map(t => parseInt(t.id.split('.')[0])));
    const newTaskId = (maxTaskId + 1).toString();

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // Default 7 days duration

    const newTask: Task = {
      id: newTaskId,
      name: taskName,
      start: startDate,
      end: endDate,
      progress: 0,
      type: "project",
      isDisabled: false,
    };

    setTasks([...tasks, newTask]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gantt Chart Demo</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <label>
          View Mode:{' '}
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <option value={ViewMode.Hour}>Hour</option>
            <option value={ViewMode.QuarterDay}>Quarter Day</option>
            <option value={ViewMode.HalfDay}>Half Day</option>
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
            <option value={ViewMode.Year}>Year</option>
          </select>
        </label>

        <button 
          onClick={addMainTask}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer' 
          }}
        >
          Add Main Task
        </button>

        <button 
          onClick={addSubtask}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer' 
          }}
        >
          Add Subtask
        </button>

        {selectedTask && (
          <div style={{ marginLeft: '20px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            Selected: <strong>{selectedTask.name}</strong>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '14px' }}>
        <strong>How to use:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li><strong>Create Dependencies:</strong> Drag from the small circles on task edges to connect tasks</li>
          <li><strong>Add Subtask:</strong> Click a project/task first, then click "Add Subtask"</li>
          <li><strong>Expand/Collapse:</strong> Click the ▶/▼ arrows next to project names</li>
          <li><strong>Edit Tasks:</strong> Drag task bars to change dates, drag progress handles to update completion</li>
        </ul>
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onDelete={handleTaskDelete}
          onProgressChange={handleProgressChange}
          onDoubleClick={handleDblClick}
          onClick={handleTaskClick}
          onExpanderClick={handleExpanderClick}
          onRelationChange={handleRelationChange}
        />
      </div>
    </div>
  );
};

// Mount the component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<GanttDemo />);
}