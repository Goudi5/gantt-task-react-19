import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Gantt } from './index';
import { Task, ViewMode, OnChangeTasks, TaskOrEmpty, Column } from './types/public-types';
import { TitleColumn, DateStartColumn, DateEndColumn, DependenciesColumn } from './index';

// Sample tasks data with proper hierarchy using parent property (based on Storybook helper)
const currentDate = new Date();
const initialTasks: TaskOrEmpty[] = [
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    name: "Project Sample",
    id: "ProjectSample",
    progress: 25,
    type: "project",
    hideChildren: false
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2, 12, 28),
    name: "Idea",
    id: "Idea",
    progress: 45,
    type: "task",
    parent: "ProjectSample"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
    name: "Research",
    id: "Research",
    progress: 25,
    dependencies: [
      {
        sourceId: "Idea",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    type: "task",
    parent: "ProjectSample"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
    name: "Discussion with team",
    id: "Discussion",
    progress: 10,
    dependencies: [
      {
        sourceId: "Research",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    type: "task",
    parent: "ProjectSample"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10, 0, 0),
    name: "Developing",
    id: "developing",
    progress: 50,
    dependencies: [
      {
        sourceId: "Discussion",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    type: "project",
    parent: "ProjectSample",
    hideChildren: false
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
    name: "Code",
    id: "code",
    type: "task",
    progress: 40,
    parent: "developing"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 12, 0),
    name: "Frontend",
    id: "frontend",
    type: "task",
    progress: 40,
    parent: "code",
    assignees: ["Bob", "Peter"]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 12, 0),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
    name: "Backend",
    id: "backend",
    type: "task",
    progress: 40,
    parent: "code",
    assignees: ["Marc"]
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
    name: "Review",
    id: "review",
    type: "task",
    progress: 70,
    parent: "developing"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 23, 59),
    name: "Release",
    id: "release",
    progress: 0,
    type: "milestone",
    dependencies: [
      {
        sourceId: "review",
        sourceTarget: "endOfTask",
        ownTarget: "startOfTask"
      }
    ],
    parent: "ProjectSample"
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
    name: "Party Time",
    id: "party",
    progress: 0,
    isDisabled: true,
    isRelationDisabled: true,
    type: "task"
  }
];

// Columns configuration - show task names, dates, and dependencies (no action buttons)
const cleanColumns: Column[] = [
  {
    Cell: TitleColumn,
    width: 200,
    title: "Task Name",
    id: "name",
  },
  {
    Cell: DateStartColumn,
    width: 120,
    title: "Start Date",
    id: "start",
  },
  {
    Cell: DateEndColumn,
    width: 120,
    title: "End Date", 
    id: "end",
  },
  {
    Cell: DependenciesColumn,
    width: 150,
    title: "Dependencies",
    id: "dependencies",
  }
];

// Helper function to fix parent-child relationships
const fixParentChildRelationships = (tasks: readonly TaskOrEmpty[]): readonly TaskOrEmpty[] => {
  const taskMap = new Map<string, TaskOrEmpty>();
  tasks.forEach(task => taskMap.set(task.id, task));

  const updatedTasks = [...tasks];

  // Update parent bounds to encompass all children
  const updateParentBounds = (parentId: string): void => {
    const parent = taskMap.get(parentId);
    if (!parent || parent.type === "empty") return;

    const children = tasks.filter(t => t.parent === parentId && t.type !== "empty") as Task[];
    if (children.length === 0) return;

    const earliestStart = new Date(Math.min(...children.map(child => child.start.getTime())));
    const latestEnd = new Date(Math.max(...children.map(child => child.end.getTime())));

    const parentTask = parent as Task;
    const currentStart = parentTask.start.getTime();
    const currentEnd = parentTask.end.getTime();

    // Only update if parent bounds are outside children bounds
    if (earliestStart.getTime() < currentStart || latestEnd.getTime() > currentEnd) {
      const updatedParent: Task = {
        ...parentTask,
        start: new Date(Math.min(earliestStart.getTime(), currentStart)),
        end: new Date(Math.max(latestEnd.getTime(), currentEnd))
      };

      const parentIndex = updatedTasks.findIndex(t => t.id === parentId);
      if (parentIndex >= 0) {
        updatedTasks[parentIndex] = updatedParent;
        taskMap.set(parentId, updatedParent);
      }

      // Recursively update grandparents
      if (updatedParent.parent) {
        updateParentBounds(updatedParent.parent);
      }
    }
  };

  // Find all parents and update their bounds
  const parentIds = new Set<string>();
  tasks.forEach(task => {
    if (task.parent) {
      parentIds.add(task.parent);
    }
  });

  parentIds.forEach(parentId => updateParentBounds(parentId));

  return updatedTasks;
};

const GanttDemo: React.FC = () => {
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initialTasks);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedArrowKey, setSelectedArrowKey] = useState<string | null>(null);

  const onChangeTasks: OnChangeTasks = (nextTasks, action) => {
    console.log("Task change action:", action.type, nextTasks);
    
    switch (action.type) {
      case "delete_relation":
        if (
          window.confirm(
            `Do you want to remove relation between ${action.payload.taskFrom.name} and ${action.payload.taskTo.name}?`
          )
        ) {
          setTasks(nextTasks);
        }
        break;

      case "delete_task":
        if (window.confirm("Are you sure about deleting this task?")) {
          setTasks(nextTasks);
        }
        break;

      case "relation_change":
        setTasks(nextTasks);
        // Show user feedback
        const message = `✅ Dependency created successfully!`;
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
        break;

      case "date_change":
        console.log("Date change detected, updating tasks");
        
        // Fix parent-child relationships after date changes
        const fixedTasks = fixParentChildRelationships(nextTasks);
        setTasks(fixedTasks);
        break;

      case "progress_change":
      case "move_task_before":
      case "move_task_after": 
      case "move_task_inside":
        // These might also affect parent-child relationships
        const fixedTasksOther = fixParentChildRelationships(nextTasks);
        setTasks(fixedTasksOther);
        break;

      default:
        console.log("Other task change:", action.type);
        setTasks(nextTasks);
        break;
    }
  };

  const handleArrowSelect = (taskFrom: Task, taskTo: Task) => {
    const arrowKey = `${taskFrom.id}-${taskTo.id}`;
    setSelectedArrowKey(selectedArrowKey === arrowKey ? null : arrowKey);
  };

  const handleDeleteDependency = (taskFrom: Task, taskTo: Task) => {
    const updatedTasks = tasks.map(task => {
      if (task.type !== "empty" && task.id === taskTo.id && task.dependencies) {
        return {
          ...task,
          dependencies: task.dependencies.filter(
            (dep: { sourceId: string }) => dep.sourceId !== taskFrom.id
          )
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    setSelectedArrowKey(null);
  };

  const handleDblClick = (task: Task) => {
    alert("You clicked on " + task.name);
  };

  const handleTaskClick = (task: TaskOrEmpty) => {
    console.log("Task clicked:", task);
    if (task.type !== "empty") {
      setSelectedTask(task as Task);
    }
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
    const startDate = new Date((parentTask && parentTask.type !== "empty" ? parentTask.start : new Date()) || new Date());
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
          onChangeTasks={onChangeTasks}
          onDoubleClick={handleDblClick}
          onClick={handleTaskClick}
          onArrowSelect={handleArrowSelect}
          onDeleteDependency={handleDeleteDependency}
          isMoveChildsWithParent={true}
          isUpdateDisabledParentsOnChange={true}
          columns={cleanColumns}
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