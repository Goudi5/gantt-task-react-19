import React, { useCallback, useState } from "react";
import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react";

import {
  Gantt,
  OnChangeTasks,
  Task,
  TaskOrEmpty,
} from "../src";

import { initTasks, onAddTask, onEditTask } from "./helper";

import "../dist/style.css";

export const TopHeaderDemo: React.FC = props => {
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initTasks());
  const [searchTerm, setSearchTerm] = useState("");

  const onChangeTasks = useCallback<OnChangeTasks>((nextTasks, action) => {
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
        if (window.confirm("Are you sure?")) {
          setTasks(nextTasks);
        }
        break;

      default:
        setTasks(nextTasks);
        break;
    }
  }, []);

  const handleDblClick = useCallback((task: Task) => {
    alert("On Double Click event Id:" + task.id);
  }, []);

  const handleClick = useCallback((task: TaskOrEmpty) => {
    console.log("On Click event Id:" + task.id);
  }, []);

  const topHeaderContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          Project Tasks
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px' }}>
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
              width: '200px'
            }}
          />
        </div>
      </div>
      
      <div className="actions" style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="actionButton"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <Filter size={14} />
          Filter
        </button>
        
        <button 
          className="actionButton"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <Download size={14} />
          Export
        </button>
        
        <button 
          className="actionButton primaryButton"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            background: '#3b82f6',
            color: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          Add Task
        </button>
        
        <button 
          className="actionButton"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </>
  );

  return (
    <Gantt
      {...props}
      onAddTask={onAddTask}
      onChangeTasks={onChangeTasks}
      onDoubleClick={handleDblClick}
      onEditTask={onEditTask}
      onClick={handleClick}
      tasks={tasks}
      topHeaderContent={topHeaderContent}
    />
  );
};