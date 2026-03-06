import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RightPanel } from '@/features/sentra/components/RightPanel';
import { Sidebar } from '@/features/sentra/components/Sidebar';

describe('app shell side panels height', () => {
  it('uses stretch/min-height classes instead of viewport-locked h-screen', () => {
    const { container: sidebarContainer } = render(
      <Sidebar recentChats={[]} onNewInvestigation={() => undefined} onSelectChat={() => undefined} />,
    );
    const sidebarRoot = sidebarContainer.firstElementChild as HTMLElement;
    const sidebarClasses = sidebarRoot.className.split(/\s+/);
    expect(sidebarClasses).toContain('min-h-screen');
    expect(sidebarClasses).toContain('self-stretch');
    expect(sidebarClasses).not.toContain('h-screen');

    const { container: rightPanelContainer } = render(<RightPanel />);
    const rightPanelRoot = rightPanelContainer.firstElementChild as HTMLElement;
    const rightPanelClasses = rightPanelRoot.className.split(/\s+/);
    expect(rightPanelClasses).toContain('min-h-screen');
    expect(rightPanelClasses).toContain('self-stretch');
    expect(rightPanelClasses).not.toContain('h-screen');
  });
});
