import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Filter, Download, Plus, Calendar, Clock, Grid, BarChart3, Indent, Outdent, Flag } from "lucide-react";
import { Gantt } from './index';
import { Task, ViewMode, OnChangeTasks, TaskOrEmpty, Column } from './types/public-types';
import { TitleColumn, DateStartColumn, DateEndColumn, DependenciesColumn, ColumnProps } from './index';

// Custom column components
const ProgressColumn: React.FC<ColumnProps> = ({ data: { task } }) => {
  if (task.type === "empty") return null;
  if (task.type === "project" || task.type === "task") {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '4px 8px'
      }}>
        <div style={{
          width: '60px',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${task.progress}%`,
            height: '100%',
            backgroundColor: task.progress === 100 ? '#10b981' : '#3b82f6',
            borderRadius: '4px',
            transition: 'width 0.2s ease'
          }} />
        </div>
        <span style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          minWidth: '35px',
          textAlign: 'right'
        }}>
          {task.progress}%
        </span>
      </div>
    );
  }
  return null;
};

const AssigneesColumn: React.FC<ColumnProps> = ({ data: { task } }) => {
  if (task.type === "empty") return null;
  if (task.type === "project" || task.type === "task") {
    if (!task.assignees || task.assignees.length === 0) {
      return (
        <span style={{ 
          fontSize: '0.75rem', 
          color: '#9ca3af', 
          fontStyle: 'italic',
          padding: '4px 8px'
        }}>
          Unassigned
        </span>
      );
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '4px',
        padding: '4px 8px'
      }}>
        {task.assignees.map((assignee, index) => (
          <span
            key={index}
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              padding: '2px 6px',
              borderRadius: '12px',
              border: '1px solid #dbeafe'
            }}
          >
            {assignee}
          </span>
        ))}
      </div>
    );
  }
  return null;
};

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

// Available column definitions
const allAvailableColumns: Column[] = [
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
    Cell: ProgressColumn,
    width: 120,
    title: "Progress",
    id: "progress",
  },
  {
    Cell: AssigneesColumn,
    width: 150,
    title: "Assignees",
    id: "assignees",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["name", "start", "end", "progress", "assignees", "dependencies"]);

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


  const addTask = () => {
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
      type: "task",
      isDisabled: false,
    };

    setTasks([...tasks, newTask]);
  };

  const addMilestone = () => {
    const milestoneName = prompt("Enter milestone name:");
    if (!milestoneName) return;

    const maxTaskId = Math.max(0, ...tasks.map(t => parseInt(t.id.split('.')[0])));
    const newMilestoneId = `milestone-${maxTaskId + 1}`;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Default 7 days from now

    const newMilestone: Task = {
      id: newMilestoneId,
      name: milestoneName,
      start: startDate,
      end: startDate,
      progress: 0,
      type: "milestone",
      isDisabled: false,
    };

    setTasks([...tasks, newMilestone]);
  };

  const indentTask = () => {
    if (!selectedTask) {
      alert("Please select a task first by clicking on it.");
      return;
    }

    // Find a suitable parent (previous task in the list at any level)
    const currentTaskIndex = tasks.findIndex(t => t.id === selectedTask.id);
    let potentialParent = null;

    // Look backwards for any task that could be a parent
    for (let i = currentTaskIndex - 1; i >= 0; i--) {
      const task = tasks[i];
      if (task.type !== "empty" && task.id !== selectedTask.id) {
        potentialParent = task;
        break;
      }
    }

    if (!potentialParent) {
      alert("No suitable parent task found above this task.");
      return;
    }

    // Generate new ID based on parent hierarchy
    const getNewTaskId = (parentTask: Task): string => {
      // Find existing children of this parent
      const siblings = tasks.filter(t => t.parent === parentTask.id);
      const maxSiblingNumber = siblings.length > 0 
        ? Math.max(...siblings.map(s => {
            const parts = s.id.split('.');
            return parseInt(parts[parts.length - 1]) || 0;
          }))
        : 0;
      
      // Create new ID by extending parent's ID
      return `${parentTask.id}.${maxSiblingNumber + 1}`;
    };

    const newTaskId = getNewTaskId(potentialParent as Task);

    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return { 
          ...task, 
          parent: potentialParent!.id,
          id: newTaskId // Update ID to reflect hierarchy
        };
      }
      // Update any tasks that reference this task's old ID
      if (task.type !== "empty" && task.dependencies) {
        return {
          ...task,
          dependencies: task.dependencies.map((dep: any) => 
            dep.sourceId === selectedTask.id 
              ? { ...dep, sourceId: newTaskId }
              : dep
          )
        };
      }
      return task;
    });

    // Update selected task reference
    const updatedSelectedTask = updatedTasks.find(t => t.id === newTaskId) as Task;
    setSelectedTask(updatedSelectedTask);

    setTasks(fixParentChildRelationships(updatedTasks));
  };

  const outdentTask = () => {
    if (!selectedTask) {
      alert("Please select a task first by clicking on it.");
      return;
    }

    if (!selectedTask.parent) {
      alert("Task is already at the top level.");
      return;
    }

    const parentTask = tasks.find(t => t.id === selectedTask.parent) as Task;
    
    // Generate new ID for the outdented task
    const getOutdentedTaskId = (): string => {
      if (!parentTask.parent) {
        // Parent is top-level, so this becomes top-level too
        const maxTopLevelId = Math.max(0, ...tasks
          .filter(t => !t.parent)
          .map(t => parseInt(t.id.split('.')[0]) || 0)
        );
        return (maxTopLevelId + 1).toString();
      } else {
        // Parent has a parent, so this becomes sibling of parent
        const grandparentId = parentTask.parent;
        const siblings = tasks.filter(t => t.parent === grandparentId);
        const maxSiblingNumber = siblings.length > 0 
          ? Math.max(...siblings.map(s => {
              const parts = s.id.split('.');
              return parseInt(parts[parts.length - 1]) || 0;
            }))
          : 0;
        return `${grandparentId}.${maxSiblingNumber + 1}`;
      }
    };

    const newTaskId = getOutdentedTaskId();
    const newParent = parentTask.parent || undefined;

    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        const updatedTask = { 
          ...task, 
          id: newTaskId,
          parent: newParent 
        };
        // Remove parent property if undefined
        if (!newParent) {
          delete (updatedTask as any).parent;
        }
        return updatedTask;
      }
      // Update any tasks that reference this task's old ID
      if (task.type !== "empty" && task.dependencies) {
        return {
          ...task,
          dependencies: task.dependencies.map((dep: any) => 
            dep.sourceId === selectedTask.id 
              ? { ...dep, sourceId: newTaskId }
              : dep
          )
        };
      }
      // Update any children that reference this task as parent
      if (task.parent === selectedTask.id) {
        return {
          ...task,
          parent: newTaskId
        };
      }
      return task;
    });

    // Update selected task reference
    const updatedSelectedTask = updatedTasks.find(t => t.id === newTaskId) as Task;
    setSelectedTask(updatedSelectedTask);

    setTasks(fixParentChildRelationships(updatedTasks));
  };

  // Generate filtered columns based on visibility
  const getFilteredColumns = (): Column[] => {
    return allAvailableColumns.filter(col => visibleColumns.includes(col.id));
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        // Allow hiding all columns
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  // Top header content
  const topHeaderContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
          Demo Tasks ({tasks.length} total)
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '8px 12px',
          minWidth: '200px',
          height: '36px',
          boxSizing: 'border-box'
        }}>
          <Search size={16} color="#6b7280" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              border: 'none', 
              outline: 'none', 
              background: 'transparent',
              fontSize: '0.875rem',
              width: '100%',
              color: '#374151'
            }}
          />
        </div>
        
        {/* Divider */}
        <div style={{ height: '36px', width: '1px', background: '#e5e7eb', margin: '0 4px' }}></div>
        
        {/* View Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { mode: ViewMode.Day, icon: Clock, label: 'Day' },
            { mode: ViewMode.Week, icon: Calendar, label: 'Week' },
            { mode: ViewMode.Month, icon: Grid, label: 'Month' },
            { mode: ViewMode.QuarterYear, icon: BarChart3, label: 'Quarter' },
            { mode: ViewMode.Year, icon: BarChart3, label: 'Year' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                border: viewMode === mode ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '6px',
                background: viewMode === mode ? '#eff6ff' : 'white',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: viewMode === mode ? '#3b82f6' : '#6b7280',
                fontWeight: viewMode === mode ? '500' : '400',
                transition: 'all 0.2s ease',
                height: '36px',
                boxSizing: 'border-box'
              }}
              title={`Switch to ${label} view`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Task Creation */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '400',
              height: '36px',
              boxSizing: 'border-box'
            }}
            onClick={addTask}
            title="Add new task"
          >
            <Plus size={14} />
            Task
          </button>
          
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '400',
              height: '36px',
              boxSizing: 'border-box'
            }}
            onClick={addMilestone}
            title="Add milestone"
          >
            <Flag size={14} />
            Milestone
          </button>
        </div>

        {/* Indent/Outdent Controls */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px 0 0 6px',
              background: selectedTask ? 'white' : '#f3f4f6',
              fontSize: '0.875rem',
              cursor: selectedTask ? 'pointer' : 'not-allowed',
              color: selectedTask ? '#374151' : '#9ca3af',
              fontWeight: '400',
              height: '36px',
              boxSizing: 'border-box'
            }}
            onClick={indentTask}
            disabled={!selectedTask}
            title="Indent task (make subtask of previous task)"
          >
            <Indent size={16} />
          </button>
          
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              border: '1px solid #e5e7eb',
              borderLeft: 'none',
              borderRadius: '0 6px 6px 0',
              background: selectedTask?.parent ? 'white' : '#f3f4f6',
              fontSize: '0.875rem',
              cursor: selectedTask?.parent ? 'pointer' : 'not-allowed',
              color: selectedTask?.parent ? '#374151' : '#9ca3af',
              fontWeight: '400',
              height: '36px',
              boxSizing: 'border-box'
            }}
            onClick={outdentTask}
            disabled={!selectedTask?.parent}
            title="Outdent task (promote to higher level)"
          >
            <Outdent size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '36px', width: '1px', background: '#e5e7eb', margin: '0 4px' }}></div>

        {/* Utility Buttons */}
        <div style={{ position: 'relative', zIndex: 9999 }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: showColumnFilter ? '1px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '6px',
              background: showColumnFilter ? '#eff6ff' : 'white',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: showColumnFilter ? '#3b82f6' : '#374151',
              fontWeight: '400',
              position: 'relative',
              zIndex: 10001,
              height: '36px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowColumnFilter(!showColumnFilter);
            }}
          >
            <Filter size={14} />
            {visibleColumns.length === 0 ? 'Columns (Hidden)' : `Columns (${visibleColumns.length})`}
          </button>
          
          {showColumnFilter && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                zIndex: 10002,
                minWidth: '200px',
                padding: '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Column Visibility
              </div>
              {allAvailableColumns.map(column => (
                <label
                  key={column.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => toggleColumnVisibility(column.id)}
                    style={{ marginRight: '8px' }}
                  />
                  {column.title}
                </label>
              ))}
            </div>
          )}
        </div>
        
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer',
            color: '#374151',
            fontWeight: '400',
            height: '36px',
            boxSizing: 'border-box'
          }}
          onClick={() => alert('Export clicked - future functionality!')}
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gantt Chart Demo</h1>
      
      {selectedTask && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '6px', 
          border: '1px solid #e0f2fe',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
            <strong>Selected:</strong> {selectedTask.name}
            {selectedTask.parent && (
              <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                (subtask of {tasks.find(t => t.id === selectedTask.parent)?.name})
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '14px' }}>
        <strong>Modern Gantt Controls:</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li><strong>Add Tasks:</strong> Use "Task" or "Milestone" buttons in the top header</li>
          <li><strong>Create Subtasks:</strong> Select a task, then click the indent button (▷) to make it a subtask</li>
          <li><strong>Move to Top Level:</strong> Select a subtask, then click outdent button (◁) to promote it</li>
          <li><strong>Dependencies:</strong> Drag from task edge circles to create dependencies</li>
          <li><strong>Edit Dates:</strong> Drag task bars to change dates, drag progress handles for completion</li>
        </ul>
      </div>

      <div 
        style={{ width: '100%', height: '500px' }}
        onClick={() => {
          // Close column filter when clicking outside
          if (showColumnFilter) {
            setShowColumnFilter(false);
          }
        }}
      >
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
          columns={getFilteredColumns()}
          topHeaderContent={topHeaderContent}
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