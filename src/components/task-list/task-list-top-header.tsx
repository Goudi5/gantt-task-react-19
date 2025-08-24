import React, { memo } from "react";

import { ColorStyles } from "../../types/public-types";

import styles from "./task-list-top-header.module.css";

export interface TaskListTopHeaderProps {
  fontFamily: string;
  fontSize: string;
  colors: ColorStyles;
  children?: React.ReactNode;
}

const TaskListTopHeaderInner: React.FC<TaskListTopHeaderProps> = ({
  fontFamily,
  fontSize,
  colors,
  children
}) => {
  // If no children are provided, don't render the header
  if (!children) {
    return null;
  }

  return (
    <div
      className={styles.taskListTopHeader}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: colors.barLabelColor,
      }}
    >
      <div className={styles.taskListTopHeaderContent}>
        {children}
      </div>
    </div>
  );
};

export const TaskListTopHeader = memo(TaskListTopHeaderInner);