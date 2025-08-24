import React, { memo } from "react";

import { TaskListHeaderProps } from "../../types/public-types";

import styles from "./task-list-header.module.css";
import { TaskListHeaderActions, TaskListHeaderActionsProps } from "./TaskListHeaderActions";

const TaskListHeaderDefaultInner: React.FC<TaskListHeaderProps & TaskListHeaderActionsProps> = (props) => {
  const {
    headerHeight,
    fontFamily,
    fontSize,
    columns,
    canResizeColumns,
    onColumnResizeStart,
    onCollapseAll,
    onExpandFirstLevel,
    onExpandAll,
    colors
  } = props;
  
  const gridTemplateColumns = columns.map(col => `${col.width}px`).join(' ');
  
  return (
    <div
      className={styles.ganttTable_Header}
      style={{
        height: headerHeight,
        fontFamily: fontFamily,
        fontSize: fontSize,
        '--grid-template-columns': gridTemplateColumns,
      } as React.CSSProperties & { '--grid-template-columns': string }}
    >
      {columns.map(({ title, canResize }, index) => {
        return (
          <div
            key={index}
            data-testid={`table-column-header-${title}`}
            className={`${styles.ganttTable_HeaderItem} ${index > 0 ? styles.ganttTable_HeaderWithSeparator : ''}`}
          >
            <div className={styles.ganttTable_HeaderContent}>
              <div className={styles.ganttTable_HeaderTitle} >
                {title}
              </div>

              {title === "Name" && <TaskListHeaderActions
                onCollapseAll={onCollapseAll}
                onExpandFirstLevel={onExpandFirstLevel}
                onExpandAll={onExpandAll}
                colors={colors} />}
            </div>

            {canResizeColumns && canResize !== false && (
              <div
                data-testid={`table-column-header-resize-handle-${title}`}
                className={styles.resizer}
                onMouseDown={event => {
                  onColumnResizeStart(index, event.clientX);
                }}
                onTouchStart={event => {
                  const firstTouch = event.touches[0];

                  if (firstTouch) {
                    onColumnResizeStart(index, firstTouch.clientX);
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const TaskListHeaderDefault = memo(TaskListHeaderDefaultInner);
