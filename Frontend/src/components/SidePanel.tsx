import { type ReactNode } from 'react';
import './SidePanel.css';

interface SidePanelProps {
  children: ReactNode;
  isCollapsed?: boolean;
}

function SidePanel({ children, isCollapsed = false }: SidePanelProps) {
  return (
    <aside className={`side-panel ${isCollapsed ? 'side-panel--collapsed' : ''}`}>
      <div className="side-panel-content">
        {children}
      </div>
    </aside>
  );
}

export default SidePanel;
